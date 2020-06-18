'use strict';

import {
    CancellationToken,
    CompletionList,
    CompletionItem,
    LanguageClient,
    CompletionParams,
    CompletionRequest,
} from 'vscode-languageclient';
import { getActiveLanguageClient } from './extension';

type CompletionResponse = CompletionList | CompletionItem[] | null;

export type getCompletionItemsCommand = (params: CompletionParams, token?: CancellationToken) => Promise<CompletionResponse>;

export function completionItemsProvider(): getCompletionItemsCommand {
    return async (params: CompletionParams, token?: CancellationToken): Promise<CompletionResponse> => {
        const languageClient: LanguageClient | undefined = await getActiveLanguageClient();
        if (!languageClient) {
            return null;
        }

        if (token !== undefined) {
            return languageClient.sendRequest(CompletionRequest.type, params, token);
        }
        return languageClient.sendRequest(CompletionRequest.type, params);
    };
}
