// Copyright (c) Microsoft Corporation. All rights reserved.

'use strict';

import * as vscode from "vscode";
import { IHandler } from "./handler";

const EXTENSION_NAME = "redhat.fabric8-analytics";
const MARKETPLACE_URL = `https://marketplace.visualstudio.com/items?itemName=${EXTENSION_NAME}`;
const RECOMMENDATION_MESSAGE = `[Dependency Analytics](${MARKETPLACE_URL}) extension is recommended to get insights about pom.xml.`;

function isPomDotXml(uri: vscode.Uri) {
	return !!uri.path && uri.path.toLowerCase().endsWith("pom.xml");
}

export function initialize (context: vscode.ExtensionContext, handler: IHandler): void {
	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => {
		if (isPomDotXml(e.uri)) {
			handler.handle(EXTENSION_NAME, RECOMMENDATION_MESSAGE);
		}
	}));

	const isPomDotXmlOpened = vscode.workspace.textDocuments.findIndex(doc => isPomDotXml(doc.uri)) !== -1;
	if (isPomDotXmlOpened) {
		handler.handle(EXTENSION_NAME, RECOMMENDATION_MESSAGE);
	}
}
