import * as net from "net";
import { LanguageClientOptions, StreamInfo, LanguageClient, ServerOptions, DidChangeConfigurationNotification, Disposable } from "vscode-languageclient";
import { OutputInfoCollector, ClientErrorHandler, getJavaConfig } from "./extension";
import { logger } from "./log";
import { getJavaServerMode, ServerMode } from "./settings";
import { StatusNotification } from "./protocol";
import { apiManager } from "./apiManager";
import { ExtensionAPI } from "./extension.api";
import { StatusBarAlignment, window } from "vscode";
import { Commands } from "./commands";

const extensionName = "Language Support for Java (Syntax Server)";

export class SyntaxLanguageClient {
	private languageClient: LanguageClient;
	private stopping: boolean = false;
	private disposables: Disposable[] = [];

	public initialize(requirements, clientOptions: LanguageClientOptions, resolve: (value: ExtensionAPI) => void, serverOptions?: ServerOptions) {
		const newClientOptions: LanguageClientOptions = Object.assign({}, clientOptions, {
			middleware: {
				workspace: {
					didChangeConfiguration: () => {
						this.languageClient.sendNotification(DidChangeConfigurationNotification.type, {
							settings: {
								java: getJavaConfig(requirements.java_home),
							}
						});
					}
				}
			},
			errorHandler: new ClientErrorHandler(extensionName),
			initializationFailedHandler: error => {
				logger.error(`Failed to initialize ${extensionName} due to ${error && error.toString()}`);
				return true;
			},
			outputChannel: new OutputInfoCollector(extensionName),
			outputChannelName: extensionName
		});

		const lsPort = process.env['SYNTAXLS_CLIENT_PORT'];
		if (!serverOptions && lsPort) {
			serverOptions = () => {
				const socket = net.connect(lsPort);
				const result: StreamInfo = {
					writer: socket,
					reader: socket
				};
				return Promise.resolve(result);
			};
		}

		if (serverOptions) {
			this.languageClient = new LanguageClient('java', extensionName, serverOptions, newClientOptions);

			// TODO: Currently only resolve the promise when the server mode is explicitly set to lightweight.
			// This is to avoid breakings
			if (getJavaServerMode() === ServerMode.LIGHTWEIGHT) {
				this.languageClient.onReady().then(() => {
					this.languageClient.onNotification(StatusNotification.type, (report) => {
						switch (report.type) {
							case 'Started':
								apiManager.updateServerMode(ServerMode.LIGHTWEIGHT);
								apiManager.updateStatus("Started");
								resolve(apiManager.getApiInstance());
								break;
							case 'Error':
								apiManager.updateServerMode(ServerMode.LIGHTWEIGHT);
								apiManager.updateStatus("Error");
								resolve(apiManager.getApiInstance());
								break;
							default:
								break;
						}
					});
				});
			}

			this.registerUIComponents();
		}
	}

	public start(): void {
		if (this.languageClient) {
			this.languageClient.start();
		}
	}

	public stop() {
		this.stopping = true;
		if (this.languageClient) {
			this.languageClient.stop();
			this.languageClient = null;
		}
	}

	public isAlive(): boolean {
		return !!this.languageClient && !this.stopping;
	}

	public getClient(): LanguageClient {
		return this.languageClient;
	}

	public registerUIComponents(): void {
		const item = window.createStatusBarItem(StatusBarAlignment.Right, Number.MIN_VALUE);
		item.text = "LightWeight Mode";
		item.command = {
			title: "Switch to Standard mode",
			command: Commands.SWITCH_SERVER_MODE,
			arguments: [ServerMode.STANDARD],
		};
		item.tooltip = "Click to switch to Standard mode";
		item.show();
		this.disposables.push(item);
	}

	public disposeUIComponents(): void {
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
		this.disposables = [];
	}
}
