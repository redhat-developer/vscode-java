import { FromWebviewMessageType, WebviewMessage } from "./common";

export type FromDashboardMessageType = FromWebviewMessageType;

export interface DashboardMessage extends WebviewMessage<FromDashboardMessageType> {
	message: FromDashboardMessageType;
}