/* eslint-disable @typescript-eslint/prefer-for-of */
import { VSCodeButton, VSCodeTextField, VSCodeDropdown, VSCodeOption, VSCodeCheckbox, VSCodePanels, VSCodePanelTab, VSCodePanelView, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import React from "react";
import { vscode } from "../vscodeApiWrapper";

interface State {
	focusRow: number;
	editParameterRow: number;
	editExceptionRow: number;
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
			editParameterRow: -1,
			editExceptionRow: -1,
			methodIdentifier: undefined,
			isDelegate: false,
			methodName: undefined,
			accessType: undefined,
			returnType: undefined,
			parameters: [],
			exceptions: []
		};
	}

	doRefactor = (preview: boolean) => {
		vscode.postMessage({
			preview: preview,
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
			this.doRefactor(false);
		} else if (id === "preview") {
			this.doRefactor(true);
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
		} else if (id.startsWith("editParameter")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				editParameterRow: selectedRowNumber,
				editExceptionRow: -1,
				focusRow: -1,
			});
			this.forceUpdate();
			const elementToSelect = document.getElementById(`parameterType-${selectedRowNumber}`);
			if (elementToSelect) {
				elementToSelect.focus();
			}
		} else if (id.startsWith("editException")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			this.setState({
				editParameterRow: -1,
				editExceptionRow: selectedRowNumber,
				focusRow: -1,
			});
			this.forceUpdate();
			const elementToSelect = document.getElementById(`exceptionType-${selectedRowNumber}`);
			if (elementToSelect) {
				elementToSelect.focus();
			}
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
		} else if (id.startsWith("confirmParameter")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			const parameterType = document.getElementById(`parameterType-${selectedRowNumber}`);
			const parameterName = document.getElementById(`parameterName-${selectedRowNumber}`);
			const parameterDefault = this.isDefaultValueEditable(selectedRowNumber) ? document.getElementById(`parameterDefault-${selectedRowNumber}`) : undefined;
			this.setState({
				parameters: this.state.parameters.map((e, i) => {
					if (i === selectedRowNumber) {
						if (parameterType?.outerText) {
							e.type = parameterType.outerText;
						}
						if (parameterName?.outerText) {
							e.name = parameterName.outerText;
						}
						if (parameterDefault?.outerText) {
							e.defaultValue = parameterDefault.outerText;
						}
					}
					return e;
				}),
				editParameterRow: -1,
				editExceptionRow: -1,
				focusRow: -1
			});
			this.forceUpdate();
		} else if (id.startsWith("cancelParameter")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			const parameterType = document.getElementById(`parameterType-${selectedRowNumber}`);
			if (parameterType) {
				parameterType.textContent = this.state.parameters[selectedRowNumber].type;
			}
			const parameterName = document.getElementById(`parameterName-${selectedRowNumber}`);
			if (parameterName) {
				parameterName.textContent = this.state.parameters[selectedRowNumber].name;
			}
			if (this.isDefaultValueEditable(selectedRowNumber)) {
				const parameterDefault = document.getElementById(`parameterDefault-${selectedRowNumber}`);
				if (parameterDefault) {
					parameterDefault.textContent = this.state.parameters[selectedRowNumber].defaultValue;
				}
			}
			this.setState({
				editParameterRow: -1,
				editExceptionRow: -1,
				focusRow: -1
			});
			this.forceUpdate();
		} else if (id.startsWith("confirmException")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			const exceptionType = document.getElementById(`exceptionType-${selectedRowNumber}`);
			this.setState({
				exceptions: this.state.exceptions.map((e, i) => {
					if (i === selectedRowNumber) {
						if (exceptionType?.outerText) {
							e.type = exceptionType.outerText;
						}
					}
					return e;
				}),
				editParameterRow: -1,
				editExceptionRow: -1,
				focusRow: -1
			});
			this.forceUpdate();
		} else if (id.startsWith("cancelException")) {
			const selectedRowNumber: number | undefined = this.getSelectedRowNumber(id);
			if (selectedRowNumber === undefined) {
				return;
			}
			const exceptionType = document.getElementById(`exceptionType-${selectedRowNumber}`);
			if (exceptionType) {
				exceptionType.textContent = this.state.exceptions[selectedRowNumber].type;
			}
			this.setState({
				editParameterRow: -1,
				editExceptionRow: -1,
				focusRow: -1
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

	isDefaultValueEditable = (row: number) => {
		return this.state.parameters[row].originalIndex === -1;
	};

	getDefaultValue = (row: number) => {
		return this.isDefaultValueEditable(row) ? this.state.parameters[row].defaultValue : "-";
	};

	generateParameterDataGridRow = (row: number) => {
		return <VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`parameterRow-${row}`}>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`parameter-cell ${row === this.state.editParameterRow ? "parameter-cell-edit" : ""}`} id={`parameterType-${row}`} contentEditable={row === this.state.editParameterRow ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"1"}>{this.state.parameters[row].type}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`parameter-cell ${row === this.state.editParameterRow ? "parameter-cell-edit" : ""}`} id={`parameterName-${row}`} contentEditable={row === this.state.editParameterRow ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"2"}>{this.state.parameters[row].name}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`parameter-cell ${row === this.state.editParameterRow ? "parameter-cell-edit" : ""}`} id={`parameterDefault-${row}`} contentEditable={row === this.state.editParameterRow && this.isDefaultValueEditable(row) ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"3"}>{this.getDefaultValue(row)}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`parameter-cell-button ${row === this.state.editParameterRow ? "parameter-cell-edit" : ""}`} id={`parameterButton-${row}`} gridColumn={"4"}>
				{row === this.state.editParameterRow ?
					<div className="table-buttons-edit">
						<VSCodeButton className={"table-buttons-edit-ok"} disabled={false} appearance="primary" onClick={this.onClick} id={`confirmParameter-${row}`}>OK</VSCodeButton>
						<VSCodeButton className={"table-buttons-edit-cancel"} disabled={false} appearance="secondary" onClick={this.onClick} id={`cancelParameter-${row}`}>Cancel</VSCodeButton>
					</div> : row === this.state.focusRow ? <div className="table-buttons">
						<VSCodeButton appearance="icon" disabled={row === 0}>
							<span className={"codicon codicon-arrow-up"} title={"Up"} onClick={this.onClick} id={`upParameter-${row}`}></span>
						</VSCodeButton>
						<VSCodeButton appearance="icon" disabled={row === this.state.parameters.length - 1}>
							<span className={"codicon codicon-arrow-down"} title={"Down"} onClick={this.onClick} id={`downParameter-${row}`}></span>
						</VSCodeButton>
						<VSCodeButton appearance="icon">
							<span className={"codicon codicon-edit"} title={"Edit"} onClick={this.onClick} id={`editParameter-${row}`}></span>
						</VSCodeButton>
						<VSCodeButton appearance="icon">
							<span className={"codicon codicon-close"} title={"Remove"} onClick={this.onClick} id={`removeParameter-${row}`}></span>
						</VSCodeButton>
					</div> : <div onMouseEnter={this.onMouseEnter} className="table-buttons"></div>
				}
			</VSCodeDataGridCell>
		</VSCodeDataGridRow>;
	};

	generateExceptionDataGridRow = (row: number) => {
		return <VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`exceptionRow-${row}`}>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`parameter-cell ${row === this.state.editExceptionRow ? "parameter-cell-edit" : ""}`} id={`exceptionType-${row}`} contentEditable={row === this.state.editExceptionRow ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"1"}>{this.state.exceptions[row].type}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`parameter-cell-button ${row === this.state.editExceptionRow ? "parameter-cell-edit" : ""}`} id={`exceptionButton-${row}`} gridColumn={"4"}>
				{row === this.state.editExceptionRow ?
					<div className="table-buttons-edit">
						<VSCodeButton className={"table-buttons-edit-ok"} disabled={false} appearance="primary" onClick={this.onClick} id={`confirmException-${row}`}>OK</VSCodeButton>
						<VSCodeButton className={"table-buttons-edit-cancel"} disabled={false} appearance="secondary" onClick={this.onClick} id={`cancelException-${row}`}>Cancel</VSCodeButton>
					</div> : row === this.state.focusRow ? <div className="table-buttons">
						<VSCodeButton appearance="icon">
							<span className={"codicon codicon-edit"} title={"Edit"} onClick={this.onClick} id={`editException-${row}`}></span>
						</VSCodeButton>
						<VSCodeButton appearance="icon">
							<span className={"codicon codicon-close"} title={"Remove"} onClick={this.onClick} id={`removeException-${row}`}></span>
						</VSCodeButton>
					</div> : <div onMouseEnter={this.onMouseEnter} className="table-buttons"></div>
				}
			</VSCodeDataGridCell>
		</VSCodeDataGridRow>;
	};

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
									for (let row = 0; row < this.state.parameters.length; row++) {
										options.push(this.generateParameterDataGridRow(row));
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
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"exceptionHeaderType"} gridColumn={"1"}>Type</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell"} cellType={"columnheader"} id={"exceptionHeaderButton"} gridColumn={"2"}></VSCodeDataGridCell>
							</VSCodeDataGridRow>
							{
								(() => {
									const options = [];
									for (let row = 0; row < this.state.exceptions.length; row++) {
										options.push(this.generateExceptionDataGridRow(row));
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
				<VSCodeTextArea className={"preview"} value={this.getPreview()} readOnly={true}>Method signature:</VSCodeTextArea>
				<VSCodeCheckbox id="delegate" className={"delegate"} onClick={this.onClick}>Keep original method as delegate to changed method</VSCodeCheckbox>
				<div className={"bottom-buttons"}>
					<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"refactor"}>Refactor</VSCodeButton>
					<VSCodeButton className={"vsc-button"} appearance="secondary" onClick={this.onClick} id={"preview"}>Preview</VSCodeButton>
				</div>
			</main >
		);
	};

	/**
	 * get the row number of the item id. The format is `${description}-${rowNumber}`.
	 * @param id the item id
	 * @returns the row number, or undefined if the id is not in the correct format
	 */
	private getSelectedRowNumber(id: string): number | undefined {
		const idSplit: string[] = id.split("-");
		if (idSplit.length !== 2) {
			return undefined;
		}
		return Number(idSplit[1]);
	}
}
