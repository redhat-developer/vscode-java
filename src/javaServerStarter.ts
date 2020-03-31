
import * as path from 'path';
import * as net from 'net';
import * as glob from 'glob';
import * as os from 'os';
import * as fs from 'fs';
import { StreamInfo, Executable, ExecutableOptions } from 'vscode-languageclient';
import { RequirementsData } from './requirements';
import { getJavaEncoding, IS_WORKSPACE_VMARGS_ALLOWED, getKey, getJavaagentFlag } from './settings';
import { logger } from './log';
import { getJavaConfiguration, deleteDirectory, ensureExists, getTimestamp } from './utils';
import { workspace, ExtensionContext } from 'vscode';

declare var v8debug;
const DEBUG = (typeof v8debug === 'object') || startedInDebugMode();

export function prepareExecutable(requirements: RequirementsData, workspacePath, javaConfig, context: ExtensionContext, isSyntaxServer: boolean): Executable {
	const executable: Executable = Object.create(null);
	const options: ExecutableOptions = Object.create(null);
	options.env = Object.assign({ syntaxserver : isSyntaxServer }, process.env);
	executable.options = options;
	executable.command = path.resolve(requirements.java_home + '/bin/java');
	executable.args = prepareParams(requirements, javaConfig, workspacePath, context, isSyntaxServer);
	logger.info(`Starting Java server with: ${executable.command} ${executable.args.join(' ')}`);
	return executable;
}
export function awaitServerConnection(port): Thenable<StreamInfo> {
	const addr = parseInt(port);
	return new Promise((res, rej) => {
		const server = net.createServer(stream => {
			server.close();
			logger.info('JDT LS connection established on port ' + addr);
			res({ reader: stream, writer: stream });
		});
		server.on('error', rej);
		server.listen(addr, () => {
			server.removeListener('error', rej);
			logger.info('Awaiting JDT LS connection on port ' + addr);
		});
		return server;
	});
}

function prepareParams(requirements: RequirementsData, javaConfiguration, workspacePath, context: ExtensionContext, isSyntaxServer: boolean): string[] {
	const params: string[] = [];
	if (DEBUG) {
		const port = isSyntaxServer ? 1045 : 1044;
		params.push(`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${port},quiet=y`);
		// suspend=y is the default. Use this form if you need to debug the server startup code:
		//  params.push('-agentlib:jdwp=transport=dt_socket,server=y,address=1044');
	}
	if (requirements.java_version > 8) {
		params.push('--add-modules=ALL-SYSTEM',
					'--add-opens',
					'java.base/java.util=ALL-UNNAMED',
					'--add-opens',
					'java.base/java.lang=ALL-UNNAMED');
	}

	params.push('-Declipse.application=org.eclipse.jdt.ls.core.id1',
				'-Dosgi.bundles.defaultStartLevel=4',
				'-Declipse.product=org.eclipse.jdt.ls.core.product');
	if (DEBUG) {
		params.push('-Dlog.level=ALL');
	}
	let vmargsCheck = workspace.getConfiguration().inspect('java.jdt.ls.vmargs').workspaceValue;
	if (vmargsCheck !== undefined) {
		const agentFlag = getJavaagentFlag(vmargsCheck);
		if (agentFlag !== null) {
			const keyVmargs = getKey(IS_WORKSPACE_VMARGS_ALLOWED, context.storagePath, vmargsCheck);
			const key = context.globalState.get(keyVmargs);
			if (key !== true) {
				vmargsCheck = workspace.getConfiguration().inspect('java.jdt.ls.vmargs').globalValue;
			}
		}
	} else {
		vmargsCheck = getJavaConfiguration().get('jdt.ls.vmargs');
	}
	let vmargs;
	if (vmargsCheck !== undefined) {
		vmargs = vmargsCheck + '';
	} else {
		vmargs = '';
	}
	const encodingKey = '-Dfile.encoding=';
	if (vmargs.indexOf(encodingKey) < 0) {
		params.push(encodingKey + getJavaEncoding());
	}
	if (os.platform() === 'win32') {
		const watchParentProcess = '-DwatchParentProcess=';
		if (vmargs.indexOf(watchParentProcess) < 0) {
			params.push(watchParentProcess + 'false');
		}
	}

	parseVMargs(params, vmargs);
	// "OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify
	// were deprecated in JDK 13 and will likely be removed in a future release."
	// so only add -noverify for older versions
	if (params.indexOf('-noverify') < 0 && params.indexOf('-Xverify:none') < 0 && requirements.java_version < 13) {
		params.push('-noverify');
	}

	const serverHome: string = path.resolve(__dirname, '../server');
	const launchersFound: Array<string> = glob.sync('**/plugins/org.eclipse.equinox.launcher_*.jar', { cwd: serverHome });
	if (launchersFound.length) {
		params.push('-jar'); params.push(path.resolve(serverHome, launchersFound[0]));
	} else {
		return null;
	}

	// select configuration directory according to OS
	let configDir = isSyntaxServer ? 'config_ss_win' : 'config_win';
	if (process.platform === 'darwin') {
		configDir = isSyntaxServer ? 'config_ss_mac' : 'config_mac';
	} else if (process.platform === 'linux') {
		configDir = isSyntaxServer ? 'config_ss_linux' : 'config_linux';
	}
	params.push('-configuration');
	if (DEBUG) { // Dev Mode: keep the config.ini in the installation location
		params.push(path.resolve(__dirname, '../server', configDir));
	} else {
		params.push(resolveConfiguration(context, configDir));
	}
	params.push('-data'); params.push(workspacePath);
	return params;
}

function resolveConfiguration(context, configDir) {
	ensureExists(context.globalStoragePath);
	const extensionPath = path.resolve(context.extensionPath, "package.json");
	const packageFile = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
	let version;
	if (packageFile) {
		version = packageFile.version;
	}
	else {
		version = '0.0.0';
	}
	let configuration = path.resolve(context.globalStoragePath, version);
	ensureExists(configuration);
	configuration = path.resolve(configuration, configDir);
	ensureExists(configuration);
	const configIniName = "config.ini";
	const configIni = path.resolve(configuration, configIniName);
	const ini = path.resolve(__dirname, '../server', configDir, configIniName);
	if (!fs.existsSync(configIni)) {
		fs.copyFileSync(ini, configIni);
	} else {
		const configIniTime = getTimestamp(configIni);
		const iniTime = getTimestamp(ini);
		if (iniTime > configIniTime) {
			deleteDirectory(configuration);
			resolveConfiguration(context, configDir);
		}
	}
	return configuration;
}

function startedInDebugMode(): boolean {
	const args = (process as any).execArgv;
	if (args) {
		return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg) || /^--inspect-brk=?/.test(arg));
	}
	return false;
}

// exported for tests
export function parseVMargs(params: any[], vmargsLine: string) {
	if (!vmargsLine) {
		return;
	}
	const vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
	if (vmargs === null) {
		return;
	}
	vmargs.forEach(arg => {
		// remove all standalone double quotes
		arg = arg.replace(/(\\)?"/g, ($0, $1) => { return ($1 ? $0 : ''); });
		// unescape all escaped double quotes
		arg = arg.replace(/(\\)"/g, '"');
		if (params.indexOf(arg) < 0) {
			params.push(arg);
		}
	});
}
