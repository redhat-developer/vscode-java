'use strict';

export interface IHandler {
	handle(extName: string, message: string): Promise<void>;
	canRecommendExtension(extName: string): boolean;
}
