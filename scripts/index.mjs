#!/usr/bin/env node

import { cleanJre, downloadJre } from './jre.mjs';
import { downloadLombok } from './lombok.mjs';
import { downloadServer, buildServer, buildOrDownload, devServer, watchServer } from './server.mjs';
import { generateStandardTestFolder, generateLightweightTestFolder, cleanTestFolder } from './test.mjs';
import { preparePreRelease } from './release.mjs';
import { repoCheck, repoFix } from './repo.mjs';
import { pathToFileURL } from 'url';

async function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
        // JRE commands
        case 'clean-jre':
            await cleanJre();
            break;
        case 'download-jre':
            const targetIndex = args.indexOf('--target');
            const versionIndex = args.indexOf('--javaVersion');
            const targetPlatform = targetIndex !== -1 ? args[targetIndex + 1] : undefined;
            const javaVersion = versionIndex !== -1 ? args[versionIndex + 1] : undefined;
            await downloadJre(targetPlatform, javaVersion);
            break;

        // Lombok commands
        case 'download-lombok':
            await downloadLombok();
            break;

        // Server commands
        case 'download-server':
            await downloadServer();
            break;
        case 'build-server':
            try {
                await buildServer();
            } catch (error) {
                console.error('Build failed:', error.message);
                process.exit(1);
            }
            break;
        case 'build-or-download':
            await buildOrDownload();
            break;
        case 'dev-server':
            await devServer();
            break;
        case 'watch-server':
            try {
                await watchServer();
            } catch (error) {
                console.error('Error:', error.message);
                process.exit(1);
            }
            break;

        // Test commands
        case 'generate-standard-test-folder':
            await generateStandardTestFolder();
            break;
        case 'generate-lightweight-test-folder':
            await generateLightweightTestFolder();
            break;
        case 'clean-test-folder':
            await cleanTestFolder();
            break;

        // Release commands
        case 'prepare-pre-release':
            await preparePreRelease();
            break;

        // Repository commands
        case 'repo-check':
            await repoCheck();
            break;
        case 'repo-fix':
            await repoFix();
            break;

        default:
            console.log(`
Usage: node scripts/index.js <command> [options]

Commands:
  JRE Management:
    clean-jre                           Clean JRE directory
    download-jre [--target <platform>] [--javaVersion <version>]  Download JRE

  Lombok Management:
    download-lombok                     Download Lombok

  Server Management:
    download-server                     Download JDT Language Server
    build-server                        Build JDT Language Server
    build-or-download                   Build or download JDT Language Server
    dev-server                          Build development server
    watch-server                        Watch server files for changes

  Test Environment:
    generate-standard-test-folder       Generate standard test folder
    generate-lightweight-test-folder    Generate lightweight test folder
    clean-test-folder                   Clean test folder

  Release Management:
    prepare-pre-release                 Prepare pre-release version

  Repository Management:
    repo-check                          Check package-lock.json for internal registry references
    repo-fix                            Fix package-lock.json registry references

Examples:
  node scripts/index.js download-jre --target darwin-x64 --javaVersion 21
  node scripts/index.js build-or-download
  node scripts/index.js watch-server
            `);
            process.exit(1);
    }
}

if (import.meta.url === pathToFileURL(process.argv[1]).toString()) {
    main().catch(console.error);
}

export {
    cleanJre,
    downloadJre,
    downloadLombok,
    downloadServer,
    buildServer,
    buildOrDownload,
    devServer,
    watchServer,
    generateStandardTestFolder,
    generateLightweightTestFolder,
    cleanTestFolder,
    preparePreRelease,
    repoCheck,
    repoFix
};
