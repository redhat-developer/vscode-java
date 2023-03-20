/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { VSCodeButton, VSCodeTextField, VSCodeDropdown, VSCodeOption, VSCodeCheckbox, VSCodePanels, VSCodePanelTab, VSCodePanelView, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import React from "react";
import { vscode } from "../vscodeApiWrapper";
import _ from "lodash";

type State = UIState & Metadata;

interface UIState {
	focusRow: number;
	editParameterRow: number;
	editExceptionRow: number;
}

interface Metadata {
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

	private initialMetadata: Metadata;
	private static TOOLTIP_RETURN_TYPE: string = "The method return type, can be either name or fully qualified name of the type.";
	private static TOOLTIP_PARAMETER_TYPE: string = "The parameter type, can be either name or fully qualified name of the type.";
	private static TOOLTIP_PARAMETER_DEFAULT: string = "The parameter default value, used when replacing the occurrences for an added parameter.";
	private static TOOLTIP_EXCEPTION_TYPE: string = "The exception type, can be either name or fully qualified name of the type.";

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
			accessType: this.getModifierString(this.state.accessType),
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
		} else if (id === "returnType") {
			this.setState({
				returnType: event.target.value
			});
		} else if (id === "methodName") {
			this.setState({
				methodName: event.target.value
			});
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
		let accessTypeString = this.getModifierString(this.state.accessType);
		if (accessTypeString?.length) {
			accessTypeString += " ";
		}
		return `${accessTypeString}${this.state.returnType} ${this.state.methodName}(${parameters})${exceptions}`;
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
		} else if (id === "reset") {
			this.setState({
				methodIdentifier: this.initialMetadata.methodIdentifier,
				isDelegate: this.initialMetadata.isDelegate,
				accessType: this.initialMetadata.accessType,
				methodName: this.initialMetadata.methodName,
				returnType: this.initialMetadata.returnType,
				parameters: _.cloneDeep(this.initialMetadata.parameters),
				exceptions: _.cloneDeep(this.initialMetadata.exceptions),
				focusRow: -1,
				editParameterRow: -1,
				editExceptionRow: -1,
			});
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
		} else if (id === "delegate") {
			this.setState({
				isDelegate: event.target.checked
			});
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
		}
	};

	handleMessage = (event: any) => {
		const { data } = event;
		const command = data.command as string;
		if (command === "setInitialState") {
			this.initialMetadata = {
				methodIdentifier: data.methodIdentifier,
				isDelegate: false,
				accessType: this.getAccessTypeString(data.modifier),
				methodName: data.methodName,
				returnType: data.returnType,
				parameters: data.parameters,
				exceptions: data.exceptions,
			};
			this.setState({
				methodIdentifier: this.initialMetadata.methodIdentifier,
				isDelegate: this.initialMetadata.isDelegate,
				accessType: this.initialMetadata.accessType,
				methodName: this.initialMetadata.methodName,
				returnType: this.initialMetadata.returnType,
				parameters: _.cloneDeep(this.initialMetadata.parameters),
				exceptions: _.cloneDeep(this.initialMetadata.exceptions),
			});
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
		this.setTextAreaCursorStyle();
		window.addEventListener("message", this.handleMessage);
		vscode.postMessage({
			command: "webviewReady"
		});
	}

	isUnchanged = () => {
		return this.state.isDelegate === this.initialMetadata?.isDelegate
			&& this.state.accessType === this.initialMetadata?.accessType
			&& this.state.methodName === this.initialMetadata?.methodName
			&& this.state.returnType === this.initialMetadata?.returnType
			&& this.isArrayEqual(this.state.parameters, this.initialMetadata?.parameters)
			&& this.isArrayEqual(this.state.exceptions, this.initialMetadata?.exceptions);
	};

	isArrayEqual = (a: any[], b: any[]) => {
		return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((e, i) => this.objectsEqual(e, b[i]));
	};

	objectsEqual = (o1, o2) => {
		return typeof o1 === 'object' && Object.keys(o1).length > 0
			? Object.keys(o1).length === Object.keys(o2).length
			&& Object.keys(o1).every(p => this.objectsEqual(o1[p], o2[p]))
			: o1 === o2;
	};

	/**
	 * Set the cursor style of the text area to text. Since the text area is
	 * inside a shadow DOM, we need to add a style element to the shadow DOM.
	 */
	setTextAreaCursorStyle(): void {
		const host = document.getElementById("textArea");
		if (host?.shadowRoot) {
			const style = document.createElement('style');
			style.innerHTML = '.control { cursor: text !important; }';
			host.shadowRoot.appendChild(style);
		}
	}

	isDefaultValueEditable = (row: number) => {
		return this.state.parameters[row].originalIndex === -1;
	};

	getDefaultValue = (row: number) => {
		return this.isDefaultValueEditable(row) ? this.state.parameters[row].defaultValue : "-";
	};

	generateParameterDataGridRow = (row: number) => {
		return <VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`parameterRow-${row}`} key={`parameterRow-${row}`}>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`${row === this.state.editParameterRow ? "parameter-cell-edit" : "parameter-cell"}`} id={`parameterType-${row}`} contentEditable={row === this.state.editParameterRow ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"1"}>{this.state.parameters[row].type}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`${row === this.state.editParameterRow ? "parameter-cell-edit" : "parameter-cell"}`} id={`parameterName-${row}`} contentEditable={row === this.state.editParameterRow ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"2"}>{this.state.parameters[row].name}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`${row === this.state.editParameterRow ? "parameter-cell-edit" : "parameter-cell"}`} id={`parameterDefault-${row}`} contentEditable={row === this.state.editParameterRow && this.isDefaultValueEditable(row) ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"3"}>{this.getDefaultValue(row)}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`${row === this.state.editParameterRow ? "parameter-cell-edit-button" : "parameter-cell-button"}`} id={`parameterButton-${row}`} gridColumn={"4"}>
				{row === this.state.editParameterRow ?
					<div className="table-buttons-edit">
						<VSCodeButton className={"table-buttons-edit-ok"} disabled={false} appearance="primary" onClick={this.onClick} id={`confirmParameter-${row}`}>OK</VSCodeButton>
						<VSCodeButton className={"table-buttons-edit-cancel"} disabled={false} appearance="secondary" onClick={this.onClick} id={`cancelParameter-${row}`}>Cancel</VSCodeButton>
					</div> : row === this.state.focusRow ? <div className="table-buttons">
						{row === 0 ? <></> : <VSCodeButton appearance="icon">
							<span className={"codicon codicon-arrow-up"} title={"Up"} onClick={this.onClick} id={`upParameter-${row}`}></span>
						</VSCodeButton>}
						{row === this.state.parameters.length - 1 ? <></> : <VSCodeButton appearance="icon">
							<span className={"codicon codicon-arrow-down"} title={"Down"} onClick={this.onClick} id={`downParameter-${row}`}></span>
						</VSCodeButton>}
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
		return <VSCodeDataGridRow onMouseEnter={this.onMouseEnter} id={`exceptionRow-${row}`} key={`exceptionRow-${row}`}>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`${row === this.state.editExceptionRow ? "parameter-cell-edit" : "parameter-cell"}`} id={`exceptionType-${row}`} contentEditable={row === this.state.editExceptionRow ? "true" : "false"} suppressContentEditableWarning={true} gridColumn={"1"}>{this.state.exceptions[row].type}</VSCodeDataGridCell>
			<VSCodeDataGridCell onMouseEnter={this.onMouseEnter} className={`${row === this.state.editExceptionRow ? "parameter-cell-edit-button" : "parameter-cell-button"}`} id={`exceptionButton-${row}`} gridColumn={"2"}>
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
							<div className="text-title">Access modifier:</div>
							<VSCodeDropdown className="vsc-dropdown" id={"access-modifier"} onChange={this.onChange} value={this.state.accessType}>
								<VSCodeOption>public</VSCodeOption>
								<VSCodeOption>protected</VSCodeOption>
								<VSCodeOption>package-private</VSCodeOption>
								<VSCodeOption>private</VSCodeOption>
							</VSCodeDropdown>
						</div>
						<div className="flex-grow header">
							<div className="text-title">Return type:</div>
							<VSCodeTextField title={App.TOOLTIP_RETURN_TYPE} value={this.state.returnType} id={"returnType"} onInput={this.onChange}></VSCodeTextField>
						</div>
						<div className="flex-grow header-right">
							<div className="text-title">Method name:</div>
							<VSCodeTextField value={this.state.methodName} id={"methodName"} onInput={this.onChange}></VSCodeTextField>
						</div>
					</div>
				</div>
				<VSCodePanels className={"parameters-panel"}>
					<VSCodePanelTab id="parametersTab">Parameters</VSCodePanelTab>
					<VSCodePanelTab id="exceptionsTab">Exceptions</VSCodePanelTab>
					<VSCodePanelView id="parametersView" className={"parameters-view"}>
						<VSCodeDataGrid onMouseLeave={this.onMouseLeave}>
							<VSCodeDataGridRow className={"parameter-cell-header"} onMouseEnter={this.onMouseEnter} id={"parameterHeader"}>
								<VSCodeDataGridCell title={App.TOOLTIP_PARAMETER_TYPE} className={"parameter-cell-title"} cellType={"columnheader"} id={"parameterHeaderType"} gridColumn={"1"}>Type</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell-title"} cellType={"columnheader"} id={"parameterHeaderName"} gridColumn={"2"}>Name</VSCodeDataGridCell>
								<VSCodeDataGridCell title={App.TOOLTIP_PARAMETER_DEFAULT} className={"parameter-cell-title"} cellType={"columnheader"} id={"parameterHeaderDefault"} gridColumn={"3"}>Default value</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell-title"} cellType={"columnheader"} id={"parameterHeaderButton"} gridColumn={"4"}></VSCodeDataGridCell>
							</VSCodeDataGridRow>
							{
								(() => {
									const options: JSX.Element[] = [];
									for (let row = 0; row < this.state.parameters.length; row++) {
										options.push(this.generateParameterDataGridRow(row));
									}
									return options;
								})()
							}
						</VSCodeDataGrid>
						<div className={"add-button"}>
							<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"addParameter"}>Add</VSCodeButton>
						</div>
					</VSCodePanelView>
					<VSCodePanelView id="exceptionsView" className={"parameters-view"}>
						<VSCodeDataGrid onMouseLeave={this.onMouseLeave}>
							<VSCodeDataGridRow className={"parameter-cell-header"} onMouseEnter={this.onMouseEnter} id={`exceptionHeader`}>
								<VSCodeDataGridCell title={App.TOOLTIP_EXCEPTION_TYPE} className={"parameter-cell-title"} cellType={"columnheader"} id={"exceptionHeaderType"} gridColumn={"1"}>Type</VSCodeDataGridCell>
								<VSCodeDataGridCell className={"parameter-cell-title"} cellType={"columnheader"} id={"exceptionHeaderButton"} gridColumn={"2"}></VSCodeDataGridCell>
							</VSCodeDataGridRow>
							{
								(() => {
									const options: JSX.Element[] = [];
									for (let row = 0; row < this.state.exceptions.length; row++) {
										options.push(this.generateExceptionDataGridRow(row));
									}
									return options;
								})()
							}
						</VSCodeDataGrid>
						<div className={"add-button"}>
							<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"addException"}>Add</VSCodeButton>
						</div>
					</VSCodePanelView>
				</VSCodePanels>
				<div className="text-title-content">Method signature:</div>
				<VSCodeTextArea className={"preview"} value={this.getPreview()} readOnly={true} id={"textArea"}></VSCodeTextArea>
				<VSCodeCheckbox id="delegate" className={"delegate"} onClick={this.onClick} checked={this.state.isDelegate}>Keep original method as delegate to changed method</VSCodeCheckbox>
				<div className={"bottom-buttons"}>
					<VSCodeButton className={"vsc-button-left"} appearance="primary" onClick={this.onClick} id={"refactor"}>Refactor</VSCodeButton>
					<VSCodeButton className={"vsc-button"} appearance="secondary" onClick={this.onClick} id={"preview"}>Preview</VSCodeButton>
					<VSCodeButton className={"vsc-button"} appearance="secondary" disabled={this.isUnchanged()} onClick={this.onClick} id={"reset"}>Reset</VSCodeButton>
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

	private getModifierString(accessType: string | undefined): string {
		if (!accessType || accessType === "package-private") {
			return "";
		}
		return accessType;
	}

	private getAccessTypeString(visibility: string): string {
		if (visibility === "") {
			return "package-private";
		}
		return visibility;
	}

}
