'use strict';

import * as assert from 'assert';
import * as path from 'path';
import * as sinon from 'sinon';
import { Uri } from 'vscode';
import { TextDocumentIdentifier } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { projectConfigurationUpdate } from '../../src/standardLanguageClientUtils';

const projectFsPath: string = path.join(__dirname, '..', '..', '..', 'test', 'resources', 'projects', 'maven', 'salut');

// tslint:disable: only-arrow-functions
suite('Project Operations Test', () => {

	test('Reload project by test document identifier', async function () {
		const client = new LanguageClient('mock client', null, null);
		const sendNotificationStub = sinon.stub(client, 'sendNotification');

		const pomPath = path.join(projectFsPath, 'pom.xml');
		const identifier: TextDocumentIdentifier = {
			uri: Uri.file(pomPath).toString(),
		};

		await projectConfigurationUpdate(client, identifier);

		assert.ok(sendNotificationStub.calledOnce);
	});

	test('Reload project by Uri instance', async function () {
		const client = new LanguageClient('mock client', null, null);
		const sendNotificationStub = sinon.stub(client, 'sendNotification');

		const pomPath = path.join(projectFsPath, 'pom.xml');

		await projectConfigurationUpdate(client, Uri.file(pomPath));

		assert.ok(sendNotificationStub.calledOnce);
	});

	test('Reload project by Uri array', async function () {
		const client = new LanguageClient('mock client', null, null);
		const sendNotificationStub = sinon.stub(client, 'sendNotification');

		const pomPath = path.join(projectFsPath, 'pom.xml');

		await projectConfigurationUpdate(client, [Uri.file(pomPath)]);

		assert.ok(sendNotificationStub.calledOnce);
	});

});
