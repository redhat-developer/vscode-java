'use strict';

import * as path from 'path';
import { window, Uri, workspace, WorkspaceConfiguration, commands, ConfigurationTarget, env, ExtensionContext, TextEditor, Range, Disposable } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { getJavaConfiguration } from './utils';

const DEFAULT_HIDDEN_FILES: string[] = ['**/.classpath', '**/.project', '**/.settings', '**/.factorypath'];
export const IS_WORKSPACE_JDK_ALLOWED = "java.ls.isJdkAllowed";
export const IS_WORKSPACE_VMARGS_ALLOWED = "java.ls.isVmargsAllowed";
const extensionName = 'Language Support for Java';

const changeItem = {
	global: 'Exclude globally',
	workspace: 'Exclude in workspace',
	never: 'Never'
};

const EXCLUDE_FILE_CONFIG = 'configuration.checkProjectSettingsExclusions';
export const ORGANIZE_IMPORTS_ON_PASTE = 'actionsOnPaste.organizeImports'; // java.actionsOnPaste.organizeImports

let oldConfig: WorkspaceConfiguration = getJavaConfiguration();

export function onConfigurationChange(languageClient: LanguageClient, context: ExtensionContext) {
	return workspace.onDidChangeConfiguration(params => {
		if (!params.affectsConfiguration('java')) {
			return;
		}
		const newConfig = getJavaConfiguration();
		if (newConfig.get(EXCLUDE_FILE_CONFIG)) {
			excludeProjectSettingsFiles();
		}
		if (hasJavaConfigChanged(oldConfig, newConfig)) {
			const msg = `Java Language Server configuration changed, please restart ${env.appName}.`;
			const action = 'Restart Now';
			const restartId = Commands.RELOAD_WINDOW;
			window.showWarningMessage(msg, action).then((selection) => {
				if (action === selection) {
					commands.executeCommand(restartId);
				}
			});
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
	const excudedConfig = getJavaConfiguration().get(EXCLUDE_FILE_CONFIG);
	if (excudedConfig) {
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
			const items = [changeItem.workspace, changeItem.never];
			// Workspace file.exclude is undefined
			if (!excludedInspectedValue.workspaceValue) {
				items.unshift(changeItem.global);
			}

			window.showInformationMessage(`Do you want to exclude the ${env.appName} Java project settings files (.classpath, .project. .settings, .factorypath) from the file explorer?`, ...items).then((result) => {
				if (result === changeItem.global) {
					excludedInspectedValue.globalValue = excludedInspectedValue.globalValue || {};
					for (const hiddenFile of needExcludeFiles) {
						excludedInspectedValue.globalValue[hiddenFile] = true;
					}
					config.update('exclude', excludedInspectedValue.globalValue, ConfigurationTarget.Global);
				} if (result === changeItem.workspace) {
					excludedInspectedValue.workspaceValue = excludedInspectedValue.workspaceValue || {};
					for (const hiddenFile of needExcludeFiles) {
						excludedInspectedValue.workspaceValue[hiddenFile] = true;
					}
					config.update('exclude', excludedInspectedValue.workspaceValue, ConfigurationTarget.Workspace);
				} else if (result === changeItem.never) {
					const storeInWorkspace = getJavaConfiguration().inspect(EXCLUDE_FILE_CONFIG).workspaceValue;
					getJavaConfiguration().update(EXCLUDE_FILE_CONFIG, false, storeInWorkspace ? ConfigurationTarget.Workspace : ConfigurationTarget.Global);
				}
			});
		}
	}
}

function hasJavaConfigChanged(oldConfig: WorkspaceConfiguration, newConfig: WorkspaceConfiguration) {
	return hasConfigKeyChanged('home', oldConfig, newConfig)
		|| hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig)
		|| hasConfigKeyChanged('progressReports.enabled', oldConfig, newConfig)
		|| hasConfigKeyChanged('server.launchMode', oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	return oldConfig.get(key) !== newConfig.get(key);
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

export async function checkJavaPreferences(context: ExtensionContext) {
	let javaHome = workspace.getConfiguration().inspect<string>('java.home').workspaceValue;
	let isVerified = javaHome === undefined || javaHome === null;
	if (isVerified) {
		javaHome = getJavaConfiguration().get('home');
	}
	const allow = 'Allow';
	const disallow = 'Disallow';
	const key = getKey(IS_WORKSPACE_JDK_ALLOWED, context.storagePath, javaHome);
	const globalState = context.globalState;
	if (!isVerified) {
		isVerified = globalState.get(key);
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
	}
	const vmargs = workspace.getConfiguration().inspect('java.jdt.ls.vmargs').workspaceValue;
	if (vmargs !== undefined) {
		const agentFlag = getJavaagentFlag(vmargs);
		if (agentFlag !== null) {
			const keyVmargs = getKey(IS_WORKSPACE_VMARGS_ALLOWED, context.storagePath, vmargs);
			const vmargsVerified = globalState.get(keyVmargs);
			if (vmargsVerified === undefined || vmargsVerified === null) {
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
	if (isVerified) {
		return javaHome;
	} else {
		return workspace.getConfiguration().inspect<string>('java.home').globalValue;
	}
}

export function getKey(prefix, storagePath, value) {
	const workspacePath = path.resolve(storagePath + '/jdt_ws');
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

export enum ServerMode {
	STANDARD = 'Standard',
	LIGHTWEIGHT = 'LightWeight',
	HYBRID = 'Hybrid'
}

export function getJavaServerMode(): ServerMode {
	return workspace.getConfiguration().get('java.server.launchMode')
		|| ServerMode.HYBRID;
}
