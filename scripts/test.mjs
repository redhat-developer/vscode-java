#!/usr/bin/env node
/* eslint-disable @typescript-eslint/naming-convention */

import fs from 'fs-extra';
import path from 'path';
import { getProjectPath, handleError, setupMainExecution } from './utils.mjs';

const originalTestFolder = getProjectPath('test', 'resources', 'projects', 'maven', 'salut');
const tempTestFolder = getProjectPath('test-temp');
const testSettings = path.join(tempTestFolder, '.vscode', 'settings.json');

async function generateStandardTestFolder() {
    console.log('Generating standard test folder...');

    try {
        fs.copySync(originalTestFolder, tempTestFolder);
        fs.ensureDirSync(path.join(tempTestFolder, '.vscode'));
        fs.writeJSONSync(testSettings, {
            "java.server.launchMode": "Standard",
            "java.configuration.updateBuildConfiguration": "automatic"
        });

        console.log('Successfully generated standard test folder');
    } catch (error) {
        handleError(error, 'generating standard test folder');
    }
}

async function generateLightweightTestFolder() {
    console.log('Generating lightweight test folder...');

    try {
        fs.copySync(originalTestFolder, tempTestFolder);
        fs.ensureDirSync(path.join(tempTestFolder, '.vscode'));
        fs.writeJSONSync(testSettings, {
            "java.server.launchMode": "LightWeight",
        });

        console.log('Successfully generated lightweight test folder');
    } catch (error) {
        handleError(error, 'generating lightweight test folder');
    }
}

async function cleanTestFolder() {
    console.log('Cleaning test folder...');

    try {
        if (fs.existsSync(tempTestFolder)) {
            fs.removeSync(tempTestFolder);
            console.log('Successfully cleaned test folder');
        } else {
            console.log('Test folder does not exist');
        }
    } catch (error) {
        handleError(error, 'cleaning test folder');
    }
}

// Main execution
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'standard':
            await generateStandardTestFolder();
            break;
        case 'lightweight':
            await generateLightweightTestFolder();
            break;
        case 'clean':
            await cleanTestFolder();
            break;
        default:
            console.log('Usage: node test.js [standard|lightweight|clean]');
            process.exit(1);
    }
}

setupMainExecution(main);

export { generateStandardTestFolder, generateLightweightTestFolder, cleanTestFolder };
