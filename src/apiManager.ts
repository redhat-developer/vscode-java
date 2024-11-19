'use strict';

import { ExtensionAPI, ClasspathQueryOptions, ClasspathResult, extensionApiVersion, ClientStatus, SourceInvalidatedEvent } from "./extension.api";
import { RequirementsData } from "./requirements";
import { GetDocumentSymbolsCommand, getDocumentSymbolsProvider } from "./documentSymbols";
import { GoToDefinitionCommand, goToDefinitionProvider } from "./goToDefinition";
import { commands, Uri } from "vscode";
import { Commands } from "./commands";
import { Emitter } from "vscode-languageclient";
import { ServerMode } from "./settings";
import { registerHoverCommand } from "./hoverAction";
import { onDidRequestEnd, onWillRequestStart } from "./TracingLanguageClient";
import { getJavaConfiguration } from "./utils";

class ApiManager {

    private api: ExtensionAPI;
    private onDidClasspathUpdateEmitter: Emitter<Uri> = new Emitter<Uri>();
    private onDidServerModeChangeEmitter: Emitter<ServerMode> = new Emitter<ServerMode>();
    private onDidProjectsImportEmitter: Emitter<Uri[]> = new Emitter<Uri[]>();
    private onDidProjectsDeleteEmitter: Emitter<Uri[]> = new Emitter<Uri[]>();
    private traceEventEmitter: Emitter<any> = new Emitter<any>();
    private sourceInvalidatedEventEmitter: Emitter<SourceInvalidatedEvent> = new Emitter<SourceInvalidatedEvent>();
    private serverReadyPromiseResolve: (result: boolean) => void;

    public initialize(requirements: RequirementsData, serverMode: ServerMode): void {
        // if it's manual import mode, set the server mode to lightweight, so that the
        // project explorer won't spinning until import project is triggered.
        if (getJavaConfiguration().get<string>("import.projectSelection") === "manual") {
            serverMode = ServerMode.lightWeight;
        }
        const getDocumentSymbols: GetDocumentSymbolsCommand = getDocumentSymbolsProvider();
        const goToDefinition: GoToDefinitionCommand = goToDefinitionProvider();

        const getProjectSettings = async (uri: string, settingKeys: string[]) => {
            return await commands.executeCommand<Object>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_PROJECT_SETTINGS, uri, settingKeys);
        };

        const getClasspaths = async (uri: string, options: ClasspathQueryOptions) => {
            return await commands.executeCommand<ClasspathResult>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_CLASSPATHS, uri, JSON.stringify(options));
        };

        const isTestFile = async (uri: string) => {
            return await commands.executeCommand<boolean>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.IS_TEST_FILE, uri);
        };

        const onDidClasspathUpdate = this.onDidClasspathUpdateEmitter.event;
        const onDidServerModeChange = this.onDidServerModeChangeEmitter.event;
        const onDidProjectsImport = this.onDidProjectsImportEmitter.event;
        const onDidProjectsDelete = this.onDidProjectsDeleteEmitter.event;
        const traceEvent = this.traceEventEmitter.event;

        const serverReadyPromise: Promise<boolean> = new Promise<boolean>((resolve) => {
            this.serverReadyPromiseResolve = resolve;
        });
        const serverReady = async () => {
            return serverReadyPromise;
        };

        this.api = {
            apiVersion: extensionApiVersion,
            javaRequirement: requirements,
            status: ClientStatus.starting,
            registerHoverCommand: registerHoverCommand,
            getDocumentSymbols,
            goToDefinition,
            getProjectSettings,
            getClasspaths,
            isTestFile,
            onDidClasspathUpdate,
            serverMode,
            onDidServerModeChange,
            onDidProjectsImport,
            onDidProjectsDelete,
            serverReady,
            onWillRequestStart,
            onDidRequestEnd,
            trackEvent: traceEvent,
            onDidSourceInvalidate: this.sourceInvalidatedEventEmitter.event,
        };
    }

    public getApiInstance(): ExtensionAPI {
        if (!this.api) {
            throw new Error("API instance is not initialized");
        }

        return this.api;
    }

    public fireDidClasspathUpdate(event: Uri): void {
        this.onDidClasspathUpdateEmitter.fire(event);
    }

    public fireDidServerModeChange(event: ServerMode): void {
        this.onDidServerModeChangeEmitter.fire(event);
    }

    public fireDidProjectsImport(event: Uri[]): void {
        this.onDidProjectsImportEmitter.fire(event);
    }

    public fireDidProjectsDelete(event: Uri[]): void {
        this.onDidProjectsDeleteEmitter.fire(event);
    }

    public fireTraceEvent(event: any): void {
        this.traceEventEmitter.fire(event);
    }

    public fireSourceInvalidatedEvent(event: SourceInvalidatedEvent): void {
        this.sourceInvalidatedEventEmitter.fire(event);
    }

    public updateServerMode(mode: ServerMode): void {
        this.api.serverMode = mode;
    }

    public updateStatus(status: ClientStatus): void {
        this.api.status = status;
    }

    public resolveServerReadyPromise(): void {
        this.serverReadyPromiseResolve(true);
    }
}

export const apiManager: ApiManager = new ApiManager();
