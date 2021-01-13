// Copyright (c) Microsoft Corporation. All rights reserved.

'use strict';

import * as vscode from "vscode";
import { HandlerImpl } from "./handlerImpl";
import { initialize as initDependencyAnalytics } from "./dependencyAnalytics";

export function initialize (context: vscode.ExtensionContext) {
	const handler = new HandlerImpl(context);
	initDependencyAnalytics(context, handler);
}
