'use strict';

import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import { CodeActionContext, commands, CompletionItem, ConfigurationTarget, Diagnostic, env, EventEmitter, ExtensionContext, extensions, IndentAction, InputBoxOptions, languages, MarkdownString, QuickPickItemKind, RelativePattern, TextDocument, TextEditorRevealType, UIKind, Uri, ViewColumn, window, workspace, WorkspaceConfiguration } from 'vscode';
import { CancellationToken, CodeActionParams, CodeActionRequest, Command, CompletionRequest, DidChangeConfigurationNotification, ExecuteCommandParams, ExecuteCommandRequest, LanguageClientOptions, RevealOutputChannelOn } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { apiManager } from './apiManager';
import { ClientErrorHandler } from './clientErrorHandler';
import { Commands, CommandTitle } from './commands';
import { ClientStatus, ExtensionAPI, TraceEvent } from './extension.api';
import * as fileEventHandler from './fileEventHandler';
import { getSharedIndexCache, HEAP_DUMP_LOCATION, prepareExecutable, removeEquinoxFragmentOnDarwinX64, startedFromSources } from './javaServerStarter';
import { initializeLogFile, logger } from './log';
import { cleanupLombokCache } from "./lombokSupport";
import { markdownPreviewProvider } from "./markdownPreviewProvider";
import { OutputInfoCollector } from './outputInfoCollector';
import { collectJavaExtensions, getBundlesToReload, getShortcuts, IJavaShortcut, isContributedPartUpdated } from './plugin';
import { fixJdtSchemeHoverLinks, registerClientProviders } from './providerDispatcher';
import { initialize as initializeRecommendation } from './recommendation';
import * as requirements from './requirements';
import { languageStatusBarProvider } from './runtimeStatusBarProvider';
import { serverStatusBarProvider, ShortcutQuickPickItem } from './serverStatusBarProvider';
import { ACTIVE_BUILD_TOOL_STATE, cleanWorkspaceFileName, getJavaServerMode, handleTextDocumentChanges, getImportMode, onConfigurationChange, ServerMode, ImportMode } from './settings';
import { snippetCompletionProvider } from './snippetCompletionProvider';
import { JavaClassEditorProvider } from './javaClassEditor';
import { StandardLanguageClient } from './standardLanguageClient';
import { SyntaxLanguageClient } from './syntaxLanguageClient';
import { convertToGlob, deleteClientLog, deleteDirectory, ensureExists, getBuildFilePatterns, getExclusionGlob, getInclusionPatternsFromNegatedExclusion, getJavaConfig, getJavaConfiguration, hasBuildToolConflicts, resolveActualCause, getVersion } from './utils';
import glob = require('glob');
import { Telemetry } from './telemetry';
import { getMessage } from './errorUtils';
import { TelemetryService } from '@redhat-developer/vscode-redhat-telemetry/lib';
import { activationProgressNotification } from "./serverTaskPresenter";
import { loadSupportedJreNames } from './jdkUtils';
import { BuildFileSelector, PICKED_BUILD_FILES, cleanupWorkspaceState } from './buildFilesSelector';
import { pasteFile } from './pasteAction';
import { ServerStatusKind } from './serverStatus';

const syntaxClient: SyntaxLanguageClient = new SyntaxLanguageClient();
const standardClient: StandardLanguageClient = new StandardLanguageClient();
const jdtEventEmitter = new EventEmitter<Uri>();
const extensionName = 'Language Support for Java';
let storagePath: string;
let clientLogFile: string;

/**
 * Shows a message about the server crashing due to an out of memory issue
 */
async function showOOMMessage(): Promise<void> {
	const CONFIGURE = 'Increase Memory ..';
	const result = await window.showErrorMessage('The Java Language Server encountered an OutOfMemory error. Some language features may not work due to limited memory. ',
		CONFIGURE);
	if (result === CONFIGURE) {
		let jvmArgs: string = getJavaConfiguration().get('jdt.ls.vmargs');
		const results = MAX_HEAP_SIZE_EXTRACTOR.exec(jvmArgs);
		if (results && results[0]) {
			const maxMemArg: string = results[0];
			const maxMemValue: number = Number(results[1]);
			const newMaxMemArg: string = maxMemArg.replace(maxMemValue.toString(), (maxMemValue * 2).toString());
			jvmArgs = jvmArgs.replace(maxMemArg, newMaxMemArg);
			await workspace.getConfiguration().update("java.jdt.ls.vmargs", jvmArgs, ConfigurationTarget.Workspace);
		}
	}
}

function getMaxMemFromConfiguration(includeUnit?: boolean): string | undefined {
	const jvmArgs: string = getJavaConfiguration().get('jdt.ls.vmargs');
	const results = includeUnit ? MAX_HEAP_SIZE_EXTRACTOR_WITH_UNIT.exec(jvmArgs)
		: MAX_HEAP_SIZE_EXTRACTOR.exec(jvmArgs);
	return results && results[0] ? results[1] : undefined;
}

