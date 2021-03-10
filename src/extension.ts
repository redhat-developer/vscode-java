'use strict';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { workspace, extensions, ExtensionContext, window, commands, ViewColumn, Uri, languages, IndentAction, InputBoxOptions, Selection, Position, EventEmitter, OutputChannel, TextDocument, RelativePattern, ConfigurationTarget, WorkspaceConfiguration, env, UIKind } from 'vscode';
import { ExecuteCommandParams, ExecuteCommandRequest, LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ErrorHandler, Message, ErrorAction, CloseAction, DidChangeConfigurationNotification, CancellationToken } from 'vscode-languageclient';
import { collectJavaExtensions } from './plugin';
import { prepareExecutable } from './javaServerStarter';
import * as requirements from './requirements';
import { initialize as initializeRecommendation } from './recommendation';
import { Commands } from './commands';
import { ExtensionAPI, ClientStatus } from './extension.api';
import { getJavaConfiguration, deleteDirectory, getBuildFilePatterns, getInclusionPatternsFromNegatedExclusion, convertToGlob, getExclusionBlob } from './utils';
import { onConfigurationChange, getJavaServerMode, ServerMode } from './settings';
import { logger, initializeLogFile } from './log';
import glob = require('glob');
import { SyntaxLanguageClient } from './syntaxLanguageClient';
import { registerClientProviders } from './providerDispatcher';
import * as fileEventHandler from './fileEventHandler';
import { StandardLanguageClient } from './standardLanguageClient';
import { apiManager } from './apiManager';
import { SnippetCompletionProvider } from './snippetCompletionProvider';
import { runtimeStatusBarProvider } from './runtimeStatusBarProvider';
import { registerSemanticTokensProvider } from './semanticTokenProvider';
import { serverStatusBarProvider } from './serverStatusBarProvider';
import { markdownPreviewProvider } from "./markdownPreviewProvider";

const syntaxClient: SyntaxLanguageClient = new SyntaxLanguageClient();
const standardClient: StandardLanguageClient = new StandardLanguageClient();
const jdtEventEmitter = new EventEmitter<Uri>();
const cleanWorkspaceFileName = '.cleanWorkspace';
const extensionName = 'Language Support for Java';
let clientLogFile;

export class ClientErrorHandler implements ErrorHandler {
	private restarts: number[];

	constructor(private name: string) {
		this.restarts = [];
	}

	public error(_error: Error, _message: Message, count: number): ErrorAction {
		if (count && count <= 3) {
			logger.error(`${this.name} server encountered error: ${_message}, ${_error && _error.toString()}`);
			return ErrorAction.Continue;
		}

		logger.error(`${this.name} server encountered error and will shut down: ${_message}, ${_error && _error.toString()}`);
		return ErrorAction.Shutdown;
	}

	public closed(): CloseAction {
		this.restarts.push(Date.now());
		if (this.restarts.length < 5) {
			logger.error(`The ${this.name} server crashed and will restart.`);
			return CloseAction.Restart;
		} else {
			const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
			if (diff <= 3 * 60 * 1000) {
				const message = `The ${this.name} server crashed 5 times in the last 3 minutes. The server will not be restarted.`;
				logger.error(message);
				const action = "Show logs";
				window.showErrorMessage(message, action).then(selection => {
					if (selection === action) {
						commands.executeCommand(Commands.OPEN_LOGS);
					}
				});
				return CloseAction.DoNotRestart;
			}

			logger.error(`The ${this.name} server crashed and will restart.`);
			this.restarts.shift();
			return CloseAction.Restart;
		}
	}
}

export class OutputInfoCollector implements OutputChannel {
	private channel: OutputChannel = null;

	constructor(public name: string) {
		this.channel = window.createOutputChannel(this.name);
	}

	append(value: string): void {
		logger.info(value);
		this.channel.append(value);
	}

	appendLine(value: string): void {
		logger.info(value);
		this.channel.appendLine(value);
	}

	clear(): void {
		this.channel.clear();
	}

	show(preserveFocus?: boolean): void;
	show(column?: ViewColumn, preserveFocus?: boolean): void;
	show(column?: any, preserveFocus?: any) {
		this.channel.show(column, preserveFocus);
	}

	hide(): void {
		this.channel.hide();
	}

