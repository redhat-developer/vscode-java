'use strict';

import { ExtensionContext, window, workspace, commands, Uri, ProgressLocation, ViewColumn, EventEmitter, extensions, Location, languages, CodeActionKind, TextEditor, CancellationToken, ConfigurationTarget, Range, Position } from "vscode";
import { Commands } from "./commands";
import { serverStatus, ServerStatusKind } from "./serverStatus";
import { prepareExecutable, awaitServerConnection } from "./javaServerStarter";
import { getJavaConfig, applyWorkspaceEdit } from "./extension";
import { LanguageClientOptions, Position as LSPosition, Location as LSLocation, MessageType, TextDocumentPositionParams, ConfigurationRequest, ConfigurationParams } from "vscode-languageclient";
import { LanguageClient, StreamInfo } from "vscode-languageclient/node";
import { CompileWorkspaceRequest, CompileWorkspaceStatus, SourceAttachmentRequest, SourceAttachmentResult, SourceAttachmentAttribute, ProjectConfigurationUpdateRequest, FeatureStatus, StatusNotification, ProgressReportNotification, ActionableNotification, ExecuteClientCommandRequest, ServerNotification, EventNotification, EventType, LinkLocation, FindLinks, GradleCompatibilityInfo } from "./protocol";
import { setGradleWrapperChecksum, excludeProjectSettingsFiles, ServerMode } from "./settings";
import { onExtensionChange, collectBuildFilePattern } from "./plugin";
import { activationProgressNotification, serverTaskPresenter } from "./serverTaskPresenter";
import { getJdkUrl, RequirementsData, sortJdksBySource, sortJdksByVersion } from "./requirements";
import * as net from 'net';
import * as fse from 'fs-extra';
import * as path from 'path';
import { getJavaConfiguration } from "./utils";
import { logger } from "./log";
import * as buildPath from './buildpath';
import * as sourceAction from './sourceAction';
import * as refactorAction from './refactorAction';
import * as pasteAction from './pasteAction';
import { serverTasks } from "./serverTasks";
import { apiManager } from "./apiManager";
import { ExtensionAPI, ClientStatus } from "./extension.api";
import { serverStatusBarProvider } from "./serverStatusBarProvider";
import * as fileEventHandler from './fileEventHandler';
import { markdownPreviewProvider } from "./markdownPreviewProvider";
import { RefactorDocumentProvider, javaRefactorKinds } from "./codeActionProvider";
import { typeHierarchyTree } from "./typeHierarchy/typeHierarchyTree";
import { TypeHierarchyDirection, TypeHierarchyItem } from "./typeHierarchy/protocol";
import { buildFilePatterns } from './plugin';
import { pomCodeActionMetadata, PomCodeActionProvider } from "./pom/pomCodeActionProvider";
import { findRuntimes, IJavaRuntime } from "jdk-utils";

const extensionName = 'Language Support for Java';
const GRADLE_CHECKSUM = "gradle/checksum/prompt";
const GET_JDK = "Get the Java Development Kit";
const USE_JAVA = "Use Java ";
const AS_GRADLE_JVM = " as Gradle JVM";
const UPGRADE_GRADLE = "Upgrade Gradle to ";
const GRADLE_IMPORT_JVM = "java.import.gradle.java.home";

export class StandardLanguageClient {

	private languageClient: LanguageClient;
	private status: ClientStatus = ClientStatus.Uninitialized;