const HEAP_DUMP_FOLDER_EXTRACTOR = new RegExp(`${HEAP_DUMP_LOCATION}(?:'([^']+)'|"([^"]+)"|([^\\s]+))`);
const MAX_HEAP_SIZE_EXTRACTOR = new RegExp(`-Xmx([0-9]+)[kKmMgG]`);
const MAX_HEAP_SIZE_EXTRACTOR_WITH_UNIT = new RegExp(`-Xmx([0-9]+[kKmMgG])`);

/**
 * Returns the heap dump folder defined in the user's preferences, or undefined if the user does not set the heap dump folder
 *
 * @returns the heap dump folder defined in the user's preferences, or undefined if the user does not set the heap dump folder
 */
function getHeapDumpFolderFromSettings(): string {
	const jvmArgs: string = getJavaConfiguration().get('jdt.ls.vmargs');
	const results = HEAP_DUMP_FOLDER_EXTRACTOR.exec(jvmArgs);
	if (!results || !results[0]) {
		return undefined;
	}
	return results[1] || results[2] || results[3];
}

const REPLACE_JDT_LINKS_PATTERN: RegExp = /(\[(?:[^\]])+\]\()(jdt:\/\/(?:(?:(?:\\\))|([^)]))+))\)/g;

/**
 * Replace `jdt://` links in the documentation with links that execute the VS Code command required to open the referenced file.
 *
 * Extracted from {@link fixJdtSchemeHoverLinks} for use in completion item documentation.
 *
 * @param oldDocumentation the documentation to fix the links in
 * @returns the documentation with fixed links
 */
export function fixJdtLinksInDocumentation(oldDocumentation: MarkdownString): MarkdownString {
	const newContent: string = oldDocumentation.value.replace(REPLACE_JDT_LINKS_PATTERN, (_substring, group1, group2) => {
		const uri = `command:${Commands.OPEN_FILE}?${encodeURI(JSON.stringify([encodeURIComponent(group2)]))}`;
		return `${group1}${uri})`;
	});
	const mdString = new MarkdownString(newContent);
	mdString.isTrusted = true;
	return mdString;
}

