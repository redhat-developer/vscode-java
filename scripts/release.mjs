#!/usr/bin/env node

import fs from 'fs-extra';
import { getProjectPath, handleError, setupMainExecution } from './utils.mjs';

function prependZero(num) {
    if (num > 99) {
        throw "Unexpected value to prepend with zero";
    }
    return `${num < 10 ? "0" : ""}${num}`;
}

async function preparePreRelease() {
    console.log('Preparing pre-release version...');

    try {
        const packageJsonPath = getProjectPath('package.json');
        const json = JSON.parse(fs.readFileSync(packageJsonPath).toString());
        const stableVersion = json.version.match(/(\d+)\.(\d+)\.(\d+)/);

        if (!stableVersion) {
            throw new Error('Invalid version format in package.json');
        }

        const major = stableVersion[1];
        const minor = stableVersion[2];
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const patch = `${date.getFullYear()}${prependZero(month)}${prependZero(day)}${prependZero(hours)}`;

        const insiderPackageJson = Object.assign(json, {
            version: `${major}.${minor}.${patch}`,
        });

        fs.writeFileSync(packageJsonPath, JSON.stringify(insiderPackageJson, null, 2));
        console.log(`Successfully updated version to ${insiderPackageJson.version}`);
    } catch (error) {
        handleError(error, 'preparing pre-release');
    }
}

// Main execution
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'prepare':
            await preparePreRelease();
            break;
        default:
            console.log('Usage: node release.js [prepare]');
            process.exit(1);
    }
}

setupMainExecution(main);

export { preparePreRelease };
