'use strict';

import { window, Uri, workspace, WorkspaceConfiguration, commands } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { getJavaConfiguration } from './utils';


const DEFAULT_HIIDEN_FILES: string[] = ['**/.classpath', '**/.project', '**/.settings'];

let oldConfig = getJavaConfiguration();

export function onConfigurationChange() {
	return workspace.onDidChangeConfiguration(params => {
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

export function excludeProjectSettingFiles(workspaceUri: Uri) {
	if (getJavaConfiguration().get<Boolean>('configuration.excludeProjectSettingFiles')) {
		const config = workspace.getConfiguration('files', workspaceUri);
		const excludeValue: Object = config.get('exclude');

		for (const hiddenFiles of DEFAULT_HIIDEN_FILES) {
			if (!excludeValue.hasOwnProperty(hiddenFiles)) {
				excludeValue[hiddenFiles] = true;
			}

		}
		config.update('exclude', excludeValue);
	}
}

function hasJavaConfigChanged(oldConfig, newConfig) {
	return hasConfigKeyChanged('home', oldConfig, newConfig)
		|| hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig)
		|| hasConfigKeyChanged('progressReports.enabled', oldConfig, newConfig);
}

function hasConfigKeyChanged(key, oldConfig, newConfig) {
	return oldConfig.get(key) !== newConfig.get(key);
}