	public async initialize(context: ExtensionContext, requirements: RequirementsData, clientOptions: LanguageClientOptions, workspacePath: string, jdtEventEmitter: EventEmitter<Uri>, resolve: (value: ExtensionAPI) => void): Promise<void> {
		if (this.status !== ClientStatus.Uninitialized) {
			return;
		}

		const hasImported: boolean = await fse.pathExists(path.join(workspacePath, ".metadata", ".plugins"));

		if (workspace.getConfiguration().get("java.showBuildStatusOnStart.enabled") === "terminal") {
			commands.executeCommand(Commands.SHOW_SERVER_TASK_STATUS);
		}

		context.subscriptions.push(commands.registerCommand(Commands.RUNTIME_VALIDATION_OPEN, () => {
			commands.executeCommand("workbench.action.openSettings", "java.configuration.runtimes");
		}));

		serverStatus.initialize();
		serverStatus.onServerStatusChanged(status => {
			if (status === ServerStatusKind.Busy) {
				serverStatusBarProvider.setBusy();
			} else if (status === ServerStatusKind.Error) {
				serverStatusBarProvider.setError();
			} else {
				serverStatusBarProvider.setReady();
			}
		});

		let serverOptions;
		const port = process.env['SERVER_PORT'];
		if (!port) {
			const lsPort = process.env['JDTLS_CLIENT_PORT'];
			if (!lsPort) {
				serverOptions = prepareExecutable(requirements, workspacePath, getJavaConfig(requirements.java_home), context, false);
			} else {
				serverOptions = () => {
					const socket = net.connect(lsPort);
					const result: StreamInfo = {
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
		this.languageClient = new LanguageClient('java', extensionName, serverOptions, clientOptions);

		this.languageClient.onReady().then(() => {
			activationProgressNotification.showProgress();
			this.languageClient.onNotification(StatusNotification.type, (report) => {
				switch (report.type) {
					case 'ServiceReady':
						apiManager.updateServerMode(ServerMode.STANDARD);
						apiManager.fireDidServerModeChange(ServerMode.STANDARD);
						activationProgressNotification.hide();
						if (!hasImported) {
							showImportFinishNotification(context);
						}
						break;
					case 'Started':
						this.status = ClientStatus.Started;
						serverStatus.updateServerStatus(ServerStatusKind.Ready);
						commands.executeCommand('setContext', 'javaLSReady', true);
						apiManager.updateStatus(ClientStatus.Started);
						resolve(apiManager.getApiInstance());
						break;
					case 'Error':
						this.status = ClientStatus.Error;
						serverStatus.updateServerStatus(ServerStatusKind.Error);
						apiManager.updateStatus(ClientStatus.Error);
						resolve(apiManager.getApiInstance());
						break;
					case 'Starting':
					case 'Message':
						// message goes to progress report instead
						break;
				}
				serverStatusBarProvider.updateTooltip(report.message);
			});

			this.languageClient.onNotification(ProgressReportNotification.type, (progress) => {
				serverTasks.updateServerTask(progress);
			});

			this.languageClient.onNotification(EventNotification.type, async (notification) => {
				switch (notification.eventType) {
					case EventType.ClasspathUpdated:
						apiManager.fireDidClasspathUpdate(Uri.parse(notification.data));
						break;
					case EventType.ProjectsImported:
						const projectUris: Uri[] = [];
						if (notification.data) {
							for (const uriString of notification.data) {
								projectUris.push(Uri.parse(uriString));
							}
						}
						if (projectUris.length > 0) {
							apiManager.fireDidProjectsImport(projectUris);
						}
						break;
					case EventType.IncompatibleGradleJdkIssue:
						const options: string[] = [];
						const info = notification.data as GradleCompatibilityInfo;
						const highestJavaVersion = Number(info.highestJavaVersion);
						let runtimes = await findRuntimes({checkJavac: true, withVersion: true, withTags: true});
						runtimes = runtimes.filter(runtime => {
							return runtime.version.major <= highestJavaVersion;
						});
						sortJdksByVersion(runtimes);
						sortJdksBySource(runtimes);
						options.push(UPGRADE_GRADLE + info.recommendedGradleVersion);
						if (!runtimes.length) {
							options.push(GET_JDK);
						} else {
							options.push(USE_JAVA + runtimes[0].version.major + AS_GRADLE_JVM);
						}
						this.showGradleCompatibilityIssueNotification(info.message, options, info.projectUri, runtimes[0]?.homedir);
					default:
						break;
				}
			});

			this.languageClient.onNotification(ActionableNotification.type, (notification) => {
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
					for (const action of notification.commands) {
						if (action.title === selection) {
							const args: any[] = (action.arguments) ? action.arguments : [];
							commands.executeCommand(action.command, ...args);
							break;
						}
					}
				});
			});

			this.languageClient.onRequest(ExecuteClientCommandRequest.type, (params) => {
				return commands.executeCommand(params.command, ...params.arguments);
			});

			this.languageClient.onNotification(ServerNotification.type, (params) => {
				commands.executeCommand(params.command, ...params.arguments);
			});

			this.languageClient.onRequest(ConfigurationRequest.type, (params: ConfigurationParams) => {
				const result: any[] = [];
				const activeEditor: TextEditor | undefined = window.activeTextEditor;
				for (const item of params.items) {
					const scopeUri: Uri | undefined = item.scopeUri && Uri.parse(item.scopeUri);
					if (scopeUri && scopeUri.toString() === activeEditor?.document.uri.toString()) {
						if (item.section === "java.format.insertSpaces") {
							result.push(activeEditor.options.insertSpaces);
						} else if (item.section === "java.format.tabSize") {
							result.push(activeEditor.options.tabSize);
						} else {
							result.push(null);
						}
					} else {
						result.push(workspace.getConfiguration(null, scopeUri).get(item.section, null /*defaultValue*/));
					}
				}
				return result;
			});
		});

		this.registerCommandsForStandardServer(context, jdtEventEmitter);
		fileEventHandler.registerFileEventHandlers(this.languageClient, context);

		collectBuildFilePattern(extensions.all);

		this.status = ClientStatus.Initialized;
	}

	private showGradleCompatibilityIssueNotification(message: string, options: string[], projectUri: string, newJavaHome: string) {
		window.showErrorMessage(message + " [Learn More](https://docs.gradle.org/current/userguide/compatibility.html)", ...options).then(async (choice) => {
			if (choice === GET_JDK) {
				commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(getJdkUrl()));
			} else if (choice.startsWith(USE_JAVA)) {
				await workspace.getConfiguration().update(GRADLE_IMPORT_JVM, newJavaHome, ConfigurationTarget.Global);
				commands.executeCommand("workbench.action.openSettings", GRADLE_IMPORT_JVM);
				commands.executeCommand(Commands.IMPORT_PROJECTS);
			} else if (choice.startsWith(UPGRADE_GRADLE)) {
				const useWrapper = workspace.getConfiguration().get<boolean>("java.import.gradle.wrapper.enabled");
				if (!useWrapper) {
					await workspace.getConfiguration().update("java.import.gradle.wrapper.enabled", true, ConfigurationTarget.Workspace);
				}
				const result = await window.withProgress({
					location: ProgressLocation.Notification,
					title: "Upgrading Gradle wrapper...",
					cancellable: true,
				}, (_progress, token) => {
					return commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, "java.project.upgradeGradle", projectUri, token);
				});
				if (result) {
					const propertiesFile = path.join(Uri.parse(projectUri).fsPath, "gradle", "wrapper", "gradle-wrapper.properties");
					if (fse.pathExists(propertiesFile)) {
						const content = await fse.readFile(propertiesFile);
						const offset = content.toString().indexOf("distributionUrl");
						if (offset >= 0) {
							const document = await workspace.openTextDocument(propertiesFile);
							const position = document.positionAt(offset);
							const distributionUrlRange = document.getWordRangeAtPosition(position);
							window.showTextDocument(document, {selection: new Range(distributionUrlRange.start, new Position(distributionUrlRange.start.line + 1, 0))});
						}
					}
					commands.executeCommand(Commands.IMPORT_PROJECTS);
				}
			}
		});
	}

