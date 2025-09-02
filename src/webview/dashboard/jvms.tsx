import React from "react";
import { JVM } from "../../webviewProtocol/toDashboard";
import path from "path";
import './jvms.css';

export interface JvmsProps {
	jvms: JVM[];
}

export class Jvms extends React.Component<JvmsProps, {}> {
	constructor(props: any) {
		super(props);
		this.state = {
		};
	}

	render = () => {
		return (
			<table className="jvm-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Path</th>
					</tr>
				</thead>
				<tbody>
					{this.props.jvms.map((jvm, index) => (
						<tr className={index % 2 === 0 ? "even" : "odd"} key={jvm.name}>
							<td>{jvm.name}</td>
							<td>{jvm.path}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	};
}