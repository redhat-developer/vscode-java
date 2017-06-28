
import { window, commands, WorkspaceConfiguration, workspace } from 'vscode'
import { StreamInfo } from 'vscode-languageclient';
import { createClientPipeTransport } from 'vscode-jsonrpc';
import * as requirements from './requirements';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import { Commands } from './commands';
const glob = require('glob');

declare var v8debug;
const DEBUG = (typeof v8debug === 'object') || startedInDebugMode();
let electron = require('./electron_j');

export function attachServer(pipeName): Thenable<StreamInfo> {
	let pipePath;
	if (process.platform === 'win32') {
		pipePath = '\\\\.\\pipe\\' + pipeName;
	} else {
		pipePath = '/tmp/' + pipeName + '.sock';
		fs.unlinkSync(pipePath);
	}
	return new Promise((res, rej) => {
		let server = net.createServer(stream => {
			console.log('Connection established on ' + pipePath);
			res({ reader: stream, writer: stream });
		});
		server.on('error', function (e) {
			rej(e);
		});
		server.listen(pipePath, () => {
			console.log('Opened server on ' + pipePath);
		});
		return server;
	});
}

export function runServer(workspacePath, javaConfig): Thenable<StreamInfo> {
	return requirements.resolveRequirements().catch(error => {
		//show error
		window.showErrorMessage(error.message, error.label).then((selection) => {
			if (error.label && error.label === selection && error.openUrl) {
				commands.executeCommand(Commands.OPEN_BROWSER, error.openUrl);
			}
		});
		// rethrow to disrupt the chain.
		throw error;
	}).then(requirements => {
		return new Promise<StreamInfo>(function (resolve, reject) {

			let child = path.resolve(requirements.java_home + '/bin/java');
			let params = prepareParams(requirements, javaConfig, workspacePath);
			if (!params) {
				return reject('Can not determine Java launch parameters for server');
			}
			console.log('Executing ' + child + ' ' + params.join(' '));

			electron.fork(child, params, {}, function (err, result) {
				if (err) { return reject(err); }
				if (result) { return resolve(result); }
			});
		});
	});
}

function prepareParams(requirements, javaConfiguration, workspacePath) {
	let params = [];
	if (DEBUG) {
		params.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044');
		// suspend=y is the default. Use this form if you need to debug the server startup code:
		//  params.push('-agentlib:jdwp=transport=dt_socket,server=y,address=1044');
	}
	if (requirements.java_version > 8) {
		params.push('--add-modules=ALL-SYSTEM');
		params.push('--add-opens');
		params.push('java.base/java.util=ALL-UNNAMED');
		params.push('--add-opens');
		params.push('java.base/java.lang=ALL-UNNAMED');
	}
	params.push('-Declipse.application=org.eclipse.jdt.ls.core.id1');
	params.push('-Dosgi.bundles.defaultStartLevel=4');
	params.push('-Declipse.product=org.eclipse.jdt.ls.core.product');
	if (DEBUG) {
		params.push('-Dlog.protocol=true');
		params.push('-Dlog.level=ALL');
	}

	let vmargs = javaConfiguration.get('jdt.ls.vmargs', '');
	parseVMargs(params, vmargs);
	let server_home: string = path.resolve(__dirname, '../../server');
	let launchersFound: Array<string> = glob.sync('**/plugins/org.eclipse.equinox.launcher_*.jar', { cwd: server_home });
	if (launchersFound.length) {
		params.push('-jar'); params.push(path.resolve(server_home, launchersFound[0]));
	} else {
		return null;
	}

	//select configuration directory according to OS
	let configDir = 'config_win';
	if (process.platform === 'darwin') {
		configDir = 'config_mac';
	} else if (process.platform === 'linux') {
		configDir = 'config_linux';
	}
	params.push('-configuration'); params.push(path.resolve(__dirname, '../../server', configDir));
	params.push('-data'); params.push(workspacePath);
	return params;
}


function startedInDebugMode(): boolean {
	let args = (process as any).execArgv;
	if (args) {
		return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg));
	};
	return false;
}

//exported for tests
export function parseVMargs(params: any[], vmargsLine: string) {
	if (!vmargsLine) {
		return;
	}
	let vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
	if (vmargs === null) {
		return;
	}
	vmargs.forEach(arg => {
		//remove all standalone double quotes
		arg = arg.replace(/(\\)?"/g, function ($0, $1) { return ($1 ? $0 : ''); });
		//unescape all escaped double quotes
		arg = arg.replace(/(\\)"/g, '"');
		if (params.indexOf(arg) < 0) {
			params.push(arg);
		}
	});
}
