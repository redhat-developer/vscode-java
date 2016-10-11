
'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { workspace, Disposable, ExtensionContext, StatusBarItem, window, StatusBarAlignment, commands, ViewColumn, Uri, CancellationToken, TextDocumentContentProvider } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, NotificationType, Position as LSPosition, Location as LSLocation, Protocol2Code} from 'vscode-languageclient';
var electron = require('./electron_j');
var os = require('os');
import * as requirements from './requirements';
import { StatusNotification,ClassFileContentsRequest } from './protocol';


declare var v8debug;
var DEBUG =( typeof v8debug === 'object');
var storagePath;
var oldConfig;

function runJavaServer(){
	return requirements.resolveRequirements().catch(error =>{
		//show error
		window.showErrorMessage(error.message, error.label).then((selection )=>{
			if(error.label && error.label == selection && error.openUrl)
				commands.executeCommand('vscode.open', error.openUrl);
		});
		// rethrow to disrupt the chain.
		throw error;
	})
	.then(requirements => new Promise(function(resolve, reject){
			let child = path.resolve (requirements.java_home + '/bin/java');
			let params = [];
			let workspacePath = path.resolve( storagePath+'/jdt_ws');

			if (DEBUG) {
				params.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044');
				// suspend=y is the default. Use this form if you need to debug the server startup code:
				//  params.push('-agentlib:jdwp=transport=dt_socket,server=y,address=1044');
			}
			params.push('-Declipse.application=org.jboss.tools.vscode.java.id1');
			params.push('-Dosgi.bundles.defaultStartLevel=4');
			params.push('-Declipse.product=org.jboss.tools.vscode.java.product');
			if (DEBUG) {
				params.push('-Dlog.protocol=true');
				params.push('-Dlog.level=ALL');
			}

			params.push('-jar'); params.push(path.resolve( __dirname ,'../../server/plugins/org.eclipse.equinox.launcher_1.3.200.v20160318-1642.jar'));
			//select configuration directory according to OS
			let configDir = 'config_win';
			if (process.platform === 'darwin') {
				configDir = 'config_mac';
			} else if (process.platform === 'linux') {
				configDir = 'config_linux';
			}
			params.push('-configuration'); params.push(path.resolve( __dirname ,'../../server',configDir));
			params.push('-data'); params.push(workspacePath);
			if (requirements.java_version > 8) {
				params.push('--add-modules=java.se.ee');
			}

			let vmargs = workspace.getConfiguration("java").get("jdt.ls.vmargs","");
			parseVMargs(params, vmargs);

			electron.fork(child, params, {}, function(err, result) {
				if(err) reject(err);
				if(result) resolve(result);
			});
	}));
}

export function activate(context: ExtensionContext) {

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
			// Notify the server about file changes to .java files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/*.java')
		}
	}
	
	let item = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
    oldConfig = workspace.getConfiguration("java");
	// Create the language client and start the client.
	let languageClient = new LanguageClient('java','Language Support for Java', serverOptions, clientOptions);
	languageClient.onNotification(StatusNotification.type, (report) => {
		console.log(report.message);
		if(report.type === "Started"){
			item.text = "$(thumbsup)"
		} else if(report.type === "Error"){
			item.text = "$(thumbsdown)"
		} else {
			item.text = report.message;
		}
		item.command = "java.open.output";
		item.tooltip = report.message;
		toggleItem(window.activeTextEditor, item);
	});
	commands.registerCommand("java.open.output", ()=>{
		languageClient.outputChannel.show(ViewColumn.Three);
	});
	commands.registerCommand("java.show.references", (uri:string, position: LSPosition, locations:LSLocation[])=>{
		commands.executeCommand('editor.action.showReferences', Uri.parse(uri), Protocol2Code.asPosition(position), locations.map(Protocol2Code.asLocation));
	});
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
	workspace.registerTextDocumentContentProvider("jdt", provider)

	item.text = "Starting Java Language Server...";
	toggleItem(window.activeTextEditor, item);
	let disposable = languageClient.start();
	
	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
	context.subscriptions.push(onConfigurationChange());
}

function toggleItem(editor, item) {
	if(editor && editor.document && editor.document.languageId === "java"){
		item.show();
	} else{
		item.hide();
	}
}

function onConfigurationChange() {
	return workspace.onDidChangeConfiguration(params => {
		let newConfig = workspace.getConfiguration("java");
		if (hasJavaConfigChanged(oldConfig, newConfig)) {
		  let msg =	"Java Language Server configuration changed, please restart VS Code.";
		  let action =	"Restart Now";
		  let restartId = "workbench.action.reloadWindow";
		  oldConfig = newConfig;
		  window.showWarningMessage(msg,action).then((selection )=>{
			  if(action == selection) {
				commands.executeCommand(restartId);
			  }
		  });
		}
	});
}

function hasJavaConfigChanged(oldConfig, newConfig) {
	return hasConfigKeyChanged("home", oldConfig, newConfig)
		|| hasConfigKeyChanged("jdt.ls.vmargs", oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	return oldConfig.get(key) != newConfig.get(key);
}

export function parseVMargs(params:any[], vmargsLine:string) {
	if (!vmargsLine) {
		return;
	}
	let vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
	if (vmargs == null) {
		return;
	}
	vmargs.forEach (function(arg) {
		if (params.indexOf(arg) < 0) {
			params.push(arg);
		}
	});
}

function getTempWorkspace() {
	return path.resolve(os.tmpdir(),"vscodesws_"+makeRandomHexString(5));
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
