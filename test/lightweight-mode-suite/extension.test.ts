import * as assert from 'assert';
import * as vscode from 'vscode';
import { Commands } from '../../src/commands';
import { extensions } from 'vscode';

// tslint:disable: only-arrow-functions
suite('Java Language Extension - LightWeight', () => {

	suiteSetup(async function() {
		await extensions.getExtension('redhat.java').activate();
	});

	test('should register syntax-only java commands', () => {
		return vscode.commands.getCommands(true).then((commands) =>
		{
			const JAVA_COMMANDS = [
				Commands.EXECUTE_WORKSPACE_COMMAND,
				Commands.OPEN_SERVER_LOG,
				Commands.OPEN_CLIENT_LOG,
				Commands.OPEN_LOGS,
				Commands.OPEN_FORMATTER,
				Commands.CLEAN_WORKSPACE,
				Commands.SWITCH_SERVER_MODE,
			];
			const foundJavaCommands = commands.filter((value) => {
				return JAVA_COMMANDS.indexOf(value)>=0 || value.startsWith('java.');
			});
			assert.equal(foundJavaCommands.length , JAVA_COMMANDS.length, 'Some Java commands are not registered properly or a new command is not added to the test');
		});
	});
});
