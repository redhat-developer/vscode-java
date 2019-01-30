'use strict';

import { window, Uri, workspace, WorkspaceConfiguration, commands, ConfigurationTarget } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { getJavaConfiguration } from './utils';


const DEFAULT_HIDDEN_FILES: string[] = ['**/.classpath', '**/.project', '**/.settings'];

let oldConfig: WorkspaceConfiguration = getJavaConfiguration();

export function onConfigurationChange() {
	return workspace.onDidChangeConfiguration(params => {
		if (!params.affectsConfiguration('java')) {
			return;
		}
		let newConfig = getJavaConfiguration();
		if (hasJavaConfigChanged(oldConfig, newConfig)) {
			let msg = 'Java Language Server configuration changed, please restart VS Code.';
			let action = 'Restart Now';
			let restartId = Commands.RELOAD_WINDOW;
			oldConfig = newConfig;
			window.showWarningMessage(msg, action).then((selection) => {
				if (action === selection) {
					commands.executeCommand(restartId);
				}
			});
		}
	});
}

export function excludeProjectSettingsFiles(workspaceUri: Uri) {
	const excudedConfig = getJavaConfiguration().get('configuration.excludeProjectSettingsFiles');
	if (excudedConfig) {
		const config = workspace.getConfiguration('files', workspaceUri);
		const excludedValue: Object = config.get('exclude');
		const needExcludeFiles: Object = {};

		let needUpdate = false;
		for (const hiddenFiles of DEFAULT_HIDDEN_FILES) {
			if (!excludedValue.hasOwnProperty(hiddenFiles)) {
				needExcludeFiles[hiddenFiles] = true;
				needUpdate = true;
			}
		}
		if (needUpdate) {
			window.showInformationMessage('Do you want to exclude the VSCode Java project settings files(.classpath, .project. .settings) from the file explorer.', 'Always', 'Workspace', 'Never').then((result) => {
				if (result === 'Always') {
					config.update('exclude', needExcludeFiles, ConfigurationTarget.Global);
				} if (result === 'Workspace') {
					config.update('exclude', needExcludeFiles, ConfigurationTarget.Workspace);
				} else if (result === 'Never') {
					getJavaConfiguration().update('configuration.excludeProjectSettingsFiles', false, ConfigurationTarget.Global);
				}
			});
		}
	}
}

function hasJavaConfigChanged(oldConfig: WorkspaceConfiguration, newConfig: WorkspaceConfiguration) {
	return hasConfigKeyChanged('home', oldConfig, newConfig)
		|| hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig)
		|| hasConfigKeyChanged('progressReports.enabled', oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	return oldConfig.get(key) !== newConfig.get(key);
}
