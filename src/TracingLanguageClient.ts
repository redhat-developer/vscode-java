import { performance } from "perf_hooks";
import { Event, EventEmitter } from "vscode";
import { CancellationToken, LanguageClient, LanguageClientOptions, ProtocolRequestType, ProtocolRequestType0, RequestType, RequestType0, ServerOptions } from "vscode-languageclient/node";
import { TraceEvent } from "./extension.api";

const requestEventEmitter = new EventEmitter<TraceEvent>();
export const onDidRequestEnd: Event<TraceEvent> = requestEventEmitter.event;

export class TracingLanguageClient extends LanguageClient {
	private isStarted: boolean = false;

	constructor(id: string, name: string, serverOptions: ServerOptions, clientOptions: LanguageClientOptions, forceDebug?: boolean) {
		super(id, name, serverOptions, clientOptions, forceDebug);
	}

	start(): Promise<void> {
		const isFirstTimeStart: boolean = !this.isStarted;
		this.isStarted = true;
		const startAt: number = performance.now();
		return super.start().then(value => {
			if (isFirstTimeStart) {
				this.fireSuccessTraceEvent("initialize", startAt, undefined);
			}
			return value;
		}, reason => {
			if (isFirstTimeStart) {
				this.fireFailureTraceEvent("initialize", startAt, reason);
			}
			throw reason;
		});
	}

	stop(timeout?: number): Promise<void> {
		this.isStarted = false;
		return super.stop(timeout);
	}

	sendRequest<R, PR, E, RO>(type: ProtocolRequestType0<R, PR, E, RO>, token?: CancellationToken): Promise<R>;
	sendRequest<P, R, PR, E, RO>(type: ProtocolRequestType<P, R, PR, E, RO>, params: P, token?: CancellationToken): Promise<R>;
	sendRequest<R, E>(type: RequestType0<R, E>, token?: CancellationToken): Promise<R>;
	sendRequest<P, R, E>(type: RequestType<P, R, E>, params: P, token?: CancellationToken): Promise<R>;
	sendRequest<R>(method: string, token?: CancellationToken): Promise<R>;
	sendRequest<R>(method: string, param: any, token?: CancellationToken): Promise<R>;
	sendRequest(method: any, ...args) {
		const startAt: number = performance.now();
		const requestType: string = this.getRequestType(method, ...args);
		let data: any;
		if (args?.[0]?.context?.triggerKind) {
			data = {
				triggerKind: args[0].context.triggerKind,
				triggerCharacter: args[0].context.triggerCharacter,
			};
		}
		return this.sendRequest0(method, ...args).then(value => {
			this.fireSuccessTraceEvent(requestType, startAt, this.getResultLength(value), data);
			return value;
		}, reason => {
			this.fireFailureTraceEvent(requestType, startAt, reason, data);
			throw reason;
		});
	}

	private sendRequest0(method: any, ...args) {
		if (!args || !args.length) {
			return super.sendRequest(method);
		}

		const first = args[0];
		const last = args[args.length - 1];
		if (CancellationToken.is(last)) {
			if (first === last) {
				return super.sendRequest(method, last);
			} else {
				return super.sendRequest(method, first, last);
			}
		}

		return super.sendRequest(method, first);
	}

	private getRequestType(method: any, ...args): string {
		let requestType: string;
		if (typeof method === 'string' || method instanceof String) {
			requestType = String(method);
		} else {
			requestType = method?.method;
		}

		if (requestType === "workspace/executeCommand") {
			if (args?.[0]?.command) {
				requestType = `workspace/executeCommand/${args[0].command}`;
			}
		}

		return requestType;
	}

	private fireSuccessTraceEvent(type: string, startAt: number, resultLength: number | undefined, data?: any): void {
		const duration: number = performance.now() - startAt;
		requestEventEmitter.fire({
			type,
			duration,
			resultLength,
			data,
		});
	}

	private fireFailureTraceEvent(type: string, startAt: number, error: any, data?: any): void {
		const duration: number = performance.now() - startAt;
		requestEventEmitter.fire({
			type,
			duration,
			error,
			data,
		});
	}

	private getResultLength(value: any): number | undefined {
		if (!value) {
			return 0;
		}

		return value?.length ?? value?.items?.length;
	}
}
