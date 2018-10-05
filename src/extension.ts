'use strict';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { workspace, extensions, ExtensionContext, window, StatusBarAlignment, commands, ViewColumn, Uri, CancellationToken, TextDocumentContentProvider, TextEditor, WorkspaceConfiguration, languages, IndentAction, ProgressLocation, InputBoxOptions, Selection, Position } from 'vscode';
import { ExecuteCommandParams, ExecuteCommandRequest, LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, Position as LSPosition, Location as LSLocation, StreamInfo } from 'vscode-languageclient';
import { collectionJavaExtensions } from './plugin';
import { prepareExecutable, awaitServerConnection } from './javaServerStarter';
import * as requirements from './requirements';
import { Commands } from './commands';
import { StatusNotification, ClassFileContentsRequest, ProjectConfigurationUpdateRequest, MessageType, ActionableNotification, FeatureStatus, ActionableMessage, CompileWorkspaceRequest, CompileWorkspaceStatus, ProgressReportNotification, ExecuteClientCommandRequest, SendNotificationRequest } from './protocol';
import { ExtensionAPI } from './extension.api';
import * as net from 'net';

let oldConfig;
let lastStatus;
let languageClient: LanguageClient;
const cleanWorkspaceFileName = '.cleanWorkspace';

export function activate(context: ExtensionContext): Promise<ExtensionAPI> {

	enableJavadocSymbols();

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
		return window.withProgress<ExtensionAPI>({ location: ProgressLocation.Window }, p => {
			return new Promise((resolve, reject) => {
				let storagePath = context.storagePath;
				if (!storagePath) {
					storagePath = getTempWorkspace();
				}
				let workspacePath = path.resolve(storagePath + '/jdt_ws');

				// Options to control the language client
				let clientOptions: LanguageClientOptions = {
					// Register the server for java
					documentSelector: [
						{ scheme: 'file', language: 'java' },
						{ scheme: 'jdt', language: 'java' },
						{ scheme: 'untitled', language: 'java' }
					],
					synchronize: {
						configurationSection: 'java',
						// Notify the server about file changes to .java and project/build files contained in the workspace
						fileEvents: [
							workspace.createFileSystemWatcher('**/*.java'),
							workspace.createFileSystemWatcher('**/pom.xml'),
							workspace.createFileSystemWatcher('**/*.gradle'),
							workspace.createFileSystemWatcher('**/.project'),
							workspace.createFileSystemWatcher('**/.classpath'),
							workspace.createFileSystemWatcher('**/settings/*.prefs'),
							workspace.createFileSystemWatcher('**/src/**')
						],
					},
					initializationOptions: {
						bundles: collectionJavaExtensions(extensions.all),
						workspaceFolders: workspace.workspaceFolders ? workspace.workspaceFolders.map(f => f.uri.toString()) : null,
						settings: { java: getJavaConfiguration() },
						extendedClientCapabilities:{
							progressReportProvider: getJavaConfiguration().get('progressReports.enabled'),
							classFileContentsSupport:true
						}
					},
					revealOutputChannelOn: RevealOutputChannelOn.Never
				};

				let item = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
				item.text = '$(rocket)';
				item.command = Commands.OPEN_OUTPUT;
				let progressBar = window.createStatusBarItem(StatusBarAlignment.Left, Number.MIN_VALUE+1);

				oldConfig = getJavaConfiguration();
				let serverOptions;
				let port = process.env['SERVER_PORT'];
				if (!port) {
					let lsPort = process.env['JDTLS_CLIENT_PORT'];
					if (!lsPort) {
						serverOptions = prepareExecutable(requirements, workspacePath, getJavaConfiguration());
					} else {
						let connectionInfo = {
							port: lsPort
						};
						serverOptions = () => {
							let socket = net.connect(connectionInfo);
							let result: StreamInfo = {
								writer: socket,
								reader: socket
							};
							return Promise.resolve(result);
						};
					}
				} else {
					// used during development
					serverOptions = awaitServerConnection.bind(null, port);
				}

				// Create the language client and start the client.
				languageClient = new LanguageClient('java', 'Language Support for Java', serverOptions, clientOptions);
				languageClient.registerProposedFeatures();
				languageClient.onReady().then(() => {
					languageClient.onNotification(StatusNotification.type, (report) => {
						switch (report.type) {
							case 'Started':
								item.text = '$(thumbsup)';
								p.report({ message: 'Finished' });
								lastStatus = item.text;
								resolve({
									apiVersion: '0.1',
									javaRequirement: requirements,
								});
								break;
							case 'Error':
								item.text = '$(thumbsdown)';
								lastStatus = item.text;
								p.report({ message: 'Finished with Error' });
								item.tooltip = report.message;
								toggleItem(window.activeTextEditor, item);
								resolve({
									apiVersion: '0.1',
									javaRequirement: requirements,
								});
								break;
							case 'Starting':
								p.report({ message: report.message });
								item.tooltip = report.message;
								break;
							case 'Message':
								item.text = report.message;
								setTimeout(() => { item.text = lastStatus; }, 3000);
								break;
						}
						item.tooltip = report.message;
						toggleItem(window.activeTextEditor, item);
					});
					languageClient.onNotification(ProgressReportNotification.type, (progress) => {
						progressBar.show();
						progressBar.text = progress.status;
						if (progress.complete) {
							setTimeout(() => { progressBar.hide(); }, 500);
						}
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
					languageClient.onRequest(ExecuteClientCommandRequest.type, (params) => {
						return commands.executeCommand(params.command, ...params.arguments);
					});

					languageClient.onRequest(SendNotificationRequest.type, (params) => {
						return commands.executeCommand(params.command, ...params.arguments);
					});

					commands.registerCommand(Commands.OPEN_OUTPUT, () => {
						languageClient.outputChannel.show(ViewColumn.Three);
					});
					commands.registerCommand(Commands.SHOW_JAVA_REFERENCES, (uri: string, position: LSPosition, locations: LSLocation[]) => {
						commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
					});
					commands.registerCommand(Commands.SHOW_JAVA_IMPLEMENTATIONS, (uri: string, position: LSPosition, locations: LSLocation[]) => {
						commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
					});

					commands.registerCommand(Commands.CONFIGURATION_UPDATE, uri => projectConfigurationUpdate(languageClient, uri));

					commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH, (data?: any) => setIncompleteClasspathSeverity('ignore'));

					commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH_HELP, (data?: any) => {
						commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse('https://github.com/redhat-developer/vscode-java/wiki/%22Classpath-is-incomplete%22-warning'));
					});

					commands.registerCommand(Commands.PROJECT_CONFIGURATION_STATUS, (uri, status) => setProjectConfigurationUpdate(languageClient, uri, status));

					commands.registerCommand(Commands.APPLY_WORKSPACE_EDIT, (obj) => {
						applyWorkspaceEdit(obj, languageClient);
					});

					commands.registerCommand(Commands.EDIT_ORGANIZE_IMPORTS, async () => {
						let activeEditor = window.activeTextEditor;
						if (!activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'java') {
							return;
						}
						if (activeEditor.document.uri instanceof Uri) {
							await <any>commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.EDIT_ORGANIZE_IMPORTS, activeEditor.document.uri.toString());
						}
					});

					commands.registerCommand(Commands.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
						const params: ExecuteCommandParams = {
							command,
							arguments: rest
						};
						return languageClient.sendRequest(ExecuteCommandRequest.type, params);
					});

					commands.registerCommand(Commands.COMPILE_WORKSPACE, (isFullCompile : boolean) => {
						return window.withProgress({ location: ProgressLocation.Window }, async p => {
							if (typeof isFullCompile !== 'boolean') {
								const selection = await window.showQuickPick(['Incremental', 'Full'], {'placeHolder' : 'please choose compile type:'});
								isFullCompile = selection !== 'Incremental';
							}
							p.report({ message: 'Compiling workspace...' });
							const start = new Date().getTime();
							const res = await languageClient.sendRequest(CompileWorkspaceRequest.type, isFullCompile);
							const elapsed = new Date().getTime() - start;
							const humanVisibleDelay = elapsed < 1000? 1000:0;
							return new Promise((resolve, reject) => {
								setTimeout(() => { // set a timeout so user would still see the message when build time is short
									if (res === CompileWorkspaceStatus.SUCCEED) {
										resolve(res);
									} else {
										reject(res);
									}
								}, humanVisibleDelay);
							});
						});
					});

					window.onDidChangeActiveTextEditor((editor) => {
						toggleItem(editor, item);
					});

					let provider: TextDocumentContentProvider = <TextDocumentContentProvider>{
						onDidChange: null,
						provideTextDocumentContent: (uri: Uri, token: CancellationToken): Thenable<string> => {
							return languageClient.sendRequest(ClassFileContentsRequest.type, { uri: uri.toString() }, token).then((v: string): string => {
								return v || '';
							});
						}
					};
					workspace.registerTextDocumentContentProvider('jdt', provider);
				});

				let cleanWorkspaceExists = fs.existsSync( path.join(workspacePath,  cleanWorkspaceFileName));
				if (cleanWorkspaceExists) {
					try {
						deleteDirectory(workspacePath);
					} catch (error) {
						window.showErrorMessage('Failed to delete ' + workspacePath + ': ' + error);
					}
				}

				languageClient.start();
				// Register commands here to make it available even when the language client fails
				commands.registerCommand(Commands.OPEN_SERVER_LOG, () => openServerLogFile(workspacePath));

				let extensionPath = context.extensionPath;
				commands.registerCommand(Commands.OPEN_FORMATTER, async () => openFormatter(extensionPath));

				commands.registerCommand(Commands.CLEAN_WORKSPACE, () => cleanWorkspace(workspacePath));

				context.subscriptions.push(onConfigurationChange());
				toggleItem(window.activeTextEditor, item);
			});
		});
	});
}

