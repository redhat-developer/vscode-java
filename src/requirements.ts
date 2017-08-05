'use strict';

import { workspace, Uri } from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

const pathExists = require('path-exists');
const expandHomeDir = require('expand-home-dir');
const findJavaHome = require('find-java-home');
const isWindows = process.platform.indexOf('win') === 0;
const JAVAC_FILENAME = 'javac' + (isWindows?'.exe':'');

export interface RequirementsData {
    java_home: string;
    java_version: number;
}

interface ErrorData {
    message: string;
    label: string;
    openUrl: Uri;
    replaceClose: boolean;
}
/**
 * Resolves the requirements needed to run the extension.
 * Returns a promise that will resolve to a RequirementsData if
 * all requirements are resolved, it will reject with ErrorData if
 * if any of the requirements fails to resolve.
 *
 */
export async function resolveRequirements(): Promise<RequirementsData> {
    let java_home = await checkJavaRuntime();
    let javaVersion = await checkJavaVersion(java_home);
    return Promise.resolve({ 'java_home': java_home, 'java_version': javaVersion});
}

function checkJavaRuntime(): Promise<string> {
    return new Promise((resolve, reject) => {
        let source : string;
        let javaHome : string = readJavaConfig();
        if (javaHome) {
            source = 'The java.home variable defined in VS Code settings';
        } else {
            javaHome = process.env['JDK_HOME'];
            if (javaHome) {
                source = 'The JDK_HOME environment variable';
            } else {
                javaHome = process.env['JAVA_HOME'];
                source = 'The JAVA_HOME environment variable';
            }
        }
        if(javaHome ){
            javaHome = expandHomeDir(javaHome);
            if(!pathExists.sync(javaHome)){
                openJDKDownload(reject, source+' points to a missing folder');
            }
            if(!pathExists.sync(path.resolve(javaHome, 'bin', JAVAC_FILENAME))){
                openJDKDownload(reject, source+ ' does not point to a JDK.');
            }
            return resolve(javaHome);
        }
        //No settings, let's try to detect as last resort.
        findJavaHome(function (err, home) {
                if (err){
                    openJDKDownload(reject,'Java runtime could not be located');
                }
                else {
                    resolve(home);
                }
            });
    });
}

function readJavaConfig() : string {
    const config = workspace.getConfiguration();
    return config.get<string>('java.home',null);
}

function checkJavaVersion(java_home: string): Promise<number> {
    return new Promise((resolve, reject) => {
        cp.execFile(java_home + '/bin/java', ['-version'], {}, (error, stdout, stderr) => {
            if (stderr.indexOf('version "9') > -1){
                resolve(9);
            } if (stderr.indexOf('1.8') < 0){
                openJDKDownload(reject, 'Java 8 is required to run. Please download and install a JDK 8.');
            }
            else{
                resolve(8);
            }
        });
    });
}

function openJDKDownload(reject, cause) {
    let jdkUrl = 'http://developers.redhat.com/products/openjdk/overview/';
    if (process.platform === 'darwin') {
        jdkUrl = 'http://www.oracle.com/technetwork/java/javase/downloads/index.html';
    }
    reject({
        message: cause,
        label: 'Get Java Development Kit',
        openUrl: Uri.parse(jdkUrl),
        replaceClose: false
    });
}
