import * as assert from 'assert';
import * as vscode from 'vscode';
import { extensions } from 'vscode';
import { Commands } from '../../src/commands';

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
				Commands.OPEN_SERVER_STDOUT_LOG,
				Commands.OPEN_SERVER_STDERR_LOG,
				Commands.OPEN_CLIENT_LOG,
				Commands.OPEN_LOGS,
				Commands.OPEN_FORMATTER,
				Commands.CLEAN_WORKSPACE,
				Commands.SWITCH_SERVER_MODE,
				Commands.OPEN_FILE,
				Commands.CLEAN_SHARED_INDEXES,
				Commands.RESTART_LANGUAGE_SERVER,
				Commands.FILESEXPLORER_ONPASTE,
				Commands.CHANGE_JAVA_SEARCH_SCOPE
			].sort();
			const foundJavaCommands = commands.filter((value) => {
				return JAVA_COMMANDS.indexOf(value)>=0 || value.startsWith('java.');
			}).sort();
			assert.deepEqual(foundJavaCommands, JAVA_COMMANDS, `Some Java commands are not registered properly or a new command is not added to the test.\nActual: ${foundJavaCommands}\nExpected: ${JAVA_COMMANDS}`);
		});
	});
});
