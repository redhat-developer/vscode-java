import { GetDocumentSymbolsCommand } from './documentSymbols';
import { GoToDefinitionCommand } from './goToDefinition';
import { RequirementsData } from './requirements';
import { TextDocumentPositionParams } from 'vscode-languageclient';
import { CancellationToken, Command, ProviderResult, Uri, Event } from 'vscode';
import { ServerMode } from './settings';

export type ProvideHoverCommandFn = (params: TextDocumentPositionParams, token: CancellationToken) => ProviderResult<Command[] | undefined>;
export type RegisterHoverCommand = (callback: ProvideHoverCommandFn) => void;

/**
 * Gets the project settings. This API is not supported in light weight server mode so far.
 * @param uri Uri of the file that needs to be queried. Accepted uris are: source file, class file and project root path.
 * @param OptionKeys the settings we want to query, for example: ["org.eclipse.jdt.core.compiler.compliance", "org.eclipse.jdt.core.compiler.source"].
 *                   Besides the options defined in JavaCore, the following keys can also be used:
 *                   - "org.eclipse.jdt.ls.core.vm.location": Get the location of the VM assigned to build the given Java project
 *                   - "org.eclipse.jdt.ls.core.sourcePaths": Get the source root paths of the given Java project
 *                   - "org.eclipse.jdt.ls.core.outputPath": Get the default output path of the given Java project. Note that the default output path
 *                                                           may not be equal to the output path of each source root.
 *                   - "org.eclipse.jdt.ls.core.referencedLibraries": Get all the referenced library files of the given Java project
 * @returns An object with all the optionKeys.
 * @throws Will throw errors if the Uri does not belong to any project.
 */

export type GetProjectSettingsCommand = (uri: string, SettingKeys: string[]) => Promise<Object>;

/**
 * Gets the classpaths and modulepaths. This API is not supported in light weight server mode so far.
 * @param uri Uri of the file that needs to be queried. Accepted uris are: source file, class file and project root path.
 * @param options Query options.
 * @returns ClasspathResult containing both classpaths and modulepaths.
 * @throws Will throw errors if the Uri does not belong to any project.
 */

export type GetClasspathsCommand = (uri: string, options: ClasspathQueryOptions) => Promise<ClasspathResult>;
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
 * Checks if the input uri is a test source file or not. This API is not supported in light weight server mode so far.
 * @param uri Uri of the file that needs to be queried. Accepted uris are: source file, class file and project root path.
 * @returns `true` if the input uri is a test file in its belonging project, otherwise returns false.
 * @throws Will throw errors if the Uri does not belong to any project.
 */
export type IsTestFileCommand = (uri: string) => Promise<boolean>;

export enum ClientStatus {
	uninitialized = "Uninitialized",
	initialized = "Initialized",
	starting = "Starting",
	started = "Started",
	error = "Error",
	stopping = "Stopping",
}

export const extensionApiVersion = '0.7';

export interface ExtensionAPI {
	readonly apiVersion: string;
	readonly javaRequirement: RequirementsData;
	status: ClientStatus;
	readonly registerHoverCommand: RegisterHoverCommand;
	readonly getDocumentSymbols: GetDocumentSymbolsCommand;
	readonly getProjectSettings: GetProjectSettingsCommand;
	readonly getClasspaths: GetClasspathsCommand;
	readonly isTestFile: IsTestFileCommand;
	/**
	 * An event which fires on classpath update. This API is not supported in light weight server mode so far.
	 *
	 * Note:
	 *   1. This event will fire when the project's configuration file (e.g. pom.xml for Maven) get changed,
	 *      but the classpaths might still be the same as before.
	 *   2. The Uri points to the project root path.
	 */
	readonly onDidClasspathUpdate: Event<Uri>;
	/**
	 * An event fires on projects imported. This API is not supported in light weight server mode so far.
	 * The Uris in the array point to the project root path.
	 */
	readonly onDidProjectsImport: Event<Uri[]>;
	readonly goToDefinition: GoToDefinitionCommand;
	/**
	 * Indicates the current active mode for Java Language Server. Possible modes are:
	 * - "Standard"
	 * - "Hybrid"
	 * - "LightWeight"
	 */
	serverMode: ServerMode;
	/**
	 * An event which fires when the server mode has been switched.
	 */
	readonly onDidServerModeChange: Event<ServerMode>;

	/**
	 * A promise that will be resolved when the standard language server is ready.
	 * Note: The server here denotes for the standard server, not the lightweight.
	 * @since API version 0.7
	 * @since extension version 1.7.0
	 */
	readonly serverReady: () => Promise<boolean>;
}
