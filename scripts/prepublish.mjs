#!/usr/bin/env node

// Skip webpack if SKIP_WEBPACK environment variable is set to 'true'
if (process.env.SKIP_WEBPACK === 'true') {
    console.log('Skipping webpack compilation (SKIP_WEBPACK=true)');
    process.exit(0);
}

// Otherwise, run webpack using the local webpack-cli installation
const { spawn } = await import('child_process');
const { fileURLToPath } = await import('url');
const { dirname, resolve, join } = await import('path');

const scriptFilename = fileURLToPath(import.meta.url);
const scriptDirname = dirname(scriptFilename);
const projectRoot = resolve(scriptDirname, '..');

// Use webpack-cli from local node_modules (cross-platform)
const webpackCliPath = join(projectRoot, 'node_modules', '.bin', 'webpack');
const isWindows = process.platform === 'win32';
const webpackCommand = isWindows ? `${webpackCliPath}.cmd` : webpackCliPath;

const webpack = spawn(webpackCommand, ['--mode', 'production'], {
    stdio: 'inherit',
    cwd: projectRoot
});

webpack.on('close', (code) => {
    process.exit(code || 0);
});

webpack.on('error', (error) => {
    console.error('Error running webpack:', error);
    process.exit(1);
});
