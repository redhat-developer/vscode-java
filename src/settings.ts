'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { commands, ConfigurationTarget, env, ExtensionContext, Position, Range, Selection, SnippetString, TextDocument, Uri, window, workspace, WorkspaceConfiguration, WorkspaceFolder } from 'vscode';
import { Commands } from './commands';
import { cleanupLombokCache } from './lombokSupport';
import { ensureExists, getJavaConfiguration } from './utils';
import { apiManager } from './apiManager';
import { isActive, setActive, smartSemicolonDetection } from './smartSemicolonDetection';
import { BuildFileSelector, IMPORT_METHOD, PICKED_BUILD_FILES } from './buildFilesSelector';

const DEFAULT_HIDDEN_FILES: string[] = ['**/.classpath', '**/.project', '**/.settings', '**/.factorypath'];
const IS_WORKSPACE_JDK_ALLOWED = "java.ls.isJdkAllowed";
const IS_WORKSPACE_JLS_JDK_ALLOWED = "java.jdt.ls.java.home.isAllowed";
export const IS_WORKSPACE_VMARGS_ALLOWED = "java.ls.isVmargsAllowed";
const extensionName = 'Language Support for Java';
export const ACTIVE_BUILD_TOOL_STATE = "java.activeBuildTool";

export const cleanWorkspaceFileName = '.cleanWorkspace';

const changeItem = {
	global: 'Exclude globally',
	workspace: 'Exclude in workspace',
	never: 'Never'
};

const EXCLUDE_FILE_CONFIG = 'configuration.checkProjectSettingsExclusions';
export const ORGANIZE_IMPORTS_ON_PASTE = 'actionsOnPaste.organizeImports'; // java.actionsOnPaste.organizeImports

let oldConfig: WorkspaceConfiguration = getJavaConfiguration();
const gradleWrapperPromptDialogs = [];

export function onConfigurationChange(workspacePath: string, context: ExtensionContext) {
	return workspace.onDidChangeConfiguration(params => {
		if (!params.affectsConfiguration('java')) {
			return;
		}
		const newConfig = getJavaConfiguration();
		if (newConfig.get(EXCLUDE_FILE_CONFIG)) {
			excludeProjectSettingsFiles();
		}

		const isFsModeChanged: boolean = hasConfigKeyChanged('import.generatesMetadataFilesAtProjectRoot', oldConfig, newConfig);
		if (isFsModeChanged) {
			// Changing the FS mode needs a clean restart.
			ensureExists(workspacePath);
			const file = path.join(workspacePath, cleanWorkspaceFileName);
			fs.closeSync(fs.openSync(file, 'w'));
		}
		if (isFsModeChanged || hasJavaConfigChanged(oldConfig, newConfig)) {
			const msg = `Java Language Server configuration changed, please reload ${env.appName}.`;
			const action = 'Reload';
			const restartId = Commands.RELOAD_WINDOW;
			window.showWarningMessage(msg, action).then((selection) => {
				if (action === selection) {
					commands.executeCommand(restartId);
				}
			});
		}
		if (hasConfigKeyChanged('jdt.ls.lombokSupport.enabled', oldConfig, newConfig)) {
			if (newConfig.get("jdt.ls.lombokSupport.enabled")) {
				const msg = `Lombok support is enabled, please reload ${env.appName}.`;
				const action = 'Reload';
				const restartId = Commands.RELOAD_WINDOW;
				window.showWarningMessage(msg, action).then((selection) => {
					if (action === selection) {
						commands.executeCommand(restartId);
					}
				});
			}
			else {
				cleanupLombokCache(context);
				const msg = `Lombok support is disabled, please reload ${env.appName}.`;
				const action = 'Reload';
				const restartId = Commands.RELOAD_WINDOW;
				window.showWarningMessage(msg, action).then((selection) => {
					if (action === selection) {
						commands.executeCommand(restartId);
					}
				});
			}
		}
		// update old config
		oldConfig = newConfig;
	});
}

export function excludeProjectSettingsFiles() {
	if (workspace.workspaceFolders && workspace.workspaceFolders.length) {
		workspace.workspaceFolders.forEach((folder) => {
			excludeProjectSettingsFilesForWorkspace(folder.uri);
		});
	}
}

