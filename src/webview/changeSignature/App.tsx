/* eslint-disable @typescript-eslint/prefer-for-of */
import { VSCodeButton, VSCodeTextField, VSCodeDropdown, VSCodeOption, VSCodeCheckbox, VSCodePanels, VSCodePanelTab, VSCodePanelView, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import React from "react";
import { vscode } from "../vscodeapiWrapper";

interface State {
	focusRow: number;
	methodIdentifier: string | undefined;
	isDelegate: boolean;
	methodName: string | undefined;
	accessType: string | undefined;
	returnType: string | undefined;
	parameters: MethodParameter[];
	exceptions: MethodException[];
}

interface MethodParameter {
	type: string;
	name: string;
	defaultValue: string;
	originalIndex: number;
}

interface MethodException {
	type: string;
	typeHandleIdentifier: string | undefined;
}

export class App extends React.Component<{}, State> {

	constructor(props: any) {
		super(props);
		this.state = {
			focusRow: -1,
			methodIdentifier: undefined,
			isDelegate: false,
			methodName: undefined,
			accessType: undefined,
			returnType: undefined,
			parameters: [],
			exceptions: []
		};
	}

	doRefactor = () => {
		vscode.postMessage({
			command: "doRefactor",
			methodIdentifier: this.state.methodIdentifier,
			isDelegate: this.state.isDelegate,
			accessType: this.state.accessType,
			methodName: this.state.methodName,
			returnType: this.state.returnType,
			parameters: this.state.parameters,
			exceptions: this.state.exceptions,
		});
	};

	onChange = (event: any) => {
		const id = event.target.id as string;
		if (!id) {
			return;
		}
		if (id === "access-modifier") {
			this.setState({
				accessType: event.target.value
			});
			this.forceUpdate();
		} else if (id === "returnType") {
			this.setState({
				returnType: event.target.value
			});
			this.forceUpdate();
		} else if (id === "methodName") {
			this.setState({
				methodName: event.target.value
			});
			this.forceUpdate();
		} else if (id.startsWith("parameterType")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				parameters: this.state.parameters.map((e, i) => {
					if (i === selectedRowNumber) {
						e.type = event.target.outerText;
					}
					return e;
				})
			});
			this.forceUpdate();
		} else if (id.startsWith("parameterName")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				parameters: this.state.parameters.map((e, i) => {
					if (i === selectedRowNumber) {
						e.name = event.target.outerText;
					}
					return e;
				})
			});
			this.forceUpdate();
		} else if (id.startsWith("parameterDefault")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				parameters: this.state.parameters.map((e, i) => {
					if (i === selectedRowNumber) {
						e.defaultValue = event.target.outerText;
					}
					return e;
				})
			});
			this.forceUpdate();
		} else if (id.startsWith("exceptionType")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				exceptions: this.state.exceptions.map((e, i) => {
					if (i === selectedRowNumber) {
						e.type = event.target.outerText;
					}
					return e;
				})
			});
			this.forceUpdate();
		}
		return;
	};

	getPreview = () => {
		let parameters = "";
		for (let i = 0; i < this.state.parameters.length; i++) {
			parameters += `${this.state.parameters[i].type} ${this.state.parameters[i].name}, `;
		}
		parameters = parameters.substring(0, parameters.length - 2);
		let exceptions = "";
		if (this.state.exceptions.length) {
			exceptions = " throws ";
			for (let i = 0; i < this.state.exceptions.length; i++) {
				exceptions += `${this.state.exceptions[i].type}, `;
			}
			exceptions = exceptions.substring(0, exceptions.length - 2);
		}
		return `${this.state.accessType} ${this.state.returnType} ${this.state.methodName}(${parameters})${exceptions}`;
	};

	onClick = (event: any) => {
		const id = event.target.id as string;
		if (!id) {
			return;
		}
		if (id === "refactor") {
			this.doRefactor();
		} else if (id === "addParameter") {
			const parameterNames = this.state.parameters.map(e => {
				return e.name;
			});
			let newParameterName: string = "newParam";
			let i = 1;
			while (parameterNames.includes(newParameterName)) {
				i++;
				newParameterName = `newParam${i}`;
			}
			this.setState({
				parameters: [...this.state.parameters, {
					type: "Object",
					name: newParameterName,
					defaultValue: "null",
					originalIndex: -1
				}]
			});
			this.forceUpdate();
		} else if (id.startsWith("removeParameter")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				parameters: this.state.parameters.filter((e, i) => {
					return i !== selectedRowNumber;
				})
			});
			this.forceUpdate();
		} else if (id.startsWith("upParameter")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			const currentParameters = this.state.parameters;
			const temp = currentParameters[selectedRowNumber - 1];
			currentParameters[selectedRowNumber - 1] = currentParameters[selectedRowNumber];
			currentParameters[selectedRowNumber] = temp;
			this.setState({
				parameters: currentParameters
			});
			this.forceUpdate();
		} else if (id.startsWith("downParameter")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			const currentParameters = this.state.parameters;
			const temp = currentParameters[selectedRowNumber + 1];
			currentParameters[selectedRowNumber + 1] = currentParameters[selectedRowNumber];
			currentParameters[selectedRowNumber] = temp;
			this.setState({
				parameters: currentParameters
			});
			this.forceUpdate();
		} else if (id === "addException") {
			const exceptionNames = this.state.exceptions.map(e => {
				return e.type;
			});
			let newExceptionName: string = "Exception";
			let i = 1;
			while (exceptionNames.includes(newExceptionName)) {
				i++;
				newExceptionName = `Exception${i}`;
			}
			this.setState({
				exceptions: [...this.state.exceptions, {
					type: newExceptionName,
					typeHandleIdentifier: undefined,
				}]
			});
			this.forceUpdate();
		} else if (id.startsWith("removeException")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				exceptions: this.state.exceptions.filter((e, i) => {
					return i !== selectedRowNumber;
				})
			});
			this.forceUpdate();
		} else if (id === "delegate") {
			this.setState({
				isDelegate: event.target.checked
			});
			this.forceUpdate();
		}
	};

	handleMessage = (event: any) => {
		const { data } = event;
		const command = data.command as string;
		if (command === "setInitialState") {
			this.setState({
				methodIdentifier: data.methodIdentifier,
				accessType: data.accessType,
				methodName: data.methodName,
				returnType: data.returnType,
				parameters: data.parameters,
				exceptions: data.exceptions,
			});
			this.forceUpdate();
		}
	};

	onMouseEnter = (event: any) => {
		const id = event.target.id as string;
		if (id.includes("Header")) {
			this.setState({
				focusRow: -1
			});
		} else if (id) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber !== undefined) {
				this.setState({
					focusRow: selectedRowNumber
				});
			}
		}
	};

	onMouseLeave = (event: any) => {
		this.setState({
			focusRow: -1
		});
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
				<h1>Change Method Signature</h1>
				<div className="section">
					<div className="flex section-columns">
						<div className="header-left">
							<label className="vscode-text-field" htmlFor="access-modifier">Access modifier:</label>
							<VSCodeDropdown className="vsc-dropdown" id={"access-modifier"} onChange={this.onChange} initialValue={this.state.accessType}>
								<VSCodeOption id={"public"} key={"public"}>public</VSCodeOption>
								<VSCodeOption id={"protected"} key={"protected"}>protected</VSCodeOption>
								<VSCodeOption id={"package-private"} key={"packagePrivate"}>package-private</VSCodeOption>
								<VSCodeOption id={"private"} key={"private"}>private</VSCodeOption>
							</VSCodeDropdown>
						</div>
						<div className="flex-grow header">
							<VSCodeTextField value={this.state.returnType} id={"returnType"} onInput={this.onChange}>Return type:</VSCodeTextField>
						</div>
						<div className="flex-grow header-right">
							<VSCodeTextField value={this.state.methodName} id={"methodName"} onInput={this.onChange}>Method name:</VSCodeTextField>
						</div>
					</div>
				</div>
				<VSCodePanels className={"parameters-panel"}>
					<VSCodePanelTab id="parametersTab">Parameters</VSCodePanelTab>
					<VSCodePanelTab id="exceptionsTab">Exceptions</VSCodePanelTab>
					<VSCodePanelView id="parametersView" className={"parameters-view"}>
						<VSCodeDataGrid className={"parameters-grid"} onMouseLeave={this.onMouseLeave}>
							<VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={"parameterHeader"}>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"parameterHeaderType"} gridColumn={"1"}>Type</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"parameterHeaderName"} gridColumn={"2"}>Name</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"parameterHeaderDefault"} gridColumn={"3"}>Default value</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"parameterHeaderButton"} gridColumn={"4"}></VSCodeDataGridCell>
							</VSCodeDataGridRow>
							{
								(() => {
									const options = [];
									for (let i = 0; i < this.state.parameters.length; i++) {
										options.push(<VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`parameterRow-${i}`}>
											<VSCodeDataGridCell className={"parameter-cell"} id={`parameterType-${i}`} contentEditable="true" suppressContentEditableWarning={true} gridColumn={"1"} onBlur={this.onChange}>{this.state.parameters[i].type}</VSCodeDataGridCell>
											<VSCodeDataGridCell className={"parameter-cell"} id={`parameterName-${i}`} contentEditable="true" suppressContentEditableWarning={true} gridColumn={"2"} onBlur={this.onChange}>{this.state.parameters[i].name}</VSCodeDataGridCell>
											<VSCodeDataGridCell className={"parameter-cell"} id={`parameterDefault-${i}`} contentEditable={this.state.parameters[i].originalIndex === -1 ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"3"} onBlur={this.onChange}>{this.state.parameters[i].originalIndex === -1 ? this.state.parameters[i].defaultValue : "-"}</VSCodeDataGridCell>
											<VSCodeDataGridCell className={"parameter-cell-button"} id={`parameterButton-${i}`} gridColumn={"4"}>
												<div className="table-buttons">
													<VSCodeButton appearance="icon" className={this.state.focusRow === i ? "" : "table-buttons-hide"} disabled={i === 0}>
														<span className={"codicon codicon-arrow-up"} title={"Up"} onClick={this.onClick} id={`upParameter-${i}`}></span>
													</VSCodeButton>
													<VSCodeButton appearance="icon" className={this.state.focusRow === i ? "" : "table-buttons-hide"} disabled={i === this.state.parameters.length - 1}>
														<span className={"codicon codicon-arrow-down"} title={"Down"} onClick={this.onClick} id={`downParameter-${i}`}></span>
													</VSCodeButton>
													<VSCodeButton appearance="icon" className={this.state.focusRow === i ? "" : "table-buttons-hide"}>
														<span className={"codicon codicon-remove"} title={"Remove"} onClick={this.onClick} id={`removeParameter-${i}`}></span>
													</VSCodeButton>
												</div>
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>
										);
									}
									return options;
								})()
							}
						</VSCodeDataGrid>
						<div className={"bottom-buttons"}>
							<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"addParameter"}>Add</VSCodeButton>
						</div>
					</VSCodePanelView>
					<VSCodePanelView id="exceptionsView" className={"parameters-view"}>
						<VSCodeDataGrid className={"parameters-grid"} onMouseLeave={this.onMouseLeave}>
							<VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`exceptionHeader`}>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"exceptionHeaderType"}gridColumn={"1"}>Type</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"exceptionHeaderButton"} gridColumn={"2"}></VSCodeDataGridCell>
							</VSCodeDataGridRow>
							{
								(() => {
									const options = [];
									for (let i = 0; i < this.state.exceptions.length; i++) {
										options.push(<VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`exceptionRow-${i}`}>
											<VSCodeDataGridCell className={"parameter-cell"} id={`exceptionType-${i}`} gridColumn={"1"} contentEditable="true" suppressContentEditableWarning={true} onBlur={this.onChange}>{this.state.exceptions[i].type}</VSCodeDataGridCell>
											<VSCodeDataGridCell className={"parameter-cell-button"} id={`exceptionButton-${i}`} gridColumn={"4"} onInput={this.onChange}>
												<div className="table-buttons">
													<VSCodeButton appearance="icon" className={this.state.focusRow === i ? "" : "table-buttons-hide"}>
														<span className="codicon codicon-remove" onClick={this.onClick} id={`removeException-${i}`} title={"Remove"}></span>
													</VSCodeButton>
												</div>
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>
										);
									}
									return options;
								})()
							}
						</VSCodeDataGrid>
						<div className={"bottom-buttons"}>
							<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"addException"}>Add</VSCodeButton>
						</div>
					</VSCodePanelView>
				</VSCodePanels>
				<VSCodeTextArea className={"preview"} value={this.getPreview()} readOnly={true}>Method signature preview:</VSCodeTextArea>
				<VSCodeCheckbox id="delegate" className={"delegate"} onClick={this.onClick}>Keep original method as delegate to changed method</VSCodeCheckbox>
				<div className={"bottom-buttons"}>
					<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"refactor"}>Preview and Refactor</VSCodeButton>
				</div>
			</main >
		);
	};

	private getSelectedRowNumber(id: string): number | undefined {
		const idSplit: string[] = id.split("-");
		if (idSplit.length !== 2) {
			return undefined;
		}
		return Number(idSplit[1]);
	}
}
