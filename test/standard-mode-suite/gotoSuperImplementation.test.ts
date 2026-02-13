'use strict';

import * as assert from 'assert';
import * as path from 'path';
import { commands, extensions, Position, Selection, TextDocument, Uri, window, workspace } from 'vscode';
import { Commands } from '../../src/commands';
import { ExtensionAPI } from '../../src/extension.api';

const projectFsPath: string = path.join(__dirname, '..', '..', '..', 'test', 'resources', 'projects', 'maven', 'salut');
const fileFsPath: string = path.join(projectFsPath, 'src', 'main', 'java', 'java', 'Foo3.java');

suite('Goto Super Implementation', () => {

	suiteSetup(async function() {
		const api: ExtensionAPI = await extensions.getExtension('redhat.java').activate();
		await api.serverReady();
	});

	test('go to super implementation should work', async function () {
		const document: TextDocument = await workspace.openTextDocument(Uri.file(path.join(fileFsPath)));
		await window.showTextDocument(document);
		window.activeTextEditor.selection = new Selection(
			new Position(22, 18),
			new Position(22, 18),
		);

		await commands.executeCommand(Commands.NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND);

		assert.equal(path.basename(window.activeTextEditor.document.fileName), "Object.java");
	});
});
