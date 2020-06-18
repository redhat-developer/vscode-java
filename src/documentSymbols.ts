'use strict';

import {
    CancellationToken,
    DocumentSymbol,
    DocumentSymbolParams,
    DocumentSymbolRequest,
    LanguageClient,
    SymbolInformation
} from "vscode-languageclient";
import { getActiveLanguageClient } from "./extension";

type DocumentSymbolsResponse = DocumentSymbol[] | SymbolInformation[] | null;

export type getDocumentSymbolsCommand = (params: DocumentSymbolParams, token?: CancellationToken) => Promise<DocumentSymbolsResponse>;

export function getDocumentSymbolsProvider(): getDocumentSymbolsCommand {
    return async (params: DocumentSymbolParams, token?: CancellationToken): Promise<DocumentSymbolsResponse> => {
        const languageClient: LanguageClient | undefined = await getActiveLanguageClient();
        if (!languageClient) {
            return [];
        }

        if (token !== undefined) {
            return languageClient.sendRequest(DocumentSymbolRequest.type, params, token);
        }
        return languageClient.sendRequest(DocumentSymbolRequest.type, params);
    };
}
