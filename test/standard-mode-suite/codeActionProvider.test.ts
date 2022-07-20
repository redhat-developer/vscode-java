'use strict';

import * as assert from 'assert';
import * as path from 'path';
import { CodeAction, CodeActionContext, CodeActionKind, CodeActionTriggerKind, DiagnosticSeverity, ExtensionContext, Position, Range, Uri, window } from "vscode";
import { Commands } from '../../src/commands';
import { GradleCodeActionProvider } from '../../src/gradle/gradleCodeActionProvider';
import { PomCodeActionProvider } from "../../src/pom/pomCodeActionProvider";

// tslint:disable: only-arrow-functions
const mavenProjectFsPath: string = path.join(__dirname, '..', '..', '..', 'test', 'resources', 'projects', 'maven', 'salut');
const gradleProjectFsPath: string = path.join(__dirname, '..', '..', '..', 'test', 'resources', 'projects', 'gradle', 'simple-gradle');

suite('Code Action Provider Test', () => {

	test('Provide reload project action on demand for pom file', async function () {
		const contextMock = {
			subscriptions: []
		};
		const provider = new PomCodeActionProvider(contextMock as ExtensionContext);

		const codeActionContext: CodeActionContext = {
			triggerKind: CodeActionTriggerKind.Invoke,
			diagnostics: [{
				range: new Range(new Position(0, 0), new Position(0, 0)),
				message: 'The build file has been changed and may need reload to make it effective.',
				severity: DiagnosticSeverity.Information,
				source: 'Java'
			}],
			only: CodeActionKind.QuickFix
		};
		const editor = await window.showTextDocument(Uri.file(path.join(mavenProjectFsPath, 'pom.xml')));
		const codeActions = provider.provideCodeActions(editor.document, null, codeActionContext, null) as CodeAction[];
		assert.equal(codeActions.length, 1);
		assert.equal(codeActions[0].command.command, Commands.CONFIGURATION_UPDATE);
	});

	test('Provide reload project action on demand for gradle file', async function () {
		const contextMock = {
			subscriptions: []
		};
		const provider = new GradleCodeActionProvider(contextMock as ExtensionContext);

		const codeActionContext: CodeActionContext = {
			triggerKind: CodeActionTriggerKind.Invoke,
			diagnostics: [{
				range: new Range(new Position(0, 0), new Position(0, 0)),
				message: 'The build file has been changed and may need reload to make it effective.',
				severity: DiagnosticSeverity.Information,
				source: 'Java'
			}],
			only: CodeActionKind.QuickFix
		};
		const editor = await window.showTextDocument(Uri.file(path.join(gradleProjectFsPath, 'build.gradle')));
		const codeActions = (await provider.provideCodeActions(editor.document, null, codeActionContext, null)) as CodeAction[];
		assert.equal(codeActions.length, 1);
		assert.equal(codeActions[0].command.command, Commands.CONFIGURATION_UPDATE);
	});

});