	private registerCommandsForStandardServer(context: ExtensionContext, jdtEventEmitter: EventEmitter<Uri>): void {
		context.subscriptions.push(commands.registerCommand(Commands.IMPORT_PROJECTS, async () => {
			return await commands.executeCommand<void>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.IMPORT_PROJECTS);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.OPEN_OUTPUT, () => this.languageClient.outputChannel.show(ViewColumn.Three)));
		context.subscriptions.push(commands.registerCommand(Commands.SHOW_SERVER_TASK_STATUS, () => serverTaskPresenter.presentServerTaskView()));

		this.languageClient.onReady().then(() => {
			context.subscriptions.push(commands.registerCommand(GRADLE_CHECKSUM, (wrapper: string, sha256: string) => {
				setGradleWrapperChecksum(wrapper, sha256);
			}));

			context.subscriptions.push(commands.registerCommand(Commands.SHOW_JAVA_REFERENCES, (uri: string, position: LSPosition, locations: LSLocation[]) => {
				commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), this.languageClient.protocol2CodeConverter.asPosition(position), locations.map(this.languageClient.protocol2CodeConverter.asLocation));
			}));
			context.subscriptions.push(commands.registerCommand(Commands.SHOW_JAVA_IMPLEMENTATIONS, (uri: string, position: LSPosition, locations: LSLocation[]) => {
				commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), this.languageClient.protocol2CodeConverter.asPosition(position), locations.map(this.languageClient.protocol2CodeConverter.asLocation));
			}));

			context.subscriptions.push(commands.registerCommand(Commands.CONFIGURATION_UPDATE, uri => projectConfigurationUpdate(this.languageClient, uri)));

			context.subscriptions.push(commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH, () => setIncompleteClasspathSeverity('ignore')));

			context.subscriptions.push(commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH_HELP, () => {
				commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse('https://github.com/redhat-developer/vscode-java/wiki/%22Classpath-is-incomplete%22-warning'));
			}));

			context.subscriptions.push(commands.registerCommand(Commands.PROJECT_CONFIGURATION_STATUS, (uri, status) => setProjectConfigurationUpdate(this.languageClient, uri, status)));

			context.subscriptions.push(commands.registerCommand(Commands.APPLY_WORKSPACE_EDIT, (obj) => {
				applyWorkspaceEdit(obj, this.languageClient);
			}));

			context.subscriptions.push(commands.registerCommand(Commands.NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND, async (location: LinkLocation | Uri) => {
				let superImplLocation: Location | undefined;

				if (!location) { // comes from command palette
					if (window.activeTextEditor?.document.languageId !== "java") {
						return;
					}
					location = window.activeTextEditor.document.uri;
				}

				if (location instanceof Uri) { // comes from context menu
					const params: TextDocumentPositionParams = {
						textDocument: {
							uri: location.toString(),
						},
						position: this.languageClient.code2ProtocolConverter.asPosition(window.activeTextEditor.selection.active),
					};
					const response = await this.languageClient.sendRequest(FindLinks.type, {
						type: 'superImplementation',
						position: params,
					});

					if (response && response.length > 0) {
						const superImpl = response[0];
						superImplLocation = new Location(
							Uri.parse(superImpl.uri),
							this.languageClient.protocol2CodeConverter.asRange(superImpl.range)
						);
					}
				} else { // comes from hover information
					superImplLocation = new Location(
						Uri.parse(decodeBase64(location.uri)),
						this.languageClient.protocol2CodeConverter.asRange(location.range),
					);
				}

				if (superImplLocation) {
					return window.showTextDocument(superImplLocation.uri, {
						preserveFocus: true,
						selection: superImplLocation.range,
					});
				} else {
					return showNoLocationFound('No super implementation found');
				}
			}));

			context.subscriptions.push(commands.registerCommand(Commands.SHOW_TYPE_HIERARCHY, (location: any) => {
				if (location instanceof Uri) {
					typeHierarchyTree.setTypeHierarchy(new Location(location, window.activeTextEditor.selection.active), TypeHierarchyDirection.Both);
				} else {
					if (window.activeTextEditor?.document?.languageId !== "java") {
						return;
					}
					typeHierarchyTree.setTypeHierarchy(new Location(window.activeTextEditor.document.uri, window.activeTextEditor.selection.active), TypeHierarchyDirection.Both);
				}
			}));

			context.subscriptions.push(commands.registerCommand(Commands.SHOW_CLASS_HIERARCHY, () => {
				typeHierarchyTree.changeDirection(TypeHierarchyDirection.Both);
			}));

			context.subscriptions.push(commands.registerCommand(Commands.SHOW_SUPERTYPE_HIERARCHY, () => {
				typeHierarchyTree.changeDirection(TypeHierarchyDirection.Parents);
			}));

			context.subscriptions.push(commands.registerCommand(Commands.SHOW_SUBTYPE_HIERARCHY, () => {
				typeHierarchyTree.changeDirection(TypeHierarchyDirection.Children);
			}));

			context.subscriptions.push(commands.registerCommand(Commands.CHANGE_BASE_TYPE, async (item: TypeHierarchyItem) => {
				typeHierarchyTree.changeBaseItem(item);
			}));

			context.subscriptions.push(commands.registerCommand(Commands.COMPILE_WORKSPACE, (isFullCompile: boolean, token?: CancellationToken) => {
				return window.withProgress({ location: ProgressLocation.Window }, async p => {
					if (typeof isFullCompile !== 'boolean') {
						const selection = await window.showQuickPick(['Incremental', 'Full'], { placeHolder: 'please choose compile type:' });
						isFullCompile = selection !== 'Incremental';
					}
					p.report({ message: 'Compiling workspace...' });
					const start = new Date().getTime();
					let res: CompileWorkspaceStatus;
					try {
						res = token ? await this.languageClient.sendRequest(CompileWorkspaceRequest.type, isFullCompile, token)
							: await this.languageClient.sendRequest(CompileWorkspaceRequest.type, isFullCompile);
					} catch (error) {
						if (error && error.code === -32800) { // Check if the request is cancelled.
							res = CompileWorkspaceStatus.CANCELLED;
						} else {
							throw error;
						}
					}

					const elapsed = new Date().getTime() - start;
					const humanVisibleDelay = elapsed < 1000 ? 1000 : 0;
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
			}));

			context.subscriptions.push(commands.registerCommand(Commands.UPDATE_SOURCE_ATTACHMENT, async (classFileUri: Uri): Promise<boolean> => {
				const resolveRequest: SourceAttachmentRequest = {
					classFileUri: classFileUri.toString(),
				};
				const resolveResult: SourceAttachmentResult = await <SourceAttachmentResult>commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.RESOLVE_SOURCE_ATTACHMENT, JSON.stringify(resolveRequest));
				if (resolveResult.errorMessage) {
					window.showErrorMessage(resolveResult.errorMessage);
					return false;
				}

				const attributes: SourceAttachmentAttribute = resolveResult.attributes || {};
				const defaultPath = attributes.sourceAttachmentPath || attributes.jarPath;
				const sourceFileUris: Uri[] = await window.showOpenDialog({
					defaultUri: defaultPath ? Uri.file(defaultPath) : null,
					openLabel: 'Select Source File',
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					filters: {
						'Source files': ['jar', 'zip']
					},
				});

				if (sourceFileUris && sourceFileUris.length) {
					const updateRequest: SourceAttachmentRequest = {
						classFileUri: classFileUri.toString(),
						attributes: {
							...attributes,
							sourceAttachmentPath: sourceFileUris[0].fsPath
						},
					};
					const updateResult: SourceAttachmentResult = await <SourceAttachmentResult>commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.UPDATE_SOURCE_ATTACHMENT, JSON.stringify(updateRequest));
					if (updateResult.errorMessage) {
						window.showErrorMessage(updateResult.errorMessage);
						return false;
					}

					// Notify jdt content provider to rerender the classfile contents.
					jdtEventEmitter.fire(classFileUri);
					return true;
				}
			}));

			buildPath.registerCommands(context);
			sourceAction.registerCommands(this.languageClient, context);
			refactorAction.registerCommands(this.languageClient, context);
			pasteAction.registerCommands(this.languageClient, context);

			if (extensions.onDidChange) {// Theia doesn't support this API yet
				extensions.onDidChange(() => {
					onExtensionChange(extensions.all);
				});
			}
			excludeProjectSettingsFiles();

			context.subscriptions.push(languages.registerCodeActionsProvider({ scheme: 'file', language: 'java' }, new RefactorDocumentProvider(), RefactorDocumentProvider.metadata));
			context.subscriptions.push(commands.registerCommand(Commands.LEARN_MORE_ABOUT_REFACTORING, async (kind: CodeActionKind) => {
				const sectionId: string = javaRefactorKinds.get(kind) || '';
				markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `${Commands.LEARN_MORE_ABOUT_REFACTORING}.md`)), 'Java Refactoring', sectionId, context);
			}));

			languages.registerCodeActionsProvider({
				language: "xml",
				scheme: "file",
				pattern: "**/pom.xml"
			}, new PomCodeActionProvider(context), pomCodeActionMetadata);
		});
	}

	public start(): void {
		if (this.languageClient && this.status === ClientStatus.Initialized) {
			this.languageClient.start();
			this.status = ClientStatus.Starting;
		}
	}

	public stop() {
		if (this.languageClient) {
			this.languageClient.stop();
			this.status = ClientStatus.Stopping;
		}
	}

	public getClient(): LanguageClient {
		return this.languageClient;
	}

	public getClientStatus(): ClientStatus {
		return this.status;
	}
}

