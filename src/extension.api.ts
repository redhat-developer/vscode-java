import { getDocumentSymbolsCommand } from './documentSymbols';
import { RequirementsData } from './requirements';
import { TextDocumentPositionParams } from 'vscode-languageclient';
import { CancellationToken, Command, ProviderResult, Uri } from 'vscode';

export type provideHoverCommandFn = (params: TextDocumentPositionParams, token: CancellationToken) => ProviderResult<Command[] | undefined>;
export type registerHoverCommand = (callback: provideHoverCommandFn) => void;

/**
 * Get the project settings.
 * @param uri Uri of the source/class file needs to be queried.
 * @param OptionKeys the settings want to query, for example: ["org.eclipse.jdt.core.compiler.compliance"]
 * @returns An object with all the optionKeys.
 * @throws Will throw errors if the Uri does not belong to any project.
 */

export type getProjectSettingsCommand = (uri: string, SettingKeys: string[]) => Promise<Object>;

/**
 * Get the classpaths and modulepaths.
 * @param uri Uri of the source/class file needs to be queried.
 * @param options Query options.
 * @returns ClasspathResult containing both classpaths and modulepaths.
 * @throws Will throw errors if the Uri does not belong to any project.
 */

export type getClasspathsCommand = (uri: string, options: ClasspathQueryOptions) => Promise<ClasspathResult>;
export type ClasspathQueryOptions = {
	/**
     * determine whether the result should contain test or not.
     */
    excludingTests: boolean;
};

export type ClasspathResult = {
    classpaths: string[];
    modulepaths: string[];
};

export const ExtensionApiVersion = '0.4';

export interface ExtensionAPI {
    readonly apiVersion: string;
	readonly javaRequirement: RequirementsData;
	readonly status: "Started" | "Error";
	readonly registerHoverCommand: registerHoverCommand;
	readonly getDocumentSymbols: getDocumentSymbolsCommand;
	readonly getProjectSettings: getProjectSettingsCommand;
	readonly getClasspaths: getClasspathsCommand;
}
