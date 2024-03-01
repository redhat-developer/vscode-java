'use strict';

import * as net from 'net';
import * as path from 'path';
import { CancellationToken, CodeActionKind, commands, ConfigurationTarget, DocumentSelector, EventEmitter, ExtensionContext, extensions, languages, Location, ProgressLocation, TextEditor, Uri, ViewColumn, window, workspace } from "vscode";
import { ConfigurationParams, ConfigurationRequest, LanguageClientOptions, Location as LSLocation, MessageType, Position as LSPosition, TextDocumentPositionParams, WorkspaceEdit, StaticFeature, ClientCapabilities, FeatureState } from "vscode-languageclient";
import { LanguageClient, StreamInfo } from "vscode-languageclient/node";
import { apiManager } from "./apiManager";
import * as buildPath from './buildpath';
import { javaRefactorKinds, RefactorDocumentProvider } from "./codeActionProvider";
import { Commands } from "./commands";
import { ClientStatus } from "./extension.api";
import * as fileEventHandler from './fileEventHandler';
import { gradleCodeActionMetadata, GradleCodeActionProvider } from "./gradle/gradleCodeActionProvider";
import { awaitServerConnection, prepareExecutable, DEBUG } from "./javaServerStarter";
import { logger } from "./log";
import { checkLombokDependency } from "./lombokSupport";
import { markdownPreviewProvider } from "./markdownPreviewProvider";
import * as pasteAction from './pasteAction';
import { registerPasteEventHandler } from './pasteEventHandler';
import { collectBuildFilePattern, onExtensionChange } from "./plugin";
import { pomCodeActionMetadata, PomCodeActionProvider } from "./pom/pomCodeActionProvider";
import { ActionableNotification, BuildProjectParams, BuildProjectRequest, CompileWorkspaceRequest, CompileWorkspaceStatus, EventNotification, EventType, ExecuteClientCommandRequest, FeatureStatus, FindLinks, GradleCompatibilityInfo, LinkLocation, ProgressKind, ProgressNotification, ServerNotification, SourceAttachmentAttribute, SourceAttachmentRequest, SourceAttachmentResult, SourceInvalidatedEvent, StatusNotification, UpgradeGradleWrapperInfo } from "./protocol";
import * as refactorAction from './refactorAction';
import { getJdkUrl, RequirementsData } from "./requirements";
import { serverStatus, ServerStatusKind } from "./serverStatus";
import { serverStatusBarProvider } from "./serverStatusBarProvider";
import { activationProgressNotification, serverTaskPresenter } from "./serverTaskPresenter";
import { serverTasks } from "./serverTasks";
import { excludeProjectSettingsFiles, ServerMode, setGradleWrapperChecksum } from "./settings";
import { snippetCompletionProvider } from "./snippetCompletionProvider";
import * as sourceAction from './sourceAction';
import { askForProjects, projectConfigurationUpdate, upgradeGradle } from "./standardLanguageClientUtils";
import { TracingLanguageClient } from './TracingLanguageClient';
import { TypeHierarchyDirection, TypeHierarchyItem } from "./typeHierarchy/protocol";
import { typeHierarchyTree } from "./typeHierarchy/typeHierarchyTree";
import { getAllJavaProjects, getAllProjects, getJavaConfiguration } from "./utils";
import { Telemetry } from "./telemetry";
import { TelemetryEvent } from "@redhat-developer/vscode-redhat-telemetry/lib";
import { registerDocumentValidationListener } from './diagnostic';
import { listJdks, sortJdksBySource, sortJdksByVersion } from './jdkUtils';
import { ClientCodeActionProvider } from './clientCodeActionProvider';
import { BuildFileSelector } from './buildFilesSelector';

const extensionName = 'Language Support for Java';
const GRADLE_CHECKSUM = "gradle/checksum/prompt";
const GET_JDK = "Get the Java Development Kit";
const USE_JAVA = "Use Java ";
const AS_GRADLE_JVM = " as Gradle JVM";
const UPGRADE_GRADLE = "Upgrade Gradle to ";
const GRADLE_IMPORT_JVM = "java.import.gradle.java.home";
export const JAVA_SELECTOR: DocumentSelector = [
	{ scheme: "file", language: "java", pattern: "**/*.java" },
	{ scheme: "jdt", language: "java", pattern: "**/*.class" },
	{ scheme: "untitled", language: "java", pattern: "**/*.java" }
];

