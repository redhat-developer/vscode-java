'use strict';

import * as path from 'path';
import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';

function isWin() {
    return /^win/.test(process.platform);
}

function isMac() {
    return /^darwin/.test(process.platform);
}

function isLinux() {
    return /^linux/.test(process.platform);
}
let workspacePath = process.env['WORKSPACE_PATH'];
if (!workspacePath) {
    workspacePath = path.resolve(os.homedir(), 'workspacetemp');
}
let port = process.env['JDTLS_SERVER_PORT'];
if (!port) {
    process.env.JDTLS_SERVER_PORT = 8888;
}
let config = './config_win';
if (isLinux()) {
    config = './config_linux';
}
if (isMac()) {
    config = './config_mac';
}
let launcher: string;
fs.readdirSync('./plugins/').forEach(file => {
    if (file.lastIndexOf('org.eclipse.equinox.launcher_', 0) === 0) {
        launcher = './plugins/' + file;
    }
});
let args = ['-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044',
    '-Declipse.application=org.eclipse.jdt.ls.core.id1',
    '-Dosgi.bundles.defaultStartLevel=4',
    '-Declipse.product=org.eclipse.jdt.ls.core.product',
    '-Dlog.protocol=true',
    '-Dlog.level=ALL',
    '-noverify',
    '-Xmx1G',
    '-jar',
    launcher,
    '-configuration',
    config,
    '-data',
    workspacePath];
let options = {
    detached: true,
    env: process.env
};
startServer(args, options);

function startServer(args, options) {
    let server = cp.spawn('java', args, options);
    process.on('SIGINT', () => server.kill('SIGINT'));
    server.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    server.on('close', (code) => {
        if (code === 0) {
            console.log('server restarted');
            startServer(args, options);
            return;
        }
        console.log(`exited with code ${code}`);
    });
}