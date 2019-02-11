'use strict';

import { RequestType, NotificationType, TextDocumentIdentifier, ExecuteCommandParams, CodeActionParams, WorkspaceEdit } from 'vscode-languageclient';
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

export enum CompileWorkspaceStatus {
    FAILED = 0,
    SUCCEED = 1,
    WITHERROR = 2,
    CANCELLED = 3,
}

export interface StatusReport {
	message: string;
	type: string;
}

export interface ProgressReport {
	id: string;
	task: string;
	subTask: string;
	status: string;
	workDone: number;
	totalWork: number;
	complete: boolean;
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

export namespace ProgressReportNotification {
	export const type = new NotificationType<ProgressReport,void >('language/progressReport');
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

export namespace CompileWorkspaceRequest {
    export const type = new RequestType<boolean, CompileWorkspaceStatus, void, void>('java/buildWorkspace');
}

export namespace ExecuteClientCommandRequest {
    export const type = new RequestType<ExecuteCommandParams, any, void, void>('workspace/executeClientCommand');
}


export namespace SendNotificationRequest {
    export const type = new RequestType<ExecuteCommandParams, any, void, void>('workspace/notify');
}

export interface SourceAttachmentRequest {
    classFileUri: string;
    attributes?: SourceAttachmentAttribute;
}

export interface SourceAttachmentResult {
    errorMessage?: string;
    attributes?: SourceAttachmentAttribute;
}

export interface SourceAttachmentAttribute {
    jarPath?: string;
    sourceAttachmentPath?: string;
    sourceAttachmentEncoding?: string;
    canEditEncoding?: boolean;
}

export interface OverridableMethod {
    key: string;
    name: string;
    parameters: string[];
    unimplemented: boolean;
    declaringClass: string;
    declaringClassType: string;
}

export interface OverridableMethodsResponse {
	type: string;
	methods: OverridableMethod[];
}

export namespace OverridableMethodsRequest {
    export const type = new RequestType<CodeActionParams, OverridableMethodsResponse, void, void>('java/overridableMethods');
}

export interface AddOverridableMethodParams {
    context: CodeActionParams;
    overridableMethods: OverridableMethod[];
}

export namespace AddOverridableMethodsRequest {
    export const type = new RequestType<AddOverridableMethodParams, WorkspaceEdit, void, void>('java/addOverridableMethods');
}