'use strict';

import { RequestType, NotificationType, TextDocumentIdentifier} from 'vscode-languageclient';
import { Command } from 'vscode';

/**
 * The message type. Copied from vscode protocol
 */
export enum MessageType {
    /**
     * An error message.
     */
    Error = 1,
    /**
     * A warning message.
     */
    Warning = 2,
    /**
     * An information message.
     */
    Info = 3,
    /**
     * A log message.
     */
    Log = 4,
}

/**
 * A functionality status
 */
export enum FeatureStatus {
    /**
     * Disabled.
     */
    disabled = 0,
    /**
     * Enabled manually.
     */
    interactive = 1,
    /**
     * Enabled automatically.
     */
    automatic = 2,
}

export interface StatusReport {
	message: string;
	type: string;
}

export interface ActionableMessage {
	severity: MessageType;
	message: string;
	data?: any;
	commands?: Command[];
}

export namespace StatusNotification {
	export const type: NotificationType<StatusReport> = { get method() { return 'language/status'; } };
}

export namespace ClassFileContentsRequest {
    export const type: RequestType<TextDocumentIdentifier, string, void> = { get method() { return 'java/classFileContents'; }};
}

export namespace ProjectConfigurationUpdateRequest {
    export const type: NotificationType<TextDocumentIdentifier> = { get method() { return 'java/projectConfigurationUpdate'; }};
}

export namespace ActionableNotification {
    export const type: NotificationType<ActionableMessage> = { get method() { return 'language/actionableNotification'; }};
}