function excludeProjectSettingsFilesForWorkspace(workspaceUri: Uri) {
	const javaConfig = getJavaConfiguration();
	const checkExclusionConfig = javaConfig.get(EXCLUDE_FILE_CONFIG);
	if (checkExclusionConfig) {
		const config = workspace.getConfiguration('files', workspaceUri);
		const excludedValue: Object = config.get('exclude');
		const needExcludeFiles: string[] = [];

		let needUpdate = false;
		for (const hiddenFile of DEFAULT_HIDDEN_FILES) {
			if (!excludedValue.hasOwnProperty(hiddenFile)) {
				needExcludeFiles.push(hiddenFile);
				needUpdate = true;
			}
		}
		if (needUpdate) {
			const excludedInspectedValue = config.inspect('exclude');
			const checkExclusionInWorkspace = javaConfig.inspect(EXCLUDE_FILE_CONFIG).workspaceValue;
			if (checkExclusionInWorkspace) {
				const workspaceValue = excludedInspectedValue.workspaceValue || {};
				for (const hiddenFile of needExcludeFiles) {
					workspaceValue[hiddenFile] = true;
				}
				config.update('exclude', workspaceValue, ConfigurationTarget.Workspace);
			} else {
				// by default save to global settings
				const globalValue = excludedInspectedValue.globalValue = excludedInspectedValue.globalValue || {};
				for (const hiddenFile of needExcludeFiles) {
					globalValue[hiddenFile] = true;
				}
				config.update('exclude', globalValue, ConfigurationTarget.Global);
			}
		}
	}
}

function hasJavaConfigChanged(oldConfig: WorkspaceConfiguration, newConfig: WorkspaceConfiguration) {
	return hasConfigKeyChanged('jdt.ls.java.home', oldConfig, newConfig)
		|| hasConfigKeyChanged('home', oldConfig, newConfig)
		|| hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig)
		|| hasConfigKeyChanged('server.launchMode', oldConfig, newConfig)
		|| hasConfigKeyChanged('sharedIndexes.location', oldConfig, newConfig)
		|| hasConfigKeyChanged('transport', oldConfig, newConfig)
		|| hasConfigKeyChanged('diagnostic.filter', oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	const oldValue = oldConfig.get(key);
	const newValue = newConfig.get(key);
	return Array.isArray(oldValue) && Array.isArray(newValue)
		? JSON.stringify(oldValue) !== JSON.stringify(newValue)
		: oldValue !== newValue;
}

export function getJavaEncoding(): string {
	const config = workspace.getConfiguration();
	const languageConfig = config.get('[java]');
	let javaEncoding = null;
	if (languageConfig) {
		javaEncoding = languageConfig['files.encoding'];
	}
	if (!javaEncoding) {
		javaEncoding = config.get<string>('files.encoding', 'UTF-8');
	}
	return javaEncoding;
}

