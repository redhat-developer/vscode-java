
'use strict';

import * as path from 'path';
import { workspace, ExtensionContext, window, StatusBarAlignment, commands, ViewColumn, Uri, CancellationToken, TextDocumentContentProvider, TextEditor, WorkspaceConfiguration, languages, IndentAction } from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo, Position as LSPosition, Location as LSLocation} from 'vscode-languageclient';


var electron = require('./electron_j');
var os = require('os');
var glob = require('glob');
import * as requirements from './requirements';
import {Commands} from './commands';
import { StatusNotification,ClassFileContentsRequest,ProjectConfigurationUpdateRequest,MessageType,ActionableNotification,FeatureStatus,ActionableMessage } from './protocol';


declare var v8debug;
const DEBUG = ( typeof v8debug === 'object') || startedInDebugMode();
var storagePath;
var serverLogFile: string | null = null;
var oldConfig;

var lastStatus;
function runJavaServer() : Thenable<StreamInfo> {
	return requirements.resolveRequirements().catch(error =>{
		//show error
		window.showErrorMessage(error.message, error.label).then((selection )=>{
			if(error.label && error.label === selection && error.openUrl){
				commands.executeCommand(Commands.OPEN_BROWSER, error.openUrl);
			}
		});
		// rethrow to disrupt the chain.
		throw error;
	})
	.then(requirements => {
	 return new Promise<StreamInfo>(function(resolve, reject){
			let child = path.resolve (requirements.java_home + '/bin/java');
			let params = [];
			let workspacePath = path.resolve( storagePath+'/jdt_ws');

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

			let vmargs = getJavaConfiguration().get('jdt.ls.vmargs','');
			parseVMargs(params, vmargs);
			let server_home :string = path.resolve( __dirname,'../../server');
			let launchersFound:Array<string> = glob.sync('**/plugins/org.eclipse.equinox.launcher_*.jar', {cwd: server_home });
			if( launchersFound.length ){
				params.push('-jar'); params.push(path.resolve(server_home,launchersFound[0]));
			}else{
				reject('failed to find launcher');
			}

			//select configuration directory according to OS
			let configDir = 'config_win';
			if (process.platform === 'darwin') {
				configDir = 'config_mac';
			} else if (process.platform === 'linux') {
				configDir = 'config_linux';
			}
			params.push('-configuration'); params.push(path.resolve( __dirname ,'../../server',configDir));
			params.push('-data'); params.push(workspacePath);

			console.log('Executing '+ child + ' '+ params.join(' '));
			serverLogFile = path.join(workspacePath, '.metadata', '.log');
			console.log('View server logs at '+ serverLogFile);

			electron.fork(child, params, {}, function(err, result) {
				if(err) { reject(err); }
				if(result){ resolve(result); }
			});
		});
	});
}