export function deactivate(): Thenable<void> {
	if (!languageClient) {
		return undefined;
	}
	return languageClient.stop();
}

function enableJavadocSymbols() {
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
}

function logNotification(message: string, ...items: string[]) {
	return new Promise((resolve, reject) => {
		console.log(message);
	});
}

function setIncompleteClasspathSeverity(severity: string) {
	const config = getJavaConfiguration();
	const section = 'errors.incompleteClasspath.severity';
	config.update(section, severity, true).then(
		() => console.log(section + ' globally set to ' + severity),
		(error) => console.log(error)
	);
}

function projectConfigurationUpdate(languageClient: LanguageClient, uri?: Uri) {
	let resource = uri;
	if (!(resource instanceof Uri)) {
		if (window.activeTextEditor) {
			resource = window.activeTextEditor.document.uri;
		}
	}
	if (!resource) {
		return window.showWarningMessage('No Java project to update!').then(() => false);
	}
	if (isJavaConfigFile(resource.path)) {
		languageClient.sendNotification(ProjectConfigurationUpdateRequest.type, {
			uri: resource.toString()
		});
	}
}

function setProjectConfigurationUpdate(languageClient: LanguageClient, uri: Uri, status: FeatureStatus) {
	const config = getJavaConfiguration();
	const section = 'configuration.updateBuildConfiguration';

	const st = FeatureStatus[status];
	config.update(section, st).then(
		() => console.log(section + ' set to ' + st),
		(error) => console.log(error)
	);
	if (status !== FeatureStatus.disabled) {
		projectConfigurationUpdate(languageClient, uri);
	}
}
function toggleItem(editor: TextEditor, item) {
	if (editor && editor.document &&
		(editor.document.languageId === 'java' || isJavaConfigFile(editor.document.uri.path))) {
		item.show();
	} else {
		item.hide();
	}
}

