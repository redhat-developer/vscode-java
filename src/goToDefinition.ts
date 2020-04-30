'use strict';

import {
	CancellationToken,
	Location,
	LocationLink,
	DefinitionParams,
	DefinitionRequest,
	LanguageClient,
} from 'vscode-languageclient';

type GoToDefinitionResponse = Location | Location[] | LocationLink[] | null;

export type goToDefinitionCommand = (params: DefinitionParams, token?: CancellationToken) => Promise<GoToDefinitionResponse>;

export function goToDefinitionProvider(languageClient: LanguageClient): goToDefinitionCommand {
    return async (params: DefinitionParams, token?: CancellationToken): Promise<GoToDefinitionResponse> => {
        if (token !== undefined) {
            return languageClient.sendRequest(DefinitionRequest.type, params, token);
        }
        return languageClient.sendRequest(DefinitionRequest.type, params);
    };
}