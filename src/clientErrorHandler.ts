import { window, commands } from "vscode";
import { serverStatusBarProvider } from './serverStatusBarProvider';
import { ErrorHandler, Message, ErrorAction, CloseAction, ErrorHandlerResult, CloseHandlerResult } from "vscode-languageclient";
import { Commands } from "./commands";
import { logger } from "./log";
import { apiManager } from "./apiManager";

const CLIENT_ERROR = "java.client.error";
export class ClientErrorHandler implements ErrorHandler {
	private restarts: number[];

	constructor(private name: string) {
		this.restarts = [];
	}

	public error(_error: Error, _message: Message, count: number): ErrorHandlerResult {
		if (count && count <= 3) {
			logger.error(`${this.name} server encountered error: ${_message}, ${_error && _error.toString()}`);
			return {
				action: ErrorAction.Continue,
				handled: true
			};
		}

		const errorMessage = `${this.name} server encountered error and will shut down: ${_message}, ${_error && _error.toString()}`;
		apiManager.fireTraceEvent({
			name: CLIENT_ERROR,
			properties: {
				message: errorMessage,
			},
		});
		logger.error(errorMessage);
		return {
			action: ErrorAction.Shutdown,
			handled: true
		};
	}

	public closed(): CloseHandlerResult {
		this.restarts.push(Date.now());
		if (this.restarts.length < 5) {
			logger.error(`The ${this.name} server crashed and will restart.`);
			return {
				action: CloseAction.Restart,
				handled: true
			};
		} else {
			const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
			if (diff <= 3 * 60 * 1000) {
				const message = `The ${this.name} server crashed 5 times in the last 3 minutes. The server will not be restarted.`;
				apiManager.fireTraceEvent({
					name: CLIENT_ERROR,
					properties: {
						message,
					},
				});
				logger.error(message);
				serverStatusBarProvider.setError();
				const action = "Show logs";
				window.showErrorMessage(message, action).then(selection => {
					if (selection === action) {
						commands.executeCommand(Commands.OPEN_LOGS);
					}
				});
				return {
					action: CloseAction.DoNotRestart,
					handled: true
				};
			}

			logger.error(`The ${this.name} server crashed and will restart.`);
			this.restarts.shift();
			return {
				action: CloseAction.Restart,
				handled: true
			};
		}
	}
}
