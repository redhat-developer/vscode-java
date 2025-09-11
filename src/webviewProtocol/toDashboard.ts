import { Diagnostic } from "vscode";
import { ToWebviewMessageType, WebviewMessage } from "./common";

export type ToDashboardMessageType = ToWebviewMessageType;

export interface ToDashboardMessage extends WebviewMessage<ToDashboardMessageType> {
}

export interface JVM {
    name: string;
    path: string;
}

export interface DashboardState {
	jvms?: JVM[];
	workspacePath?: string;
	lombokEnabled?: boolean;
	activeLombokPath?: string | undefined;
	diagnosticInfo?: DiagnosticInfo;
}

export interface DiagnosticInfo {
	readonly mavenUserSettings: string;
	readonly mavenGlobalSettings: string;
	readonly activeImporters: string[];
	readonly gradleUserHome: string;
	readonly gradleJavaHome: string;
}

export interface UpdateMessage extends ToDashboardMessage, DashboardState {
	type: "update";
}