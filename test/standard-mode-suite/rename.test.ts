'use strict';

import * as path from 'path';
import * as fse from "fs-extra";
import { Uri, extensions, TextDocument, workspace, WorkspaceEdit } from 'vscode';
import { constants } from '../common';

const originFilePath: string = path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo.java');
const newFilePath: string = path.join(constants.projectFsPath, 'src', 'main', 'java', 'java', 'Foo1.java');

// Rename refactoring will pop up a dialog for confirm, didn't find a way to bypass it. So skip this test case.
// tslint:disable: only-arrow-functions
suite.skip('Rename tests', () => {

	suiteSetup(async function() {
		await extensions.getExtension('redhat.java').activate();
	});

	test('rename on file will update the class name', async function () {
		const workspaceEdit: WorkspaceEdit = new WorkspaceEdit();
		workspaceEdit.renameFile(Uri.file(originFilePath), Uri.file(newFilePath));
		await workspace.applyEdit(workspaceEdit);

		const document: TextDocument = await workspace.openTextDocument(Uri.file(path.join(newFilePath)));
		// wait for the extension to update the class name,
		// if it's not updated, this case will fail on timeout - 60s.
		while (true) {
			await sleep(5 * 1000 /*ms*/);
			if (document.getText().includes("public class Foo1")) {
				break;
			}
		}
	});

	suiteTeardown(async function() {
		// revert the rename changes
		if (await fse.pathExists(newFilePath)) {
			const workspaceEdit: WorkspaceEdit = new WorkspaceEdit();
			workspaceEdit.renameFile(Uri.file(newFilePath), Uri.file(originFilePath));
			await workspace.applyEdit(workspaceEdit);

			const document: TextDocument = await workspace.openTextDocument(Uri.file(path.join(originFilePath)));
			while (true) {
				await sleep(5 * 1000 /*ms*/);
				if (document.getText().includes("public class Foo")) {
					break;
				}
			}
		}
	});
});

async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}