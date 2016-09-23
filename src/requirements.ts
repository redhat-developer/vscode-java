'use strict';

import { Uri } from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as downloadManager from './downloadManager';


var findJavaHome = require('find-java-home');

interface RequirementsData {
    java_home: string
}

interface ErrorData {
    message: string
    label: string
    openUrl: Uri
    replaceClose: boolean
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
    let isJava8 = await checkJavaVersion(java_home);
    let serverInstalled = await checkServerInstalled();
    return Promise.resolve({ "java_home": java_home });
}

async function checkJavaRuntime(): Promise<any> {
    return new Promise((resolve, reject) => {
        findJavaHome(function (err, home) {
            if (err)
                reject({
                    message: "Java could not be detected. Please download and install a Java 8 Development Kit to enable Java Language Support.",
                    label: "Get OpenJDK",
                    openUrl: Uri.parse('http://developers.redhat.com/products/openjdk/overview/'),
                    replaceClose: false
                });
            else
                resolve(home);
        });
    });
}

async function checkJavaVersion(java_home: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let result = cp.execFile(java_home + '/bin/java', ['-version'], {}, (error, stdout, stderr) => {
            if (stderr.indexOf('1.8') < 0)
                reject({
                    message: "Java Language Support requires Java 8 to run. Please download and install a Java 8 ",
                    label: "Get OpenJDK",
                    openUrl: Uri.parse('http://developers.redhat.com/products/openjdk/overview/'),
                    replaceClose: false
                });
            else
                resolve(true);
        });
    });
}

async function checkServerInstalled(): Promise<any> {
    let pluginsPath = path.resolve(__dirname, '../../server/plugins');
    try {
        let isDirectory = fs.lstatSync(pluginsPath);
        if (isDirectory) {
            return Promise.resolve(true);
        }
    }
    catch (err) {
       // Directory does not exist 
    }
    return downloadManager.downloadAndInstallServer();
}
