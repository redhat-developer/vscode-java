'use strict';

import * as assert from 'assert';
import * as fse from 'fs-extra';
import * as path from 'path';
import { commands, DocumentSymbol, extensions, Uri } from 'vscode';
import { Commands } from '../../src/commands';
import { ClasspathResult, ExtensionAPI, extensionApiVersion } from '../../src/extension.api';
import { ServerMode } from '../../src/settings';
import { getJavaConfiguration } from '../../src/utils';
import { constants } from '../common';

const pomPath: string = path.join(constants.projectFsPath, 'pom.xml');

suite('Public APIs - LightWeight', () => {

	suiteSetup(async function() {
		getJavaConfiguration().update('server.launchMode', 'LightWeight');
		await extensions.getExtension('redhat.java').activate();
	});

	test('version should be correct', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.equal(api.apiVersion, extensionApiVersion);
	});

	test('requirement should be correct', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.ok(api.javaRequirement);
	});

	test('status should be correct', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.equal(api.status, 'Starting');
	});

	test('registerHoverCommand should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.ok(api.registerHoverCommand);
		// TODO: figure out a way to test this API
	});

	test('getDocumentSymbols should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const symbols = await api.getDocumentSymbols({
			textDocument: {
				uri: Uri.file(path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo3.java')).toString(),
			},
		});
		let symbolDetected: boolean = false;
		for (const symbol of symbols) {
			if (symbol.name !== 'Foo3') {
				continue;
			}
			symbolDetected = true;
			// @ts-ignore
			assert.equal((symbol as DocumentSymbol).children.length, 4);
		}
		if (!symbolDetected) {
			assert.fail('Failed to get document symbols');
		}
	});

	test('getProjectSettings should not work in lightweight mode', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const projectSetting: {} = await api.getProjectSettings(
			Uri.file(constants.projectFsPath).toString(),
			['org.eclipse.jdt.core.compiler.compliance', 'org.eclipse.jdt.core.compiler.source'],
		);
		assert.ok(projectSetting === undefined);
	});

	test('getClasspaths should not work in lightweight mode', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const classpathResult: ClasspathResult = await api.getClasspaths(Uri.file(constants.projectFsPath).toString(), {scope: 'runtime'});
		assert.ok(classpathResult === undefined);
	});

	test('isTestFile should not work in lightweight mode', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const isTest: boolean = await api.isTestFile(Uri.file(path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo.java')).toString());
		assert.ok(isTest === undefined);
	});

	test('onDidClasspathUpdate should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.ok(api.onDidClasspathUpdate);
	});

	test('goToDefinition should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const definition = await api.goToDefinition({
			textDocument: {
				uri: Uri.file(path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo3.java')).toString(),
			},
			position: {
				line: 17,
				character: 34
			},
		});
		assert.ok(Uri.parse(definition[0].uri).fsPath,  path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo3.java'));
		assert.deepEqual(definition[0].range, {
			start: {
				character: 21,
				line: 9,
			},
			end: {
				character: 31,
				line: 9,
			},
		});
	});

	test('server mode should be correct', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.equal(api.serverMode, ServerMode.lightWeight);
	});

	test('onDidProjectsImport should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.ok(api.onDidProjectsImport);
	});

	/**
	 * Note: This case will switch the server mode to standard. Please make sure it is run
	 * as the last one whenever you want to add new cases for the lightweight mode.
	 */
	test('onDidServerModeChange should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		let onDidChangeServerModeCount: number = 0;

		await new Promise<void>(async (resolve) => {

			api.onDidServerModeChange((mode) => {
				onDidChangeServerModeCount++;
				if (onDidChangeServerModeCount === 1) {
					assert.equal(mode, ServerMode.hybrid);
				} else if (onDidChangeServerModeCount === 2) {
					assert.equal(mode, ServerMode.standard);
					return resolve();
				}
			});

			await commands.executeCommand(Commands.SWITCH_SERVER_MODE, "Standard", true/* force */);
		});

		assert.equal(onDidChangeServerModeCount, 2);
	});

	suiteTeardown(async function() {
		// revert the pom content
		const pomContent: string = await fse.readFile(pomPath, 'utf-8');
		await fse.writeFile(pomPath,
			pomContent.replace('<version>3.4</version>', '<version>3.5</version>'), {encoding: 'utf-8'});
	});
});
