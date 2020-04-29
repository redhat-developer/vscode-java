'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { workspace, WorkspaceConfiguration } from 'vscode';

export function getJavaConfiguration(): WorkspaceConfiguration {
	return workspace.getConfiguration('java');
}

export function isPreferenceOverridden(section: string): boolean {
	const config = workspace.getConfiguration();
	return config.inspect(section).workspaceFolderValue !== undefined ||
			config.inspect(section).workspaceFolderLanguageValue !== undefined ||
			config.inspect(section).workspaceValue !== undefined ||
			config.inspect(section).workspaceLanguageValue !== undefined ||
			config.inspect(section).globalValue !== undefined ||
			config.inspect(section).globalLanguageValue !== undefined;
}

export function deleteDirectory(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach((child) => {
			const entry = path.join(dir, child);
			if (fs.lstatSync(entry).isDirectory()) {
				deleteDirectory(entry);
			} else {
				fs.unlinkSync(entry);
			}
		});
		fs.rmdirSync(dir);
	}
}

export function getTimestamp(file) {
	if (!fs.existsSync(file)) {
		return -1;
	}
	const stat = fs.statSync(file);
	return stat.mtimeMs;
}

export function ensureExists(folder) {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
}