function isJavaConfigFile(path: String) {
	return path.endsWith('pom.xml') || path.endsWith('.gradle');
}

function onConfigurationChange() {
	return workspace.onDidChangeConfiguration(params => {
		let newConfig = getJavaConfiguration();
		if (hasJavaConfigChanged(oldConfig, newConfig)) {
			let msg = 'Java Language Server configuration changed, please restart VS Code.';
			let action = 'Restart Now';
			let restartId = Commands.RELOAD_WINDOW;
			oldConfig = newConfig;
			window.showWarningMessage(msg, action).then((selection) => {
				if (action === selection) {
					commands.executeCommand(restartId);
				}
			});
		}
	});
}

function hasJavaConfigChanged(oldConfig, newConfig) {
	return hasConfigKeyChanged('home', oldConfig, newConfig)
		|| hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig)
		|| hasConfigKeyChanged('progressReports.enabled', oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	return oldConfig.get(key) !== newConfig.get(key);
}


function getTempWorkspace() {
	return path.resolve(os.tmpdir(), 'vscodesws_' + makeRandomHexString(5));
}

function makeRandomHexString(length) {
	let chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	let result = '';
	for (let i = 0; i < length; i++) {
		let idx = Math.floor(chars.length * Math.random());
		result += chars[idx];
	}
	return result;
}

