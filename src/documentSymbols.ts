'use strict';

import {
    CancellationToken,
    DocumentSymbolParams,
    DocumentSymbolRequest,
    LanguageClient
} from "vscode-languageclient";
import { DocumentSymbolsResponse } from "./protocol";

export type getDocumentSymbolsCommand = (params: DocumentSymbolParams, token?: CancellationToken) => Promise<DocumentSymbolsResponse>;

export function getDocumentSymbolsProvider(languageClient: LanguageClient): getDocumentSymbolsCommand {
    return async (params: DocumentSymbolParams, token?: CancellationToken): Promise<DocumentSymbolsResponse> => {
        if (token !== undefined) {
            return languageClient.sendRequest(DocumentSymbolRequest.type, params, token);
        }
        return languageClient.sendRequest(DocumentSymbolRequest.type, params);
    };
}
