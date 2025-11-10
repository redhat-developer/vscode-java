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
		workspaceHash = computeWorkspaceHash();
		workspace.onDidChangeWorkspaceFolders(() => {
			workspaceHash = computeWorkspaceHash();
		});
		const redhatService = await getRedHatService(context);
		const telemService = await redhatService.getTelemetryService();
		telemetryManager = telemService;
		return telemService;
	}

	function computeWorkspaceHash(): number {
		if (!workspace.workspaceFolders?.length) {
			return 0;
		}
		return cyrb53(workspace.workspaceFolders.map(f => f.uri.toString()).join('|'));
	}

	/**
	 * Send a telemetry event with the given name and data
	 *
	 * @param eventName the name of the telemetry event
	 * @param data the telemetry data
	 * @throws Error if the telemetry service has not been started yet
	 */
	export async function sendTelemetry(eventName: string, data?: object): Promise<void> {
		if (!telemetryManager) {
			throw new Error("The telemetry service for vscode-java has not been started yet");
		}

		const event = {
			name: eventName,
			properties:  { workspaceHash, ...data}
		};
		return telemetryManager.send(event);
	}
}
