import { window, commands } from "vscode";
import { ErrorHandler, Message, ErrorAction, CloseAction } from "vscode-languageclient";
import { Commands } from "./commands";
import { logger } from "./log";

export class ClientErrorHandler implements ErrorHandler {
	private restarts: number[];

	constructor(private name: string) {
		this.restarts = [];
	}

	public error(_error: Error, _message: Message, count: number): ErrorAction {
		if (count && count <= 3) {
			logger.error(`${this.name} server encountered error: ${_message}, ${_error && _error.toString()}`);
			return ErrorAction.Continue;
		}

		logger.error(`${this.name} server encountered error and will shut down: ${_message}, ${_error && _error.toString()}`);
		return ErrorAction.Shutdown;
	}

	public closed(): CloseAction {
		this.restarts.push(Date.now());
		if (this.restarts.length < 5) {
			logger.error(`The ${this.name} server crashed and will restart.`);
			return CloseAction.Restart;
		} else {
			const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
			if (diff <= 3 * 60 * 1000) {
				const message = `The ${this.name} server crashed 5 times in the last 3 minutes. The server will not be restarted.`;
				logger.error(message);
				const action = "Show logs";
				window.showErrorMessage(message, action).then(selection => {
					if (selection === action) {
						commands.executeCommand(Commands.OPEN_LOGS);
					}
				});
				return CloseAction.DoNotRestart;
			}

			logger.error(`The ${this.name} server crashed and will restart.`);
			this.restarts.shift();
			return CloseAction.Restart;
		}
	}
}