export async function activate(context: ExtensionContext): Promise<ExtensionAPI> {
	await loadSupportedJreNames(context);
	context.subscriptions.push(commands.registerCommand(Commands.FILESEXPLORER_ONPASTE, async () => {
		const originalClipboard = await env.clipboard.readText();
		// Hack in order to get path to selected folder if applicable (see https://github.com/microsoft/vscode/issues/3553#issuecomment-1098562676)
		await commands.executeCommand('copyFilePath');
		const folder = await env.clipboard.readText();
		await env.clipboard.writeText(originalClipboard);
		pasteFile(folder);
	}));
	context.subscriptions.push(markdownPreviewProvider);
	context.subscriptions.push(commands.registerCommand(Commands.TEMPLATE_VARIABLES, async () => {
		markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `${Commands.TEMPLATE_VARIABLES}.md`)), 'Predefined Variables', "", context);
	}));
	context.subscriptions.push(commands.registerCommand(Commands.NOT_COVERED_EXECUTION, async () => {
		markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `_java.notCoveredExecution.md`)), 'Not Covered Maven Plugin Execution', "", context);
	}));

	storagePath = context.storagePath;
	context.subscriptions.push(commands.registerCommand(Commands.METADATA_FILES_GENERATION, async () => {
		markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `_java.metadataFilesGeneration.md`)), 'Metadata Files Generation', "", context);
	}));
	context.subscriptions.push(commands.registerCommand(Commands.LEARN_MORE_ABOUT_CLEAN_UPS, async () => {
		markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `${Commands.LEARN_MORE_ABOUT_CLEAN_UPS}.md`)), 'Java Clean Ups', "java-clean-ups", context);
	}));
	if (!storagePath) {
		storagePath = getTempWorkspace();
	}
	const workspacePath = path.resolve(`${storagePath}/jdt_ws`);
	clientLogFile = path.join(storagePath, 'client.log');
	const cleanWorkspaceExists = fs.existsSync(path.join(workspacePath, cleanWorkspaceFileName));
	if (cleanWorkspaceExists) {
		deleteClientLog(storagePath);
	}
	initializeLogFile(clientLogFile);

	const telemetryService: Promise<TelemetryService> = Telemetry.startTelemetry(context);

	enableJavadocSymbols();

	initializeRecommendation(context, telemetryService);

	registerOutOfMemoryDetection(storagePath);

	cleanJavaWorkspaceStorage();

	if (!startedFromSources()) { // Dev mode: version may not match package.json, deleting the in-use folder
		cleanOldGlobalStorage(context);
	}

	// https://github.com/redhat-developer/vscode-java/issues/3484
	if (process.platform === 'darwin' && process.arch === 'x64') {
		try {
			if (semver.lt(os.release(), '20.0.0')) {
				removeEquinoxFragmentOnDarwinX64(context);
			}
		} catch (error) {
			// do nothing
		}
	}

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
			const syntaxServerWorkspacePath = path.resolve(`${storagePath}/ss_ws`);

			let serverMode = getJavaServerMode();
			const isWorkspaceTrusted = (workspace as any).isTrusted; // TODO: use workspace.isTrusted directly when other clients catch up to adopt 1.56.0
			if (isWorkspaceTrusted !== undefined && !isWorkspaceTrusted) { // keep compatibility for old engines < 1.56.0
				serverMode = ServerMode.lightWeight;
			}
			commands.executeCommand('setContext', 'java:serverMode', serverMode);
			const isDebugModeByClientPort = !!process.env['SYNTAXLS_CLIENT_PORT'] || !!process.env['JDTLS_CLIENT_PORT'];
			const requireSyntaxServer = (serverMode !== ServerMode.standard) && (!isDebugModeByClientPort || !!process.env['SYNTAXLS_CLIENT_PORT']);
			let requireStandardServer = (serverMode !== ServerMode.lightWeight) && (!isDebugModeByClientPort || !!process.env['JDTLS_CLIENT_PORT']);
			let initFailureReported: boolean = false;

			// Options to control the language client
			const clientOptions: LanguageClientOptions = {
				// Register the server for java
				documentSelector: [
					{ scheme: 'file', language: 'java' },
					{ scheme: 'jdt', language: 'java' },
					{ scheme: 'untitled', language: 'java' }
				],
				synchronize: {
					configurationSection: ['java', 'editor.insertSpaces', 'editor.tabSize', "files.associations"],
				},
				initializationOptions: {
					bundles: collectJavaExtensions(extensions.all),
					workspaceFolders: workspace.workspaceFolders ? workspace.workspaceFolders.map(f => f.uri.toString()) : null,
					settings: { java: await getJavaConfig(requirements.java_home) },
					extendedClientCapabilities: {
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
						advancedIntroduceParameterRefactoringSupport: true,
						actionableRuntimeNotificationSupport: true,
						onCompletionItemSelectedCommand: "editor.action.triggerParameterHints",
						extractInterfaceSupport: true,
						advancedUpgradeGradleSupport: true,
						executeClientCommandSupport: true,
					},
					triggerFiles,
				},
				middleware: {
					workspace: {
						didChangeConfiguration: async () => {
							await standardClient.getClient().sendNotification(DidChangeConfigurationNotification.type, {
								settings: {
									java: await getJavaConfig(requirements.java_home),
								}
							});
						}
					},
					resolveCompletionItem: async (item, token, next): Promise<CompletionItem> => {
						const completionItem = await next(item, token);
						if (completionItem.documentation instanceof MarkdownString) {
							completionItem.documentation = fixJdtLinksInDocumentation(completionItem.documentation);
						}
						return completionItem;
					},
					// https://github.com/redhat-developer/vscode-java/issues/2130
					// include all diagnostics for the current line in the CodeActionContext params for the performance reason
					provideCodeActions: async (document, range, context, token, next) => {
						const client: LanguageClient = standardClient.getClient();
						const params: CodeActionParams = {
							textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document),
							range: client.code2ProtocolConverter.asRange(range),
							context: await client.code2ProtocolConverter.asCodeActionContext(context)
						};
						const showAt = getJavaConfiguration().get<string>("quickfix.showAt");
						if (showAt === 'line' && range.start.line === range.end.line && range.start.character === range.end.character) {
							const textLine = document.lineAt(params.range.start.line);
							if (textLine !== null) {
								const diagnostics = client.diagnostics.get(document.uri);
								const allDiagnostics: Diagnostic[] = [];
								for (const diagnostic of diagnostics) {
									if (textLine.range.intersection(diagnostic.range)) {
										const newLen = allDiagnostics.push(diagnostic);
										if (newLen > 1000) {
											break;
										}
									}
								}
								const codeActionContext: CodeActionContext = {
									diagnostics: allDiagnostics,
									only: context.only,
									triggerKind: context.triggerKind,
								};
								params.context = await client.code2ProtocolConverter.asCodeActionContext(codeActionContext);
							}
						}
						return client.sendRequest(CodeActionRequest.type, params, token).then(async (values) => {
							if (values === null) {
								return undefined;
							}
							const result = [];
							for (const item of values) {
								if (Command.is(item)) {
									result.push(client.protocol2CodeConverter.asCommand(item));
								}
								else {
									result.push(await client.protocol2CodeConverter.asCodeAction(item));
								}
							}
							return result;
						}, (error) => {
							return client.handleFailedRequest(CodeActionRequest.type, token, error, []);
						});
					}
				},
				revealOutputChannelOn: RevealOutputChannelOn.Never,
				errorHandler: new ClientErrorHandler(extensionName),
				initializationFailedHandler: error => {
					logger.error(`Failed to initialize ${extensionName} due to ${error && error.toString()}`);
					if ((error.toString().includes('Connection')  && error.toString().includes('disposed')) || error.toString().includes('Internal error')) {
						if (!initFailureReported) {
							apiManager.fireTraceEvent({
								name: "java.client.error.initialization",
								properties: {
									message: error && error.toString(),
									data: resolveActualCause(error?.data),
								},
							});
						}
						initFailureReported = true;
						return false;
					} else {
						return true;
					}
				},
				outputChannel: requireStandardServer ? new OutputInfoCollector(extensionName) : undefined,
				outputChannelName: extensionName
			};

			apiManager.initialize(requirements, serverMode);
			registerCodeCompletionTelemetryListener();
			resolve(apiManager.getApiInstance());
			// the promise is resolved
			// no need to pass `resolve` into any code past this point,
			// since `resolve` is a no-op from now on
			const serverOptions = prepareExecutable(requirements, syntaxServerWorkspacePath, context, true);
			if (requireSyntaxServer) {
				if (process.env['SYNTAXLS_CLIENT_PORT']) {
					syntaxClient.initialize(requirements, clientOptions);
				} else {
					syntaxClient.initialize(requirements, clientOptions, serverOptions);
				}
				syntaxClient.start().then(() => {
					syntaxClient.registerSyntaxClientActions(serverOptions);
				});
				serverStatusBarProvider.showLightWeightStatus();
			}

			context.subscriptions.push(commands.registerCommand(Commands.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
				const api: ExtensionAPI = apiManager.getApiInstance();
				if (api.serverMode === ServerMode.lightWeight) {
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

			if (cleanWorkspaceExists) {
				const data = {};
				try {
					cleanupLombokCache(context);
					cleanupWorkspaceState(context);
					deleteDirectory(workspacePath);
					deleteDirectory(syntaxServerWorkspacePath);
				} catch (error) {
					data['error'] = getMessage(error);
					window.showErrorMessage(`Failed to delete ${workspacePath}: ${error}`);
				}
				await Telemetry.sendTelemetry(Commands.CLEAN_WORKSPACE, data);
			}

			// Register commands here to make it available even when the language client fails
			context.subscriptions.push(commands.registerCommand(Commands.OPEN_STATUS_SHORTCUT, async (status: string) => {
				const items: ShortcutQuickPickItem[] = [];
				if (status === ServerStatusKind.error || status === ServerStatusKind.warning) {
					commands.executeCommand("workbench.panel.markers.view.focus");
				} else {
					commands.executeCommand(Commands.SHOW_SERVER_TASK_STATUS, true);
				}

				items.push(...getShortcuts().map((shortcut: IJavaShortcut) => {
					return {
						label: shortcut.title,
						command: shortcut.command,
						args: shortcut.arguments,
					};
				}));

				const choice = await window.showQuickPick(items);
				if (!choice) {
					return;
				}

				apiManager.fireTraceEvent({
					name: "triggerShortcutCommand",
					properties: {
						message: choice.command,
					},
				});

				if (choice.command) {
					commands.executeCommand(choice.command, ...(choice.args || []));
				}
			}));
			context.subscriptions.push(commands.registerCommand(Commands.OPEN_SERVER_LOG, (column: ViewColumn) => openServerLogFile(storagePath, column)));
			context.subscriptions.push(commands.registerCommand(Commands.OPEN_SERVER_STDOUT_LOG, (column: ViewColumn) => openRollingServerLogFile(storagePath, '.out-jdt.ls', column)));
			context.subscriptions.push(commands.registerCommand(Commands.OPEN_SERVER_STDERR_LOG, (column: ViewColumn) => openRollingServerLogFile(storagePath, '.error-jdt.ls', column)));

			context.subscriptions.push(commands.registerCommand(Commands.OPEN_CLIENT_LOG, (column: ViewColumn) => openClientLogFile(clientLogFile, column)));

			context.subscriptions.push(commands.registerCommand(Commands.OPEN_LOGS, () => openLogs()));

			context.subscriptions.push(commands.registerCommand(Commands.OPEN_FORMATTER, async () => openFormatter(context.extensionPath)));
			context.subscriptions.push(commands.registerCommand(Commands.OPEN_FILE, async (uri: string) => {
				const parsedUri = Uri.parse(uri);
				const editor = await window.showTextDocument(parsedUri);
				// Reveal the document at the specified line, if possible (e.g. jumping to a specific javadoc method).
				if (editor && parsedUri.scheme === 'jdt' && parsedUri.fragment) {
					const line = parseInt(parsedUri.fragment);
					if (isNaN(line) || line < 1 || line > editor.document.lineCount) {
						return;
					}
					const range = editor.document.lineAt(line -1).range;
					editor.revealRange(range, TextEditorRevealType.AtTop);
				}
			}));

			context.subscriptions.push(commands.registerCommand(Commands.CLEAN_WORKSPACE, (force?: boolean) => cleanWorkspace(workspacePath, force)));
			context.subscriptions.push(commands.registerCommand(Commands.CLEAN_SHARED_INDEXES, () => cleanSharedIndexes(context)));

			context.subscriptions.push(commands.registerCommand(Commands.GET_WORKSPACE_PATH, () => workspacePath));

			context.subscriptions.push(commands.registerCommand(Commands.REFRESH_BUNDLES_COMMAND, () => {
				return getBundlesToReload();
			}));

			context.subscriptions.push(onConfigurationChange(workspacePath, context));

			registerRestartJavaLanguageServerCommand(context);

			/**
			 * Command to switch the server mode. Currently it only supports switch from lightweight to standard.
			 * @param force force to switch server mode without asking
			 */
			commands.registerCommand(Commands.SWITCH_SERVER_MODE, async (switchTo: ServerMode, force: boolean = false) => {
				const isWorkspaceTrusted = (workspace as any).isTrusted;
				if (isWorkspaceTrusted !== undefined && !isWorkspaceTrusted) { // keep compatibility for old engines < 1.56.0
					const button = "Manage Workspace Trust";
					const choice = await window.showInformationMessage("For security concern, Java language server cannot be switched to Standard mode in untrusted workspaces.", button);
					if (choice === button) {
						commands.executeCommand("workbench.trust.manage");
					}
					return;
				}

				const clientStatus: ClientStatus = standardClient.getClientStatus();
				if (clientStatus === ClientStatus.starting || clientStatus === ClientStatus.started) {
					return;
				}

				const api: ExtensionAPI = apiManager.getApiInstance();
				if (!force && (api.serverMode === switchTo || api.serverMode === ServerMode.standard)) {
					return;
				}

				let choice: string;
				if (force) {
					choice = "Yes";
				} else {
					choice = await window.showInformationMessage("Are you sure you want to switch the Java language server to Standard mode?", "Yes", "No");
				}

				if (choice === "Yes") {
					await startStandardServer(context, requirements, clientOptions, workspacePath, true /* triggeredByCommand */);
				}
			});

			context.subscriptions.push(snippetCompletionProvider.initialize());
			context.subscriptions.push(serverStatusBarProvider);
			context.subscriptions.push(languageStatusBarProvider);

			const classEditorProviderRegistration = window.registerCustomEditorProvider(JavaClassEditorProvider.viewType, new JavaClassEditorProvider(context));
			context.subscriptions.push(classEditorProviderRegistration);

			registerClientProviders(context, { contentProviderEvent: jdtEventEmitter.event });

			apiManager.getApiInstance().onDidServerModeChange((event: ServerMode) => {
				if (event === ServerMode.standard) {
					syntaxClient.stop();
					fileEventHandler.setServerStatus(true);
					languageStatusBarProvider.initialize(context);
				}
				commands.executeCommand('setContext', 'java:serverMode', event);
			});

			if (serverMode === ServerMode.hybrid && !await fse.pathExists(path.join(workspacePath, ".metadata", ".plugins"))) {
				const config = getJavaConfiguration();
				const importOnStartupSection: string = "project.importOnFirstTimeStartup";
				const importOnStartup = config.get(importOnStartupSection);
				if (importOnStartup === "disabled" ||
					env.uiKind === UIKind.Web && env.appName.includes("Visual Studio Code")) {
					apiManager.getApiInstance().serverMode = ServerMode.lightWeight;
					apiManager.fireDidServerModeChange(ServerMode.lightWeight);
					requireStandardServer = false;
				} else if (importOnStartup === "interactive" && await workspaceContainsBuildFiles()) {
					apiManager.getApiInstance().serverMode = ServerMode.lightWeight;
					apiManager.fireDidServerModeChange(ServerMode.lightWeight);
					requireStandardServer = await promptUserForStandardServer(config);
				} else {
					requireStandardServer = true;
				}
			}

			if (requireStandardServer) {
				await startStandardServer(context, requirements, clientOptions, workspacePath);
			}

			const onDidGrantWorkspaceTrust = (workspace as any).onDidGrantWorkspaceTrust;
			if (onDidGrantWorkspaceTrust !== undefined) { // keep compatibility for old engines < 1.56.0
				context.subscriptions.push(onDidGrantWorkspaceTrust(() => {
					if (getJavaServerMode() !== ServerMode.lightWeight) {
						// See the issue https://github.com/redhat-developer/vscode-java/issues/1994
						// Need to recollect the Java bundles before starting standard mode.
						let pollingCount: number = 0;
						// Poll every ~100ms (timeout after 1s) and check whether contributing javaExtensions have changed.
						const intervalId = setInterval(() => {
							const existingJavaExtensions = clientOptions.initializationOptions.bundles;
							clientOptions.initializationOptions.bundles = collectJavaExtensions(extensions.all);
							if (++pollingCount >= 10 || isContributedPartUpdated(existingJavaExtensions, clientOptions.initializationOptions.bundles)) {
								clearInterval(intervalId);
								commands.executeCommand(Commands.SWITCH_SERVER_MODE, ServerMode.standard, true);
								return;
							}
						}, 100);
					}
				}));
			}
			context.subscriptions.push(workspace.onDidChangeTextDocument(event => handleTextDocumentChanges(event.document, event.contentChanges)));
		});
	});
}

