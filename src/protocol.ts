'use strict';

import {
    CodeActionParams,
    ExecuteCommandParams,
    FormattingOptions,
    Location,
    NotificationType,
    RequestType,
    SymbolInformation,
    TextDocumentIdentifier,
    TextDocumentPositionParams,
    WorkspaceEdit,
    WorkspaceSymbolParams,
} from 'vscode-languageclient';
import { Command, Range } from 'vscode';

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

export enum EventType {
    ClasspathUpdated = 100,
    ProjectsImported = 200,
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

export interface EventNotification {
    eventType: EventType;
    data?: any;
}

export namespace StatusNotification {
	export const type = new NotificationType<StatusReport, void >('language/status');
}

export namespace ProgressReportNotification {
	export const type = new NotificationType<ProgressReport, void >('language/progressReport');
}

export namespace ClassFileContentsRequest {
    export const type = new RequestType<TextDocumentIdentifier, string, void, void> ('java/classFileContents');
}

export namespace ProjectConfigurationUpdateRequest {
    export const type = new NotificationType<TextDocumentIdentifier, void> ('java/projectConfigurationUpdate');
}

export namespace ActionableNotification {
    export const type = new NotificationType<ActionableMessage, void>('language/actionableNotification');
}

export namespace EventNotification {
    export const type = new NotificationType<EventNotification, void>('language/eventNotification');
}

export namespace CompileWorkspaceRequest {
    export const type = new RequestType<boolean, CompileWorkspaceStatus, void, void>('java/buildWorkspace');
}

export namespace ExecuteClientCommandRequest {
    export const type = new RequestType<ExecuteCommandParams, any, void, void>('workspace/executeClientCommand');
}

export namespace ServerNotification {
    export const type = new NotificationType<ExecuteCommandParams, void>('workspace/notify');
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

export namespace ListOverridableMethodsRequest {
    export const type = new RequestType<CodeActionParams, OverridableMethodsResponse, void, void>('java/listOverridableMethods');
}

export interface AddOverridableMethodParams {
    context: CodeActionParams;
    overridableMethods: OverridableMethod[];
}

export namespace AddOverridableMethodsRequest {
    export const type = new RequestType<AddOverridableMethodParams, WorkspaceEdit, void, void>('java/addOverridableMethods');
}

export interface VariableBinding {
    bindingKey: string;
    name: string;
    type: string;
    isField: boolean;
}

export interface CheckHashCodeEqualsResponse {
    type: string;
    fields: VariableBinding[];
    existingMethods: string[];
}

export namespace CheckHashCodeEqualsStatusRequest {
    export const type = new RequestType<CodeActionParams, CheckHashCodeEqualsResponse, void, void>('java/checkHashCodeEqualsStatus');
}

export interface GenerateHashCodeEqualsParams {
    context: CodeActionParams;
    fields: VariableBinding[];
    regenerate: boolean;
}

export namespace GenerateHashCodeEqualsRequest {
    export const type = new RequestType<GenerateHashCodeEqualsParams, WorkspaceEdit, void, void>('java/generateHashCodeEquals');
}

export namespace OrganizeImportsRequest {
    export const type = new RequestType<CodeActionParams, WorkspaceEdit, void, void>('java/organizeImports');
}

export interface ImportCandidate {
    fullyQualifiedName: string;
    id: string;
}

export interface ImportSelection {
    candidates: ImportCandidate[];
    range: Range;
}

export interface CheckToStringResponse {
    type: string;
    fields: VariableBinding[];
    exists: boolean;
}

export namespace CheckToStringStatusRequest {
    export const type = new RequestType<CodeActionParams, CheckToStringResponse, void, void>('java/checkToStringStatus');
}

export interface GenerateToStringParams {
    context: CodeActionParams;
    fields: VariableBinding[];
}

export namespace GenerateToStringRequest {
    export const type = new RequestType<GenerateToStringParams, WorkspaceEdit, void, void>('java/generateToString');
}

export interface AccessorField {
    fieldName: string;
    isStatic: boolean;
    generateGetter: boolean;
    generateSetter: boolean;
}

export namespace ResolveUnimplementedAccessorsRequest {
    export const type = new RequestType<CodeActionParams, AccessorField[], void, void>('java/resolveUnimplementedAccessors');
}

export interface GenerateAccessorsParams {
    context: CodeActionParams;
    accessors: AccessorField[];
}

export namespace GenerateAccessorsRequest {
    export const type = new RequestType<GenerateAccessorsParams, WorkspaceEdit, void, void>('java/generateAccessors');
}

export interface MethodBinding {
    bindingKey: string;
    name: string;
    parameters: string[];
}

export interface CheckConstructorsResponse {
    constructors: MethodBinding[];
    fields: VariableBinding[];
}

export namespace CheckConstructorStatusRequest {
    export const type = new RequestType<CodeActionParams, CheckConstructorsResponse, void, void>('java/checkConstructorsStatus');
}

export interface GenerateConstructorsParams {
    context: CodeActionParams;
    constructors: MethodBinding[];
    fields: VariableBinding[];
}

export namespace GenerateConstructorsRequest {
    export const type = new RequestType<GenerateConstructorsParams, WorkspaceEdit, void, void>('java/generateConstructors');
}

export interface DelegateField {
    field: VariableBinding;
    delegateMethods: MethodBinding[];
}

export interface CheckDelegateMethodsResponse {
    delegateFields: DelegateField[];
}

export namespace CheckDelegateMethodsStatusRequest {
    export const type = new RequestType<CodeActionParams, CheckDelegateMethodsResponse, void, void>('java/checkDelegateMethodsStatus');
}

export interface DelegateEntry {
    field: VariableBinding;
    delegateMethod: MethodBinding;
}

export interface GenerateDelegateMethodsParams {
    context: CodeActionParams;
    delegateEntries: DelegateEntry[];
}

export namespace GenerateDelegateMethodsRequest {
    export const type = new RequestType<GenerateDelegateMethodsParams, WorkspaceEdit, void, void>('java/generateDelegateMethods');
}

export interface RenamePosition {
    uri: string;
    offset: number;
    length: number;
}

export interface RefactorWorkspaceEdit {
    edit: WorkspaceEdit;
    command?: Command;
    errorMessage?: string;
}

export interface GetRefactorEditParams {
    command: string;
    context: CodeActionParams;
    options: FormattingOptions;
    commandArguments: any[];
}

export namespace GetRefactorEditRequest {
    export const type = new RequestType<GetRefactorEditParams, RefactorWorkspaceEdit, void, void>('java/getRefactorEdit');
}

export interface SelectionInfo {
    name: string;
    length: number;
    offset: number;
    params?: string[];
}

export interface InferSelectionParams {
    command: string;
    context: CodeActionParams;
}

export namespace InferSelectionRequest {
    export const type = new RequestType<InferSelectionParams, SelectionInfo[], void, void>('java/inferSelection');
}

export interface PackageNode {
    displayName: string;
    uri: string;
    path: string;
    project: string;
    isDefaultPackage: boolean;
    isParentOfSelectedFile: boolean;
}

export interface MoveParams {
    moveKind: string;
    sourceUris: string[];
    params: CodeActionParams;
    destination?: any;
    updateReferences?: boolean;
}

export interface MoveDestinationsResponse {
    errorMessage?: string;
    destinations: any[];
}

export namespace GetMoveDestinationsRequest {
    export const type = new RequestType<MoveParams, MoveDestinationsResponse, void, void>('java/getMoveDestinations');
}

export namespace MoveRequest {
    export const type = new RequestType<MoveParams, RefactorWorkspaceEdit, void, void>('java/move');
}

export interface SearchSymbolParams extends WorkspaceSymbolParams {
    projectName: string;
    maxResults?: number;
    sourceOnly?: boolean;
}

export namespace SearchSymbols {
    export const type = new RequestType<SearchSymbolParams, SymbolInformation[], void, void>('java/searchSymbols');
}

export interface FindLinksParams {
    type: string;
    position: TextDocumentPositionParams;
}

export interface LinkLocation extends Location {
    displayName: string;
    kind: string;
}

export namespace FindLinks {
    export const type = new RequestType<FindLinksParams, LinkLocation[], void, void>('java/findLinks');
}

export interface RenameFilesParams {
    files: Array<{ oldUri: string, newUri: string }>;
}

export namespace WillRenameFiles {
    export const type = new RequestType<RenameFilesParams, WorkspaceEdit, void, void>('workspace/willRenameFiles');
}
