'use strict';

import { workspace, Uri, env, window, ConfigurationTarget, commands, ExtensionContext } from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as expandHomeDir from 'expand-home-dir';
import findJavaHome = require("find-java-home");
import { Commands } from './commands';
import { checkJavaPreferences } from './settings';
import { findJavaHomes, getJavaVersion, JavaRuntime, verifyJavaHome } from './findJavaRuntimes';
import { logger } from './log';

const isWindows = process.platform.indexOf('win') === 0;
const JAVAC_FILENAME = 'javac' + (isWindows ? '.exe' : '');
const JAVA_FILENAME = 'java' + (isWindows ? '.exe' : '');
const REQUIRED_JDK_VERSION = 11;
export interface RequirementsData {
    tooling_jre: string;
    tooling_jre_version: number;
    java_home: string;
    java_version: number;
}

interface ErrorData {
    message: string;
    label: string;
    command: string;
    commandParam: any;
}
/**
 * Resolves the requirements needed to run the extension.
 * Returns a promise that will resolve to a RequirementsData if
 * all requirements are resolved, it will reject with ErrorData if
 * if any of the requirements fails to resolve.
 *
 */
export async function resolveRequirements(context: ExtensionContext): Promise<RequirementsData> {
    let toolingJre: string = await findEmbeddedJRE(context);
    let toolingJreVersion: number = await getJavaVersion(toolingJre);
    return new Promise(async (resolve, reject) => {
        let source: string;
        let javaVersion: number = 0;
        let javaHome = await checkJavaPreferences(context);
        if (!toolingJre && javaHome) { // "java.home" setting is only used for the universal version.
            source = `java.home variable defined in ${env.appName} settings`;
            javaHome = expandHomeDir(javaHome);
            if (!await fse.pathExists(javaHome)) {
                invalidJavaHome(reject, `The ${source} points to a missing or inaccessible folder (${javaHome})`);
            } else if (!await fse.pathExists(path.resolve(javaHome, 'bin', JAVAC_FILENAME))) {
                let msg: string;
                if (await fse.pathExists(path.resolve(javaHome, JAVAC_FILENAME))) {
                    msg = `'bin' should be removed from the ${source} (${javaHome})`;
                } else {
                    msg = `The ${source} (${javaHome}) does not point to a JDK.`;
                }
                invalidJavaHome(reject, msg);
            }
            javaVersion = await getJavaVersion(javaHome);
            toolingJre = javaHome;
            toolingJreVersion = javaVersion;
        } else {
            // java.home not specified, search valid JDKs from env.JAVA_HOME, env.PATH, Registry(Window), Common directories
            const javaRuntimes = await findJavaHomes();
            if (!toolingJre) { // universal version
                const validJdks = javaRuntimes.filter(r => r.version >= REQUIRED_JDK_VERSION);
                if (validJdks.length > 0) {
                    sortJdksBySource(validJdks);
                    javaHome = validJdks[0].home;
                    javaVersion = validJdks[0].version;
                    toolingJre = javaHome;
                    toolingJreVersion = javaVersion;
                }
            } else { // pick a default project JDK
                /**
                 * For legacy users, we implicitly following the order below to
                 * set a default project JDK during initialization:
                 * java.home > env.JDK_HOME > env.JAVA_HOME > env.PATH
                 *
                 * We'll keep it for compatibility.
                 */
                if (javaHome && (javaHome = await verifyJavaHome(javaHome, JAVAC_FILENAME))) {
                    javaVersion = await getJavaVersion(javaHome);
                    logger.info("Use the JDK from 'java.home' setting as the initial default project JDK.");
                } else if (javaRuntimes.length) {
                    sortJdksBySource(javaRuntimes);
                    javaHome = javaRuntimes[0].home;
                    javaVersion = javaRuntimes[0].version;
                    logger.info(`Use the JDK from '${javaRuntimes[0].sources}' as the initial default project JDK.`);
                } else if (javaHome = await findDefaultJDKFromSettings()) {
                    javaVersion = await getJavaVersion(javaHome);
                    logger.info("Use the JDK from 'java.configuration.runtimes' as the initial default project JDK.");
                } else {
                    openJDKDownload(reject, "Please download and install a JDK to compile your project. You can configure your projects with different JDKs by the setting ['java.configuration.runtimes'](https://github.com/redhat-developer/vscode-java/wiki/JDK-Requirements#java.configuration.runtimes)");
                }
            }
        }

        if (!toolingJre || toolingJreVersion < REQUIRED_JDK_VERSION) {
            // For universal version, we still require users to install a qualified JDK to run Java extension.
            openJDKDownload(reject, `Java ${REQUIRED_JDK_VERSION} or more recent is required to run the Java extension. Please download and install a recent JDK. You can still compile your projects with older JDKs by configuring ['java.configuration.runtimes'](https://github.com/redhat-developer/vscode-java/wiki/JDK-Requirements#java.configuration.runtimes)`);
        }

        resolve({
            tooling_jre: toolingJre,  // Used to launch Java extension.
            tooling_jre_version: toolingJreVersion,
            java_home: javaHome, // Used as default project JDK.
            java_version: javaVersion,
        });
    });
}

