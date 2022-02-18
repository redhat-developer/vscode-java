'use strict';

import { DocumentSymbolRequest, SymbolInformation as clientSymbolInformation, DocumentSymbol as clientDocumentSymbol, HoverRequest, WorkspaceSymbolRequest } from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { ExtensionContext, languages, DocumentSymbolProvider, TextDocument, CancellationToken, SymbolInformation, DocumentSymbol, TextDocumentContentProvider, workspace, Uri, Event, HoverProvider, Position, Hover, WorkspaceSymbolProvider, Range, commands, SymbolKind } from "vscode";
import { ClassFileContentsRequest, StatusNotification } from "./protocol";
import { createClientHoverProvider } from "./hoverAction";
import { getActiveLanguageClient } from "./extension";
import { apiManager } from "./apiManager";
import { ServerMode } from "./settings";
import { serverStatus, ServerStatusKind } from "./serverStatus";
import { Commands } from "./commands";

export interface ProviderOptions {
	contentProviderEvent: Event<Uri>;
}

export interface ProviderHandle {
	handles: any[];
}

export function registerClientProviders(context: ExtensionContext, options: ProviderOptions): ProviderHandle {
	const hoverProvider = new ClientHoverProvider();
	context.subscriptions.push(languages.registerHoverProvider('java', hoverProvider));

	const symbolProvider = createDocumentSymbolProvider();
	context.subscriptions.push(languages.registerDocumentSymbolProvider('java', symbolProvider));

	const jdtProvider = createJDTContentProvider(options);
	context.subscriptions.push(workspace.registerTextDocumentContentProvider('jdt', jdtProvider));

	overwriteWorkspaceSymbolProviderIfSupported();
	return {
		handles: [hoverProvider, symbolProvider, jdtProvider]
	};
}

export class ClientHoverProvider implements HoverProvider {
	private delegateProvider;

	async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
		const languageClient: LanguageClient | undefined = await getActiveLanguageClient();

		if (!languageClient) {
			return undefined;
		}

		const serverMode: ServerMode = apiManager.getApiInstance().serverMode;
		if (serverMode === ServerMode.STANDARD) {
			if (!this.delegateProvider) {
				this.delegateProvider = createClientHoverProvider(languageClient);
			}
			return this.delegateProvider.provideHover(document, position, token);
		} else {
			const params = {
				textDocument: languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
				position: languageClient.code2ProtocolConverter.asPosition(position)
			};
			const hoverResponse = await languageClient.sendRequest(HoverRequest.type, params, token);
			return languageClient.protocol2CodeConverter.asHover(hoverResponse);
		}
	}
}

function createJDTContentProvider(options: ProviderOptions): TextDocumentContentProvider {
	return <TextDocumentContentProvider>{
		onDidChange: options.contentProviderEvent,
		provideTextDocumentContent: async (uri: Uri, token: CancellationToken): Promise<string> => {
			const languageClient: LanguageClient | undefined = await getActiveLanguageClient();

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
			const languageClient: LanguageClient | undefined = await getActiveLanguageClient();

			if (!languageClient) {
				return [];
			}

			const params = {
				textDocument: languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
			};
			const symbolResponse = await languageClient.sendRequest(DocumentSymbolRequest.type, params, token);
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

const START_OF_DOCUMENT = new Range(new Position(0, 0), new Position(0, 0));

function createWorkspaceSymbolProvider(existingWorkspaceSymbolProvider: WorkspaceSymbolProvider): WorkspaceSymbolProvider  {
	return {
		provideWorkspaceSymbols: existingWorkspaceSymbolProvider.provideWorkspaceSymbols,
		resolveWorkspaceSymbol: async (symbol: SymbolInformation, token: CancellationToken): Promise<SymbolInformation> => {
			const range = symbol.location.range;
			if (range && !range.isEqual(START_OF_DOCUMENT)) {
				return symbol;
			}

			const languageClient = await getActiveLanguageClient();
			const serializableSymbol = {
				name: symbol.name,
				// Cannot serialize SymbolKind as number, because GSON + lsp4j.SymbolKind expect a name.
				kind: SymbolKind[symbol.kind],
				location: {
					uri: languageClient.code2ProtocolConverter.asUri(symbol.location.uri),
					range: languageClient.code2ProtocolConverter.asRange(symbol.location.range)
				},
				containerName: symbol.containerName
			};

			const response = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.RESOLVE_WORKSPACE_SYMBOL, JSON.stringify(serializableSymbol));
			if (token.isCancellationRequested) {
				return undefined;
			}
			return languageClient.protocol2CodeConverter.asSymbolInformation(response as clientSymbolInformation);
		}
	};
}

function overwriteWorkspaceSymbolProviderIfSupported(): void {
	const disposable =  serverStatus.onServerStatusChanged( async (status) => {
		if (status === ServerStatusKind.Ready) {
			const feature =  (await getActiveLanguageClient()).getFeature(WorkspaceSymbolRequest.method);
			const providers = feature.getProviders();
			if (providers && providers.length > 0) {
				feature.dispose();
				const workspaceSymbolProvider = createWorkspaceSymbolProvider(providers[0]);
				languages.registerWorkspaceSymbolProvider(workspaceSymbolProvider);
				disposable.dispose();
			}
		}
	});
}