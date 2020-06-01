'use strict';

import {
	CancellationToken,
	CompletionList,
	CompletionItem,
	LanguageClient,
	CompletionParams,
	CompletionRequest,
} from 'vscode-languageclient';

type CompletionResponse = CompletionList | CompletionItem[] | null;
export type provideCompletionItemsCommand = (params: CompletionParams, token? : CancellationToken) => Promise<CompletionResponse>;

export function completionItemsProvider(languageClient: LanguageClient) : provideCompletionItemsCommand {
	return async (params: CompletionParams, token?: CancellationToken): Promise<CompletionResponse> => {
		if (token !== undefined) {
			return languageClient.sendRequest(CompletionRequest.type, params, token);
		}
		return languageClient.sendRequest(CompletionRequest.type, params);
	}
}