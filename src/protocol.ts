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
	export const type = new NotificationType<StatusReport,void >('language/status');
}

export namespace ClassFileContentsRequest {
    export const type= new RequestType<TextDocumentIdentifier, string, void, void> ('java/classFileContents');
}

export namespace ProjectConfigurationUpdateRequest {
    export const type = new NotificationType<TextDocumentIdentifier, void> ('java/projectConfigurationUpdate');
}

export namespace ActionableNotification {
    export const type = new NotificationType<ActionableMessage, void>('language/actionableNotification');
}