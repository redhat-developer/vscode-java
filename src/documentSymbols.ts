'use strict';

import {
    CancellationToken,
    DocumentSymbol,
    DocumentSymbolParams,
    DocumentSymbolRequest,
    LanguageClient,
    SymbolInformation
} from "vscode-languageclient";

type DocumentSymbolsResponse = DocumentSymbol[] | SymbolInformation[] | null;

export type getDocumentSymbolsCommand = (params: DocumentSymbolParams, token?: CancellationToken) => Promise<DocumentSymbolsResponse>;

export function getDocumentSymbolsProvider(languageClient: LanguageClient): getDocumentSymbolsCommand {
    return async (params: DocumentSymbolParams, token?: CancellationToken): Promise<DocumentSymbolsResponse> => {
        if (token !== undefined) {
            return languageClient.sendRequest(DocumentSymbolRequest.type, params, token);
        }
        return languageClient.sendRequest(DocumentSymbolRequest.type, params);
    };
}
