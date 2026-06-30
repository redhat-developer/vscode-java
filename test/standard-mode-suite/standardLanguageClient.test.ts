'use strict';

import * as assert from 'assert';
import { Executable, TransportKind } from 'vscode-languageclient/node';
import { startWithStdioFallback, StartableLanguageClient } from '../../src/standardLanguageClientStart';

class TestLanguageClient implements StartableLanguageClient {
	public startCount = 0;

	constructor(private readonly startResult: Promise<void>) {
	}

	public start(): Promise<void> {
		this.startCount++;
		return this.startResult;
	}
}

suite('Standard Language Client Test', () => {

	test('startWithStdioFallback() - does not fall back when pipe start rejects', async () => {
		const pipeClient = new TestLanguageClient(Promise.reject(new Error('pipe failed')));
		const stdioClient = new TestLanguageClient(Promise.resolve());
		const pipeOptions = createServerOptions(TransportKind.pipe);
		let fallbackOptions: Executable | undefined;

		await assert.rejects(startWithStdioFallback({
			languageClient: pipeClient,
			serverOptions: pipeOptions,
			createLanguageClient: serverOptions => {
				fallbackOptions = serverOptions;
				return stdioClient;
			},
			pipeStartTimeout: 1000,
		}), /pipe failed/);

		assert.equal(pipeClient.startCount, 1);
		assert.equal(stdioClient.startCount, 0);
		assert.equal(fallbackOptions, undefined);
	});

	test('startWithStdioFallback() - falls back when pipe start times out', async () => {
		const pipeClient = new TestLanguageClient(new Promise<void>(() => { /* never resolves */ }));
		const stdioClient = new TestLanguageClient(Promise.resolve());
		let fallbackError: any;

		const result = await startWithStdioFallback({
			languageClient: pipeClient,
			serverOptions: createServerOptions(TransportKind.pipe),
			createLanguageClient: () => stdioClient,
			pipeStartTimeout: 1,
			onFallback: error => fallbackError = error,
		});

		assert.equal(pipeClient.startCount, 1);
		assert.equal(stdioClient.startCount, 1);
		assert.equal(result.client, stdioClient);
		assert.equal((result.serverOptions as Executable).transport, TransportKind.stdio);
		assert.ok(String(fallbackError).includes('timed out'));
	});

	test('startWithStdioFallback() - does not fall back for stdio start failures', async () => {
		const stdioClient = new TestLanguageClient(Promise.reject(new Error('stdio failed')));

		await assert.rejects(startWithStdioFallback({
			languageClient: stdioClient,
			serverOptions: createServerOptions(TransportKind.stdio),
			createLanguageClient: () => new TestLanguageClient(Promise.resolve()),
			pipeStartTimeout: 1,
		}), /stdio failed/);

		assert.equal(stdioClient.startCount, 1);
	});
});

function createServerOptions(transport: TransportKind): Executable {
	return {
		command: 'java',
		args: ['-version'],
		options: { env: { test: 'true' } },
		transport,
	};
}
