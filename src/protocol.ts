'use strict';

import { RequestType, NotificationType } from 'vscode-languageclient';

export interface StatusReport {
	message: string;
	type: string;
}

export namespace StatusNotification {
	export const type: NotificationType<StatusReport> = { get method() { return 'language/status'; } };
}

export namespace ClassFileContentsRequest {
    export const type: RequestType<ClassFileContentParams, string, void> = { get method() { return 'java/ClassFileContents'; }};
}

export interface ClassFileContentParams  {
    uri: string;
}
