'use strict';

import * as assert from 'assert';
import { Hover, MarkdownString } from 'vscode';
import { fixJdtSchemeHoverLinks } from '../../src/providerDispatcher';

suite('Hover Links Test', () => {

	test('trusted contributed command links are preserved (super implementation)', () => {
		const contributed = new MarkdownString('[Go to Super Implementation](command:java.action.navigateToSuperImplementation?%5B%5D)');
		contributed.isTrusted = { enabledCommands: ['java.action.navigateToSuperImplementation'] };
		const hover = new Hover([contributed]);

		const fixed = fixJdtSchemeHoverLinks(hover);
		const value = (fixed.contents[0] as MarkdownString).value;
		assert.ok(value.includes('(command:java.action.navigateToSuperImplementation'), 'contributed command link should not be sanitized');
	});

	test('untrusted server command links are sanitized', () => {
		const javadoc = new MarkdownString('[click here](command:evil.command?param=true)');
		const hover = new Hover([javadoc]);

		const fixed = fixJdtSchemeHoverLinks(hover);
		const value = (fixed.contents[0] as MarkdownString).value;
		assert.strictEqual(value, 'click here', 'server command link should be stripped to its label');
	});

	test('jdt:// links are converted to command links', () => {
		const javadoc = new MarkdownString('[String](jdt://contents/Foo.class)');
		const hover = new Hover([javadoc]);

		const fixed = fixJdtSchemeHoverLinks(hover);
		const value = (fixed.contents[0] as MarkdownString).value;
		assert.ok(value.includes('(command:'), 'jdt link should be converted to a command link');
		assert.ok(!value.includes('jdt://'), 'jdt scheme should be replaced');
	});
});
