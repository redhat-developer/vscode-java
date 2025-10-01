/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import React from "react";
import { vscode } from "../vscodeApiWrapper";
import { Jvms } from "./jvms";
import { DiagnosticInfo, JVM, ToDashboardMessage, ToDashboardMessageType, UpdateMessage } from "../../webviewProtocol/toDashboard";
import './dashboard.css';

type State = {
	workspacePath: string;
	jvms: JVM[];
	lombokEnabled: boolean;
	activeLombokPath: string | undefined;
	diagnosticInfo: DiagnosticInfo | undefined;
};

export interface AppProps {
}

function openSettingsLink(settingId: string): string {
	const args = {
			query: settingId
		};
		return `command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify(args))}`;
}

export class Dashboard extends React.Component<AppProps, State> {

	constructor(props: AppProps) {
		super(props);
		this.state = {
			workspacePath: 'unknown',
			jvms: [],
			lombokEnabled: false,
			activeLombokPath: 'unknown',
			diagnosticInfo: {
				mavenUserSettings: 'unknown',
				mavenGlobalSettings: 'unknown',
				activeImporters: [],
				gradleUserHome: 'unknown',
				gradleJavaHome: 'unknown'
			}
		};
	}

	handleMessage = (event: MessageEvent) => {
		const message = event.data as ToDashboardMessage;
		switch (message.type) {
			case "update": {
				for (const [key, value] of Object.entries(message as UpdateMessage)) {
					this.setState({ [key]: value } as Pick<State, keyof State>);
				}
			}
			break;
		}
	};

	componentDidMount(): void {
		window.addEventListener("message", this.handleMessage);
		vscode.postMessage({
			command: "webviewReady"
		});
	}


	render = () => {

		const args = [ {
			path: this.state.workspacePath
		}];
		return (
			<main>
				<div className="toolbar" >
					<a href={`command:java.dashboard.refresh`} className="toolbarItem" tabIndex={-1}><i className="codicon codicon-refresh" title="Refresh"></i></a>
					<a href={`command:java.dashboard.dumpState`} className="toolbarItem" tabIndex={-1}><i className="codicon codicon-json" title="Dump State"></i></a>
				</div>
				<h3>Workspace</h3>
				<div>Path: {this.state.workspacePath || 'undefined'}</div>
				<div><a href={`command:java.dashboard.revealFileInOS?${encodeURIComponent(JSON.stringify(args))}`}>Reveal</a></div>
				<h3>Detected Java Installations</h3>
				<Jvms jvms={this.state.jvms}></Jvms>
				<a href={openSettingsLink('java.configuration.runtimes')}>configure...</a>
				<br />
				<h3>Lombok Support</h3>
				<div>
					<span>enabled</span>
					<span className={this.state.lombokEnabled ? 'codicon codicon-pass' : 'codicon codicon-circle-slash'} style={{verticalAlign: 'middle', margin: '4px'}} title="Enabled"></span>
					<a href = {openSettingsLink('java.jdt.ls.lombokSupport.enabled')}>configure...</a>
				</div>
				<div>Using Lombok at: {this.state.activeLombokPath || ''}</div>
				<h3>Maven</h3>
				<div>User Settings: {this.state.diagnosticInfo?.mavenUserSettings || 'undefined'} <a href={openSettingsLink('java.configuration.maven.userSettings')}>configure...</a></div>
				<div>Global Settings: {this.state.diagnosticInfo?.mavenGlobalSettings || 'undefined'} <a href={openSettingsLink('java.configuration.maven.globalSettings')}>configure...</a></div>
				<h3>Gradle</h3>
				<div>User Home: {this.state.diagnosticInfo?.gradleUserHome || 'undefined'} <a href={openSettingsLink('java.import.gradle.home')}>configure...</a></div>
				<div>Java Home: {this.state.diagnosticInfo?.gradleJavaHome || 'undefined'} <a href={openSettingsLink('java.import.gradle.java.home')}>configure...</a></div>
				<h3>Registered Project Importers</h3>
				{this.state.diagnosticInfo?.activeImporters.map((clazz, index) => (
					<div key={index}>{clazz}</div>
				))}
			</main >
		);
	};
}
