import * as assert from 'assert';
import * as vscode from 'vscode';
import * as java from '../src/extension';

suite('Java Language Extension', () => {

	test('should be present', () => {
		assert.ok(vscode.extensions.getExtension('redhat.java'));
	});

	test('should activate', function (done) {
		this.timeout(1 * 60 * 1000);
		return vscode.extensions.getExtension('redhat.java').activate().then((api) => {
			done();
		});
	});

	test('should register all java commands', function (done) {
		return vscode.commands.getCommands(true).then((commands) =>
		{
			let javaCmds = commands.filter(function(value){
				return 'java.open.output' === value ||
						'java.show.references' === value;
			});
			assert.ok(javaCmds.length === 2, 'missing java commands');
			done();
		});
	});

	test('should parse VM arguments', function (done) {
		let userArgs = '-Xmx512m -noverify   -Dfoo=\"something with blank\"  ';
		let vmArgs = ['-noverify', 'foo'];

		java.parseVMargs(vmArgs, userArgs);

		assert.equal(4, vmArgs.length);
		assert.equal('-noverify', vmArgs[0]);
		assert.equal('foo', vmArgs[1]);
		assert.equal('-Xmx512m', vmArgs[2]);
		assert.equal('-Dfoo=something with blank', vmArgs[3]);

		done();
	});

	test('should parse VM arguments with spaces', function (done) {
		let userArgs = '-javaagent:"C:\\Program Files\\Java\\lombok.jar" -Xbootclasspath/a:"C:\\Program Files\\Java\\lombok.jar" -Dfoo="Some \\"crazy\\" stuff"';
		let vmArgs = [];

		java.parseVMargs(vmArgs, userArgs);

		assert.equal(vmArgs.length, 3);
		assert.equal(vmArgs[0], '-javaagent:C:\\Program Files\\Java\\lombok.jar');
		assert.equal(vmArgs[1], '-Xbootclasspath/a:C:\\Program Files\\Java\\lombok.jar');
		assert.equal(vmArgs[2], '-Dfoo=Some "crazy" stuff');
		done();
	});
});