'use strict';

import * as assert from 'assert';
import * as path from 'path';
import { ExtensionAPI, extensionApiVersion, ClasspathResult } from '../../src/extension.api';
import { Uri, DocumentSymbol, extensions, commands } from 'vscode';
import { ServerMode } from '../../src/settings';
import * as fse from 'fs-extra';
import { getJavaConfiguration } from '../../src/utils';
import { Commands } from '../../src/commands';
import { constants } from '../common';
import { env } from 'process';

const pomPath: string = path.join(constants.projectFsPath, 'pom.xml');
const gradleTestFolder: string = path.join(constants.projectFsPath, 'testGradle');

suite('Public APIs - Standard', () => {

	suiteSetup(async function() {
		getJavaConfiguration().update('configuration.updateBuildConfiguration', 'automatic');
		getJavaConfiguration().update('server.launchMode', 'Standard');
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
		assert.equal(api.status, 'Started');
	});

	test('registerHoverCommand should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		// TODO: To test this API, we need to import hoverProvider and trigger hoverProvider.provideHover().
		// Since the main entry is dist/extension, import hoverProvider from 'out/' won't work because of the
		// different context scope.
		assert.ok(api.registerHoverCommand);
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

	test('getProjectSettings should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const projectSetting: {} = await api.getProjectSettings(
			Uri.file(constants.projectFsPath).toString(),
			['org.eclipse.jdt.core.compiler.compliance', 'org.eclipse.jdt.core.compiler.source'],
		);
		assert.equal(projectSetting['org.eclipse.jdt.core.compiler.compliance'], '1.7');
		assert.equal(projectSetting['org.eclipse.jdt.core.compiler.source'], '1.7');
	});

	test('getClasspaths should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		let classpathResult: ClasspathResult = await api.getClasspaths(Uri.file(constants.projectFsPath).toString(), {scope: 'runtime'});
		assert.equal(classpathResult.classpaths.length, 2);
		for (const classpath of classpathResult.classpaths) {
			if (classpath.endsWith('test-classes')) {
				assert.fail('Classpath with runtime scope should not containing tests');
			}
		}

		classpathResult = await api.getClasspaths(Uri.file(constants.projectFsPath).toString(), {scope: 'test'});
		assert.equal(classpathResult.classpaths.length, 3);
	});

	test('isTestFile should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		const isTest: boolean = await api.isTestFile(Uri.file(path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo.java')).toString());
		assert.ok(!isTest);
	});

	test('onDidClasspathUpdate should work', async function () {
		if (env['SKIP_CLASSPATH_TEST'] === 'true') {
			console.log('Skipping "onDidClasspathUpdate should work"');
			return;
		}
		const pomContent: string = await fse.readFile(pomPath, 'utf-8');
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;

		await new Promise<void>(async (resolve) => {
			api.onDidClasspathUpdate((uri) => {
				assert.equal(path.relative(uri.fsPath, constants.projectFsPath), '');
				return resolve();
			});
			await fse.writeFile(pomPath,
				pomContent.replace('<version>3.5</version>', '<version>3.4</version>'), {encoding: 'utf-8'});
		});
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
		assert.equal(api.serverMode, ServerMode.standard);
	});

	test('onDidServerModeChange should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		assert.ok(api.onDidServerModeChange);
	});

	test('onDidProjectsImport should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;

		await fse.ensureDir(gradleTestFolder);
		await fse.createFile(path.join(gradleTestFolder, 'build.gradle'));

		await new Promise<void>(async (resolve) => {
			api.onDidProjectsImport(() => {
				return resolve();
			});
			await commands.executeCommand(Commands.IMPORT_PROJECTS_CMD);
		});
	});

	test('serverReady() should work', async function () {
		const api: ExtensionAPI = extensions.getExtension('redhat.java').exports;
		await api.serverReady();
	});

	suiteTeardown(async function() {
		// revert the pom content
		const pomContent: string = await fse.readFile(pomPath, 'utf-8');
		await fse.writeFile(pomPath,
			pomContent.replace('<version>3.4</version>', '<version>3.5</version>'), {encoding: 'utf-8'});

		// delete the generated temp folder
		await fse.remove(gradleTestFolder);
	});
});
