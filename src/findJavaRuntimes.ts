// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as cp from "child_process";
import * as fse from "fs-extra";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
const expandHomeDir = require("expand-home-dir");
const WinReg = require("winreg-utf8");
const isWindows: boolean = process.platform.indexOf("win") === 0;
const isMac: boolean = process.platform.indexOf("darwin") === 0;
const isLinux: boolean = process.platform.indexOf("linux") === 0;
const JAVAC_FILENAME = "javac" + (isWindows ? ".exe" : "");
const JAVA_FILENAME = "java" + (isWindows ? ".exe" : "");

export interface JavaRuntime {
    home: string;
    version: number;
    sources: string[];
}

/**
 * return metadata for all installed JDKs.
 */
export async function findJavaHomes(): Promise<JavaRuntime[]> {
    const ret: JavaRuntime[] = [];
    const jdkMap = new Map<string, string[]>();

    updateJDKs(jdkMap, await fromEnv("JDK_HOME"), "env.JDK_HOME");
    updateJDKs(jdkMap, await fromEnv("JAVA_HOME"), "env.JAVA_HOME");
    updateJDKs(jdkMap, await fromPath(), "env.PATH");
    updateJDKs(jdkMap, await fromWindowsRegistry(), "WindowsRegistry");
    updateJDKs(jdkMap, await fromCommonPlaces(), "DefaultLocation");

    for (const elem of jdkMap) {
        const home = elem[0];
        const sources = elem[1];
        const version = await getJavaVersion(home);
        if (version) {
            ret.push({
                home,
                sources,
                version
            });
        } else {
            console.warn(`Unknown version of JDK ${home}`);
        }
    }
    return ret;
}

function updateJDKs(map: Map<string, string[]>, newJdks: string[], source: string) {
    for (const newJdk of newJdks) {
        const sources = map.get(newJdk);
        if (sources !== undefined) {
            map.set(newJdk, [...sources, source]);
        } else {
            map.set(newJdk, [source]);
        }
    }
}

async function fromEnv(name: string): Promise<string[]> {
    const ret: string[] = [];
    if (process.env[name]) {
        const javaHome = await verifyJavaHome(process.env[name], JAVAC_FILENAME);
        if (javaHome) {
            ret.push(javaHome);
        }
    }
    return ret;
}

async function fromPath(): Promise<string[]> {
    const ret: string[] = [];

    const paths = process.env.PATH ? process.env.PATH.split(path.delimiter).filter(Boolean) : [];
    for (const p of paths) {
        const proposed = path.dirname(p); // remove "bin"
        const javaHome = await verifyJavaHome(proposed, JAVAC_FILENAME);
        if (javaHome) {
            ret.push(javaHome);
        }

        if (isMac) {
            let dir = expandHomeDir(p);
            dir = await findLinkedFile(dir);
            // on mac, java install has a utility script called java_home
            const macUtility = path.join(dir, "java_home");
            if (await fse.pathExists(macUtility)) {
                let buffer;
                try {
                    buffer = cp.execSync(macUtility, { cwd: dir });
                    const absoluteJavaHome = "" + buffer.toString().replace(/\n$/, "");
                    const verified = await verifyJavaHome(absoluteJavaHome, JAVAC_FILENAME);
                    if (verified) {
                        ret.push(absoluteJavaHome);
                    }
                } catch (error) {
                    // do nothing
                }
            }
        }
    }

    if (isMac) {
        // Exclude /usr, because in macOS Big Sur /usr/bin/javac is no longer symlink.
        // See https://github.com/redhat-developer/vscode-java/issues/1700#issuecomment-729478810
        return ret.filter(item => item !== "/usr");
    } else {
        return ret;
    }
}

async function fromWindowsRegistry(): Promise<string[]> {
    if (!isWindows) {
        return [];
    }

    const keyPaths: string[] = [
        "\\SOFTWARE\\JavaSoft\\JDK",
        "\\SOFTWARE\\JavaSoft\\Java Development Kit"
    ];

    const promisifyFindPossibleRegKey = (keyPath: string, regArch: string): Promise<Winreg.Registry[]> => {
        return new Promise<Winreg.Registry[]>((resolve) => {
            const winreg: Winreg.Registry = new WinReg({
                hive: WinReg.HKLM,
                key: keyPath,
                arch: regArch
            });
            winreg.keys((err, result) => {
                if (err) {
                    return resolve([]);
                }
                resolve(result);
            });
        });
    };

    const promisifyFindJavaHomeInRegKey = (reg: Winreg.Registry): Promise<string | null> => {
        return new Promise<string | null>((resolve) => {
            reg.get("JavaHome", (err, home) => {
                if (err || !home) {
                    return resolve(null);
                }
                resolve(home.value);
            });
        });
    };

    const promises = [];
    for (const arch of ["x64", "x86"]) {
        for (const keyPath of keyPaths) {
            promises.push(promisifyFindPossibleRegKey(keyPath, arch));
        }
    }

    const keysFoundSegments: Winreg.Registry[][] = await Promise.all(promises);
    const keysFound: Winreg.Registry[] = Array.prototype.concat.apply([], keysFoundSegments);
    if (!keysFound.length) {
        return [];
    }

    const sortedKeysFound = keysFound.sort((a, b) => {
        const aVer = parseFloat(a.key);
        const bVer = parseFloat(b.key);
        return bVer - aVer;
    });

    const javaHomes: string[] = [];
    for (const key of sortedKeysFound) {
        const candidate = await promisifyFindJavaHomeInRegKey(key);
        if (candidate) {
            javaHomes.push(candidate);
        }
    }

    const ret: string[] = [];
    for (const proposed of javaHomes) {
        const javaHome = await verifyJavaHome(proposed, JAVAC_FILENAME);
        if (javaHome) {
            ret.push(javaHome);
        }
    }
    return ret;
}