	dispose(): void {
		this.channel.dispose();
	}
}

export function activate(context: ExtensionContext): Promise<ExtensionAPI> {
	context.subscriptions.push(markdownPreviewProvider);
	context.subscriptions.push(commands.registerCommand(Commands.TEMPLATE_VARIABLES, async () => {
		markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `${Commands.TEMPLATE_VARIABLES}.md`)), 'Predefined Variables', "", context);
	}));

	let storagePath = context.storagePath;
	if (!storagePath) {
		storagePath = getTempWorkspace();
	}
	clientLogFile = path.join(storagePath, 'client.log');
	initializeLogFile(clientLogFile);

	enableJavadocSymbols();

	initializeRecommendation(context);

	return requirements.resolveRequirements(context).catch(error => {
		// show error
		window.showErrorMessage(error.message, error.label).then((selection) => {
			if (error.label && error.label === selection && error.command) {
				commands.executeCommand(error.command, error.commandParam);
			}
		});
		// rethrow to disrupt the chain.
		throw error;
	}).then(async (requirements) => {
		const triggerFiles = await getTriggerFiles();
		return new Promise<ExtensionAPI>(async (resolve) => {
			const workspacePath = path.resolve(storagePath + '/jdt_ws');
			const syntaxServerWorkspacePath = path.resolve(storagePath + '/ss_ws');

			const serverMode = getJavaServerMode();
			commands.executeCommand('setContext', 'java:serverMode', serverMode);
			const isDebugModeByClientPort = !!process.env['SYNTAXLS_CLIENT_PORT'] || !!process.env['JDTLS_CLIENT_PORT'];
			const requireSyntaxServer = (serverMode !== ServerMode.STANDARD) && (!isDebugModeByClientPort || !!process.env['SYNTAXLS_CLIENT_PORT']);
			let requireStandardServer = (serverMode !== ServerMode.LIGHTWEIGHT) && (!isDebugModeByClientPort || !!process.env['JDTLS_CLIENT_PORT']);

			// Options to control the language client
			const clientOptions: LanguageClientOptions = {
				// Register the server for java
				documentSelector: [
					{ scheme: 'file', language: 'java' },
					{ scheme: 'jdt', language: 'java' },
					{ scheme: 'untitled', language: 'java' }
				],
				synchronize: {
					configurationSection: ['java', 'editor.insertSpaces', 'editor.tabSize'],
				},
				initializationOptions: {
					bundles: collectJavaExtensions(extensions.all),
					workspaceFolders: workspace.workspaceFolders ? workspace.workspaceFolders.map(f => f.uri.toString()) : null,
					settings: { java: getJavaConfig(requirements.java_home) },
					extendedClientCapabilities: {
						progressReportProvider: getJavaConfiguration().get('progressReports.enabled'),
						classFileContentsSupport: true,
						overrideMethodsPromptSupport: true,
						hashCodeEqualsPromptSupport: true,
						advancedOrganizeImportsSupport: true,
						generateToStringPromptSupport: true,
						advancedGenerateAccessorsSupport: true,
						generateConstructorsPromptSupport: true,
						generateDelegateMethodsPromptSupport: true,
						advancedExtractRefactoringSupport: true,
						inferSelectionSupport: ["extractMethod", "extractVariable", "extractField"],
						moveRefactoringSupport: true,
						clientHoverProvider: true,
						clientDocumentSymbolProvider: true,
						gradleChecksumWrapperPromptSupport: true,
						resolveAdditionalTextEditsSupport: true,
						advancedIntroduceParameterRefactoringSupport: true,
						actionableRuntimeNotificationSupport: true
					},
					triggerFiles,
				},
				middleware: {
					workspace: {
						didChangeConfiguration: () => {
							standardClient.getClient().sendNotification(DidChangeConfigurationNotification.type, {
								settings: {
									java: getJavaConfig(requirements.java_home),
								}
							});
						}
					}
				},
				revealOutputChannelOn: RevealOutputChannelOn.Never,
				errorHandler: new ClientErrorHandler(extensionName),
				initializationFailedHandler: error => {
					logger.error(`Failed to initialize ${extensionName} due to ${error && error.toString()}`);
					return true;
				},
				outputChannel: requireStandardServer ? new OutputInfoCollector(extensionName) : undefined,
				outputChannelName: extensionName
			};

			apiManager.initialize(requirements);

			if (requireSyntaxServer) {
				if (process.env['SYNTAXLS_CLIENT_PORT']) {
					syntaxClient.initialize(requirements, clientOptions, resolve);
				} else {
					syntaxClient.initialize(requirements, clientOptions, resolve, prepareExecutable(requirements, syntaxServerWorkspacePath, getJavaConfig(requirements.java_home), context, true));
				}
				syntaxClient.start();
				serverStatusBarProvider.showLightWeightStatus();
			}

			context.subscriptions.push(commands.registerCommand(Commands.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
				const api: ExtensionAPI = apiManager.getApiInstance();
				if (api.serverMode === ServerMode.LIGHTWEIGHT) {
					console.warn(`The command: ${command} is not supported in LightWeight mode. See: https://github.com/redhat-developer/vscode-java/issues/1480`);
					return;
				}
				let token: CancellationToken;
				let commandArgs: any[] = rest;
				if (rest && rest.length && CancellationToken.is(rest[rest.length - 1])) {
					token = rest[rest.length - 1];
					commandArgs = rest.slice(0, rest.length - 1);
				}
				const params: ExecuteCommandParams = {
					command,
					arguments: commandArgs
				};
				if (token) {
					return standardClient.getClient().sendRequest(ExecuteCommandRequest.type, params, token);
				} else {
					return standardClient.getClient().sendRequest(ExecuteCommandRequest.type, params);
				}
			}));

			const cleanWorkspaceExists = fs.existsSync(path.join(workspacePath, cleanWorkspaceFileName));
			if (cleanWorkspaceExists) {
				try {
					deleteDirectory(workspacePath);
					deleteDirectory(syntaxServerWorkspacePath);
				} catch (error) {
					window.showErrorMessage(`Failed to delete ${workspacePath}: ${error}`);
				}
			}

			// Register commands here to make it available even when the language client fails
			context.subscriptions.push(commands.registerCommand(Commands.OPEN_SERVER_LOG, (column: ViewColumn) => openServerLogFile(workspacePath, column)));

			context.subscriptions.push(commands.registerCommand(Commands.OPEN_CLIENT_LOG, (column: ViewColumn) => openClientLogFile(clientLogFile, column)));

			context.subscriptions.push(commands.registerCommand(Commands.OPEN_LOGS, () => openLogs()));

			context.subscriptions.push(commands.registerCommand(Commands.OPEN_FORMATTER, async () => openFormatter(context.extensionPath)));

			context.subscriptions.push(commands.registerCommand(Commands.CLEAN_WORKSPACE, () => cleanWorkspace(workspacePath)));

			context.subscriptions.push(onConfigurationChange());

			/**
			 * Command to switch the server mode. Currently it only supports switch from lightweight to standard.
			 * @param force force to switch server mode without asking
			 */
			commands.registerCommand(Commands.SWITCH_SERVER_MODE, async (switchTo: ServerMode, force: boolean = false) => {
				const clientStatus: ClientStatus = standardClient.getClientStatus();
				if (clientStatus === ClientStatus.Starting || clientStatus === ClientStatus.Started) {
					return;
				}

				const api: ExtensionAPI = apiManager.getApiInstance();
				if (api.serverMode === switchTo || api.serverMode === ServerMode.STANDARD) {
					return;
				}

				let choice: string;
				if (force) {
					choice = "Yes";
				} else {
					choice = await window.showInformationMessage("Are you sure you want to switch the Java language server to Standard mode?", "Yes", "No");
				}

				if (choice === "Yes") {
					startStandardServer(context, requirements, clientOptions, workspacePath, resolve);
				}
			});

			const snippetProvider: SnippetCompletionProvider = new SnippetCompletionProvider();
			context.subscriptions.push(languages.registerCompletionItemProvider({ scheme: 'file', language: 'java' }, snippetProvider));
			context.subscriptions.push(serverStatusBarProvider);
			context.subscriptions.push(runtimeStatusBarProvider);

			registerClientProviders(context, { contentProviderEvent: jdtEventEmitter.event });

			apiManager.getApiInstance().onDidServerModeChange((event: ServerMode) => {
				if (event === ServerMode.STANDARD) {
					syntaxClient.stop();
					fileEventHandler.setServerStatus(true);
					runtimeStatusBarProvider.initialize(context.storagePath);
					// temporary implementation Semantic Highlighting before it is part of LSP
					registerSemanticTokensProvider(context);
				}
				commands.executeCommand('setContext', 'java:serverMode', event);
			});

			if (serverMode === ServerMode.HYBRID && !await fse.pathExists(path.join(workspacePath, ".metadata", ".plugins"))) {
				const config = getJavaConfiguration();
				const importOnStartupSection: string = "project.importOnFirstTimeStartup";
				const importOnStartup = config.get(importOnStartupSection);
				if (importOnStartup === "disabled" ||
					env.uiKind === UIKind.Web && env.appName.includes("Visual Studio Code")) {
					syntaxClient.resolveApi(resolve);
					requireStandardServer = false;
				} else if (importOnStartup === "interactive" && await workspaceContainsBuildFiles()) {
					syntaxClient.resolveApi(resolve);
					requireStandardServer = await promptUserForStandardServer(config);
				} else {
					requireStandardServer = true;
				}
			}

			if (requireStandardServer) {
				startStandardServer(context, requirements, clientOptions, workspacePath, resolve);
			}
		});
	});
}

