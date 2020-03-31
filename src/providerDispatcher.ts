'use strict';

import { LanguageClient, DocumentSymbolRequest, SymbolInformation as clientSymbolInformation, DocumentSymbol as clientDocumentSymbol, HoverRequest } from "vscode-languageclient";
import { ExtensionContext, languages, DocumentSymbolProvider, TextDocument, CancellationToken, SymbolInformation, ProviderResult, DocumentSymbol, TextDocumentContentProvider, workspace, Uri, Event, HoverProvider, Position, Hover } from "vscode";
import { SyntaxLanguageClient } from "./syntaxLanguageClient";
import { ClassFileContentsRequest } from "./protocol";
import { provideHoverCommandFn } from "./extension.api";
import { createClientHoverProvider } from "./hoverAction";

export interface ProviderOptions {
	standardClient: LanguageClient;
	syntaxClient?: SyntaxLanguageClient;
	contentProviderEvent: Event<Uri>;
}

export interface ProviderHandle {
	handles: any[];
}

export function registerClientProviders(context: ExtensionContext, options: ProviderOptions): ProviderHandle {
	const hoverProvider = new ClientHoverProvider(options, context);
	context.subscriptions.push(languages.registerHoverProvider('java', hoverProvider));

	const symbolProvider = createDocumentSymbolProvider(options);
	context.subscriptions.push(languages.registerDocumentSymbolProvider('java', symbolProvider));

	const jdtProvider = createJDTContentProvider(options);
	context.subscriptions.push(workspace.registerTextDocumentContentProvider('jdt', jdtProvider));
	return {
		handles: [hoverProvider, symbolProvider, jdtProvider]
	};
}

export class ClientHoverProvider implements HoverProvider {
	private delegateProvider;

	constructor(private options: ProviderOptions, context: ExtensionContext) {
		if (options.standardClient) {
			this.delegateProvider = createClientHoverProvider(options.standardClient, context);
		}
	}

	async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
		if (this.options.syntaxClient && this.options.syntaxClient.isAlive()) {
			const languageClient: LanguageClient = this.options.syntaxClient.getClient();
			await languageClient.onReady();
			const params = {
				textDocument: languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
				position: languageClient.code2ProtocolConverter.asPosition(position)
			};
			const hoverResponse = await languageClient.sendRequest(HoverRequest.type, params);
			return languageClient.protocol2CodeConverter.asHover(hoverResponse);
		} else if (this.delegateProvider) {
			return this.delegateProvider.provideHover(document, position, token);
		}
	}

	registerHoverCommand(callback: provideHoverCommandFn) {
		if (this.delegateProvider) {
			this.delegateProvider.registerHoverCommand(callback);
		}
	}
}

function createJDTContentProvider(options: ProviderOptions): TextDocumentContentProvider {
	return <TextDocumentContentProvider>{
		onDidChange: options.contentProviderEvent,
		provideTextDocumentContent: async (uri: Uri, token: CancellationToken): Promise<string> => {
			let languageClient: LanguageClient = options.standardClient;
			if (options.syntaxClient && options.syntaxClient.isAlive() && uri.fragment === "syntaxserver") {
				languageClient = options.syntaxClient.getClient();
			}

			await languageClient.onReady();
			return languageClient.sendRequest(ClassFileContentsRequest.type, { uri: uri.toString() }, token).then((v: string): string => {
				return v || '';
			});
		}
	};
}

function createDocumentSymbolProvider(options: ProviderOptions): DocumentSymbolProvider {
	return <DocumentSymbolProvider>{
		provideDocumentSymbols: async (document: TextDocument, token: CancellationToken): Promise<SymbolInformation[] | DocumentSymbol[]> => {
			let languageClient: LanguageClient = options.standardClient;
			if (options.syntaxClient && options.syntaxClient.isAlive()) {
				languageClient = options.syntaxClient.getClient();
			}

			await languageClient.onReady();
			const params = {
				textDocument: languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
			};
			const symbolResponse = await languageClient.sendRequest(DocumentSymbolRequest.type, params);
			if (!symbolResponse || !symbolResponse.length) {
				return [];
			}

			if ((<any>symbolResponse[0]).containerName) {
				return languageClient.protocol2CodeConverter.asSymbolInformations(<clientSymbolInformation[]>symbolResponse);
			}

			return languageClient.protocol2CodeConverter.asDocumentSymbols(<clientDocumentSymbol[]>symbolResponse);
		}
	};
}
