/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import React from "react";
import { vscode } from "../vscodeApiWrapper";
import { Jvms } from "./jvms";
import { InitializeMessage, JVM, ToDashboardMessage, ToDashboardMessageType } from "../../webviewProtocol/toDashboard";
import './dashboard.css';

type State = {
	jvms: JVM[];
	lombokEnabled: boolean;
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
			jvms: [],
			lombokEnabled: false,
		};
	}

	handleMessage = (event: MessageEvent) => {
		const message = event.data as ToDashboardMessage;
		switch (message.type) {
			case "initialize": {
				const initializeMessage = message as InitializeMessage;
				this.setState({ jvms: initializeMessage.jvms, lombokEnabled: initializeMessage.lombokEnabled });
				break;
			} case "settingsChanged":
				this.setState({ lombokEnabled: (message as InitializeMessage).lombokEnabled });
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

		return (
			<main>
				<h3>Detected Java Installations</h3>
				<Jvms jvms={this.state.jvms}></Jvms>
				<a href={openSettingsLink('java.configuration.runtimes')}>configure...</a>
				<br />
				<h3>Lombok Support</h3>
				<span>enabled</span><input type="checkbox" readOnly={true} checked={this.state.lombokEnabled}/>
				<a href = {openSettingsLink('java.jdt.ls.lombokSupport.enabled')}>configure...</a>
			</main >
		);
	};
}
