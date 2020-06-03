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
export type getCompletionItemsCommand = (params: CompletionParams, token?: CancellationToken) => Promise<CompletionResponse>;

export function completionItemsProvider(languageClient: LanguageClient): getCompletionItemsCommand {
	return async (params: CompletionParams, token?: CancellationToken): Promise<CompletionResponse> => {
		if (token !== undefined) {
			return languageClient.sendRequest(CompletionRequest.type, params, token);
		}
		return languageClient.sendRequest(CompletionRequest.type, params);
	};
}