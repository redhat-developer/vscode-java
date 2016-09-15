import * as assert from 'assert';
import * as vscode from 'vscode';
import * as java from '../src/extension';

suite("Java Language Extension Tests", () => {

	test("Check extension", () => {
		assert.ok(vscode.extensions.getExtension('redhat.java'));
	});

	test("Activate extension", function(done){
		 this.timeout(1*60*1000);
		return vscode.extensions.getExtension('redhat.java').activate().then((api)=>{
			done();
		});
	});
});