function getJavaConfiguration(): WorkspaceConfiguration {
	return workspace.getConfiguration('java');
}

async function cleanWorkspace(workspacePath) {
	const doIt = 'Restart and delete';
	window.showWarningMessage('Are you sure you want to clean the Java language server workspace?', 'Cancel', doIt).then(selection => {
		if (selection === doIt) {
			const file = path.join(workspacePath, cleanWorkspaceFileName);
			fs.closeSync(fs.openSync(file, 'w'));
			commands.executeCommand(Commands.RELOAD_WINDOW);
		}
	});
}

function deleteDirectory(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach(function (child) {
			let entry = path.join(dir, child);
			if (fs.lstatSync(entry).isDirectory()) {
				deleteDirectory(entry);
			} else {
				fs.unlinkSync(entry);
			}
		});
		fs.rmdirSync(dir);
	}
}

function openServerLogFile(workspacePath): Thenable<boolean> {
	let serverLogFile = path.join(workspacePath, '.metadata', '.log');
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

async function openFormatter(extensionPath) {
	let defaultFormatter = path.join(extensionPath, 'formatters', 'eclipse-formatter.xml');
	let formatterUrl: string = getJavaConfiguration().get('format.settings.url');
	if (formatterUrl && formatterUrl.length > 0) {
		if (isRemote(formatterUrl)) {
			commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(formatterUrl));
		} else {
			let document = getPath(formatterUrl);
			if (document && fs.existsSync(document)) {
				return openDocument(extensionPath, document, defaultFormatter, null);
			}
		}
	}
	let global = workspace.workspaceFolders === undefined;
	let fileName = formatterUrl || 'eclipse-formatter.xml';
	let file;
	let relativePath;
	if (!global) {
		file = path.join(workspace.workspaceFolders[0].uri.fsPath, fileName);
		relativePath = fileName;
	} else {
		let root = path.join(extensionPath, '..', 'redhat.java');
		if (!fs.existsSync(root)) {
			fs.mkdirSync(root);
		}
		file = path.join(root, fileName);
	}
	if (!fs.existsSync(file)) {
		addFormatter(extensionPath, file, defaultFormatter, relativePath);
	} else {
		if (formatterUrl) {
			getJavaConfiguration().update('format.settings.url', (relativePath !== null ? relativePath : file), global);
			openDocument(extensionPath, file, file, defaultFormatter);
		} else {
			addFormatter(extensionPath, file, defaultFormatter, relativePath);
		}
	}
}

function getPath(f) {
	if (workspace.workspaceFolders && !path.isAbsolute(f)) {
		workspace.workspaceFolders.forEach(wf => {
			let file = path.resolve(wf.uri.path, f);
			if (fs.existsSync(file)) {
				return file;
			}
		});
	} else {
		return path.resolve(f);
	}
	return null;
}

function openDocument(extensionPath, formatterUrl, defaultFormatter, relativePath) {
	return workspace.openTextDocument(formatterUrl)
		.then(doc => {
			if (!doc) {
				addFormatter(extensionPath, formatterUrl, defaultFormatter, relativePath);
			}
			return window.showTextDocument(doc, window.activeTextEditor ?
				window.activeTextEditor.viewColumn : undefined)
				.then(editor => !!editor);
		}, () => false)
		.then(didOpen => {
			if (!didOpen) {
				window.showWarningMessage('Could not open Formatter Settings file');
				addFormatter(extensionPath, formatterUrl, defaultFormatter, relativePath);
			} else {
				return didOpen;
			}
		});
}