export async function checkJavaPreferences(context: ExtensionContext): Promise<{javaHome?: string; preference: string}> {
	const allow = 'Allow';
	const disallow = 'Disallow';
	let preference: string = 'java.jdt.ls.java.home';
	let javaHome = workspace.getConfiguration().inspect<string>('java.jdt.ls.java.home').workspaceValue;
	let isVerified = javaHome === undefined || javaHome === null;
	if (isVerified) {
		javaHome = getJavaConfiguration().get('jdt.ls.java.home');
	}
	const key = getKey(IS_WORKSPACE_JLS_JDK_ALLOWED, context.storagePath, javaHome);
	const globalState = context.globalState;
	if (!isVerified) {
		isVerified = workspace.isTrusted || globalState.get(key);
		if (isVerified === undefined) {
			await window.showErrorMessage(`Security Warning! Do you allow this workspace to set the java.jdt.ls.java.home variable? \n java.jdt.ls.java.home: ${javaHome}`, disallow, allow).then(async selection => {
				if (selection === allow) {
					globalState.update(key, true);
				} else if (selection === disallow) {
					globalState.update(key, false);
					await workspace.getConfiguration().update('java.jdt.ls.java.home', undefined, ConfigurationTarget.Workspace);
				}
			});
			isVerified = globalState.get(key);
		}
		if (!isVerified) { // java.jdt.ls.java.home from workspace settings is disallowed.
			javaHome = workspace.getConfiguration().inspect<string>('java.jdt.ls.java.home').globalValue;
		}
	}

	if (!javaHome) { // Read java.home from the deprecated "java.home" setting.
		preference = 'java.home';
		javaHome = workspace.getConfiguration().inspect<string>('java.home').workspaceValue;
		isVerified = javaHome === undefined || javaHome === null;
		if (isVerified) {
			javaHome = getJavaConfiguration().get('home');
		}
		const key = getKey(IS_WORKSPACE_JDK_ALLOWED, context.storagePath, javaHome);
		const globalState = context.globalState;
		if (!isVerified) {
			isVerified = workspace.isTrusted || globalState.get(key);
			if (isVerified === undefined) {
				await window.showErrorMessage(`Security Warning! Do you allow this workspace to set the java.home variable? \n java.home: ${javaHome}`, disallow, allow).then(async selection => {
					if (selection === allow) {
						globalState.update(key, true);
					} else if (selection === disallow) {
						globalState.update(key, false);
						await workspace.getConfiguration().update('java.home', undefined, ConfigurationTarget.Workspace);
					}
				});
				isVerified = globalState.get(key);
			}
			if (!isVerified) { // java.home from workspace settings is disallowed.
				javaHome = workspace.getConfiguration().inspect<string>('java.home').globalValue;
			}
		}
	}

	const vmargs = workspace.getConfiguration().inspect('java.jdt.ls.vmargs').workspaceValue;
	if (vmargs !== undefined) {
		const isWorkspaceTrusted = (workspace as any).isTrusted; // keep compatibility for old engines < 1.56.0
		const agentFlag = getJavaagentFlag(vmargs);
		if (agentFlag !== null && (isWorkspaceTrusted === undefined || !isWorkspaceTrusted)) {
			const keyVmargs = getKey(IS_WORKSPACE_VMARGS_ALLOWED, context.storagePath, vmargs);
			const vmargsVerified = globalState.get(keyVmargs);
			if ((vmargsVerified === undefined || vmargsVerified === null) && (workspace.workspaceFolders && isInWorkspaceFolder(agentFlag, workspace.workspaceFolders))) {
				await window.showErrorMessage(`Security Warning! The java.jdt.ls.vmargs variable defined in ${env.appName} settings includes the (${agentFlag}) javagent preference. Do you allow it to be used?`, disallow, allow).then(async selection => {
					if (selection === allow) {
						globalState.update(keyVmargs, true);
					} else if (selection === disallow) {
						globalState.update(keyVmargs, false);
						await workspace.getConfiguration().update('java.jdt.ls.vmargs', undefined, ConfigurationTarget.Workspace);
					}
				});
			}
		}
	}

	return {
		javaHome,
		preference
	};
}

export function getKey(prefix, storagePath, value) {
	const workspacePath = path.resolve(`${storagePath}/jdt_ws`);
	if (workspace.name !== undefined) {
		return `${prefix}::${workspacePath}::${value}`;
	}
	else {
		return `${prefix}::${value}`;
	}
}

export function getJavaagentFlag(vmargs) {
	const javaagent = '-javaagent:';
	const args = vmargs.split(" ");
	let agentFlag = null;
	for (const arg of args) {
		if (arg.startsWith(javaagent)) {
			agentFlag = arg.substring(javaagent.length);
			break;
		}
	}
	return agentFlag;
}

export function isInWorkspaceFolder(loc: string, workspaceFolders: readonly WorkspaceFolder[]) {
	return !path.isAbsolute(loc) || workspaceFolders.some(dir => loc.startsWith(dir.uri.fsPath));
}

export enum ServerMode {
	standard = 'Standard',
	lightWeight = 'LightWeight',
	hybrid = 'Hybrid'
}

export function getJavaServerMode(): ServerMode {
	return workspace.getConfiguration().get('java.server.launchMode')
		|| ServerMode.hybrid;
}

export function validateAllOpenBuffersOnChanges(): boolean {
	return workspace.getConfiguration().get('java.edit.validateAllOpenBuffersOnChanges');
}