function startStandardServer(context: ExtensionContext, requirements: requirements.RequirementsData, clientOptions: LanguageClientOptions, workspacePath: string, resolve: (value?: ExtensionAPI | PromiseLike<ExtensionAPI>) => void) {
	if (standardClient.getClientStatus() !== ClientStatus.Uninitialized) {
		return;
	}
	if (apiManager.getApiInstance().serverMode === ServerMode.LIGHTWEIGHT) {
		// Before standard server is ready, we are in hybrid.
		apiManager.getApiInstance().serverMode = ServerMode.HYBRID;
		apiManager.fireDidServerModeChange(ServerMode.HYBRID);
	}
	standardClient.initialize(context, requirements, clientOptions, workspacePath, jdtEventEmitter, resolve);
	standardClient.start();
	serverStatusBarProvider.showStandardStatus();
}

async function workspaceContainsBuildFiles(): Promise<boolean> {
	// Since the VS Code API does not support put negated exclusion pattern in findFiles(), we need to first parse the
	// negated exclusion to inclusion and do the search. (If negated exclusion pattern is set by user)
	const inclusionPatterns: string[] = getBuildFilePatterns();
	const inclusionPatternsFromNegatedExclusion: string[] = getInclusionPatternsFromNegatedExclusion();
	if (inclusionPatterns.length > 0 && inclusionPatternsFromNegatedExclusion.length > 0 &&
			(await workspace.findFiles(convertToGlob(inclusionPatterns, inclusionPatternsFromNegatedExclusion), null, 1 /*maxResults*/)).length > 0) {
		return true;
	}

	// Nothing found in negated exclusion pattern, do a normal search then.
	const inclusionBlob: string = convertToGlob(inclusionPatterns);
	const exclusionBlob: string = getExclusionBlob();
	if (inclusionBlob && (await workspace.findFiles(inclusionBlob, exclusionBlob, 1 /*maxResults*/)).length > 0) {
		return true;
	}

	return false;
}

