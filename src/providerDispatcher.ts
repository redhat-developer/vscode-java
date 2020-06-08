'use strict';

import { LanguageClient, DocumentSymbolRequest, SymbolInformation as clientSymbolInformation, DocumentSymbol as clientDocumentSymbol, HoverRequest } from "vscode-languageclient";
import { ExtensionContext, languages, DocumentSymbolProvider, TextDocument, CancellationToken, SymbolInformation, ProviderResult, DocumentSymbol, TextDocumentContentProvider, workspace, Uri, Event, HoverProvider, Position, Hover } from "vscode";
import { ClassFileContentsRequest } from "./protocol";
import { provideHoverCommandFn } from "./extension.api";
import { createClientHoverProvider } from "./hoverAction";
import { getClient } from "./extension";
import { apiManager } from "./apiManager";
import { ServerMode } from "./settings";

export interface ProviderOptions {
	contentProviderEvent: Event<Uri>;
}

export interface ProviderHandle {
	handles: any[];
}

export function registerClientProviders(context: ExtensionContext, options: ProviderOptions): ProviderHandle {
	context.subscriptions.push(languages.registerHoverProvider('java', hoverProvider));

	const symbolProvider = createDocumentSymbolProvider();
	context.subscriptions.push(languages.registerDocumentSymbolProvider('java', symbolProvider));

	const jdtProvider = createJDTContentProvider(options);
	context.subscriptions.push(workspace.registerTextDocumentContentProvider('jdt', jdtProvider));
	return {
		handles: [hoverProvider, symbolProvider, jdtProvider]
	};
}

export class ClientHoverProvider implements HoverProvider {
	private delegateProvider;

	initializeForStandardServer(standardClient: LanguageClient, context: ExtensionContext) {
		this.delegateProvider = createClientHoverProvider(standardClient, context);
	}

	async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
		const languageClient: LanguageClient | undefined = await getClient();

		if (!languageClient) {
			return undefined;
		}

		const serverMode: ServerMode = apiManager.getApiInstance().serverMode;
		if (serverMode === ServerMode.LIGHTWEIGHT) {
			const params = {
				textDocument: languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
				position: languageClient.code2ProtocolConverter.asPosition(position)
			};
			const hoverResponse = await languageClient.sendRequest(HoverRequest.type, params);
			return languageClient.protocol2CodeConverter.asHover(hoverResponse);
		} else if (serverMode === ServerMode.STANDARD) {
			return this.delegateProvider.provideHover(document, position, token);
		}
	}

	registerHoverCommand(callback: provideHoverCommandFn) {
		if (this.delegateProvider) {
			this.delegateProvider.registerHoverCommand(callback);
		}
	}
}

export const hoverProvider = new ClientHoverProvider();

function createJDTContentProvider(options: ProviderOptions): TextDocumentContentProvider {
	return <TextDocumentContentProvider>{
		onDidChange: options.contentProviderEvent,
		provideTextDocumentContent: async (uri: Uri, token: CancellationToken): Promise<string> => {
			const languageClient: LanguageClient | undefined = await getClient();

			if (!languageClient) {
				return '';
			}

			return languageClient.sendRequest(ClassFileContentsRequest.type, { uri: uri.toString() }, token).then((v: string): string => {
				return v || '';
			});
		}
	};
}

function createDocumentSymbolProvider(): DocumentSymbolProvider {
	return <DocumentSymbolProvider>{
		provideDocumentSymbols: async (document: TextDocument, token: CancellationToken): Promise<SymbolInformation[] | DocumentSymbol[]> => {
			const languageClient: LanguageClient | undefined = await getClient();

			if (!languageClient) {
				return [];
			}

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
