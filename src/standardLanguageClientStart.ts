import { Executable, ServerOptions, TransportKind } from "vscode-languageclient/node";

export interface StartableLanguageClient {
	start(): Promise<void>;
}

export interface StartWithStdioFallbackOptions<T extends StartableLanguageClient> {
	languageClient: T;
	serverOptions: ServerOptions;
	createLanguageClient(serverOptions: Executable): T;
	pipeStartTimeout: number;
	onFallback?(error: any): void;
}

class PipeStartTimeoutError extends Error {
}

export async function startWithStdioFallback<T extends StartableLanguageClient>(options: StartWithStdioFallbackOptions<T>): Promise<{ client: T; serverOptions: ServerOptions }> {
	if (!isPipeExecutable(options.serverOptions)) {
		await options.languageClient.start();
		return { client: options.languageClient, serverOptions: options.serverOptions };
	}

	try {
		await startWithTimeout(options.languageClient, options.pipeStartTimeout);
		return { client: options.languageClient, serverOptions: options.serverOptions };
	} catch (error) {
		if (!(error instanceof PipeStartTimeoutError)) {
			throw error;
		}
		options.onFallback?.(error);
		const stdioServerOptions = createStdioServerOptions(options.serverOptions);
		const stdioClient = options.createLanguageClient(stdioServerOptions);
		await stdioClient.start();
		return { client: stdioClient, serverOptions: stdioServerOptions };
	}
}

async function startWithTimeout(client: StartableLanguageClient, timeout: number): Promise<void> {
	let timeoutHandle: NodeJS.Timeout | undefined;
	try {
		await Promise.race([
			client.start(),
			new Promise<void>((_resolve, reject) => {
				timeoutHandle = setTimeout(() => reject(new PipeStartTimeoutError(`Starting pipe transport timed out after ${timeout}ms.`)), timeout);
			})
		]);
	} finally {
		if (timeoutHandle) {
			clearTimeout(timeoutHandle);
		}
	}
}

function isPipeExecutable(serverOptions: ServerOptions): serverOptions is Executable {
	return !!serverOptions && typeof (serverOptions as Executable).command === 'string' && (serverOptions as Executable).transport === TransportKind.pipe;
}

function createStdioServerOptions(serverOptions: Executable): Executable {
	return {
		...serverOptions,
		args: serverOptions.args?.slice(),
		options: serverOptions.options ? { ...serverOptions.options } : undefined,
		transport: TransportKind.stdio,
	};
}