async function findEmbeddedJRE(context: ExtensionContext): Promise<string | undefined> {
    const jreHome = context.asAbsolutePath("jre");
    if (fse.existsSync(jreHome) && fse.statSync(jreHome).isDirectory()) {
        const candidates = fse.readdirSync(jreHome);
        for (const candidate of candidates) {
            if (fse.existsSync(path.join(jreHome, candidate, "bin", JAVA_FILENAME))) {
                return path.join(jreHome, candidate);
            }
        }
    }

    return;
}

async function findDefaultJDKFromSettings(): Promise<string | undefined> {
    const runtimes = workspace.getConfiguration().get("java.configuration.runtimes");
    if (Array.isArray(runtimes) && runtimes.length) {
        let candidate: string;
        for (const runtime of runtimes) {
            if (!runtime || typeof runtime !== 'object' || !runtime.path) {
                continue;
            }

            const javaHome = await verifyJavaHome(runtime.path, JAVAC_FILENAME);
            if (javaHome) {
                candidate = javaHome;
            }

            if (runtime.default) {
                break;
            }
        }

        return candidate;
    }

    return undefined;
}

function sortJdksBySource(jdks: JavaRuntime[]) {
    const rankedJdks = jdks as Array<JavaRuntime & { rank: number }>;
    const sources = ["env.JDK_HOME", "env.JAVA_HOME", "env.PATH"];
    for (const [index, source] of sources.entries()) {
        for (const jdk of rankedJdks) {
            if (jdk.rank === undefined && jdk.sources.includes(source)) {
                jdk.rank = index;
            }
        }
    }
    rankedJdks.filter(jdk => jdk.rank === undefined).forEach(jdk => jdk.rank = sources.length);
    rankedJdks.sort((a, b) => a.rank - b.rank);
}

function checkJavaRuntime(context: ExtensionContext): Promise<string> {
    return new Promise(async (resolve, reject) => {
        let source: string;
        let javaHome = await checkJavaPreferences(context);
        if (javaHome) {
            source = `java.home variable defined in ${env.appName} settings`;
        } else {
            javaHome = process.env['JDK_HOME'];
            if (javaHome) {
                source = 'JDK_HOME environment variable';
            } else {
                javaHome = process.env['JAVA_HOME'];
                source = 'JAVA_HOME environment variable';
            }
        }
        if (javaHome) {
            javaHome = expandHomeDir(javaHome);
            if (!await fse.pathExists(javaHome)) {
                invalidJavaHome(reject, `The ${source} points to a missing or inaccessible folder (${javaHome})`);
            } else if (!await fse.pathExists(path.resolve(javaHome, 'bin', JAVAC_FILENAME))) {
                let msg: string;
                if (await fse.pathExists(path.resolve(javaHome, JAVAC_FILENAME))) {
                    msg = `'bin' should be removed from the ${source} (${javaHome})`;
                } else {
                    msg = `The ${source} (${javaHome}) does not point to a JDK.`;
                }
                invalidJavaHome(reject, msg);
            }
            return resolve(javaHome);
        }
        // No settings, let's try to detect as last resort.
        findJavaHome((err, home) => {
            if (err) {
                openJDKDownload(reject, 'Java runtime (JDK, not JRE) could not be located');
            }
            else {
                resolve(home);
            }
        });
    });
}

