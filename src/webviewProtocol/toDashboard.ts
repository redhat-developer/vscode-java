import { ToWebviewMessageType, WebviewMessage } from "./common";

export type ToDashboardMessageType = ToWebviewMessageType;

export interface ToDashboardMessage extends WebviewMessage<ToDashboardMessageType> {
}

export interface JVM {
    name: string;
    path: string;
}

export interface InitializeMessage extends ToDashboardMessage {
	type: "initialize";
    jvms: JVM[];
	lombokEnabled: boolean;
}

export interface SettingChangedMessage extends ToDashboardMessage {
	type: "settingsChanged";
	lombokEnabled: boolean;
}