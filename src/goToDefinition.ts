'use strict';

import {
	CancellationToken,
	Location,
	LocationLink,
	DefinitionParams,
	DefinitionRequest,
	LanguageClient,
} from 'vscode-languageclient';
import { getActiveLanguageClient } from './extension';

type GoToDefinitionResponse = Location | Location[] | LocationLink[] | null;

export type goToDefinitionCommand = (params: DefinitionParams, token?: CancellationToken) => Promise<GoToDefinitionResponse>;

export function goToDefinitionProvider(): goToDefinitionCommand {
    return async (params: DefinitionParams, token?: CancellationToken): Promise<GoToDefinitionResponse> => {
        const languageClient: LanguageClient | undefined = await getActiveLanguageClient();
        if (!languageClient) {
            return null;
        }

        if (token !== undefined) {
            return languageClient.sendRequest(DefinitionRequest.type, params, token);
        }
        return languageClient.sendRequest(DefinitionRequest.type, params);
    };
}