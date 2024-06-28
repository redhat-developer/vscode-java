'use strict';

import * as expandHomeDir from 'expand-home-dir';
import * as fse from 'fs-extra';
import { getRuntime, getSources, JAVAC_FILENAME, JAVA_FILENAME } from 'jdk-utils';
import * as path from 'path';
import { env, ExtensionContext, Uri, window, workspace } from 'vscode';
import { Commands } from './commands';
import { logger } from './log';
import { checkJavaPreferences } from './settings';
import { listJdks, sortJdksBySource, sortJdksByVersion } from './jdkUtils';

const REQUIRED_JDK_VERSION = 22;
/* eslint-disable @typescript-eslint/naming-convention */
export interface RequirementsData {
    tooling_jre: string;
    tooling_jre_version: number;
    java_home: string;
    java_version: number;
}
/* eslint-enable @typescript-eslint/naming-convention */

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
    let toolingJreVersion: number = await getMajorVersion(toolingJre);
    return new Promise(async (resolve, reject) => {
        const javaPreferences = await checkJavaPreferences(context);
        const preferenceName = javaPreferences.preference;
        let javaHome = javaPreferences.javaHome;
        let javaVersion: number = 0;
        if (javaHome) {
            const source = `${preferenceName} variable defined in ${env.appName} settings`;
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
            javaVersion = await getMajorVersion(javaHome);
            if (preferenceName === "java.jdt.ls.java.home" || !toolingJre) {
                if (javaVersion >= REQUIRED_JDK_VERSION) {
                    toolingJre = javaHome;
                    toolingJreVersion = javaVersion;
                } else {
                    const neverShow: boolean | undefined = context.workspaceState.get<boolean>("java.home.failsMinRequiredFirstTime");
                    if (!neverShow) {
                        context.workspaceState.update("java.home.failsMinRequiredFirstTime", true);
                        window.showInformationMessage(`The Java runtime set by 'java.jdt.ls.java.home' does not meet the minimum required version of '${REQUIRED_JDK_VERSION}' and will not be used.`);
                    }
                }
            }
        }

        // search valid JDKs from env.JAVA_HOME, env.PATH, SDKMAN, jEnv, jabba, Common directories
        const javaRuntimes = await listJdks();
        if (!toolingJre) { // universal version
            // as latest version as possible.
            sortJdksByVersion(javaRuntimes);
            const validJdks = javaRuntimes.filter(r => r.version.major >= REQUIRED_JDK_VERSION);
            if (validJdks.length > 0) {
                sortJdksBySource(validJdks);
                javaHome = validJdks[0].homedir;
                javaVersion = validJdks[0].version.major;
                toolingJre = javaHome;
                toolingJreVersion = javaVersion;
            }
        } else { // pick a default project JDK/JRE
            /**
             * For legacy users, we implicitly following the order below to
             * set a default project JDK during initialization:
             * java.jdt.ls.java.home > java.home > env.JDK_HOME > env.JAVA_HOME > env.PATH
             *
             * We'll keep it for compatibility.
             */
            if (javaHome) {
                logger.info(`Use the JDK from '${preferenceName}' setting as the initial default project JDK.`);
            } else if (javaRuntimes.length) {
                sortJdksBySource(javaRuntimes);
                javaHome = javaRuntimes[0].homedir;
                javaVersion = javaRuntimes[0].version?.major;
                logger.info(`Use the JDK from '${getSources(javaRuntimes[0])}' as the initial default project JDK.`);
            } else if (javaHome = await findDefaultRuntimeFromSettings()) {
                javaVersion = await getMajorVersion(javaHome);
                logger.info("Use the JDK from 'java.configuration.runtimes' as the initial default project JDK.");
            } else {
                openJDKDownload(reject, "Please download and install a JDK to compile your project. You can configure your projects with different JDKs by the setting ['java.configuration.runtimes'](https://github.com/redhat-developer/vscode-java/wiki/JDK-Requirements#java.configuration.runtimes)");
            }
        }

        if (!toolingJre || toolingJreVersion < REQUIRED_JDK_VERSION) {
            openJDKDownload(reject, `Java ${REQUIRED_JDK_VERSION} or more recent is required to run the Java extension. Please download and install a recent JDK. You can still compile your projects with older JDKs by configuring ['java.configuration.runtimes'](https://github.com/redhat-developer/vscode-java/wiki/JDK-Requirements#java.configuration.runtimes)`);
        }

        /* eslint-disable @typescript-eslint/naming-convention */
        resolve({
            tooling_jre: toolingJre,
            tooling_jre_version: toolingJreVersion,
            java_home: javaHome,
            java_version: javaVersion,
        });
        /* eslint-enable @typescript-eslint/naming-convention */
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

async function findDefaultRuntimeFromSettings(): Promise<string | undefined> {
    const runtimes = workspace.getConfiguration().get("java.configuration.runtimes");
    if (Array.isArray(runtimes) && runtimes.length) {
        let candidate: string;
        for (const runtime of runtimes) {
            if (!runtime || typeof runtime !== 'object' || !runtime.path) {
                continue;
            }

            const jr = await getRuntime(runtime.path);
            if (jr) {
                candidate = jr.homedir;
            }

            if (runtime.default) {
                break;
            }
        }

        return candidate;
    }

    return undefined;
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

export function getJdkUrl() {
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

async function getMajorVersion(javaHome: string): Promise<number> {
    if (!javaHome) {
        return 0;
    }
    const runtime = await getRuntime(javaHome, { withVersion: true });
    return runtime?.version?.major || 0;
}