async function startStandardServer(context: ExtensionContext, requirements: requirements.RequirementsData, clientOptions: LanguageClientOptions, workspacePath: string, triggeredByCommand: boolean = false) {
	if (standardClient.getClientStatus() !== ClientStatus.uninitialized) {
		return;
	}

	const selector: BuildFileSelector = new BuildFileSelector(context, []);
	const importMode: ImportMode = await getImportMode(context, selector);
	if (importMode === ImportMode.automatic) {
		if (!await ensureNoBuildToolConflicts(context, clientOptions)) {
			return;
		}
	} else {
		const buildFiles: string[] = [];
		if (importMode === ImportMode.manual) {
			const cache = context.workspaceState.get<string[]>(PICKED_BUILD_FILES);
			if (cache === undefined || cache.length === 0 && triggeredByCommand) {
				buildFiles.push(...await selector.selectBuildFiles() || []);
			} else {
				buildFiles.push(...cache);
			}
		}
		if (buildFiles.length === 0) {
			commands.executeCommand('setContext', 'java:serverMode', ServerMode.lightWeight);
			serverStatusBarProvider.showNotImportedStatus();
			return;
		}
		clientOptions.initializationOptions.projectConfigurations = buildFiles;
	}

	if (apiManager.getApiInstance().serverMode === ServerMode.lightWeight) {
		// Before standard server is ready, we are in hybrid.
		apiManager.getApiInstance().serverMode = ServerMode.hybrid;
		apiManager.fireDidServerModeChange(ServerMode.hybrid);
	}
	await standardClient.initialize(context, requirements, clientOptions, workspacePath, jdtEventEmitter);
	standardClient.start().then(async () => {
		standardClient.registerLanguageClientActions(context, await fse.pathExists(path.join(workspacePath, ".metadata", ".plugins")), jdtEventEmitter);
	});
	serverStatusBarProvider.setBusy("Activating...");
}

