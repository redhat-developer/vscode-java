// Copyright (c) Microsoft Corporation. All rights reserved.

'use strict';

import * as vscode from "vscode";
import { initialize as initDependencyAnalytics } from "./dependencyAnalytics";
import { TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/lib";
import { IRecommendationService, Recommendation, RecommendationCore } from "@redhat-developer/vscode-extension-proposals/lib";

export async function initialize (context: vscode.ExtensionContext, telemetry: Promise<TelemetryService>): Promise<void> {
	const telem: TelemetryService = await telemetry;
    const recommendService: IRecommendationService | undefined = RecommendationCore.getService(context, telem);
    if( recommendService ) {
		const fromDependencyAnalytics: Recommendation[] = initDependencyAnalytics(context, recommendService);
        recommendService.register(fromDependencyAnalytics);
    }
}
