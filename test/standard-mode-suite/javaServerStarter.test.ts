'use strict';

import * as assert from 'assert';
import { platform } from 'os';
import { getUnicodeLocaleEnv, LOCALE_ENV_VARS, UTF8_LOCALE } from '../../src/javaServerStarter';

function setLocale(...values: [string, string][]): void {
	for (const name of LOCALE_ENV_VARS) {
		delete process.env[name];
	}
	for (const [name, value] of values) {
		process.env[name] = value;
	}
}

function utf8Env(variable: string): { [key: string]: string } {
	const env: { [key: string]: string } = {};
	env[variable] = UTF8_LOCALE;
	return env;
}

suite('Java Server Starter Test', () => {

	const saved: [string, string][] = [];

	suiteSetup(() => {
		for (const name of LOCALE_ENV_VARS) {
			if (process.env[name] !== undefined) {
				saved.push([name, process.env[name]]);
			}
		}
	});

	suiteTeardown(() => {
		setLocale(...saved);
	});

	test('getUnicodeLocaleEnv() - never overrides the locale on Windows', function () {
		if (platform() !== 'win32') {
			this.skip();
		}
		setLocale();
		assert.deepStrictEqual(getUnicodeLocaleEnv(), {});
	});

	test('getUnicodeLocaleEnv() - forces UTF-8 when the locale is unset', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		setLocale();
		assert.deepStrictEqual(getUnicodeLocaleEnv(), utf8Env('LC_CTYPE'));
	});

	test('getUnicodeLocaleEnv() - forces UTF-8 for ASCII only locales', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		for (const locale of ['C', 'POSIX', 'C.ASCII']) {
			setLocale(['LANG', locale]);
			assert.deepStrictEqual(getUnicodeLocaleEnv(), utf8Env('LC_CTYPE'), `LANG=${locale}`);
		}
	});

	test('getUnicodeLocaleEnv() - keeps an existing UTF-8 locale', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		setLocale(['LANG', 'en_US.UTF-8']);
		assert.deepStrictEqual(getUnicodeLocaleEnv(), {});
	});

	test('getUnicodeLocaleEnv() - keeps a deliberately configured non-UTF-8 locale', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		setLocale(['LANG', 'zh_CN.GBK']);
		assert.deepStrictEqual(getUnicodeLocaleEnv(), {});
	});

	test('getUnicodeLocaleEnv() - replaces LC_ALL because it overrides every other category', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		setLocale(['LC_ALL', 'C'], ['LANG', 'en_US.UTF-8']);
		assert.deepStrictEqual(getUnicodeLocaleEnv(), utf8Env('LC_ALL'));
	});

	test('getUnicodeLocaleEnv() - only corrects LC_CTYPE when LC_ALL is unset', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		setLocale(['LC_CTYPE', 'C'], ['LANG', 'en_US.UTF-8']);
		assert.deepStrictEqual(getUnicodeLocaleEnv(), utf8Env('LC_CTYPE'));
	});

	test('getUnicodeLocaleEnv() - LC_CTYPE takes precedence over LANG', function () {
		if (platform() === 'win32') {
			this.skip();
		}
		setLocale(['LC_CTYPE', 'en_US.UTF-8'], ['LANG', 'C']);
		assert.deepStrictEqual(getUnicodeLocaleEnv(), {});
	});
});
