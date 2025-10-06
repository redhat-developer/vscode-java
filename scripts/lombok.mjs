#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { downloadFile, handleError, setupMainExecution } from './utils.mjs';

async function downloadLombok() {
    if (fs.existsSync('./lombok')) {
        fs.removeSync('./lombok');
    }

    try {
        const lombokVersion = '1.18.38';
        // The latest lombok version can be found on the website https://projectlombok.org/downloads
        const lombokUrl = `https://projectlombok.org/downloads/lombok-${lombokVersion}.jar`;

        // Ensure the lombok directory exists
        fs.ensureDirSync('./lombok');

        console.log(`Downloading Lombok ${lombokVersion}...`);
        await downloadFile(lombokUrl, path.join('./lombok', `lombok-${lombokVersion}.jar`));

        console.log(`Successfully downloaded Lombok ${lombokVersion}`);
    } catch (error) {
        handleError(error, 'downloading Lombok');
    }
}

// Main execution
async function main() {
    await downloadLombok();
}

setupMainExecution(main);

export { downloadLombok };
