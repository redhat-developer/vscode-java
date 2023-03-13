export function cloneArray(array: any[]): any[] {
	const clonedArray = [];
	array.forEach(val => clonedArray.push(Object.assign({}, val)));
	return clonedArray;
}
