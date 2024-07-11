'use strict';

import { CancellationToken, commands, DocumentSymbol, DocumentSymbolProvider, Event, ExtensionContext, Hover, HoverProvider, languages, MarkdownString, MarkedString, Position, Range, SymbolInformation, SymbolKind, TextDocument, TextDocumentContentProvider, Uri, workspace, WorkspaceSymbolProvider } from "vscode";
import { DocumentSymbol as clientDocumentSymbol, DocumentSymbolRequest, HoverRequest, SymbolInformation as clientSymbolInformation, WorkspaceSymbolRequest } from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { apiManager } from "./apiManager";
import { Commands } from "./commands";
import { fixJdtLinksInDocumentation, getActiveLanguageClient } from "./extension";
import { createClientHoverProvider } from "./hoverAction";
import { ClassFileContentsRequest } from "./protocol";
import { ServerMode } from "./settings";

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

	const classProvider = createClassContentProvider(options);
	context.subscriptions.push(workspace.registerTextDocumentContentProvider('class', classProvider));

	overwriteWorkspaceSymbolProvider(context);

	return {
		handles: [hoverProvider, symbolProvider, jdtProvider, classProvider]
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
		if (serverMode === ServerMode.standard) {
			if (!this.delegateProvider) {
				this.delegateProvider = createClientHoverProvider(languageClient);
			}
			const hover = await this.delegateProvider.provideHover(document, position, token);
			return fixJdtSchemeHoverLinks(hover);
		} else {
			const params = {
				textDocument: languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document),
				position: languageClient.code2ProtocolConverter.asPosition(position)
			};
			const hoverResponse = await languageClient.sendRequest(HoverRequest.type, params, token);
			const hover = languageClient.protocol2CodeConverter.asHover(hoverResponse);
			return fixJdtSchemeHoverLinks(hover);
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

function createClassContentProvider(options: ProviderOptions): TextDocumentContentProvider {
	return <TextDocumentContentProvider>{
		onDidChange: options.contentProviderEvent,
		provideTextDocumentContent: async (uri: Uri, token: CancellationToken): Promise<string> => {
			const languageClient: LanguageClient | undefined = await getActiveLanguageClient();

			if (!languageClient) {
				return '';
			}
			const originalUri = uri.toString().replace(/^class/, "file");
			const decompiledContent: string = await commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_DECOMPILED_SOURCE, originalUri);
			if (!decompiledContent) {
				console.log(`Error while getting decompiled source : ${originalUri}`);
				return "Error while getting decompiled source.";
			} else {
				return decompiledContent;
			}
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

function createWorkspaceSymbolProvider(existingWorkspaceSymbolProvider: WorkspaceSymbolProvider): WorkspaceSymbolProvider {
	return {
		provideWorkspaceSymbols: async (query: string, token: CancellationToken) => {
			// This is a workaround until vscode add support for qualified symbol search which is tracked by
			// https://github.com/microsoft/vscode/issues/98125
			const result = existingWorkspaceSymbolProvider.provideWorkspaceSymbols(query, token);
			if (query.indexOf('.') > -1) { // seems like a qualified name
				return new Promise<SymbolInformation[]>((resolve) => {
					((result as Promise<SymbolInformation[]>)).then((symbols) => {
						if (symbols === null) {
							resolve(null);
						} else {
							resolve(symbols?.map((s) => {
								s.name = `${s.containerName}.${s.name}`;
								return s;
							}));
						}
					});
				});
			}
			return result;
		},
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

function overwriteWorkspaceSymbolProvider(context: ExtensionContext): void {
	const disposable = apiManager.getApiInstance().onDidServerModeChange(async (mode) => {
		if (mode === ServerMode.standard) {
			const feature = (await getActiveLanguageClient()).getFeature(WorkspaceSymbolRequest.method);
			const providers = feature.getProviders();
			if (providers && providers.length > 0) {
				feature.clear();
				const workspaceSymbolProvider = createWorkspaceSymbolProvider(providers[0]);
				context.subscriptions.push(languages.registerWorkspaceSymbolProvider(workspaceSymbolProvider));
				disposable.dispose();
			}
		}
	});
}

/**
 * Returns the hover with all jdt:// links replaced with a command:// link that opens the jdt URI.
 *
 * VS Code doesn't render links with the `jdt` scheme in hover popups.
 * To get around this, you can create a command:// link that invokes a command that opens the corresponding URI.
 * VS Code will render command:// links in hover pop ups if they are marked as trusted.
 *
 * @param hover The hover to fix the jdt:// links for
 * @returns the hover with all jdt:// links replaced with a command:// link that opens the jdt URI
 */
export function fixJdtSchemeHoverLinks(hover: Hover): Hover {
	const newContents: (MarkedString | MarkdownString)[] = [];
	for (const content of hover.contents) {
		if (content instanceof MarkdownString) {
			newContents.push(fixJdtLinksInDocumentation(content));
		} else {
			newContents.push(content);
		}
	}
	hover.contents = newContents;
	return hover;
}