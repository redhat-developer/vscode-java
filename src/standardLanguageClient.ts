'use strict';

import { ExtensionContext, window, StatusBarAlignment, workspace, commands, Uri, ProgressLocation, ViewColumn, EventEmitter, extensions } from "vscode";
import { Commands } from "./commands";
import { serverStatus, ServerStatusKind } from "./serverStatus";
import { prepareExecutable, awaitServerConnection } from "./javaServerStarter";
import { getJavaConfig, applyWorkspaceEdit } from "./extension";
import { StreamInfo, LanguageClient, LanguageClientOptions, Position as LSPosition, Location as LSLocation, MessageType } from "vscode-languageclient";
import { CompileWorkspaceRequest, CompileWorkspaceStatus, SourceAttachmentRequest, SourceAttachmentResult, SourceAttachmentAttribute, ProjectConfigurationUpdateRequest, FeatureStatus, StatusNotification, ProgressReportNotification, ActionableNotification, ExecuteClientCommandRequest, ServerNotification, EventNotification, EventType } from "./protocol";
import { setGradleWrapperChecksum, excludeProjectSettingsFiles, ServerMode } from "./settings";
import { onExtensionChange } from "./plugin";
import { serverTaskPresenter } from "./serverTaskPresenter";
import { RequirementsData } from "./requirements";
import * as net from 'net';
import { getJavaConfiguration } from "./utils";
import { logger } from "./log";
import * as buildPath from './buildpath';
import * as sourceAction from './sourceAction';
import * as refactorAction from './refactorAction';
import * as pasteAction from './pasteAction';
import { serverTasks } from "./serverTasks";
import { apiManager } from "./apiManager";
import { ExtensionAPI, ClientStatus } from "./extension.api";

const extensionName = 'Language Support for Java';
const GRADLE_CHECKSUM = "gradle/checksum/prompt";

export class StandardLanguageClient {

	private languageClient: LanguageClient;
	private status: ClientStatus = ClientStatus.Uninitialized;

	public initialize(context: ExtensionContext, requirements: RequirementsData, clientOptions: LanguageClientOptions, workspacePath: string, jdtEventEmitter: EventEmitter<Uri>, resolve: (value: ExtensionAPI) => void): void {
		if (this.status !== ClientStatus.Uninitialized) {
			return;
		}

		const item = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
		item.text = '$(sync~spin)';
		item.command = Commands.SHOW_SERVER_TASK_STATUS;
		item.show();
		context.subscriptions.push(item);

		if (workspace.getConfiguration().get("java.showBuildStatusOnStart.enabled")) {
			commands.executeCommand(Commands.SHOW_SERVER_TASK_STATUS);
		}

		serverStatus.initialize();
		serverStatus.onServerStatusChanged(status => {
			if (status === ServerStatusKind.Busy) {
				item.text = '$(sync~spin)';
			} else if (status === ServerStatusKind.Error) {
				item.text = '$(thumbsdown)';
			} else {
				item.text = '$(thumbsup)';
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
		this.languageClient.registerProposedFeatures();

		this.languageClient.onReady().then(() => {
			this.languageClient.onNotification(StatusNotification.type, (report) => {
				switch (report.type) {
					case 'ServiceReady':
						apiManager.updateServerMode(ServerMode.STANDARD);
						apiManager.fireDidServerModeChange(ServerMode.STANDARD);
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
				item.tooltip = report.message;
			});

			this.languageClient.onNotification(ProgressReportNotification.type, (progress) => {
				serverTasks.updateServerTask(progress);
			});

			this.languageClient.onNotification(EventNotification.type, (notification) => {
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
		});

		this.registerCommandsForStandardServer(context, jdtEventEmitter);

		this.status = ClientStatus.Initialized;
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

			context.subscriptions.push(commands.registerCommand(Commands.NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND, (location: any) => {
				const range = this.languageClient.protocol2CodeConverter.asRange(location.range);
				window.showTextDocument(Uri.parse(decodeBase64(location.uri)), {
					preserveFocus: true,
					selection: range,
				});
			}));

			context.subscriptions.push(commands.registerCommand(Commands.COMPILE_WORKSPACE, (isFullCompile: boolean) => {
				return window.withProgress({ location: ProgressLocation.Window }, async p => {
					if (typeof isFullCompile !== 'boolean') {
						const selection = await window.showQuickPick(['Incremental', 'Full'], { placeHolder: 'please choose compile type:' });
						isFullCompile = selection !== 'Incremental';
					}
					p.report({ message: 'Compiling workspace...' });
					const start = new Date().getTime();
					const res = await this.languageClient.sendRequest(CompileWorkspaceRequest.type, isFullCompile);
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

function isJavaConfigFile(path: String) {
	return path.endsWith('pom.xml') || path.endsWith('.gradle');
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
