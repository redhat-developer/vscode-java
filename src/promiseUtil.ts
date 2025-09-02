export class Deferred<T> {
	readonly promise: Promise<T>;

	resolve: (result: T) =>  void;
	reject: (error: any) => void;

	constructor() {
		this.promise= new Promise<T>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}