async function showImportFinishNotification(context: ExtensionContext) {
	const neverShow: boolean | undefined = context.globalState.get<boolean>("java.neverShowImportFinishNotification");
	if (!neverShow) {
		const projectUris: string[] = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
		if (projectUris.length === 0 || (projectUris.length === 1 && projectUris[0].includes("jdt.ls-java-project"))) {
			return;
		}

		const options = ["Don't show again"];
		if (extensions.getExtension("vscjava.vscode-java-dependency")) {
			options.unshift("View projects");
		}
		window.showInformationMessage("Projects are imported into workspace.", ...options).then((choice) => {
			if (choice === "Don't show again") {
				context.globalState.update("java.neverShowImportFinishNotification", true);
			} else if (choice === "View projects") {
				commands.executeCommand("javaProjectExplorer.focus");
			}
		});
	}
}

function logNotification(message: string) {
	return new Promise(() => {
		logger.verbose(message);
	});
}

function setIncompleteClasspathSeverity(severity: string) {
	const config = getJavaConfiguration();
	const section = 'errors.incompleteClasspath.severity';
	config.update(section, severity, true).then(
		() => logger.info(`${section} globally set to ${severity}`),
		(error) => logger.error(error)
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

function isJavaConfigFile(filePath: string) {
	const fileName = path.basename(filePath);
	const regEx = new RegExp(buildFilePatterns.map(r => `(${r})`).join('|'), 'i');
	return regEx.test(fileName);
}

function setProjectConfigurationUpdate(languageClient: LanguageClient, uri: Uri, status: FeatureStatus) {
	const config = getJavaConfiguration();
	const section = 'configuration.updateBuildConfiguration';

	const st = FeatureStatus[status];
	config.update(section, st).then(
		() => logger.info(`${section} set to ${st}`),
		(error) => logger.error(error)
	);
	if (status !== FeatureStatus.disabled) {
		projectConfigurationUpdate(languageClient, uri);
	}
}

function decodeBase64(text: string): string {
    return Buffer.from(text, 'base64').toString('ascii');
}

export function showNoLocationFound(message: string): void {
	commands.executeCommand(
		Commands.GOTO_LOCATION,
		window.activeTextEditor.document.uri,
		window.activeTextEditor.selection.active,
		[],
		'goto',
		message
	);
}
