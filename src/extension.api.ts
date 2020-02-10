import { getDocumentSymbolsCommand } from './documentSymbols';
import { RequirementsData } from './requirements';
import { TextDocumentPositionParams } from 'vscode-languageclient';
import { CancellationToken, Command, ProviderResult, Uri, Event } from 'vscode';

export type provideHoverCommandFn = (params: TextDocumentPositionParams, token: CancellationToken) => ProviderResult<Command[] | undefined>;
export type registerHoverCommand = (callback: provideHoverCommandFn) => void;

/**
 * Gets the project settings.
 * @param uri Uri of the source/class file that needs to be queried.
 * @param OptionKeys the settings we want to query, for example: ["org.eclipse.jdt.core.compiler.compliance", "org.eclipse.jdt.core.compiler.source"]
 * @returns An object with all the optionKeys.
 * @throws Will throw errors if the Uri does not belong to any project.
 */

export type getProjectSettingsCommand = (uri: string, SettingKeys: string[]) => Promise<Object>;

/**
 * Gets the classpaths and modulepaths.
 * @param uri Uri of the source/class file that needs to be queried.
 * @param options Query options.
 * @returns ClasspathResult containing both classpaths and modulepaths.
 * @throws Will throw errors if the Uri does not belong to any project.
 */

export type getClasspathsCommand = (uri: string, options: ClasspathQueryOptions) => Promise<ClasspathResult>;
export type ClasspathQueryOptions = {
	/**
	 * Determines the scope of the classpath. Valid scopes are "runtime" and "test".
	 * If the given scope is not supported, "runtime" will be used.
	 */
	scope: string;
};

export type ClasspathResult = {
	/**
	 * Uri string of the project root path.
	 */
	projectRoot: string;
	/**
	 * File path array for the classpaths.
	 */
	classpaths: string[];
	/**
	 * File path array for the modulepaths.
	 */
	modulepaths: string[];
};

/**
 * Checks if the input uri is a test source file or not.
 * @param uri Uri of the source file that needs to be queried.
 * @returns `true` if the input uri is a test file in its belonging project, otherwise returns false.
 * @throws Will throw errors if the Uri does not belong to any project.
 */
export type isTestFileCommand = (uri: string) => Promise<boolean>;

export const ExtensionApiVersion = '0.4';

export interface ExtensionAPI {
	readonly apiVersion: string;
	readonly javaRequirement: RequirementsData;
	readonly status: "Started" | "Error";
	readonly registerHoverCommand: registerHoverCommand;
	readonly getDocumentSymbols: getDocumentSymbolsCommand;
	readonly getProjectSettings: getProjectSettingsCommand;
	readonly getClasspaths: getClasspathsCommand;
	readonly isTestFile: isTestFileCommand;
	/**
	 * An event which fires on classpath update.
	 *
	 * Note:
	 *   1. This event will only fire for Maven/Gradle projects.
	 *   2. This event will fire when the project's configuration file (e.g. pom.xml for Maven) get changed,
	 *      but the classpaths might still be the same as before.
	 *   3. The Uri points to the project root path.
	 */
	readonly onDidClasspathUpdate: Event<Uri>;
}
