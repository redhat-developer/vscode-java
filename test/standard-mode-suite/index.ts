//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.

import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

export async function run(testsRoot: string): Promise<void> {
	const mocha = new Mocha({
		ui: 'tdd',
		useColors: true,
		timeout: 1 * 60 * 1000, /* ms*/
	});

	try {
		const files = await glob('**/**.test.js', { cwd: testsRoot });
		// Add files to the test suite
		files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

		return new Promise((c, e) => {
			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				e(err);
			}
		});
	} catch (err) {
		throw err;
	}
}
