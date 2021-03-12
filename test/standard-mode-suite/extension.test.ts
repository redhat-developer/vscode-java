import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as plugin from '../../src/plugin';
import * as java from '../../src/javaServerStarter';
import * as requirements from '../../src/requirements';
import { Commands } from '../../src/commands';
import { env } from 'process';

// tslint:disable: only-arrow-functions
suite('Java Language Extension - Standard', () => {

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('redhat.java'));
	});

	test('should activate', function () {
		return vscode.extensions.getExtension('redhat.java').activate().then((api) => {
			assert.ok(true);
		});
	});

	test('should register all java commands', () => {
		if (env['SKIP_COMMANDS_TEST'] === 'true') {
			console.log('Skipping "should register all java commands"');
			return;
		}

		return vscode.commands.getCommands(true).then((commands) =>
		{
			const JAVA_COMMANDS = [
				Commands.ADD_TO_SOURCEPATH,
				Commands.APPLY_REFACTORING_COMMAND,
				Commands.APPLY_WORKSPACE_EDIT,
				Commands.CHOOSE_IMPORTS,
				Commands.CLEAN_WORKSPACE,
				Commands.CLIPBOARD_ONPASTE,
				Commands.COMPILE_WORKSPACE,
				Commands.CONFIGURATION_UPDATE,
				Commands.EXECUTE_WORKSPACE_COMMAND,
				Commands.GENERATE_ACCESSORS_PROMPT,
				Commands.GENERATE_CONSTRUCTORS_PROMPT,
				Commands.GENERATE_DELEGATE_METHODS_PROMPT,
				Commands.GENERATE_TOSTRING_PROMPT,
				Commands.HASHCODE_EQUALS_PROMPT,
				Commands.IGNORE_INCOMPLETE_CLASSPATH,
				Commands.IGNORE_INCOMPLETE_CLASSPATH_HELP,
				Commands.IMPORT_PROJECTS,
				Commands.LIST_SOURCEPATHS,
				Commands.NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND,
				Commands.OPEN_CLIENT_LOG,
				Commands.OPEN_FORMATTER,
				Commands.OPEN_JSON_SETTINGS,
				Commands.OPEN_LOGS,
				Commands.OPEN_OUTPUT,
				Commands.OPEN_SERVER_LOG,
				Commands.ORGANIZE_IMPORTS,
				Commands.OVERRIDE_METHODS_PROMPT,
				Commands.PROJECT_CONFIGURATION_STATUS,
				Commands.REMOVE_FROM_SOURCEPATH,
				Commands.RENAME_COMMAND,
				Commands.SHOW_JAVA_IMPLEMENTATIONS,
				Commands.SHOW_JAVA_REFERENCES,
				Commands.SHOW_SERVER_TASK_STATUS,
				Commands.SWITCH_SERVER_MODE,
				Commands.UPDATE_SOURCE_ATTACHMENT,
				Commands.RUNTIME_VALIDATION_OPEN,
				Commands.CHANGE_BASE_TYPE,
				Commands.SHOW_TYPE_HIERARCHY,
				Commands.SHOW_SUBTYPE_HIERARCHY,
				Commands.SHOW_SUPERTYPE_HIERARCHY,
				Commands.SHOW_CLASS_HIERARCHY,
			].sort();
			const foundJavaCommands = commands.filter((value) => {
				return JAVA_COMMANDS.indexOf(value)>=0 || value.startsWith('java.');
			}).sort();
			assert.deepEqual(foundJavaCommands, JAVA_COMMANDS, `Some Java commands are not registered properly or a new command is not added to the test.\nActual: ${foundJavaCommands}\nExpected: ${JAVA_COMMANDS}`);
		});
	});

	test('should parse VM arguments', () => {
		const userArgs = '-Xmx512m -noverify   -Dfoo=\"something with blank\"  ';
		const vmArgs = ['-noverify', 'foo'];

		java.parseVMargs(vmArgs, userArgs);

		assert.equal(4, vmArgs.length);
		assert.equal('-noverify', vmArgs[0]);
		assert.equal('foo', vmArgs[1]);
		assert.equal('-Xmx512m', vmArgs[2]);
		assert.equal('-Dfoo=something with blank', vmArgs[3]);
	});

	test('should parse VM arguments with spaces', () => {
		const userArgs = '-javaagent:"C:\\Program Files\\Java\\lombok.jar" -Xbootclasspath/a:"C:\\Program Files\\Java\\lombok.jar" -Dfoo="Some \\"crazy\\" stuff"';
		const vmArgs = [];

		java.parseVMargs(vmArgs, userArgs);

		assert.equal(vmArgs.length, 3);
		assert.equal(vmArgs[0], '-javaagent:C:\\Program Files\\Java\\lombok.jar');
		assert.equal(vmArgs[1], '-Xbootclasspath/a:C:\\Program Files\\Java\\lombok.jar');
		assert.equal(vmArgs[2], '-Dfoo=Some "crazy" stuff');
	});

	test('should collect java extensions', () => {
		const packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../test/resources/packageExample.json'), 'utf8'));
		const fakedExtension = {
			id: 'test',
			extensionUri: null,
			extensionPath: '',
			isActive: true,
			packageJSON,
			exports: '',
			activate: null,
			extensionKind: vscode.ExtensionKind.Workspace
		};

		const extensions = [fakedExtension];
		const result = plugin.collectJavaExtensions(extensions);
		assert(result.length === 1);
		assert(result[0].endsWith(path.normalize('./bin/java.extend.jar')));
	});

	test('should parse Java version', () => {
		// Test boundaries
		assert.equal(requirements.parseMajorVersion(null), 0);
		assert.equal(requirements.parseMajorVersion(undefined), 0);
		assert.equal(requirements.parseMajorVersion(''), 0);
		assert.equal(requirements.parseMajorVersion('foo'), 0);
		assert.equal(requirements.parseMajorVersion('version'), 0);
		assert.equal(requirements.parseMajorVersion('version ""'), 0);
		assert.equal(requirements.parseMajorVersion('version "NaN"'), 0);

		// Test the real stuff
		assert.equal(requirements.parseMajorVersion('1.7'), 7);
		assert.equal(requirements.parseMajorVersion('1.8.0_151'), 8);
		assert.equal(requirements.parseMajorVersion('9'), 9);
		assert.equal(requirements.parseMajorVersion('9.0.1'), 9);
		assert.equal(requirements.parseMajorVersion('10-ea'), 10);
	});

	test('should detect debug flag', () => {
		assert(!java.hasDebugFlag(['debug', '-debug']));
		assert(java.hasDebugFlag(['foo', '--inspect']));
		assert(java.hasDebugFlag(['foo', '--inspect=127.0.0.1:1234']));
		assert(java.hasDebugFlag(['foo', '--inspect-brk']));
		assert(java.hasDebugFlag(['foo', '--inspect-brk=127.0.0.1:1234']));
		// deprecated flags
		assert(java.hasDebugFlag(['foo', '--debug=1234']));
		assert(java.hasDebugFlag(['foo', '--debug-brk=1234']));
	});
});
