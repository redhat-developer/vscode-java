'use strict';

import {
	CancellationToken,
	Location,
	LocationLink,
	DefinitionParams,
	DefinitionRequest
} from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { getActiveLanguageClient } from './extension';

type GoToDefinitionResponse = Location | Location[] | LocationLink[] | null;

export type GoToDefinitionCommand = (params: DefinitionParams, token?: CancellationToken) => Promise<GoToDefinitionResponse>;

export function goToDefinitionProvider(): GoToDefinitionCommand {
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