export class StandardLanguageClient {

	private languageClient: LanguageClient;
	private status: ClientStatus = ClientStatus.uninitialized;

	public async initialize(context: ExtensionContext, requirements: RequirementsData, clientOptions: LanguageClientOptions, workspacePath: string, jdtEventEmitter: EventEmitter<Uri>): Promise<void> {
		if (this.status !== ClientStatus.uninitialized) {
			return;
		}

		if (workspace.getConfiguration().get("java.showBuildStatusOnStart.enabled") === "terminal") {
			commands.executeCommand(Commands.SHOW_SERVER_TASK_STATUS);
		}

		context.subscriptions.push(commands.registerCommand(Commands.RUNTIME_VALIDATION_OPEN, () => {
			commands.executeCommand("workbench.action.openSettings", "java.configuration.runtimes");
		}));

		serverStatus.initialize();
		serverStatus.onServerStatusChanged(status => {
			if (status === ServerStatusKind.error) {
				serverStatusBarProvider.setError();
			} else if (status === ServerStatusKind.warning) {
				serverStatusBarProvider.setWarning();
			} else if (status === ServerStatusKind.ready) {
				serverStatusBarProvider.setReady();
			}
		});

		let serverOptions;
		const port = process.env['JDTLS_SERVER_PORT'];
		if (!port) {
			const lsPort = process.env['JDTLS_CLIENT_PORT'];
			if (!lsPort) {
				serverOptions = prepareExecutable(requirements, workspacePath, context, false);
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
		this.languageClient = new TracingLanguageClient('java', extensionName, serverOptions, clientOptions, DEBUG);
		this.languageClient.registerFeature(new DisableWillRenameFeature());

		this.registerCommandsForStandardServer(context, jdtEventEmitter);
		fileEventHandler.registerFileEventHandlers(this.languageClient, context);

		collectBuildFilePattern(extensions.all);

		this.status = ClientStatus.initialized;
	}

	public registerLanguageClientActions(context: ExtensionContext, hasImported: boolean, jdtEventEmitter: EventEmitter<Uri>) {
		activationProgressNotification.showProgress();
		this.languageClient.onNotification(StatusNotification.type, (report) => {
			switch (report.type) {
				case 'ServiceReady':
					apiManager.updateServerMode(ServerMode.standard);
					apiManager.fireDidServerModeChange(ServerMode.standard);
					apiManager.resolveServerReadyPromise();

					if (extensions.onDidChange) {// Theia doesn't support this API yet
						extensions.onDidChange(async () => {
							await onExtensionChange(extensions.all);
						});
					}
					try {
						registerPasteEventHandler(context, this.languageClient);
					} catch (error) {
						// clients may not have properly configured documentPaste
						logger.error(error);
					}
					activationProgressNotification.hide();
					if (!hasImported) {
						showImportFinishNotification(context);
					}
					checkLombokDependency(context);
					apiManager.getApiInstance().onDidClasspathUpdate((projectUri: Uri) => {
						checkLombokDependency(context, projectUri);
					});
					// Disable the client-side snippet provider since LS is ready.
					snippetCompletionProvider.dispose();
					registerDocumentValidationListener(context, this.languageClient);
					commands.executeCommand('setContext', 'javaLSReady', true);
					break;
				case 'Started':
					this.status = ClientStatus.started;
					serverStatus.updateServerStatus(ServerStatusKind.ready);
					apiManager.updateStatus(ClientStatus.started);
					break;
				case 'Error':
					this.status = ClientStatus.error;
					serverStatus.updateServerStatus(ServerStatusKind.error);
					apiManager.updateStatus(ClientStatus.error);
					apiManager.fireTraceEvent({
						name: "java.ls.error.serviceError",
						properties: {
							message: report.message,
						},
					});
					break;
				case 'ProjectStatus':
					if (report.message === "WARNING") {
						serverStatus.updateServerStatus(ServerStatusKind.warning);
					} else if (report.message === "OK") {
						this.status = ClientStatus.started;
						serverStatus.errorResolved();
						serverStatus.updateServerStatus(ServerStatusKind.ready);
					}
					return;
				case 'Starting':
				case 'Message':
					// message goes to progress report instead
					break;
			}
		});

		this.languageClient.onNotification(ProgressNotification.type, (progress) => {
			progress.complete = progress.value.kind === ProgressKind.end;
			serverTasks.updateServerTask(progress);
		});

		this.languageClient.onNotification(EventNotification.type, async (notification) => {
			switch (notification.eventType) {
				case EventType.classpathUpdated:
					apiManager.fireDidClasspathUpdate(Uri.parse(notification.data));
					break;
				case EventType.projectsImported: {
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
				}
				case EventType.projectsDeleted: {
					const projectUris: Uri[] = [];
					if (notification.data) {
						for (const uriString of notification.data) {
							projectUris.push(Uri.parse(uriString));
						}
					}
					if (projectUris.length > 0) {
						apiManager.fireDidProjectsDelete(projectUris);
					}
					break;
				}
				case EventType.incompatibleGradleJdkIssue:
					const options: string[] = [];
					const info = notification.data as GradleCompatibilityInfo;
					const highestJavaVersion = Number(info.highestJavaVersion);
					let runtimes = await listJdks(true);
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
					this.showGradleCompatibilityIssueNotification(info.message, options, info.projectUri, info.recommendedGradleVersion, runtimes[0]?.homedir);
					break;
				case EventType.upgradeGradleWrapper:
					const neverShow: boolean | undefined = context.globalState.get<boolean>("java.neverShowUpgradeWrapperNotification");
					if (!neverShow) {
						const upgradeInfo = notification.data as UpgradeGradleWrapperInfo;
						const option = `Upgrade to ${upgradeInfo.recommendedGradleVersion}`;
						window.showWarningMessage(upgradeInfo.message, option, "Don't show again").then(async (choice) => {
							if (choice === option) {
								await upgradeGradle(upgradeInfo.projectUri, upgradeInfo.recommendedGradleVersion);
							} else if (choice === "Don't show again") {
								context.globalState.update("java.neverShowUpgradeWrapperNotification", true);
							}
						});
					}
					break;
				case EventType.sourceInvalidated:
					const result = notification.data as SourceInvalidatedEvent;
					const triggeredByUser: string[] = [];
					const triggeredByAutoDownloadedSource: string[] = [];
					Object.entries(result.affectedRootPaths || {})?.forEach(([key, value]) => {
						if (value) {
							triggeredByAutoDownloadedSource.push(key);
						} else {
							triggeredByUser.push(key);
						}
					});
					if (triggeredByUser?.length) {
						this.handleSourceInvalidatedEvent(triggeredByUser, false, jdtEventEmitter);
					}
					if (triggeredByAutoDownloadedSource?.length) {
						this.handleSourceInvalidatedEvent(triggeredByAutoDownloadedSource, true, jdtEventEmitter);
					}
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
					apiManager.fireTraceEvent({
						name: "java.ls.error.notification",
						properties: {
							message: notification.message,
						},
					});
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
					result.push(workspace.getConfiguration(null, scopeUri).get(item.section, null /* defaultValue */));
				}
			}
			return result;
		});

		this.languageClient.onTelemetry(async (e: TelemetryEvent) => {
			apiManager.fireTraceEvent(e);
			if (e.name === Telemetry.SERVER_INITIALIZED_EVT) {
				return Telemetry.sendTelemetry(Telemetry.STARTUP_EVT, e.properties);
			} else if (e.name === Telemetry.LS_ERROR) {
				const tags = [];
				const exception: string = e?.properties.exception;
				if (exception !== undefined) {
					if (exception.includes("dtree.ObjectNotFoundException")) {
						tags.push("dtree.ObjectNotFoundException");
					}

					if (tags.length > 0) {
						e.properties['tags'] = tags;
						return Telemetry.sendTelemetry(Telemetry.LS_ERROR, e.properties);
					}
				}
			}
		});

		context.subscriptions.push(commands.registerCommand(GRADLE_CHECKSUM, (wrapper: string, sha256: string) => {
			setGradleWrapperChecksum(wrapper, sha256);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.SHOW_JAVA_REFERENCES, (uri: string, position: LSPosition, locations: LSLocation[]) => {
			commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), this.languageClient.protocol2CodeConverter.asPosition(position), locations.map(this.languageClient.protocol2CodeConverter.asLocation));
		}));
		context.subscriptions.push(commands.registerCommand(Commands.SHOW_JAVA_IMPLEMENTATIONS, (uri: string, position: LSPosition, locations: LSLocation[]) => {
			commands.executeCommand(Commands.SHOW_REFERENCES, Uri.parse(uri), this.languageClient.protocol2CodeConverter.asPosition(position), locations.map(this.languageClient.protocol2CodeConverter.asLocation));
		}));

		context.subscriptions.push(commands.registerCommand(Commands.CONFIGURATION_UPDATE, async (uri) => {
			await projectConfigurationUpdate(this.languageClient, uri);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH, () => setIncompleteClasspathSeverity('ignore')));

		context.subscriptions.push(commands.registerCommand(Commands.IGNORE_INCOMPLETE_CLASSPATH_HELP, () => {
			commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse('https://github.com/redhat-developer/vscode-java/wiki/%22Classpath-is-incomplete%22-warning'));
		}));

		context.subscriptions.push(commands.registerCommand(Commands.PROJECT_CONFIGURATION_STATUS, async (uri, status) => {
			await setProjectConfigurationUpdate(this.languageClient, uri, status);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.NULL_ANALYSIS_SET_MODE, (status) => setNullAnalysisStatus(status)));

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
				typeHierarchyTree.setTypeHierarchy(new Location(location, window.activeTextEditor.selection.active), TypeHierarchyDirection.both);
			} else {
				if (window.activeTextEditor?.document?.languageId !== "java") {
					return;
				}
				typeHierarchyTree.setTypeHierarchy(new Location(window.activeTextEditor.document.uri, window.activeTextEditor.selection.active), TypeHierarchyDirection.both);
			}
		}));

		context.subscriptions.push(commands.registerCommand(Commands.SHOW_CLASS_HIERARCHY, () => {
			typeHierarchyTree.changeDirection(TypeHierarchyDirection.both);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.SHOW_SUPERTYPE_HIERARCHY, () => {
			typeHierarchyTree.changeDirection(TypeHierarchyDirection.parents);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.SHOW_SUBTYPE_HIERARCHY, () => {
			typeHierarchyTree.changeDirection(TypeHierarchyDirection.children);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.CHANGE_BASE_TYPE, async (item: TypeHierarchyItem) => {
			typeHierarchyTree.changeBaseItem(item);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.BUILD_PROJECT, async (uris: Uri[] | Uri, isFullBuild: boolean, token: CancellationToken) => {
			let resources: Uri[] = [];
			if (uris instanceof Uri) {
				resources.push(uris);
			} else if (Array.isArray(uris)) {
				for (const uri of uris) {
					if (uri instanceof Uri) {
						resources.push(uri);
					}
				}
			}

			if (!resources.length) {
				resources = await askForProjects(
					window.activeTextEditor?.document.uri,
					"Please select the project(s) to rebuild.",
				);
				if (!resources?.length) {
					return;
				}
			}

			const params: BuildProjectParams = {
				identifiers: resources.map((u => {
					return { uri: u.toString() };
				})),
				// we can consider expose 'isFullBuild' according to users' feedback,
				// currently set it to true by default.
				isFullBuild: isFullBuild === undefined ? true : isFullBuild,
			};

			return window.withProgress({ location: ProgressLocation.Window }, async p => {
				p.report({ message: 'Rebuilding projects...' });
				return new Promise(async (resolve, reject) => {
					const start = new Date().getTime();

					let res: CompileWorkspaceStatus;
					try {
						res = token ? await this.languageClient.sendRequest(BuildProjectRequest.type, params, token) :
							await this.languageClient.sendRequest(BuildProjectRequest.type, params);
					} catch (error) {
						if (error && error.code === -32800) { // Check if the request is cancelled.
							res = CompileWorkspaceStatus.cancelled;
						}
						reject(error);
					}

					const elapsed = new Date().getTime() - start;
					const humanVisibleDelay = elapsed < 1000 ? 1000 : 0;
					setTimeout(() => { // set a timeout so user would still see the message when build time is short
						resolve(res);
					}, humanVisibleDelay);
				});
			});
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
						res = CompileWorkspaceStatus.cancelled;
					} else {
						throw error;
					}
				}

				const elapsed = new Date().getTime() - start;
				const humanVisibleDelay = elapsed < 1000 ? 1000 : 0;
				return new Promise((resolve, reject) => {
					setTimeout(() => { // set a timeout so user would still see the message when build time is short
						if (res === CompileWorkspaceStatus.succeed) {
							resolve(res);
						} else {
							reject(res);
						}
					}, humanVisibleDelay);
				});
			});
		}));

		context.subscriptions.push(commands.registerCommand(Commands.UPDATE_SOURCE_ATTACHMENT_CMD, async (classFileUri: Uri): Promise<boolean> => {
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
					// eslint-disable-next-line @typescript-eslint/naming-convention
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

		excludeProjectSettingsFiles();

		context.subscriptions.push(languages.registerCodeActionsProvider({ scheme: 'file', language: 'java' }, new RefactorDocumentProvider(), RefactorDocumentProvider.metadata));
		context.subscriptions.push(commands.registerCommand(Commands.LEARN_MORE_ABOUT_REFACTORING, async (kind: CodeActionKind) => {
			const sectionId: string = javaRefactorKinds.get(kind) || '';
			markdownPreviewProvider.show(context.asAbsolutePath(path.join('document', `${Commands.LEARN_MORE_ABOUT_REFACTORING}.md`)), 'Java Refactoring', sectionId, context);
		}));

		context.subscriptions.push(commands.registerCommand(Commands.CREATE_MODULE_INFO_COMMAND, async () => {
			const uri = await askForProjects(
				window.activeTextEditor?.document.uri,
				"Please select the project to create module-info.java",
				false,
			);
			if (!uri?.length) {
				return;
			}

			const moduleInfoUri: string = await commands.executeCommand(
				Commands.EXECUTE_WORKSPACE_COMMAND,
				Commands.CREATE_MODULE_INFO,
				uri[0].toString(),
			);

			if (moduleInfoUri) {
				await window.showTextDocument(Uri.parse(moduleInfoUri));
			}
		}));

		context.subscriptions.push(commands.registerCommand(Commands.UPGRADE_GRADLE_WRAPPER_CMD, (projectUri: string, version?: string) => {
			upgradeGradle(projectUri, version);
		}));

		languages.registerCodeActionsProvider({
			language: "xml",
			scheme: "file",
			pattern: "**/pom.xml"
		}, new PomCodeActionProvider(context), pomCodeActionMetadata);

		languages.registerCodeActionsProvider({
			scheme: "file",
			pattern: "**/{gradle/wrapper/gradle-wrapper.properties,build.gradle,build.gradle.kts,settings.gradle,settings.gradle.kts}"
		}, new GradleCodeActionProvider(), gradleCodeActionMetadata);

		languages.registerCodeActionsProvider({
			scheme: 'file',
			language: 'java'
		}, new ClientCodeActionProvider(context));
	}

	private showGradleCompatibilityIssueNotification(message: string, options: string[], projectUri: string, gradleVersion: string, newJavaHome: string) {
		window.showErrorMessage(`${message} [Learn More](https://docs.gradle.org/current/userguide/compatibility.html)`, ...options).then(async (choice) => {
			if (choice === GET_JDK) {
				commands.executeCommand(Commands.OPEN_BROWSER, Uri.parse(getJdkUrl()));
			} else if (choice.startsWith(USE_JAVA)) {
				await workspace.getConfiguration().update(GRADLE_IMPORT_JVM, newJavaHome, ConfigurationTarget.Global);
				commands.executeCommand("workbench.action.openSettings", GRADLE_IMPORT_JVM);
				commands.executeCommand(Commands.IMPORT_PROJECTS_CMD);
			} else if (choice.startsWith(UPGRADE_GRADLE)) {
				await upgradeGradle(projectUri, gradleVersion);
			}
		});
	}

	private registerCommandsForStandardServer(context: ExtensionContext, jdtEventEmitter: EventEmitter<Uri>): void {
		context.subscriptions.push(commands.registerCommand(Commands.IMPORT_PROJECTS_CMD, async () => {
			if (getJavaConfiguration().get<string>("import.projectSelection") === "automatic") {
				return await commands.executeCommand<void>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.IMPORT_PROJECTS);
			}
			const projectUris: string[] = await getAllProjects(true /* excludeDefaultProject */);
			const buildFileSelector = new BuildFileSelector(context, projectUris, false);
			const selectedBuildFiles = await buildFileSelector.selectBuildFiles();
			if (selectedBuildFiles === undefined) {
				return; // cancelled by user
			}
			const importedFolders = projectUris.map(uri => Uri.parse(uri).fsPath);
			const allFoundBuildFiles = buildFileSelector.getAllFoundBuildFiles();
			const foldersContainingBuildFiles = allFoundBuildFiles.map(uri => path.dirname(uri.fsPath));

			const filesToImport = new Set<string>();
			const folderToUpdate = new Set<string>();
			selectedBuildFiles.forEach(buildFile => {
				const folder = path.dirname(Uri.parse(buildFile).fsPath);
				if (importedFolders.some(importedFolder => path.relative(importedFolder, folder) === "")) {
					// update the project if the folder of the build file is already imported
					folderToUpdate.add(Uri.file(folder).toString());
				} else {
					filesToImport.add(buildFile);
				}
			});

			const folderToRemove = new Set<string>();
			foldersContainingBuildFiles.forEach(folder => {
				// for those unselected folders, if the folder is imported, delete the project.
				const isSelected = selectedBuildFiles.some(buildFile => path.relative(path.dirname(Uri.parse(buildFile).fsPath), folder) === "");
				const isFolderImported = importedFolders.some(importedFolder => path.relative(importedFolder, folder) === "");

				if (!isSelected && isFolderImported) {
					folderToRemove.add(Uri.file(folder).toString());
				}
			});

			if (filesToImport.size > 0  || folderToUpdate.size > 0 || folderToRemove.size > 0) {
				return await commands.executeCommand<void>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.CHANGE_IMPORTED_PROJECTS,
					Array.from(filesToImport), Array.from(folderToUpdate), Array.from(folderToRemove));
			}
		}));

		context.subscriptions.push(commands.registerCommand(Commands.OPEN_OUTPUT, () => this.languageClient.outputChannel.show(ViewColumn.Three)));
		context.subscriptions.push(commands.registerCommand(Commands.SHOW_SERVER_TASK_STATUS, (preserveFocus?: boolean) => serverTaskPresenter.presentServerTaskView(preserveFocus)));
	}

	public start(): Promise<void> {
		if (this.languageClient && this.status === ClientStatus.initialized) {
			this.status = ClientStatus.starting;
			return this.languageClient.start();
		}
	}

	public stop(): Promise<void> {
		this.status = ClientStatus.stopping;
		if (this.languageClient) {
			try {
				return this.languageClient.stop();
			} finally {
				this.languageClient = null;
			}
		}
		return Promise.resolve();
	}

	public getClient(): LanguageClient {
		return this.languageClient;
	}

	public getClientStatus(): ClientStatus {
		return this.status;
	}

	private async handleSourceInvalidatedEvent(jars: string[], isAutoDownloadSource: boolean, jdtContentProviderEventEmitter: EventEmitter<Uri>): Promise<void> {
		const changedJarNames: Set<string> = new Set();
		for (const jar of jars) {
			const path = jar.split(/\/|\\/);
			if (path?.length) {
				changedJarNames.add(path[path.length - 1]);
			}
		}

		const affectedDocumentUris: Uri[] = [];
		const affectedDocumentNames: string[] = [];
		workspace.textDocuments.forEach(document => {
			// Here is a sample jdt uri for classfile:
			// jdt://contents/rt.jar/java.lang/System.class?...
			if (document.uri.scheme === "jdt") {
				const paths = document.uri.path?.split(/\/|\\/);
				if (paths?.[1] && changedJarNames.has(paths[1])) {
					affectedDocumentNames.push(paths[paths.length - 1]);
					affectedDocumentUris.push(document.uri);
				}
			}
		});
		if (affectedDocumentUris.length) {
			if (isAutoDownloadSource) {
				const reloadSources = workspace.getConfiguration().get("java.editor.reloadChangedSources");
				if (reloadSources === "manual") {
					return;
				}

				if (reloadSources === "ask") {
					const choice = await window.showWarningMessage(`The following class(es): ${affectedDocumentNames.map(name => `'${name}'`).join(", ")} ` +
						"have new source jar available on the local Maven repository. Do you want to reload them?", "Yes", "Always", "No");
					if (choice === "Always") {
						workspace.getConfiguration().update("java.editor.reloadChangedSources", "auto", ConfigurationTarget.Global);
					} else if (choice !== "Yes") {
						return;
					}
				}
			}
			affectedDocumentUris.forEach(classFileUri => {
				jdtContentProviderEventEmitter.fire(classFileUri);
			});
		}
		apiManager.fireSourceInvalidatedEvent({
			affectedRootPaths: jars,
			affectedEditorDocuments: affectedDocumentUris,
		});
	}
}

