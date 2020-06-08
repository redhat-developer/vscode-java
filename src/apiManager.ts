'use strict';

import { ExtensionAPI, registerHoverCommand, ClasspathQueryOptions, ClasspathResult, ExtensionApiVersion } from "./extension.api";
import { RequirementsData } from "./requirements";
import { getDocumentSymbolsCommand, getDocumentSymbolsProvider } from "./documentSymbols";
import { goToDefinitionCommand, goToDefinitionProvider } from "./goToDefinition";
import { commands, Uri } from "vscode";
import { Commands } from "./commands";
import { Emitter } from "vscode-languageclient";
import { ServerMode, getJavaServerMode } from "./settings";
import { hoverProvider } from "./providerDispatcher";

class ApiManager {

    private api: ExtensionAPI;
    private onDidClasspathUpdateEmitter: Emitter<Uri> = new Emitter<Uri>();
    private onWillChangeServerMode: Emitter<ServerMode> = new Emitter<ServerMode>();
    private onDidChangeServerMode: Emitter<ServerMode> = new Emitter<ServerMode>();
    private onDidProjectsImport: Emitter<Uri[]> = new Emitter<Uri[]>();

    public initialize(requirements: RequirementsData): void {
        const registerHoverCommand: registerHoverCommand = hoverProvider.registerHoverCommand;
        const getDocumentSymbols: getDocumentSymbolsCommand = getDocumentSymbolsProvider();
        const goToDefinition: goToDefinitionCommand = goToDefinitionProvider();

        const getProjectSettings = async (uri: string, SettingKeys: string[]) => {
            return await commands.executeCommand<Object>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_PROJECT_SETTINGS, uri, SettingKeys);
        };

        const getClasspaths = async (uri: string, options: ClasspathQueryOptions) => {
            return await commands.executeCommand<ClasspathResult>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_CLASSPATHS, uri, JSON.stringify(options));
        };

        const isTestFile = async (uri: string) => {
            return await commands.executeCommand<boolean>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.IS_TEST_FILE, uri);
        };

        const onDidClasspathUpdate = this.onDidClasspathUpdateEmitter.event;
        const onWillChangeServerMode = this.onWillChangeServerMode.event;
        const onDidChangeServerMode = this.onDidChangeServerMode.event;
        const onDidProjectsImport = this.onDidProjectsImport.event;

        this.api = {
            apiVersion: ExtensionApiVersion,
            javaRequirement: requirements,
            status: null,
            registerHoverCommand,
            getDocumentSymbols,
            goToDefinition,
            getProjectSettings,
            getClasspaths,
            isTestFile,
            onDidClasspathUpdate,
            serverMode: getJavaServerMode() === ServerMode.STANDARD ? ServerMode.STANDARD : ServerMode.LIGHTWEIGHT,
            onWillChangeServerMode,
            onDidChangeServerMode,
            onDidProjectsImport,
        };
    }

    public getApiInstance(): ExtensionAPI {
        if (!this.api) {
            throw new Error("API instance is not initialized");
        }

        return this.api;
    }

    public emitDidClasspathUpdate(event: Uri): void {
        this.onDidClasspathUpdateEmitter.fire(event);
    }

    public emitDidChangeServerMode(event: ServerMode): void {
        this.onDidChangeServerMode.fire(event);
    }

    public emitWillChangeServerMode(event: ServerMode): void {
        this.onWillChangeServerMode.fire(event);
    }

    public emitDidProjectsImport(event: Uri[]): void {
        this.onDidProjectsImport.fire(event);
    }

    public updateServerMode(mode: ServerMode): void {
        this.api.serverMode = mode;
    }

    public updateStatus(status: "Started" | "Error"): void {
        this.api.status = status;
    }
}

export const apiManager: ApiManager = new ApiManager();
