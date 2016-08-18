'use strict';

import { RequestType, NotificationType, TextDocumentIdentifier} from 'vscode-languageclient';

export interface StatusReport {
	message: string;
	type: string;
}

export namespace StatusNotification {
	export const type: NotificationType<StatusReport> = { get method() { return 'language/status'; } };
}

export namespace ClassFileContentsRequest {
    export const type: RequestType<TextDocumentIdentifier, string, void> = { get method() { return 'java/ClassFileContents'; }};
}
