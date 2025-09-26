import { TelemetryService, getRedHatService } from "@redhat-developer/vscode-redhat-telemetry";
import { ExtensionContext, workspace, WorkspaceConfiguration } from "vscode";
import { cyrb53 } from "./utils";

/**
 * Wrap vscode-redhat-telemetry to suit vscode-java
 */
export namespace Telemetry {

	export const STARTUP_EVT = "startup";
	export const COMPLETION_EVENT = "textCompletion";
	export const SERVER_INITIALIZED_EVT = "java.workspace.initialized";
	export const LS_ERROR = "java.ls.error";
	export const IMPORT_PROJECT = "java.workspace.importProject";

	let telemetryManager: TelemetryService = null;
	let workspaceHash;

	/**
	 * Starts the telemetry service
	 *
	 * @returns when the telemetry service has been started
	 * @throws Error if the telemetry service has already been started
	 */
	export async function startTelemetry(context: ExtensionContext): Promise<TelemetryService> {
		if (!!telemetryManager) {
			throw new Error("The telemetry service for vscode-java has already been started");
		}
		workspaceHash = cyrb53(workspace.workspaceFolders.map(f => f.uri.toString()).join('|'));
		workspace.onDidChangeWorkspaceFolders(() => {
			workspaceHash = cyrb53(workspace.workspaceFolders.map(f => f.uri.toString()).join('|'));
		});
		const redhatService = await getRedHatService(context);
		const telemService = await redhatService.getTelemetryService();
		telemetryManager = telemService;
		return telemService;
	}

	/**
	 * Send a telemetry event with the given name and data
	 *
	 * @param eventName the name of the telemetry event
	 * @param data the telemetry data
	 * @throws Error if the telemetry service has not been started yet
	 */
	export async function sendTelemetry(eventName: string, data?: object): Promise<void> {
		console.log(`Sending telemetry event: ${eventName} with data: ${JSON.stringify(data)}`);
		if (!telemetryManager) {
			throw new Error("The telemetry service for vscode-java has not been started yet");
		}

		const event = {
			name: eventName,
			properties:  { workspaceHash, ...data}
		};
		return telemetryManager.send(event);
	}

	function getJavaSettingsForTelemetry(config: WorkspaceConfiguration) {
		// settings whose values we can record
		const SETTINGS_BASIC = [
			"java.quickfix.showAt", "java.symbols.includeSourceMethodDeclarations",
			"java.completion.collapseCompletionItems", "java.completion.guessMethodArguments",
			"java.cleanup.actionsOnSave", "java.completion.postfix.enabled",
			"java.sharedIndexes.enabled", "java.inlayHints.parameterNames.enabled",
			"java.inlayHints.parameterNames.suppressWhenSameNameNumbered",
			"java.inlayHints.variableTypes.enabled",
			"java.inlayHints.parameterTypes.enabled",
			"java.server.launchMode", "java.autobuild.enabled"
		];

		// settings where we only record their existence
		const SETTINGS_CUSTOM = [
			"java.settings.url", "java.format.settings.url"
		];

		let value: any;
		const properties = {};

		for (const key of SETTINGS_CUSTOM) {
			if (config.get(key)) {
				properties[key] = true;
			}
		}
		for (const key of SETTINGS_BASIC) {
			value = config.get(key);
			if (value !== undefined) {
				properties[key] = value;
			}
		}

		return properties;
	}
}
