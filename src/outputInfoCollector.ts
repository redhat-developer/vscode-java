import { Event, LogLevel, LogOutputChannel, ViewColumn, window } from "vscode";
import { logger } from "./log";

export class OutputInfoCollector implements LogOutputChannel {
	private channel: LogOutputChannel = null;

	constructor(public name: string) {
		this.channel = window.createOutputChannel(this.name, { log:true });
	}
	get logLevel(): LogLevel { return this.channel.logLevel; }
	get onDidChangeLogLevel(): Event<LogLevel> { return this.channel.onDidChangeLogLevel; };
	trace(message: string, ...args: any[]): void {
		this.channel.trace(message, args);
	}
	debug(message: string, ...args: any[]): void {
		this.channel.debug(message, args);
	}
	info(message: string, ...args: any[]): void {
		this.channel.info(message, args);
	}
	warn(message: string, ...args: any[]): void {
		this.channel.warn(message, args);
	}
	error(error: string | Error, ...args: any[]): void {
		this.channel.error(error, args);
	}

	append(value: string): void {
		logger.info(value);
		this.channel.append(value);
	}

	appendLine(value: string): void {
		logger.info(value);
		this.channel.appendLine(value);
	}

	replace(value: string): void {
		this.clear();
		this.append(value);
	}

	clear(): void {
		this.channel.clear();
	}

	show(preserveFocus?: boolean): void;
	show(column?: ViewColumn, preserveFocus?: boolean): void;
	show(column?: any, preserveFocus?: any) {
		this.channel.show(column, preserveFocus);
	}

	hide(): void {
		this.channel.hide();
	}

	dispose(): void {
		this.channel.dispose();
	}
}