async function workspaceContainsBuildFiles(): Promise<boolean> {
	// Since the VS Code API does not support put negated exclusion pattern in findFiles(), we need to first parse the
	// negated exclusion to inclusion and do the search. (If negated exclusion pattern is set by user)
	const inclusionPatterns: string[] = getBuildFilePatterns();
	const inclusionPatternsFromNegatedExclusion: string[] = getInclusionPatternsFromNegatedExclusion();
	if (inclusionPatterns.length > 0 && inclusionPatternsFromNegatedExclusion.length > 0 &&
		(await workspace.findFiles(convertToGlob(inclusionPatterns, inclusionPatternsFromNegatedExclusion), null, 1 /* maxResults */)).length > 0) {
		return true;
	}

	// Nothing found in negated exclusion pattern, do a normal search then.
	const inclusionGlob: string = convertToGlob(inclusionPatterns);
	const exclusionGlob: string = getExclusionGlob();
	if (inclusionGlob && (await workspace.findFiles(inclusionGlob, exclusionGlob, 1 /* maxResults */)).length > 0) {
		return true;
	}

	return false;
}

async function ensureNoBuildToolConflicts(context: ExtensionContext, clientOptions: LanguageClientOptions): Promise<boolean> {
	const isMavenEnabled: boolean = getJavaConfiguration().get<boolean>("import.maven.enabled");
	const isGradleEnabled: boolean = getJavaConfiguration().get<boolean>("import.gradle.enabled");
	if (isMavenEnabled && isGradleEnabled) {
		let activeBuildTool: string | undefined = context.workspaceState.get(ACTIVE_BUILD_TOOL_STATE);
		if (!activeBuildTool) {
			if (!await hasBuildToolConflicts()) {
				return true;
			}
			activeBuildTool = await window.showInformationMessage("Build tool conflicts are detected in workspace. Which one would you like to use?", "Use Maven", "Use Gradle");
		}

		if (!activeBuildTool) {
			return false; // user cancels
		} else if (activeBuildTool.toLocaleLowerCase().includes("maven")) {
			// Here we do not persist it in the settings to avoid generating/updating files in user's workspace
			// Later if user want to change the active build tool, just directly set the related settings.
			clientOptions.initializationOptions.settings.java.import.gradle.enabled = false;
			context.workspaceState.update(ACTIVE_BUILD_TOOL_STATE, "maven");
		} else if (activeBuildTool.toLocaleLowerCase().includes("gradle")) {
			clientOptions.initializationOptions.settings.java.import.maven.enabled = false;
			context.workspaceState.update(ACTIVE_BUILD_TOOL_STATE, "gradle");
		} else {
			throw new Error(`Unknown build tool: ${activeBuildTool}`); // unreachable
		}
	}

	return true;
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
			if (showHint && standardClient.getClientStatus() === ClientStatus.uninitialized) {
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

export function deactivate(): Promise<void[]> {
	return Promise.all<void>([
		standardClient.stop(),
		syntaxClient.stop(),
	]);
}

export async function getActiveLanguageClient(): Promise<LanguageClient | undefined> {
	let languageClient: LanguageClient;

	const api: ExtensionAPI = apiManager.getApiInstance();
	if (api.serverMode === ServerMode.standard) {
		languageClient = standardClient.getClient();
	} else {
		languageClient = syntaxClient.getClient();
	}

	if (!languageClient) {
		return undefined;
	}

	if (languageClient.needsStart()) {
		await languageClient.start();
	}

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
				// e.g. /** | */ or /* | */
				beforeText: /^\s*\/\*\*?(?!\/)([^\*]|\*(?!\/))*$/,
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

export function getTempWorkspace() {
	return path.resolve(os.tmpdir(), `vscodesws_${makeRandomHexString(5)}`);
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

async function cleanWorkspace(workspacePath, force?: boolean) {
	if (!force) {
		const doIt = 'Reload and delete';
		const selection = await window.showWarningMessage('Are you sure you want to clean the Java language server workspace?', 'Cancel', doIt);
		if (selection !== doIt) {
			return;
		}
	}
	ensureExists(workspacePath);
	const file = path.join(workspacePath, cleanWorkspaceFileName);
	fs.closeSync(fs.openSync(file, 'w'));
	commands.executeCommand(Commands.RELOAD_WINDOW);
}

async function cleanSharedIndexes(context: ExtensionContext) {
	const sharedIndexLocation: string = getSharedIndexCache(context);
	if (sharedIndexLocation && fs.existsSync(sharedIndexLocation)) {
		const doIt = 'Clean and Reload';
		const ans = await window.showWarningMessage('The shared indexes might be in use by other workspaces, do you want to clear it? New indexes will be built after reloading.',
			doIt, "Cancel");
		if (ans === doIt) {
			deleteDirectory(sharedIndexLocation);
			commands.executeCommand(Commands.RELOAD_WINDOW);
		}
	}
}

function openServerLogFile(storagePath, column: ViewColumn = ViewColumn.Active): Thenable<boolean> {
	const workspacePath = getWorkspacePath(storagePath);
	const serverLogFile = path.join(workspacePath, '.metadata', '.log');
	return openLogFile(serverLogFile, 'Could not open Java Language Server log file', column);
}

function getWorkspacePath(storagePath: any) {
	return path.join(storagePath, apiManager.getApiInstance().serverMode === ServerMode.lightWeight ? 'ss_ws' : 'jdt_ws');
}

function openRollingServerLogFile(storagePath, filename, column: ViewColumn = ViewColumn.Active): Thenable<boolean> {
	return new Promise((resolve) => {
		const workspacePath = getWorkspacePath(storagePath);
		const dirname = path.join(workspacePath, '.metadata');

		// find out the newest one
		glob(`${filename}-*`, { cwd: dirname }, (err, files) => {
			if (!err && files.length > 0) {
				files.sort();

				const logFile = path.join(dirname, files[files.length - 1]);
				openLogFile(logFile, `Could not open Java Language Server log file ${filename}`, column).then((result) => resolve(result));
			} else {
				resolve(false);
			}
		});
	});
}

function openClientLogFile(logFile: string, column: ViewColumn = ViewColumn.Active): Thenable<boolean> {
	return new Promise((resolve) => {
		const filename = path.basename(logFile);
		const dirname = path.dirname(logFile);

		// find out the newest one
		glob(`${filename}.*`, { cwd: dirname }, (err, files) => {
			if (!err && files.length > 0) {
				files.sort((a, b) => {
					const dateA = a.slice(11, 21), dateB = b.slice(11, 21);
					if (dateA === dateB) {
						if (a.length > 22 && b.length > 22) {
							const extA = a.slice(22), extB = b.slice(22);
							return parseInt(extA) - parseInt(extB);
						} else {
							return a.length - b.length;
						}
					} else {
						return dateA < dateB ? -1 : 1;
					}
				});
				logFile = path.join(dirname, files[files.length - 1]);
			}

			openLogFile(logFile, 'Could not open Java extension log file', column).then((result) => resolve(result));
		});
	});
}

async function openLogs() {
	await commands.executeCommand(Commands.OPEN_CLIENT_LOG, ViewColumn.One);
	await commands.executeCommand(Commands.OPEN_SERVER_LOG, ViewColumn.One);
	await commands.executeCommand(Commands.OPEN_SERVER_STDOUT_LOG, ViewColumn.One);
	await commands.executeCommand(Commands.OPEN_SERVER_STDERR_LOG, ViewColumn.One);
	const client = await getActiveLanguageClient();
	client?.outputChannel.show(true);
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
			return window.showTextDocument(doc, { viewColumn: column, preview: false })
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
			return commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(formatterUrl));
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
		ensureExists(root);
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
	return f !== null && f.startsWith('http:/') || f.startsWith('https:/') || f.startsWith('file:/');
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
						ensureExists(root);
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
							try {
								ensureExists(path.dirname(f));
								fs.createReadStream(defaultFormatter)
									.pipe(fs.createWriteStream(f))
									.on('finish', () => openDocument(extensionPath, f, defaultFormatter, relativePath));
							} catch (error) {
								window.showErrorMessage(`Failed to create ${f}: ${error}`);
							}
						}
					});
				} else {
					openDocument(extensionPath, f, defaultFormatter, relativePath);
				}
			}
		}
	});
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

		// Paths set by 'java.import.exclusions' will be ignored when searching trigger files.
		const exclusionGlob = getExclusionGlob();
		const javaFilesUnderRoot: Uri[] = await workspace.findFiles(new RelativePattern(rootFolder, "*.java"), exclusionGlob, 1);
		for (const javaFile of javaFilesUnderRoot) {
			if (isPrefix(rootPath, javaFile.fsPath)) {
				openedJavaFiles.push(javaFile.toString());
				return;
			}
		}

		const javaFilesInCommonPlaces: Uri[] = await workspace.findFiles(new RelativePattern(rootFolder, "{src, test}/**/*.java"), exclusionGlob, 1);
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
		if (resource.scheme === 'file' && document.languageId === "java") {
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

async function cleanJavaWorkspaceStorage() {
	const configCacheLimit = getJavaConfiguration().get<number>("configuration.workspaceCacheLimit");

	// Also leave temporary workspaces alone as they should have their own policy
	if (!storagePath || !configCacheLimit || storagePath.includes('vscodesws')) {
		return;
	}

	const limit: number = configCacheLimit * 86400000; // days to ms
	const currTime = new Date().valueOf(); // ms since Epoch
	// storage path is Code/User/workspaceStorage/${id}/redhat.java/
	const wsRoot = path.dirname(path.dirname(storagePath));

	// find all folders of the form "redhat.java/jdt_ws/" and delete "redhat.java/"
	if (fs.existsSync(wsRoot)) {
		new glob.Glob(`${wsRoot}/**/jdt_ws`, (_err, matches) => {
			for (const javaWSCache of matches) {
				const entry = path.dirname(javaWSCache);
				const entryModTime = fs.statSync(entry).mtimeMs;
				if ((currTime - entryModTime) > limit) {
					logger.info(`Removing workspace storage folder : ${entry}`);
					deleteDirectory(entry);
				}
			}
		});
	}
}

async function cleanOldGlobalStorage(context: ExtensionContext) {
	const currentVersion = getVersion(context.extensionPath);
	const globalStoragePath = context.globalStorageUri?.fsPath; // .../Code/User/globalStorage/redhat.java

	ensureExists(globalStoragePath);

	// delete folders in .../User/globalStorage/redhat.java that are not named the current version
	fs.promises.readdir(globalStoragePath).then(async (files) => {
		await Promise.all(files.map(async (file) => {
			const currentPath = path.join(globalStoragePath, file);
			const stat = await fs.promises.stat(currentPath);

			if (stat.isDirectory() && file !== currentVersion) {
				logger.info(`Removing old folder in globalStorage : ${file}`);
				deleteDirectory(currentPath);
			}
		}));
	});
}

export function registerCodeCompletionTelemetryListener() {
	apiManager.getApiInstance().onDidRequestEnd((traceEvent: TraceEvent) => {
		if (traceEvent.type === CompletionRequest.method) {
			// Exclude the invalid completion requests.
			if (!traceEvent.resultLength) {
				return;
			}
			const props = {
				duration: Math.round(traceEvent.duration * 100) / 100,
				resultLength: traceEvent.resultLength || 0,
				error: !!traceEvent.error,
				fromSyntaxServer: !!traceEvent.fromSyntaxServer,
			};
			return Telemetry.sendTelemetry(Telemetry.COMPLETION_EVENT, props);
		}
	});
}

function registerOutOfMemoryDetection(storagePath: string) {
	const heapDumpFolder = getHeapDumpFolderFromSettings() || storagePath;
	chokidar.watch(`${heapDumpFolder}/java_*.hprof`, { ignoreInitial: true }).on('add', path => {
		// Only clean heap dumps that are generated in the default location.
		// The default location is the extension global storage
		// This means that if users change the folder where the heap dumps are placed,
		// then they will be able to read the heap dumps,
		// since they aren't immediately deleted.
		if (heapDumpFolder === storagePath) {
			fse.remove(path);
		}
		apiManager.fireTraceEvent({
			name: "java.process.outofmemory",
			properties: {
				maxMem: getMaxMemFromConfiguration(true),
			}
		});
		showOOMMessage();
		serverStatusBarProvider.setError();
		activationProgressNotification.hide();
	});
}

function registerRestartJavaLanguageServerCommand(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand(Commands.RESTART_LANGUAGE_SERVER, async () => {
		switch (getJavaServerMode()) {
			case (ServerMode.standard):
				// Standard server restart
				await standardClient.getClient().restart();
				break;
			case (ServerMode.lightWeight):
				// Syntax server restart
				await syntaxClient.getClient().restart();
				break;
			case (ServerMode.hybrid):
				if (syntaxClient.isAlive()) {
					await syntaxClient.getClient().restart();
				}
				await standardClient.getClient().restart();
				break;
		}
	}));
}


