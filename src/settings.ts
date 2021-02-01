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
const gradleWrapperPromptDialogs = [];

export function onConfigurationChange() {
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
	const allow = 'Allow';
	const disallow = 'Disallow';
	let javaHome = workspace.getConfiguration().inspect<string>('java.home').workspaceValue;
	let isVerified = javaHome === undefined || javaHome === null;
	if (isVerified) {
		javaHome = getJavaConfiguration().get('home');
	}
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
