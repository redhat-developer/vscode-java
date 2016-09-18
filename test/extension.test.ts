import * as assert from 'assert';
import * as vscode from 'vscode';
import * as java from '../src/extension';

suite("Java Language Extension", () => {

	test("should be present", () => {
		assert.ok(vscode.extensions.getExtension('redhat.java'));
	});

	test("should activate", function (done) {
		this.timeout(1 * 60 * 1000);
		return vscode.extensions.getExtension('redhat.java').activate().then((api) => {
			done();
		});
	});

	test("should register all java commands", function (done) {
		return vscode.commands.getCommands(true).then((commands) =>
		{
			let javaCmds = commands.filter(function(value){
				return "java.open.output" === value || 
						"java.show.references" === value;
			});
			assert.ok(javaCmds.length == 2, "missing java commands");
			done();
		});
	});
});