async function promptUserForStandardServer(config: WorkspaceConfiguration): Promise<boolean> {
	const choice: string = await window.showInformationMessage("The workspace contains Java projects. Would you like to import them?", "Yes", "Always", "Later");
	switch (choice) {
		case "Always":
			await config.update("project.importOnFirstTimeStartup", "automatic", ConfigurationTarget.Global);
			return true;
		case "Yes":
			return true;
		case "Later":
		default:
			const importHintSection: string = "project.importHint";
			const dontShowAgain: string = "Don't Show Again";
			const showHint: boolean = config.get(importHintSection);
			if (showHint && standardClient.getClientStatus() === ClientStatus.Uninitialized) {
				const showRocketEmoji: boolean = process.platform === "win32" || process.platform === "darwin";
				const message: string = `Java Language Server is running in LightWeight mode. Click the ${showRocketEmoji ? '🚀' : 'Rocket'} icon in the status bar if you want to import the projects later.`;
				window.showInformationMessage(message, dontShowAgain)
					.then(selection => {
						if (selection && selection === dontShowAgain) {
							config.update(importHintSection, false, ConfigurationTarget.Global);
						}
					});
			}
			return false;
	}
}

export function getJavaConfig(javaHome: string) {
	const origConfig = getJavaConfiguration();
	const javaConfig = JSON.parse(JSON.stringify(origConfig));
	javaConfig.home = javaHome;
	// Since source & output path are project specific settings. To avoid pollute other project,
	// we avoid reading the value from the global scope.
	javaConfig.project.outputPath = origConfig.inspect<string>("project.outputPath").workspaceValue;
	javaConfig.project.sourcePaths = origConfig.inspect<string[]>("project.sourcePaths").workspaceValue;

	const editorConfig = workspace.getConfiguration('editor');
	javaConfig.format.insertSpaces = editorConfig.get('insertSpaces');
	javaConfig.format.tabSize = editorConfig.get('tabSize');
	return javaConfig;
}

