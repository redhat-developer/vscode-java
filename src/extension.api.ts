import { getDocumentSymbolsCommand } from './documentSymbols';
import { RequirementsData } from './requirements';
import { TextDocumentPositionParams } from 'vscode-languageclient';
import { CancellationToken, Command, ProviderResult } from 'vscode';

export type provideHoverCommandFn = (params: TextDocumentPositionParams, token: CancellationToken) => ProviderResult<Command[] | undefined>;
export type registerHoverCommand = (callback: provideHoverCommandFn) => void;

export const ExtensionApiVersion = '0.3';

export interface ExtensionAPI {
    readonly apiVersion: string;
	readonly javaRequirement: RequirementsData;
	readonly status: "Started" | "Error";
	readonly registerHoverCommand: registerHoverCommand;
	readonly getDocumentSymbols: getDocumentSymbolsCommand;
}
