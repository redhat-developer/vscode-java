import { TelemetryService, getRedHatService } from "@redhat-developer/vscode-redhat-telemetry";
import { ExtensionContext, workspace, WorkspaceConfiguration } from "vscode";

/**
 * Wrap vscode-redhat-telemetry to suit vscode-java
 */
export namespace Telemetry {

	export const STARTUP_EVT = "startup";
	export const SERVER_INITIALIZED_EVT = "java.workspace.initialized";
	let telemetryManager: TelemetryService = null;
	let serverInitializedReceived = false;

	/**
	 * Starts the telemetry service
	 *
	 * @returns when the telemetry service has been started
	 * @throws Error if the telemetry service has already been started
	 */
	export async function startTelemetry(context: ExtensionContext): Promise<void> {
		if (!!telemetryManager) {
			throw new Error("The telemetry service for vscode-java has already been started");
		}
		const redhatService = await getRedHatService(context);
		telemetryManager = await redhatService.getTelemetryService();
		setTimeout(sendEmptyStartUp, 60000); // assume LS may not have initialized
		return;
	}

	/**
	 * Send a telemetry event with the given name and data
	 *
	 * @param eventName the name of the telemetry event
	 * @param data the telemetry data
	 * @throws Error if the telemetry service has not been started yet
	 */
	export async function sendTelemetry(eventName: string, data?: any): Promise<void> {
		if (!telemetryManager) {
			throw new Error("The telemetry service for vscode-java has not been started yet");
		}
		const javaSettings = getJavaSettingsForTelemetry(workspace.getConfiguration());

		let properties: any;
		if (eventName === STARTUP_EVT) {
			serverInitializedReceived = true;
			properties= { ...data, ...javaSettings };
		} else {
			properties= { ...data};
		}

		return telemetryManager.send({
			name: eventName,
			properties
		});
	}

	function sendEmptyStartUp() {
		if (!serverInitializedReceived) {
			return sendTelemetry(STARTUP_EVT);
		}
	}

	function getJavaSettingsForTelemetry(config: WorkspaceConfiguration) {
		// settings whose values we can record
		const SETTINGS_BASIC = [
			"java.quickfix.showAt", "java.symbols.includeSourceMethodDeclarations",
			"java.completion.guessMethodArguments", "java.cleanup.actionsOnSave",
			"java.completion.postfix.enabled", "java.sharedIndexes.enabled",
			"java.inlayHints.parameterNames.enabled", "java.server.launchMode",
			"java.autobuild.enabled"
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
