'use strict';

import { LanguageClient, DocumentSymbolParams } from "vscode-languageclient";
import { DocumentSymbolRequest, DocumentSymbolsResponse } from "./protocol";

export type getDocumentSymbolsCommand = (params: DocumentSymbolParams) => Promise<DocumentSymbolsResponse>;

export function getDocumentSymbolsProvider(languageClient: LanguageClient): getDocumentSymbolsCommand {
    return async (params: DocumentSymbolParams): Promise<DocumentSymbolsResponse> => {
        return languageClient.sendRequest(DocumentSymbolRequest.type, params);
    };
}