export function setGradleWrapperChecksum(wrapper: string, sha256?: string) {
	const opened = gradleWrapperPromptDialogs.filter(v => (v === sha256));
	if (opened !== null && opened.length > 0) {
		return;
	}
	gradleWrapperPromptDialogs.push(sha256);
	const allow = 'Trust';
	const disallow = 'Do not trust';
	window.showErrorMessage(`"Security Warning! The gradle wrapper '${wrapper}'" [sha256 '${sha256}'] [could be malicious](https://github.com/redhat-developer/vscode-java/wiki/Gradle-Support#suspicious.wrapper). Should it be trusted?";`, disallow, allow)
		.then(async selection => {
			let allowed;
			if (selection === allow) {
				allowed = true;
			} else if (selection === disallow) {
				allowed = false;
			} else {
				unregisterGradleWrapperPromptDialog(sha256);
				return false;
			}
			const key = "java.imports.gradle.wrapper.checksums";
			let property: any = workspace.getConfiguration().inspect<string>(key).globalValue;
			if (!Array.isArray(property)) {
				property = [];
			}
			const entry = property.filter(p => (p.sha256 === sha256));
			if (entry === null || entry.length === 0) {
				property.push({ sha256: sha256, allowed: allowed });
				workspace.getConfiguration().update(key, property, ConfigurationTarget.Global);
			}
			unregisterGradleWrapperPromptDialog(sha256);
		});
}

function unregisterGradleWrapperPromptDialog(sha256: string) {
	const index = gradleWrapperPromptDialogs.indexOf(sha256);
	if (index > -1) {
		gradleWrapperPromptDialogs.splice(index, 1);
	}
}

let serverReady = false;

export function handleTextDocumentChanges(document: TextDocument, changes: readonly import("vscode").TextDocumentContentChangeEvent[]): any {
	if (!serverReady) {
		apiManager.getApiInstance().serverReady().then(() => {
			serverReady = true;
		});
	}
	const activeTextEditor = window.activeTextEditor;
	const activeDocument = activeTextEditor && activeTextEditor.document;
	if (document !== activeDocument || changes.length === 0 || document.languageId !== 'java') {
		setActive(false);
		return;
	}
	const lastChange = changes[changes.length - 1];
	if (lastChange.text === null || lastChange.text.length <= 0) {
		setActive(false);
		return;
	}
	if (lastChange.text !== '"""";') {
		if (lastChange.text === ';' && serverReady && !isActive()) {
			smartSemicolonDetection();
		}
		setActive(false);
		return;
	}
	setActive(false);
	const selection = activeTextEditor.selection.active;
	if (selection !== null) {
		const start = new Position(selection.line, selection.character - 2);
		const end = new Position(selection.line, selection.character + 4);
		const range = new Range(start, end);
		const activeText = activeDocument.getText(range);
		if (activeText === '""""""') {
			const tabSize = <number>activeTextEditor.options.tabSize!;
			const tabSpaces = <boolean>activeTextEditor.options.insertSpaces!;
			const indentLevel = 2;
			const indentSize = tabSpaces ? indentLevel * tabSize : indentLevel;
			const repeatChar = tabSpaces ? ' ' : '\t';
			const text = `\n${repeatChar.repeat(indentSize)}\$\{0\}\n${repeatChar.repeat(indentSize)}`;
			const position = new Position(selection.line, selection.character + 1);
			activeTextEditor.insertSnippet(new SnippetString(text), position);
		}
	}
}

export async function getImportMode(context: ExtensionContext, selector: BuildFileSelector): Promise<ImportMode> {
	const mode = getJavaConfiguration().get<string>("import.projectSelection");
	if (mode === "manual") {
		// use automatic mode if user has selected "Import All" before.
		if (context.workspaceState.get(IMPORT_METHOD) === "Import All") {
			return ImportMode.automatic;
		}

		// if no selectable build files, use automatic mode
		const hasBuildFiles = await selector.hasBuildFiles();
		if (!hasBuildFiles) {
			return ImportMode.automatic;
		}

		// If the the manually picked build files has already cached, return manual mode.
		if (context.workspaceState.get(PICKED_BUILD_FILES) !== undefined) {
			return ImportMode.manual;
		}

		const answer: string = await window.showInformationMessage(
			"Java build files are detected in the workspace. How do you want to import them?",
			{ modal: true },
			"Import All", "Let Me Select...");
		if (answer === "Import All") {
			context.workspaceState.update(IMPORT_METHOD, "Import All");
			return ImportMode.automatic;
		} else if (answer === "Let Me Select...") {
			return ImportMode.manual;
		}

		return ImportMode.skip;
	}

	return ImportMode.automatic;
}

export enum ImportMode {
	automatic = 'automatic',
	manual = 'manual',
	skip = 'skip',
}
