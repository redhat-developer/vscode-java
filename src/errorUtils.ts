// copied from https://github.com/redhat-developer/openshift-dd-ext/blob/f8c053bded9bc6c1bfac682cf4867b187e87ee76/client/src/utils/ErrorUtils.ts#L12
export function getMessage(error: any): string {
	return getRawMessage(error).trim();
}

export function getRawMessage(error: any): string {
	if (typeof error === 'string') {
		return error;
	}
	if (error.stderr) {
		return error.stderr;
	}
	if (error.message) {
		return error.message;
	}
	if (error.error) {
		return error.error;
	}

	// Unlikely to happen, as we're either getting an Error object with a message
	// or we're dealing with a failed promise with a stderr message
	// in any other case, we'll need to figure out what to return on a case by case basis
	return JSON.stringify(error);
}