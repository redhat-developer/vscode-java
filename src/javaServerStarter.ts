
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as glob from 'glob';
import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import { ExtensionContext, version, workspace } from 'vscode';
import { Executable, ExecutableOptions, StreamInfo, TransportKind, generateRandomPipeName } from 'vscode-languageclient/node';
import { logger } from './log';
import { addLombokParam, isLombokSupportEnabled } from './lombokSupport';
import { RequirementsData } from './requirements';
import { IS_WORKSPACE_VMARGS_ALLOWED, getJavaEncoding, getJavaagentFlag, getKey, isInWorkspaceFolder } from './settings';
import { deleteDirectory, ensureExists, getJavaConfiguration, getTimestamp, getVersion } from './utils';
import { log } from 'console';

// eslint-disable-next-line no-var
declare var v8debug;
export const DEBUG = (typeof v8debug === 'object') || startedInDebugMode();

/**
 * Argument that tells the program where to generate the heap dump that is created when an OutOfMemoryError is raised and `HEAP_DUMP` has been passed
 */
export const HEAP_DUMP_LOCATION = '-XX:HeapDumpPath=';

/**
 * Argument that tells the program to generate a heap dump file when an OutOfMemoryError is raised
 */
export const HEAP_DUMP = '-XX:+HeapDumpOnOutOfMemoryError';

/**
 * Argument that specifies name of the dependency collector implementation to use.
 * `df` for depth-first and `bf` for breadth-first.
 * See: https://github.com/apache/maven-resolver/blob/maven-resolver-1.9.7/src/site/markdown/configuration.md
 */
const DEPENDENCY_COLLECTOR_IMPL= '-Daether.dependencyCollector.impl=';
const DEPENDENCY_COLLECTOR_IMPL_BF= 'bf';

export function prepareExecutable(requirements: RequirementsData, workspacePath, context: ExtensionContext, isSyntaxServer: boolean): Executable {
	const executable: Executable = Object.create(null);
	const options: ExecutableOptions = Object.create(null);
	options.env = Object.assign({ syntaxserver : isSyntaxServer }, process.env);
	if (os.platform() === 'win32') {
		const vmargs = getJavaConfiguration().get('jdt.ls.vmargs', '');
		const watchParentProcess = '-DwatchParentProcess=false';
		if (vmargs.indexOf(watchParentProcess) < 0) {
			options.detached = true;
		}
	}
	executable.options = options;
	executable.command = path.resolve(`${requirements.tooling_jre}/bin/java`);
	executable.args = prepareParams(requirements, workspacePath, context, isSyntaxServer);
	const transportKind = getJavaConfiguration().get('transport');

	switch (transportKind) {
		case 'stdio':
			executable.transport = TransportKind.stdio;
			break;
		case 'pipe':
		default:
			executable.transport = TransportKind.pipe;
			try {
				generateRandomPipeName();
			} catch (error) {
				logger.warn(`Falling back to 'stdio' (from 'pipe') due to : ${error}`);
				executable.transport = TransportKind.stdio;
			}
			break;
	}
	logger.info(`Starting Java server with: ${executable.command} ${executable.args?.join(' ')}`);
	return executable;
}
export function awaitServerConnection(port): Thenable<StreamInfo> {
	const addr = parseInt(port);
	return new Promise((res, rej) => {
		const server = net.createServer(stream => {
			server.close();
			logger.info(`JDT LS connection established on port ${addr}`);
			res({ reader: stream, writer: stream });
		});
		server.on('error', rej);
		server.listen(addr, () => {
			server.removeListener('error', rej);
			logger.info(`Awaiting JDT LS connection on port ${addr}`);
		});
		return server;
	});
}

