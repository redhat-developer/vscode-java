'use strict';

import { window, Uri, workspace, WorkspaceConfiguration, commands, ConfigurationTarget, env, ExtensionContext, TextEditor, Range, Disposable } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { Commands } from './commands';
import { getJavaConfiguration } from './utils';

const DEFAULT_HIDDEN_FILES: string[] = ['**/.classpath', '**/.project', '**/.settings', '**/.factorypath'];

const changeItem = {
	global: 'Exclude globally',
	workspace: 'Exclude in workspace',
	never: 'Never'
};

const EXCLUDE_FILE_CONFIG = 'configuration.checkProjectSettingsExclusions';
export const ORGANIZE_IMPORTS_ON_PASTE = 'actionsOnPaste.organizeImports'; // java.actionsOnPaste.organizeImports
// index of the paste disposable in the subscriptions array
let pasteSubscriptionIndex;

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
		handleJavaPasteConfigurationChange(languageClient, context, newConfig);
		// update old config
		oldConfig = newConfig;
	});
}

/**
 * Starting point for any settings that need to be handled when the server starts
 * @param languageClient
 * @param context
 */
export function initializeSettings(languageClient: LanguageClient, context: ExtensionContext) {
	handleInitialConfigurations(languageClient, context, getJavaConfiguration());
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
					getJavaConfiguration().update(EXCLUDE_FILE_CONFIG, false, storeInWorkspace?ConfigurationTarget.Workspace: ConfigurationTarget.Global);
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

export function handleInitialConfigurations(languageClient: LanguageClient, context: ExtensionContext, newConfig: WorkspaceConfiguration) {
	// organize imports on paste registration
	if (newConfig.get(ORGANIZE_IMPORTS_ON_PASTE)) {
		registerOverridePasteCommand(languageClient, context);
	}
}

export function handleJavaPasteConfigurationChange(languageClient: LanguageClient, context: ExtensionContext, newConfig: WorkspaceConfiguration) {
	const oldOrganizeImportsOnPaste = oldConfig.get(ORGANIZE_IMPORTS_ON_PASTE);
	const newOrganizeImportsOnPaste = newConfig.get(ORGANIZE_IMPORTS_ON_PASTE);
	if (oldOrganizeImportsOnPaste !== newOrganizeImportsOnPaste) {
		if (newOrganizeImportsOnPaste === true) {
			registerOverridePasteCommand(languageClient, context);
		}
		else {
			unregisterOverridePasteCommand(languageClient, context);
		}
	}
}

export function registerOverridePasteCommand(languageClient: LanguageClient, context: ExtensionContext): void {
    // referencing https://github.com/gazugafan/vscode-indent-on-paste/blob/master/src/extension.ts
    const length = context.subscriptions.push(commands.registerCommand('editor.action.clipboardPasteAction', async () => {

        const clipboardText: string = await env.clipboard.readText();
        const editor: TextEditor = window.activeTextEditor;
        const documentText: string = editor.document.getText();
        const isCursorOnly = editor.selection.isEmpty;
        let action: Thenable<boolean>;
        if (isCursorOnly) {
            action = editor.edit(textInserter => {
                textInserter.insert(editor.selection.start, clipboardText);
            });
        }
        else {
            const start = editor.selection.start;
            const end = editor.selection.end;
            action = editor.edit(textInserter => {
                textInserter.replace(new Range(start, end), clipboardText);
            });
        }

        action.then((wasApplied) => {
            const fileURI = editor.document.uri.toString();
            if (wasApplied && fileURI.endsWith(".java")) {
                const hasText: boolean = documentText !== null && /\S/.test(documentText);
                if (hasText) {
                    // Organize imports silently to avoid surprising the user
                    commands.executeCommand(Commands.ORGANIZE_IMPORTS_SILENTLY, fileURI);
                } else {
                    commands.executeCommand(Commands.ORGANIZE_IMPORTS, { textDocument: { uri: fileURI } });
                }
            }
        });
    }));

    pasteSubscriptionIndex = length - 1;
    languageClient.info(`Registered 'java.${ORGANIZE_IMPORTS_ON_PASTE}' command.`);
}

export function unregisterOverridePasteCommand(languageClient: LanguageClient, context: ExtensionContext) {
	if (pasteSubscriptionIndex !== null) {
		const pasteDisposable: Disposable = context.subscriptions[pasteSubscriptionIndex];
		pasteDisposable.dispose();
		pasteSubscriptionIndex = null;
		languageClient.info(`Unregistered 'java.${ORGANIZE_IMPORTS_ON_PASTE}' command.`);
	}
}
