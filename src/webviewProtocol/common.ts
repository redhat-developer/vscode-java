export interface WebviewMessage<T> {
    type: T;
}

export type FromWebviewMessageType = "webviewReady";
export type ToWebviewMessageType = "update";