function prepareParams(requirements: RequirementsData, workspacePath, context: ExtensionContext, isSyntaxServer: boolean): string[] {
	const params: string[] = [];
	if (DEBUG) {
		const port = isSyntaxServer ? 1045 : 1044;
		params.push(`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${port},quiet=y`);
		// suspend=y is the default. Use this form if you need to debug the server startup code:
		//  params.push('-agentlib:jdwp=transport=dt_socket,server=y,address=1044');
	}

	params.push('--add-modules=ALL-SYSTEM',
				'--add-opens',
				'java.base/java.util=ALL-UNNAMED',
				'--add-opens',
				'java.base/java.lang=ALL-UNNAMED',
				// See https://github.com/redhat-developer/vscode-java/issues/2264
				// It requires the internal API sun.nio.fs.WindowsFileAttributes.isDirectoryLink() to check if a Windows directory is symlink.
				'--add-opens',
				'java.base/sun.nio.fs=ALL-UNNAMED');

	params.push('-Declipse.application=org.eclipse.jdt.ls.core.id1',
				'-Dosgi.bundles.defaultStartLevel=4',
				'-Declipse.product=org.eclipse.jdt.ls.core.product');
	if (DEBUG) {
		params.push('-Dlog.level=ALL');
	}
	const metadataLocation = workspace.getConfiguration().get('java.import.generatesMetadataFilesAtProjectRoot');
	if (metadataLocation !== undefined) {
		params.push(`-Djava.import.generatesMetadataFilesAtProjectRoot=${metadataLocation}`);
	}
	let vmargsCheck = workspace.getConfiguration().inspect('java.jdt.ls.vmargs').workspaceValue;
	if (vmargsCheck !== undefined) {
		const isWorkspaceTrusted = (workspace as any).isTrusted; // keep compatibility for old engines < 1.56.0
		const agentFlag = getJavaagentFlag(vmargsCheck);
		if (agentFlag !== null && (isWorkspaceTrusted === undefined || !isWorkspaceTrusted)) {
			const keyVmargs = getKey(IS_WORKSPACE_VMARGS_ALLOWED, context.storagePath, vmargsCheck);
			const key = context.globalState.get(keyVmargs);
			if (key !== true && (workspace.workspaceFolders && isInWorkspaceFolder(agentFlag, workspace.workspaceFolders))) {
				vmargsCheck = workspace.getConfiguration().inspect('java.jdt.ls.vmargs').globalValue;
			}
		}
	} else {
		vmargsCheck = getJavaConfiguration().get('jdt.ls.vmargs');
	}
	let vmargs;
	if (vmargsCheck !== undefined) {
		vmargs = String(vmargsCheck);
	} else {
		vmargs = '';
	}
	if (vmargs.indexOf('-DDetectVMInstallationsJob.disabled=') < 0) {
		params.push('-DDetectVMInstallationsJob.disabled=true');
	}
	const encodingKey = '-Dfile.encoding=';
	if (vmargs.indexOf(encodingKey) < 0) {
		params.push(encodingKey + getJavaEncoding());
	}
	if (vmargs.indexOf('-Xlog:') < 0) {
		params.push('-Xlog:disable');
	}

	parseVMargs(params, vmargs);

	if (isLombokSupportEnabled()) {
		addLombokParam(context, params);
	}

	if (!isSyntaxServer) {
		if (vmargs.indexOf(HEAP_DUMP) < 0) {
			params.push(HEAP_DUMP);
		}
		if (vmargs.indexOf(HEAP_DUMP_LOCATION) < 0) {
			params.push(`${HEAP_DUMP_LOCATION}${path.dirname(workspacePath)}`);
		}
		if (vmargs.indexOf(DEPENDENCY_COLLECTOR_IMPL) < 0) {
			params.push(`${DEPENDENCY_COLLECTOR_IMPL}${DEPENDENCY_COLLECTOR_IMPL_BF}`);
		}

		const sharedIndexLocation: string = resolveIndexCache(context);
		if (sharedIndexLocation) {
			params.push(`-Djdt.core.sharedIndexLocation=${sharedIndexLocation}`);
		}
	}

	// "OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify
	// were deprecated in JDK 13 and will likely be removed in a future release."
	// so only add -noverify for older versions
	if (params.indexOf('-noverify') < 0 && params.indexOf('-Xverify:none') < 0 && requirements.tooling_jre_version < 13) {
		params.push('-noverify');
	}

	const serverHome: string = process.env.JDT_LS_PATH || path.resolve(__dirname, '../server');
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
	params.push(startedFromSources() || process.env.JDT_LS_PATH !== undefined ?
		path.resolve(serverHome, configDir) : resolveConfiguration(context, configDir));
	if (startedFromSources()) { // Dev Mode: keep the config.ini in the installation location
		console.log(`Starting jdt.ls ${isSyntaxServer?'(syntax)' : '(standard)'} from vscode-java sources`);
	}

	params.push('-data'); params.push(workspacePath);
	return params;
}

function resolveIndexCache(context: ExtensionContext) {
	let enabled: string = getJavaConfiguration().get("sharedIndexes.enabled");
	if (enabled === "auto") {
		enabled = version.includes("insider") ? "on" : "off";
	}

	if (enabled !== "on") {
		return;
	}

	const location: string = getSharedIndexCache(context);
	if (location) {
		ensureExists(location);
		if (!fs.existsSync(location)) {
			logger.error(`Failed to create the shared index directory '${location}', fall back to local index.`);
			return;
		}
	}

	return location;
}

export function getSharedIndexCache(context: ExtensionContext): string {
	let location: string = getJavaConfiguration().get("sharedIndexes.location");
	if (!location) {
		switch (process.platform) {
			case "win32":
				location = process.env.APPDATA ? path.join(process.env.APPDATA, ".jdt", "index")
					: path.join(os.homedir(), ".jdt", "index");
				break;
			case "darwin":
				location = path.join(os.homedir(), "Library", "Caches", ".jdt", "index");
				break;
			case "linux":
				location = process.env.XDG_CACHE_HOME ? path.join(process.env.XDG_CACHE_HOME, ".jdt", "index")
					: path.join(os.homedir(), ".cache", ".jdt", "index");
				break;
			default:
				const globalStoragePath = context.globalStorageUri?.fsPath; // .../Code/User/globalStorage/redhat.java
				location = globalStoragePath ? path.join(globalStoragePath, "index") : undefined;
		}
	} else {
		// expand homedir
		location = location.startsWith(`~${path.sep}`) ? path.join(os.homedir(), location.slice(2)) : location;
	}

	return location;
}

function resolveConfiguration(context, configDir) {
	ensureExists(context.globalStoragePath);
	const version = getVersion(context.extensionPath);
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
	const args = (process as any).execArgv as string[];
	return hasDebugFlag(args);
}

export function startedFromSources(): boolean {
	return process.env['DEBUG_VSCODE_JAVA'] === 'true';
}

// exported for tests
export function hasDebugFlag(args: string[]): boolean {
	if (args) {
		// See https://nodejs.org/en/docs/guides/debugging-getting-started/
		return args.some( arg => /^--inspect/.test(arg) || /^--debug/.test(arg));
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
		params.push(arg);
	});
}

export function removeEquinoxFragmentOnDarwinX64(context: ExtensionContext) {
	// https://github.com/redhat-developer/vscode-java/issues/3484
	const extensionPath = context.extensionPath;
	const matches = new glob.GlobSync(`${extensionPath}/server/plugins/org.eclipse.equinox.launcher.cocoa.macosx.x86_64*.jar`).found;
	for (const fragment of matches) {
		fse.removeSync(fragment);
		logger.info(`Removing Equinox launcher fragment : ${fragment}`);
	}
}
