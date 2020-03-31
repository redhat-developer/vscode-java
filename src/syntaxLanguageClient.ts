import * as net from "net";
import { LanguageClientOptions, StreamInfo, LanguageClient, ServerOptions, DidChangeConfigurationNotification } from "vscode-languageclient";
import { OutputInfoCollector, ClientErrorHandler, getJavaConfig } from "./extension";
import { logger } from "./log";

const extensionName = "Language Support for Java (Syntax Server)";

export class SyntaxLanguageClient {
	private languageClient: LanguageClient;
	private stopping: boolean = false;

	public initialize(requirements, clientOptions: LanguageClientOptions, serverOptions?: ServerOptions) {
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
}
