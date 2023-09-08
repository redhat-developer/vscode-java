'use strict';

import * as net from "net";
import { DidChangeConfigurationNotification, LanguageClientOptions } from "vscode-languageclient";
import { LanguageClient, ServerOptions, StreamInfo } from "vscode-languageclient/node";
import { apiManager } from "./apiManager";
import { ClientErrorHandler } from "./clientErrorHandler";
import { ClientStatus } from "./extension.api";
import { logger } from "./log";
import { OutputInfoCollector } from "./outputInfoCollector";
import { StatusNotification } from "./protocol";
import { RequirementsData } from "./requirements";
import { ServerMode } from "./settings";
import { snippetCompletionProvider } from "./snippetCompletionProvider";
import { getJavaConfig } from "./utils";
import { DEBUG } from "./javaServerStarter";
import { TracingLanguageClient } from "./TracingLanguageClient";

const extensionName = "Language Support for Java (Syntax Server)";

export class SyntaxLanguageClient {
	private languageClient: LanguageClient;
	private status: ClientStatus = ClientStatus.uninitialized;

	public initialize(requirements: RequirementsData, clientOptions: LanguageClientOptions, serverOptions?: ServerOptions) {
		const newClientOptions: LanguageClientOptions = Object.assign({}, clientOptions, {
			middleware: {
				workspace: {
					didChangeConfiguration: async () => {
						await this.languageClient.sendNotification(DidChangeConfigurationNotification.type, {
							settings: {
								java: await getJavaConfig(requirements.java_home),
							}
						});
					}
				}
			},
			errorHandler: new ClientErrorHandler(extensionName),
			initializationFailedHandler: error => {
				logger.error(`Failed to initialize ${extensionName} due to ${error && error.toString()}`);
				if (error.toString().includes('Connection') && error.toString().includes('disposed')) {
					return false;
				} else {
					return true;
				}
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
			this.languageClient = new TracingLanguageClient('java', extensionName, serverOptions, newClientOptions, DEBUG);
		}

		this.status = ClientStatus.initialized;
	}

	public registerSyntaxClientActions(serverOptions?: ServerOptions): void {
		// TODO: Currently only resolve the promise when the server mode is explicitly set to lightweight.
		// This is to avoid breakings
		if (serverOptions) {
			this.languageClient.onNotification(StatusNotification.type, (report) => {
				switch (report.type) {
					case 'Started':
						this.status = ClientStatus.started;
						apiManager.updateStatus(ClientStatus.started);
						// Disable the client-side snippet provider since LS is ready.
						snippetCompletionProvider.dispose();
						break;
					case 'Error':
						this.status = ClientStatus.error;
						apiManager.updateStatus(ClientStatus.error);
						break;
					default:
						break;
				}
				if (apiManager.getApiInstance().serverMode === ServerMode.lightWeight) {
					apiManager.fireDidServerModeChange(ServerMode.lightWeight);
				}
			});
		}
	}

	public start(): Promise<void> {
		if (this.languageClient) {
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

	public isAlive(): boolean {
		return !!this.languageClient && this.status !== ClientStatus.stopping;
	}

	public getClient(): LanguageClient {
		return this.languageClient;
	}

}
