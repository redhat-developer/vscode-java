#!/usr/bin/env node

import fs from 'fs-extra';
import { getProjectPath, handleError, setupMainExecution } from './utils.mjs';

const NON_NPM_REPOSITORY_RE = new RegExp(
    String.raw`"resolved":\s*"https://.+/registry.npmjs.org/`,
    "g"
);

async function repoCheck() {
    console.log('Checking package-lock.json for internal registry references...');

    try {
        const packageLockPath = getProjectPath('package-lock.json');
        const data = fs.readFileSync(packageLockPath, { encoding: "utf-8" });

        if (NON_NPM_REPOSITORY_RE.test(data)) {
            console.error("Found references to the internal registry in the file package-lock.json. Please fix it with 'npm run repo:fix'");
            process.exit(1);
        } else {
            console.log('No internal registry references found');
        }
    } catch (error) {
        handleError(error, 'checking repository');
    }
}

async function repoFix() {
    console.log('Fixing package-lock.json registry references...');

    try {
        const packageLockPath = getProjectPath('package-lock.json');
        const data = fs.readFileSync(packageLockPath, { encoding: "utf-8" });
        const newData = data.replace(NON_NPM_REPOSITORY_RE, `"resolved": "https://registry.npmjs.org/`);

        if (data !== newData) {
            fs.writeFileSync(packageLockPath, newData, {
                encoding: "utf-8",
            });
            console.log('Successfully fixed package-lock.json');
        } else {
            console.log('Nothing to fix');
        }
    } catch (error) {
        handleError(error, 'fixing repository');
    }
}

// Main execution
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'check':
            await repoCheck();
            break;
        case 'fix':
            await repoFix();
            break;
        default:
            console.log('Usage: node repo.js [check|fix]');
            process.exit(1);
    }
}

setupMainExecution(main);

export { repoCheck, repoFix };