async function checkJavaVersion(javaHome: string): Promise<number> {
    let javaVersion = await checkVersionInReleaseFile(javaHome);
    if (!javaVersion) {
        javaVersion = await checkVersionByCLI(javaHome);
    }
    return new Promise<number>((resolve, reject) => {
        if (javaVersion < 11) {
            openJDKDownload(reject, 'Java 11 or more recent is required to run the Java extension. Please download and install a recent JDK. You can still compile your projects with older JDKs by configuring [`java.configuration.runtimes`](https://github.com/redhat-developer/vscode-java/wiki/JDK-Requirements#java.configuration.runtimes)');
        }
        return resolve(javaVersion);
    });
}

/**
 * Get version by checking file JAVA_HOME/release
 */
async function checkVersionInReleaseFile(javaHome: string): Promise<number> {
    if (!javaHome) {
        return 0;
    }
    const releaseFile = path.join(javaHome, "release");
    if (!await fse.pathExists(releaseFile)) {
        return 0;
    }

    try {
        const content = await fse.readFile(releaseFile);
        const regexp = /^JAVA_VERSION="(.*)"/gm;
        const match = regexp.exec(content.toString());
        if (!match) {
            return 0;
        }
        const majorVersion = parseMajorVersion(match[1]);
        return majorVersion;
    } catch (error) {
        // ignore
    }
    return 0;
}

/**
 * Get version by parsing `JAVA_HOME/bin/java -version`
 */
function checkVersionByCLI(javaHome: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const javaBin = path.join(javaHome, "bin", JAVA_FILENAME);
        cp.execFile(javaBin, ['-version'], {}, (error, stdout, stderr) => {
            const regexp = /version "(.*)"/g;
            const match = regexp.exec(stderr);
            if (!match) {
                return resolve(0);
            }
            const javaVersion = parseMajorVersion(match[1]);
            resolve(javaVersion);
        });
    });
}

export function parseMajorVersion(version: string): number {
    if (!version) {
        return 0;
    }
    // Ignore '1.' prefix for legacy Java versions
    if (version.startsWith('1.')) {
        version = version.substring(2);
    }
    // look into the interesting bits now
    const regexp = /\d+/g;
    const match = regexp.exec(version);
    let javaVersion = 0;
    if (match) {
        javaVersion = parseInt(match[0]);
    }
    return javaVersion;
}

function openJDKDownload(reject, cause) {
    const jdkUrl = getJdkUrl();
    reject({
        message: cause,
        label: 'Get the Java Development Kit',
        command: Commands.OPEN_BROWSER,
        commandParam: Uri.parse(jdkUrl),
    });
}

function getJdkUrl() {
    let jdkUrl = 'https://developers.redhat.com/products/openjdk/download/?sc_cid=701f2000000RWTnAAO';
    if (process.platform === 'darwin') {
        jdkUrl = 'https://adoptopenjdk.net/';
    }
    return jdkUrl;
}

function invalidJavaHome(reject, cause: string) {
    if (cause.indexOf("java.home") > -1) {
        reject({
            message: cause,
            label: 'Open settings',
            command: Commands.OPEN_JSON_SETTINGS
        });
    } else {
        reject({
            message: cause,
        });
    }
}
