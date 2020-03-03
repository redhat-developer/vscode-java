'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { workspace, WorkspaceConfiguration } from 'vscode';

export function getJavaConfiguration(): WorkspaceConfiguration {
	return workspace.getConfiguration('java');
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
