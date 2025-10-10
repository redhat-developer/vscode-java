#!/usr/bin/env node

/* eslint-disable no-underscore-dangle */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chokidar from 'chokidar';
import { glob } from 'glob';
import { downloadFile, getScriptDir, extractTarGz, handleError, setupMainExecution } from './utils.mjs';

const dirname = getScriptDir();

const serverDir = path.join(dirname, '..', '..', 'eclipse.jdt.ls');
const JDT_LS_SNAPSHOT_URL = "https://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz";

function isWin() {
    return /^win/.test(process.platform);
}

function mvnw() {
    return isWin() ? "mvnw.cmd" : "./mvnw";
}


async function downloadServer() {
    console.log('Downloading Eclipse JDT Language Server snapshot...');

    fs.removeSync('./server');
    fs.ensureDirSync('./server');

    const tempFile = path.join(dirname, 'temp-server.tar.gz');

    try {
        await downloadFile(JDT_LS_SNAPSHOT_URL, tempFile);
        await extractTarGz(tempFile, './server');
        fs.removeSync(tempFile);

        console.log('Successfully downloaded and extracted JDT Language Server');
    } catch (error) {
        handleError(error, 'downloading server');
    }
}

async function buildServer() {
    console.log('Building Eclipse JDT Language Server...');

    fs.removeSync('./server');
    fs.ensureDirSync('./server');

    try {
        const command = `${mvnw()  } -Pserver-distro clean package -U -Declipse.jdt.ls.skipGradleChecksums`;
        console.log(`Executing: ${command}`);
        execSync(command, { cwd: serverDir, stdio: [0, 1, 2] });

        const sources = await glob(`${serverDir  }/org.eclipse.jdt.ls.product/distro/*.tar.gz`);

        if (sources.length > 0) {
            await extractTarGz(sources[0], './server');
            console.log('Successfully built and extracted JDT Language Server');
        } else {
            throw new Error('No server distribution found after build');
        }
    } catch (error) {
        handleError(error, 'building server', false);
        throw error;
    }
}

async function buildOrDownload() {
    if (!fs.existsSync(serverDir)) {
        console.log('NOTE: eclipse.jdt.ls is not found as a sibling directory, downloading the latest snapshot of the Eclipse JDT Language Server...');
        await downloadServer();
    } else {
        await buildServer();
    }
}

async function devServer() {
    console.log('Building development server...');

    try {
        const command = `${mvnw()  } -o -pl org.eclipse.jdt.ls.core,org.eclipse.jdt.ls.target clean package -Declipse.jdt.ls.skipGradleChecksums`;
        console.log(`Executing: ${command}`);
        execSync(command, { cwd: serverDir, stdio: [0, 1, 2] });

        const sources = await glob(`${serverDir  }/org.eclipse.jdt.ls.core/target/org.eclipse.jdt.ls.core-*-SNAPSHOT.jar`);
        const targets = await glob('./server/plugins/org.eclipse.jdt.ls.core_*.jar');

        if (sources.length > 0 && targets.length > 0) {
            console.log(`Copying ${sources[0]} to ${targets[0]}`);
            fs.copySync(sources[0], targets[0]);
            console.log('Successfully built development server');
        } else {
            throw new Error('Source or target JAR files not found');
        }
    } catch (error) {
        handleError(error, 'building development server');
    }
}

async function watchServer() {
    console.log('Watching server files for changes...');
	// if server_dir is not a directory, throw an error
	if (!fs.existsSync(serverDir)) {
		throw new Error(`Server directory '${serverDir}' does not exist. This command is for JDT Language Server development. You need to have the eclipse.jdt.ls repository as a sibling directory to use this feature.`);
	}
    const watcher = chokidar.watch(`${serverDir  }/org.eclipse.jdt.ls.core/**/*.java`, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });

    watcher.on('change', async (path) => {
        console.log(`File ${path} has been changed, rebuilding...`);
        try {
            await devServer();
        } catch (error) {
            handleError(error, 'rebuilding server', false);
        }
    });

    console.log('Watching for changes. Press Ctrl+C to stop.');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nStopping watcher...');
        watcher.close();
        process.exit(0);
    });

    // Keep the process alive by waiting indefinitely
    return new Promise((resolve, reject) => {
        console.log('Watcher is now active and waiting for file changes...');
        // This promise never resolves, keeping the process alive
        // The process will only exit when SIGINT is received
    });
}

// Main execution
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'download':
            await downloadServer();
            break;
        case 'build':
            await buildServer();
            break;
        case 'build-or-download':
            await buildOrDownload();
            break;
        case 'dev':
            await devServer();
            break;
        case 'watch':
            await watchServer();
            break;
        default:
            console.log('Usage: node server.js [download|build|build-or-download|dev|watch]');
            process.exit(1);
    }
}

setupMainExecution(main);

export { downloadServer, buildServer, buildOrDownload, devServer, watchServer };