function isRemote(f) {
	return f !== null && f.startsWith('http:/') || f.startsWith('https:/');
}

async function addFormatter(extensionPath, formatterUrl, defaultFormatter, relativePath) {
	const options: InputBoxOptions = {
		value: (relativePath ? relativePath : formatterUrl),
		prompt: 'please enter URL or Path:',
		ignoreFocusOut: true
	};
	await window.showInputBox(options).then(f => {
		if (f) {
			let global = workspace.workspaceFolders === undefined;
			if (isRemote(f)) {
				commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(f));
				getJavaConfiguration().update('format.settings.url', f, global);
			} else {
				if (!path.isAbsolute(f)) {
					let fileName = f;
					if (!global) {
						f = path.join(workspace.workspaceFolders[0].uri.fsPath, fileName);
						relativePath = fileName;
					} else {
						let root = path.join(extensionPath, '..', 'redhat.java');
						if (!fs.existsSync(root)) {
							fs.mkdirSync(root);
						}
						f = path.join(root, fileName);
					}
				} else {
					relativePath = null;
				}
				getJavaConfiguration().update('format.settings.url', (relativePath !== null ? relativePath : f), global);
				if (!fs.existsSync(f)) {
					let name = relativePath !== null ? relativePath : f;
					let msg = '\'' + name + '\' does not exist. Do you want to create it?';
					let action = 'Yes';
					window.showWarningMessage(msg, action, 'No').then((selection) => {
						if (action === selection) {
							fs.createReadStream(defaultFormatter)
							.pipe(fs.createWriteStream(f))
							.on('finish', () => openDocument(extensionPath, f, defaultFormatter, relativePath));
						}
					});
				} else {
					openDocument(extensionPath, f, defaultFormatter, relativePath);
				}
			}
		}
	});
}

async function applyWorkspaceEdit(obj, languageClient) {
	let edit = languageClient.protocol2CodeConverter.asWorkspaceEdit(obj);
	if (edit) {
		await workspace.applyEdit(edit);
		// By executing the range formatting command to correct the indention according to the VS Code editor settings.
		// More details, see: https://github.com/redhat-developer/vscode-java/issues/557
		try {
			let currentEditor = window.activeTextEditor;
			// If the Uri path of the edit change is not equal to that of the active editor, we will skip the range formatting
			if (currentEditor.document.uri.fsPath !== edit.entries()[0][0].fsPath) {
				return;
			}
			let cursorPostion = currentEditor.selection.active;
			// Get the array of all the changes
			let changes = edit.entries()[0][1];
			// Get the position information of the first change
			let startPosition = new Position(changes[0].range.start.line, changes[0].range.start.character);
			let lineOffsets = changes[0].newText.split(/\r?\n/).length - 1;
			for (let i = 1; i < changes.length; i++) {
				// When it comes to a discontinuous range, execute the range formatting and record the new start position
				if (changes[i].range.start.line !== startPosition.line) {
					await executeRangeFormat(currentEditor, startPosition, lineOffsets);
					startPosition = new Position(changes[i].range.start.line, changes[i].range.start.character);
					lineOffsets = 0;
				}
				lineOffsets += changes[i].newText.split(/\r?\n/).length - 1;
			}
			await executeRangeFormat(currentEditor, startPosition, lineOffsets);
			// Recover the cursor's original position
			currentEditor.selection = new Selection(cursorPostion, cursorPostion);
		} catch (error) {
			languageClient.error(error);
		}
	}
}

async function executeRangeFormat(editor, startPosition, lineOffset) {
	let endPosition = editor.document.positionAt(editor.document.offsetAt(new Position(startPosition.line + lineOffset + 1, 0)) - 1);
	editor.selection = new Selection(startPosition, endPosition);
	await commands.executeCommand('editor.action.formatSelection');
}
