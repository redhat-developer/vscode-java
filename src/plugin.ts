'use strict'

import * as path from 'path';
import { extensions } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { BundleRequestParams, BundleRequest } from './protocol';

export function loadPlugins(languageClient: LanguageClient): void {
	const plugins = collectionExtensions();
	for (const plugin of plugins) {
		const params: BundleRequestParams = { params: ['install', plugin] }
		languageClient.sendRequest(BundleRequest.type, params);
	}
}

function collectionExtensions(): string[] {
	let result = [];
	for (let extension of extensions.all) {
		let contributesSection = extension.packageJSON['contributes'];
		if (contributesSection) {
			let javaExtensions = contributesSection['javaExtensions'];
			if (Array.isArray(javaExtensions) && javaExtensions.length) {
				for (let javaExtensionPath of javaExtensions) {
					result.push(path.resolve(extension.extensionPath, javaExtensionPath));
				}
			}
		}
	}
	return result;
}