async function fromCommonPlaces(): Promise<string[]> {
    const ret: string[] = [];

    // common place for mac
    if (isMac) {
        const jvmStore = "/Library/Java/JavaVirtualMachines";
        const subfolder = "Contents/Home";
        let jvms: string[] = [];
        try {
            jvms = await fse.readdir(jvmStore);
        } catch (error) {
            // ignore
        }
        for (const jvm of jvms) {
            const proposed = path.join(jvmStore, jvm, subfolder);
            const javaHome = await verifyJavaHome(proposed, JAVAC_FILENAME);
            if (javaHome) {
                ret.push(javaHome);
            }
        }
    }

    // common place for Windows
    if (isWindows) {
        const localAppDataFolder = process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA : path.join(os.homedir(), "AppData", "Local");
        const possibleLocations: string[] = [
            process.env.ProgramFiles && path.join(process.env.ProgramFiles, "Java"), // Oracle JDK per machine
            process.env.ProgramW6432 && path.join(process.env.ProgramW6432, "Java"), // Oracle JDK per machine
            process.env.ProgramFiles && path.join(process.env.ProgramFiles, "AdoptOpenJDK"), // AdoptOpenJDK per machine
            process.env.ProgramW6432 && path.join(process.env.ProgramW6432, "AdoptOpenJDK"), // AdoptOpenJDK per machine
            path.join(localAppDataFolder, "Programs", "AdoptOpenJDK"), // AdoptOpenJDK per user
        ].filter(Boolean) as string[];
        const jvmStores = _.uniq(possibleLocations);
        for (const jvmStore of jvmStores) {
            let jvms: string[] = [];
            try {
                jvms = await fse.readdir(jvmStore);
            } catch (error) {
                // ignore
            }
            for (const jvm of jvms) {
                const proposed = path.join(jvmStore, jvm);
                const javaHome = await verifyJavaHome(proposed, JAVAC_FILENAME);
                if (javaHome) {
                    ret.push(javaHome);
                }
            }
        }
    }

    // common place for Linux
    if (isLinux) {
        const jvmStore = "/usr/lib/jvm";
        let jvms: string[] = [];
        try {
            jvms = await fse.readdir(jvmStore);
        } catch (error) {
            // ignore
        }
        for (const jvm of jvms) {
            const proposed = path.join(jvmStore, jvm);
            const javaHome = await verifyJavaHome(proposed, JAVAC_FILENAME);
            if (javaHome) {
                ret.push(javaHome);
            }
        }
    }

    return ret;
}

export async function verifyJavaHome(raw: string, javaFilename: string): Promise<string | undefined> {
    const dir = expandHomeDir(raw);
    const targetJavaFile = await findLinkedFile(path.resolve(dir, "bin", javaFilename));
    const proposed = path.dirname(path.dirname(targetJavaFile));
    if (await fse.pathExists(proposed)
        && await fse.pathExists(path.resolve(proposed, "bin", javaFilename))
    ) {
        return proposed;
    }
    return undefined;
}

// iterate through symbolic links until file is found
async function findLinkedFile(file: string): Promise<string> {
    if (!await fse.pathExists(file) || !(await fse.lstat(file)).isSymbolicLink()) {
        return file;
    }
    return await findLinkedFile(await fse.readlink(file));
}

export async function getJavaVersion(javaHome: string): Promise<number | undefined> {
    let javaVersion = await checkVersionInReleaseFile(javaHome);
    if (!javaVersion) {
        javaVersion = await checkVersionByCLI(javaHome);
    }
    return javaVersion;
}

export function parseMajorVersion(version: string): number {
    if (!version) {
        return 0;
    }
    // Ignore '1.' prefix for legacy Java versions
    if (version.startsWith("1.")) {
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
async function checkVersionByCLI(javaHome: string): Promise<number> {
    if (!javaHome) {
        return 0;
    }
    return new Promise((resolve, reject) => {
        const javaBin = path.join(javaHome, "bin", JAVA_FILENAME);
        cp.execFile(javaBin, ["-version"], {}, (error, stdout, stderr) => {
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