export function deactivate(): void {
	standardClient.stop();
	syntaxClient.stop();
}

export async function getActiveLanguageClient(): Promise<LanguageClient | undefined> {
	let languageClient: LanguageClient;

	const api: ExtensionAPI = apiManager.getApiInstance();
	if (api.serverMode === ServerMode.STANDARD) {
		languageClient = standardClient.getClient();
	} else {
		languageClient = syntaxClient.getClient();
	}

	if (!languageClient) {
		return undefined;
	}

	await languageClient.onReady();

	return languageClient;
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

function getTempWorkspace() {
	return path.resolve(os.tmpdir(), 'vscodesws_' + makeRandomHexString(5));
}

function makeRandomHexString(length) {
	const chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	let result = '';
	for (let i = 0; i < length; i++) {
		const idx = Math.floor(chars.length * Math.random());
		result += chars[idx];
	}
	return result;
}

async function cleanWorkspace(workspacePath) {
	const doIt = 'Restart and delete';
	window.showWarningMessage('Are you sure you want to clean the Java language server workspace?', 'Cancel', doIt).then(selection => {
		if (selection === doIt) {
			if (!fs.existsSync(workspacePath)) {
				fs.mkdirSync(workspacePath);
			}
			const file = path.join(workspacePath, cleanWorkspaceFileName);
			fs.closeSync(fs.openSync(file, 'w'));
			commands.executeCommand(Commands.RELOAD_WINDOW);
		}
	});
}

function openServerLogFile(workspacePath, column: ViewColumn = ViewColumn.Active): Thenable<boolean> {
	const serverLogFile = path.join(workspacePath, '.metadata', '.log');
	return openLogFile(serverLogFile, 'Could not open Java Language Server log file', column);
}

function openClientLogFile(logFile: string, column: ViewColumn = ViewColumn.Active): Thenable<boolean> {
	return new Promise((resolve) => {
		const filename = path.basename(logFile);
		const dirname = path.dirname(logFile);

		// find out the newest one
		glob(filename + '.*', { cwd: dirname }, (err, files) => {
			if (!err && files.length > 0) {
				files.sort();
				logFile = path.join(dirname, files[files.length - 1]);
			}

			openLogFile(logFile, 'Could not open Java extension log file', column).then((result) => resolve(result));
		});
	});
}

async function openLogs() {
	await commands.executeCommand(Commands.OPEN_CLIENT_LOG, ViewColumn.One);
	await commands.executeCommand(Commands.OPEN_SERVER_LOG, ViewColumn.Two);
}

function openLogFile(logFile, openingFailureWarning: string, column: ViewColumn = ViewColumn.Active): Thenable<boolean> {
	if (!fs.existsSync(logFile)) {
		return window.showWarningMessage('No log file available').then(() => false);
	}

	return workspace.openTextDocument(logFile)
		.then(doc => {
			if (!doc) {
				return false;
			}
			return window.showTextDocument(doc, column)
				.then(editor => !!editor);
		}, () => false)
		.then(didOpen => {
			if (!didOpen) {
				window.showWarningMessage(openingFailureWarning);
			}
			return didOpen;
		});
}

async function openFormatter(extensionPath) {
	const defaultFormatter = path.join(extensionPath, 'formatters', 'eclipse-formatter.xml');
	const formatterUrl: string = getJavaConfiguration().get('format.settings.url');
	if (formatterUrl && formatterUrl.length > 0) {
		if (isRemote(formatterUrl)) {
			commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(formatterUrl));
		} else {
			const document = getPath(formatterUrl);
			if (document && fs.existsSync(document)) {
				return openDocument(extensionPath, document, defaultFormatter, null);
			}
		}
	}
	const global = workspace.workspaceFolders === undefined;
	const fileName = formatterUrl || 'eclipse-formatter.xml';
	let file;
	let relativePath;
	if (!global) {
		file = path.join(workspace.workspaceFolders[0].uri.fsPath, fileName);
		relativePath = fileName;
	} else {
		const root = path.join(extensionPath, '..', 'redhat.java');
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
			const file = path.resolve(wf.uri.path, f);
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
			const global = workspace.workspaceFolders === undefined;
			if (isRemote(f)) {
				commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(f));
				getJavaConfiguration().update('format.settings.url', f, global);
			} else {
				if (!path.isAbsolute(f)) {
					const fileName = f;
					if (!global) {
						f = path.join(workspace.workspaceFolders[0].uri.fsPath, fileName);
						relativePath = fileName;
					} else {
						const root = path.join(extensionPath, '..', 'redhat.java');
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
					const name = relativePath !== null ? relativePath : f;
					const msg = `' ${name} ' does not exist. Do you want to create it?`;
					const action = 'Yes';
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

export function applyWorkspaceEdit(obj, languageClient) {
	const edit = languageClient.protocol2CodeConverter.asWorkspaceEdit(obj);
	if (edit) {
		workspace.applyEdit(edit);
	}
}

async function getTriggerFiles(): Promise<string[]> {
	const openedJavaFiles = [];
	const activeJavaFile = getJavaFilePathOfTextDocument(window.activeTextEditor && window.activeTextEditor.document);
	if (activeJavaFile) {
		openedJavaFiles.push(Uri.file(activeJavaFile).toString());
	}

	if (!workspace.workspaceFolders) {
		return openedJavaFiles;
	}

	await Promise.all(workspace.workspaceFolders.map(async (rootFolder) => {
		if (rootFolder.uri.scheme !== 'file') {
			return;
		}

		const rootPath = path.normalize(rootFolder.uri.fsPath);
		if (isPrefix(rootPath, activeJavaFile)) {
			return;
		}

		for (const textEditor of window.visibleTextEditors) {
			const javaFileInTextEditor = getJavaFilePathOfTextDocument(textEditor.document);
			if (isPrefix(rootPath, javaFileInTextEditor)) {
				openedJavaFiles.push(Uri.file(javaFileInTextEditor).toString());
				return;
			}
		}

		for (const textDocument of workspace.textDocuments) {
			const javaFileInTextDocument = getJavaFilePathOfTextDocument(textDocument);
			if (isPrefix(rootPath, javaFileInTextDocument)) {
				openedJavaFiles.push(Uri.file(javaFileInTextDocument).toString());
				return;
			}
		}

		const javaFilesUnderRoot: Uri[] = await workspace.findFiles(new RelativePattern(rootFolder, "*.java"), undefined, 1);
		for (const javaFile of javaFilesUnderRoot) {
			if (isPrefix(rootPath, javaFile.fsPath)) {
				openedJavaFiles.push(javaFile.toString());
				return;
			}
		}

		const javaFilesInCommonPlaces: Uri[] = await workspace.findFiles(new RelativePattern(rootFolder, "{src, test}/**/*.java"), undefined, 1);
		for (const javaFile of javaFilesInCommonPlaces) {
			if (isPrefix(rootPath, javaFile.fsPath)) {
				openedJavaFiles.push(javaFile.toString());
				return;
			}
		}
	}));

	return openedJavaFiles;
}

function getJavaFilePathOfTextDocument(document: TextDocument): string | undefined {
	if (document) {
		const resource = document.uri;
		if (resource.scheme === 'file' && resource.fsPath.endsWith('.java')) {
			return path.normalize(resource.fsPath);
		}
	}

	return undefined;
}

function isPrefix(parentPath: string, childPath: string): boolean {
	if (!childPath) {
		return false;
	}
	const relative = path.relative(parentPath, childPath);
	return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}
