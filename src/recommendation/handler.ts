'use strict';

export interface IHandler {
	handle(extName: string, message: string): Promise<void>;
	isExtensionInstalled(extName: string): boolean;
}