async function showImportFinishNotification(context: ExtensionContext) {
	const neverShow: boolean | undefined = context.globalState.get<boolean>("java.neverShowImportFinishNotification");
	if (!neverShow) {
		let choice: string | undefined;
		const options = ["Don't show again"];
		if (serverStatus.hasErrors()) {
			options.unshift("Show errors");
			choice = await window.showWarningMessage("Errors occurred during import of Java projects.", ...options);
		} else {
			const projectUris: string[] = await getAllJavaProjects();
			if (projectUris.length === 0) {
				return;
			}

			if (extensions.getExtension("vscjava.vscode-java-dependency")) {
				options.unshift("View projects");
			}

			choice = await window.showInformationMessage("Projects are imported into workspace.", ...options);
		}

		if (choice === "Don't show again") {
			context.globalState.update("java.neverShowImportFinishNotification", true);
		} else if (choice === "View projects") {
			commands.executeCommand("javaProjectExplorer.focus");
		} else if (choice === "Show errors") {
			commands.executeCommand("workbench.panel.markers.view.focus");
		}
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

async function setProjectConfigurationUpdate(languageClient: LanguageClient, uri: Uri, status: FeatureStatus) {
	const config = getJavaConfiguration();
	const section = 'configuration.updateBuildConfiguration';

	const st = FeatureStatus[status];
	config.update(section, st).then(
		() => logger.info(`${section} set to ${st}`),
		(error) => logger.error(error)
	);
	if (status !== FeatureStatus.disabled) {
		await projectConfigurationUpdate(languageClient, uri);
	}
}

function setNullAnalysisStatus(status: FeatureStatus) {
	const config = getJavaConfiguration();
	const section = 'compile.nullAnalysis.mode';

	const st = FeatureStatus[status];
	config.update(section, st).then(
		() => logger.info(`${section} set to ${st}`),
		(error) => logger.error(error)
	);
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

export async function applyWorkspaceEdit(workspaceEdit: WorkspaceEdit, languageClient: LanguageClient): Promise<boolean> {
	const codeEdit = await languageClient.protocol2CodeConverter.asWorkspaceEdit(workspaceEdit);
	if (codeEdit) {
		return await workspace.applyEdit(codeEdit);
	} else {
		return Promise.resolve(true);
	}
}

/**
 * 'workspace/willRenameFiles' already handled so we need to disable it.
 * @see fileEventHandler.registerFileEventHandlers
 */
export class DisableWillRenameFeature implements StaticFeature {
	fillClientCapabilities(capabilities: ClientCapabilities): void {
		capabilities.workspace.fileOperations.willRename = false;
	}
	getState(): FeatureState {
		return null;
	}
	clear(): void {}
	fillInitializeParams?: () => void;
	preInitialize?: () => void;
	initialize(): void {}
}