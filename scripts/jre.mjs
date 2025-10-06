#!/usr/bin/env node
/* eslint-disable @typescript-eslint/naming-convention */

import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import { downloadFile, getScriptDir, extractTarGz, handleError, setupMainExecution } from './utils.mjs';

const dirname = getScriptDir();

const LATEST_JRE = 21;

const platformMapping = {
    "linux-arm64": "linux-aarch64",
    "linux-x64": "linux-x86_64",
    "darwin-arm64": "macosx-aarch64",
    "darwin-x64": "macosx-x86_64",
    "win32-x64": "win32-x86_64"
};


async function downloadManifest(manifestUrl) {
    return new Promise((resolve, reject) => {
        https.get(manifestUrl, (response) => {
            if (response.statusCode >= 400) {
                reject(new Error(`${response.statusCode} returned from ${manifestUrl}`));
                return;
            }
            let body = '';
            response.on('data', (chunk) => body += chunk);
            response.on('end', () => resolve(body));
        }).on('error', reject);
    });
}


async function cleanJre() {
    if (fs.existsSync('./jre')) {
        fs.removeSync('./jre');
        console.log('Cleaned JRE directory');
    }
}

async function downloadJre(targetPlatform, javaVersion) {
    if (fs.existsSync('./jre')) {
        fs.removeSync('./jre');
    }

    if (!targetPlatform || !Object.keys(platformMapping).includes(targetPlatform)) {
        console.log("[Error] download_jre failed, please specify a valid target platform via --target argument. Here are the supported platform list:");
        for (const platform of Object.keys(platformMapping)) {
            console.log(platform);
        }
        return;
    }

    const version = (!javaVersion || javaVersion === "latest") ? LATEST_JRE : javaVersion;
    console.log(`Downloading justj JRE ${version} for the platform ${targetPlatform}...`);

    const manifestUrl = `https://download.eclipse.org/justj/jres/${version}/downloads/latest/justj.manifest`;

    try {
        const manifest = await downloadManifest(manifestUrl);

        if (!manifest) {
            throw new Error(`Failed to download justj.manifest, please check if the link ${manifestUrl} is valid.`);
        }

        const javaPlatform = platformMapping[targetPlatform];
        const list = manifest.split(/\r?\n/);
        const jreIdentifier = list.find((value) => {
            return value.indexOf("org.eclipse.justj.openjdk.hotspot.jre.full.stripped") >= 0 && value.indexOf(javaPlatform) >= 0;
        });

        if (!jreIdentifier) {
            throw new Error(`justj doesn't support the jre ${version} for the platform ${javaPlatform} (${targetPlatform}), please refer to the link ${manifestUrl} for the supported platforms.`);
        }

        const jreDownloadUrl = `https://download.eclipse.org/justj/jres/${version}/downloads/latest/${jreIdentifier}`;
        const parsedDownloadUrl = new URL(jreDownloadUrl);
        const jreFileName = path.basename(parsedDownloadUrl.pathname)
            .replace(/[\.7z|\.bz2|\.gz|\.rar|\.tar|\.zip|\.xz]*$/, "");
        const idx = jreFileName.indexOf('-');
        const jreVersionLabel = idx >= 0 ? jreFileName.substring(idx + 1) : jreFileName;

        const tempFile = path.join(dirname, 'temp-jre.tar.gz');
        const destDir = path.join('./jre', jreVersionLabel);

        // Ensure the jre directory exists
        fs.ensureDirSync('./jre');
        fs.ensureDirSync(destDir);

        console.log(`Downloading JRE from ${jreDownloadUrl}...`);
        await downloadFile(jreDownloadUrl, tempFile);

        console.log(`Extracting JRE to ${destDir}...`);
        await extractTarGz(tempFile, destDir);

        // Clean up temp file
        fs.removeSync(tempFile);

        console.log(`Successfully downloaded and extracted JRE ${jreVersionLabel}`);
    } catch (error) {
        handleError(error, 'downloading JRE');
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const targetIndex = args.indexOf('--target');
    const versionIndex = args.indexOf('--javaVersion');

    const targetPlatform = targetIndex !== -1 ? args[targetIndex + 1] : `${process.platform}-${process.arch}`;
    const javaVersion = versionIndex !== -1 ? args[versionIndex + 1] : LATEST_JRE;

    if (args.includes('clean')) {
        await cleanJre();
    } else {
        await downloadJre(targetPlatform, javaVersion);
    }
}

setupMainExecution(main);

export { cleanJre, downloadJre };
