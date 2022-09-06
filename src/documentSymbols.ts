'use strict';

import {
    CancellationToken,
    DocumentSymbol,
    DocumentSymbolParams,
    DocumentSymbolRequest,
    SymbolInformation
} from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { getActiveLanguageClient } from "./extension";

type DocumentSymbolsResponse = DocumentSymbol[] | SymbolInformation[] | null;

export type GetDocumentSymbolsCommand = (params: DocumentSymbolParams, token?: CancellationToken) => Promise<DocumentSymbolsResponse>;

export function getDocumentSymbolsProvider(): GetDocumentSymbolsCommand {
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