export function activate(context: ExtensionContext) {
	// Let's enable Javadoc symbols autocompletion, shamelessly copied from MIT licensed code at
	// https://github.com/Microsoft/vscode/blob/9d611d4dfd5a4a101b5201b8c9e21af97f06e7a7/extensions/typescript/src/typescriptMain.ts#L186
	languages.setLanguageConfiguration('java', {
		indentationRules: {
			// ^(.*\*/)?\s*\}.*$
			decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
			// ^.*\{[^}"']*$
			increaseIndentPattern: /^.*\{[^}"']*$/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
		onEnterRules: [
			{
				// e.g. /** | */
				beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
				afterText: /^\s*\*\/$/,
				action: { indentAction: IndentAction.IndentOutdent, appendText: ' * ' }
			},
			{
				// e.g. /** ...|
				beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
				action: { indentAction: IndentAction.None, appendText: ' * ' }
			},
			{
				// e.g.  * ...|
				beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
				action: { indentAction: IndentAction.None, appendText: '* ' }
			},
			{
				// e.g.  */|
				beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
				action: { indentAction: IndentAction.None, removeText: 1 }
			},
			{
				// e.g.  *-----*/|
				beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
				action: { indentAction: IndentAction.None, removeText: 1 }
			}
		]
	});


	storagePath = context.storagePath;
	if (!storagePath) {
		storagePath = getTempWorkspace();
	}
	let serverOptions= runJavaServer;


	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for java
		documentSelector: ['java'],
		synchronize: {
			configurationSection: 'java',
			// Notify the server about file changes to .java files contain in the workspace
			fileEvents: [
				workspace.createFileSystemWatcher('**/*.java'),
				workspace.createFileSystemWatcher('**/pom.xml'),
				workspace.createFileSystemWatcher('**/*.gradle')
			],
		}
	};

	let item = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
    oldConfig = getJavaConfiguration();
	// Create the language client and start the client.
	let languageClient = new LanguageClient('java','Language Support for Java', serverOptions, clientOptions);
	languageClient.onReady().then(() => {
		languageClient.onNotification(StatusNotification.type, (report) => {
			console.log(report.message);
			switch (report.type) {
				case 'Started':
					item.text = '$(thumbsup)';
					lastStatus = item.text;
					break;
				case 'Error':
					item.text = '$(thumbsdown)';
					lastStatus = item.text;
					break;
				case 'Message':
					item.text = report.message;
					setTimeout(() => { item.text = lastStatus; }, 3000);
					break;
			}
			item.command = Commands.OPEN_OUTPUT;
			item.tooltip = report.message;
			toggleItem(window.activeTextEditor, item);
		});
		languageClient.onNotification(ActionableNotification.type, (notification) => {
			let show = null;
			switch (notification.severity) {
				case MessageType.Log:
					show = logNotification;
					break;
				case MessageType.Info:
					show = window.showInformationMessage;
					break;
				case MessageType.Warning:
					show = window.showWarningMessage;
					break;
				case MessageType.Error:
					show = window.showErrorMessage;
					break;
			}
			if (!show) {
				return;
			}

			const titles = notification.commands.map(a => a.title);

			show(notification.message, ...titles).then((selection) => {
				for (let action of notification.commands) {
					if (action.title === selection) {
						let args: any[] = (action.arguments) ? action.arguments : [];
						commands.executeCommand(action.command, ...args);
						break;
					}
				}
			});
		});
	});


	commands.registerCommand(Commands.OPEN_OUTPUT, ()=>{
		languageClient.outputChannel.show(ViewColumn.Three);
	});
	commands.registerCommand(Commands.SHOW_JAVA_REFERENCES, (uri:string, position: LSPosition, locations:LSLocation[])=>{
		commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
	});

	commands.registerCommand(Commands.CONFIGURATION_UPDATE, uri => projectConfigurationUpdate(languageClient, uri));

	commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH, (data?:any) => setIncompleteClasspathSeverity('ignore'));

	commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH_HELP, (data?:any) => {
		commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse('https://github.com/redhat-developer/vscode-java/wiki/%22Classpath-is-incomplete%22-warning'))
	});

	commands.registerCommand(Commands.PROJECT_CONFIGURATION_STATUS, (uri, status) => setProjectConfigurationUpdate(languageClient, uri, status));

	commands.registerCommand(Commands.APPLY_WORKSPACE_EDIT,(obj)=>{
		let edit = languageClient.protocol2CodeConverter.asWorkspaceEdit(obj);
		if(edit){
			workspace.applyEdit(edit);
		}
	});

	commands.registerCommand(Commands.OPEN_SERVER_LOG,()=> openServerLogFile());

	window.onDidChangeActiveTextEditor((editor) =>{
		toggleItem(editor, item);
	});

	let provider: TextDocumentContentProvider= <TextDocumentContentProvider> {
		onDidChange: null,
		provideTextDocumentContent: (uri: Uri, token: CancellationToken): Thenable<string> => {
			return languageClient.sendRequest(ClassFileContentsRequest.type, { uri: uri.toString() }, token).then((v: string):string => {
				return v || '';
			});
		}
	};
	workspace.registerTextDocumentContentProvider('jdt', provider);

	item.text = 'Starting Java Language Server...';
	toggleItem(window.activeTextEditor, item);
	let disposable = languageClient.start();

	// Push the disposable to the context's subscriptions so that the
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
	context.subscriptions.push(onConfigurationChange());
}

function logNotification(message:string, ...items: string[]) {
	return new Promise((resolve, reject) => {
    	console.log(message);
	});
}

