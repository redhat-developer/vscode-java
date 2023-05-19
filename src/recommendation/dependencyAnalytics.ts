// Copyright (c) Microsoft Corporation. All rights reserved.

'use strict';

import { IRecommendationService, Recommendation } from "@redhat-developer/vscode-extension-proposals/lib";
import * as vscode from "vscode";

const EXTENSION_NAME = "redhat.fabric8-analytics";
const GH_ORG_URL = `https://github.com/fabric8-analytics`;
let alreadyShown = false;
export function initialize (context: vscode.ExtensionContext, recommendService: IRecommendationService): Recommendation[] {
	const ret: Recommendation = createDependencyRecommendation(recommendService);
	delayedShowDependencyRecommendation(context, recommendService);
	return [ret];
}

function createDependencyRecommendation(recommendService: IRecommendationService): Recommendation {
	const r1 = recommendService.create(EXTENSION_NAME, "Dependency Analytics",
	`The [Dependency Analytics](${GH_ORG_URL}) extension helps you to stay informed about vulnerable dependencies in pom.xml files.`, false);
	return r1;
}

async function delayedShowDependencyRecommendation (context: vscode.ExtensionContext, recommendService: IRecommendationService): Promise<void> {
	await new Promise(f => setTimeout(f, 6000));
	const isPomDotXmlOpened = vscode.workspace.textDocuments.findIndex(doc => isPomDotXml(doc.uri)) !== -1;
	if (isPomDotXmlOpened) {
		recommendService.show(EXTENSION_NAME);
	} else {
		context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => {
			// I would prefer to delete this listener after showing once, but i can't figure out how ;)
			if( !alreadyShown  ) {
				if (isPomDotXml(e.uri)) {
					recommendService.show(EXTENSION_NAME);
					alreadyShown = true;
				}
			}
		}));
	}
}

function isPomDotXml(uri: vscode.Uri) {
	return !!uri.path && uri.path.toLowerCase().endsWith("pom.xml");
}