import * as assert from 'assert';
import { beautifyDocument } from '../../src/snippetCompletionProvider';
import { MarkdownString } from 'vscode';

suite('Snippet Completion Provider', () => {

	test('should render document correctly', () => {
		// tslint:disable: prefer-template
		const raw = "for (${1:int} ${2:i} = ${3:0}; ${2:i} < ${4:max}; ${2:i}++) {\n" + "\t$0\n" + "}";
		const markdownString: MarkdownString = beautifyDocument(raw);
		const expected: string = "\n```java\n" + "for (int i = 0; i < max; i++) {\n" + "\t\n" + "}\n" + "```\n";
		assert.equal(markdownString.value, expected);
	});
});
