'use strict';

import { ExtensionAPI, ClasspathQueryOptions, ClasspathResult, ExtensionApiVersion, ClientStatus } from "./extension.api";
import { RequirementsData } from "./requirements";
import { getDocumentSymbolsCommand, getDocumentSymbolsProvider } from "./documentSymbols";
import { goToDefinitionCommand, goToDefinitionProvider } from "./goToDefinition";
import { commands, Uri } from "vscode";
import { Commands } from "./commands";
import { Emitter } from "vscode-languageclient";
import { ServerMode, getJavaServerMode } from "./settings";
import { registerHoverCommand } from "./hoverAction";

class ApiManager {

    private api: ExtensionAPI;
    private onDidClasspathUpdateEmitter: Emitter<Uri> = new Emitter<Uri>();
    private onDidServerModeChangeEmitter: Emitter<ServerMode> = new Emitter<ServerMode>();
    private onDidProjectsImportEmitter: Emitter<Uri[]> = new Emitter<Uri[]>();

    public initialize(requirements: RequirementsData): void {
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
        const onDidServerModeChange = this.onDidServerModeChangeEmitter.event;
        const onDidProjectsImport = this.onDidProjectsImportEmitter.event;

        this.api = {
            apiVersion: ExtensionApiVersion,
            javaRequirement: requirements,
            status: ClientStatus.Starting,
            registerHoverCommand: registerHoverCommand,
            getDocumentSymbols,
            goToDefinition,
            getProjectSettings,
            getClasspaths,
            isTestFile,
            onDidClasspathUpdate,
            serverMode: getJavaServerMode(),
            onDidServerModeChange,
            onDidProjectsImport,
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

    public updateServerMode(mode: ServerMode): void {
        this.api.serverMode = mode;
    }

    public updateStatus(status: ClientStatus): void {
        this.api.status = status;
    }
}

export const apiManager: ApiManager = new ApiManager();