function setIncompleteClasspathSeverity(severity:string) {
	const config = getJavaConfiguration();
	const section = 'errors.incompleteClasspath.severity';
	config.update(section, severity, true).then(
		() => console.log(section + ' globally set to '+severity),
		(error) => console.log(error)
	);
}

function projectConfigurationUpdate(languageClient:LanguageClient, uri?: Uri) {
	let resource = uri;
	if (!(resource instanceof Uri)) {
		if (window.activeTextEditor) {
			resource = window.activeTextEditor.document.uri;
		}
	}
	if (!resource) {
		return window.showWarningMessage('No Java project to update!').then(() => false);
	}
	if (isJavaConfigFile(resource.path)){
		languageClient.sendNotification(ProjectConfigurationUpdateRequest.type, {
			uri: resource.toString()
		});
	}
}

function setProjectConfigurationUpdate(languageClient:LanguageClient, uri: Uri, status:FeatureStatus) {
	const config = getJavaConfiguration();
	const section = 'configuration.updateBuildConfiguration';

	const st = FeatureStatus[status];
	config.update(section, st).then(
		() => console.log(section + ' set to '+st),
		(error) => console.log(error)
	);
	if (status !== FeatureStatus.disabled) {
		projectConfigurationUpdate(languageClient, uri);
	}
}
function toggleItem(editor: TextEditor, item) {
	if(editor && editor.document &&
		(editor.document.languageId === 'java' || isJavaConfigFile(editor.document.uri.path))){
		item.show();
	} else{
		item.hide();
	}
}

function isJavaConfigFile(path:String) {
	return path.endsWith('pom.xml') || path.endsWith('.gradle');
}

function onConfigurationChange() {
	return workspace.onDidChangeConfiguration(params => {
		let newConfig = getJavaConfiguration();
		if (hasJavaConfigChanged(oldConfig, newConfig)) {
		  let msg =	'Java Language Server configuration changed, please restart VS Code.';
		  let action =	'Restart Now';
		  let restartId = Commands.RELOAD_WINDOW;
		  oldConfig = newConfig;
		  window.showWarningMessage(msg,action).then((selection )=>{
			  if(action === selection) {
				commands.executeCommand(restartId);
			  }
		  });
		}
	});
}

function hasJavaConfigChanged(oldConfig, newConfig) {
	return hasConfigKeyChanged('home', oldConfig, newConfig)
		|| hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	return oldConfig.get(key) !== newConfig.get(key);
}

export function parseVMargs(params:any[], vmargsLine:string) {
	if (!vmargsLine) {
		return;
	}
	let vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
	if (vmargs === null) {
		return;
	}
	vmargs.forEach (arg => {
		//remove all standalone double quotes
		arg = arg.replace( /(\\)?"/g, function ($0, $1) { return ($1 ? $0 : ''); });
		//unescape all escaped double quotes
		arg = arg.replace( /(\\)"/g, '"');
		if (params.indexOf(arg) < 0) {
			params.push(arg);
		}
	});
}

function getTempWorkspace() {
	return path.resolve(os.tmpdir(),'vscodesws_'+makeRandomHexString(5));
}

function makeRandomHexString(length) {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    var result = '';
    for (var i = 0; i < length; i++) {
        var idx = Math.floor(chars.length * Math.random());
        result += chars[idx];
    }
    return result;
}

function startedInDebugMode(): boolean {
	let args = (process as any).execArgv;
	if (args) {
		return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg));
	};
	return false;
}

function getJavaConfiguration():WorkspaceConfiguration {
	return workspace.getConfiguration('java');
}

function openServerLogFile(): Thenable<boolean> {
	if (!serverLogFile) {
		return window.showWarningMessage('Java Language Server has not started logging.').then(() => false);
	}

	return workspace.openTextDocument(serverLogFile)
		.then(doc => {
			if (!doc) {
				return false;
			}
			return window.showTextDocument(doc, window.activeTextEditor ?
												window.activeTextEditor.viewColumn : undefined)
				.then(editor => !!editor);
		}, () => false)
		.then(didOpen => {
			if (!didOpen) {
				window.showWarningMessage('Could not open Java Language Server log file');
			}
			return didOpen;
		});
}