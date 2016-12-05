import { Uri } from 'vscode';

declare module 'java' {

	/**
	 * Represents a location that defines libraries and
	 * source code that can be build as a unit.
	 * Usually a project.
	 */
   export interface ClassPathRoot{
		/**
		 * The uri of this ClasspathRoot
		 *
		 * @readonly
		 */
		uri : Uri;
		/**
		 * The list of classpath entries associated with this root.
		 */
		entries: ClassPathEntry[];
    }

	/**
	 * An entry on ClassPathRoot's definition
	 *
	 */
    export interface ClassPathEntry{
		/**
		 * The path of the entry
		 */
		path: Uri;

		/**
		 * Entry kind
		 */
		kind: ClassPathKind;

    }

	export enum ClassPathKind{
		/**
		 * A folder with source code
		 */
		Source = 1,
		/**
		 * A folder or JAR that contains compiled code
		 */
		Library = 2,
		/**
		 * Reference to a classpath root
		 */
		ClassPathRoot = 3
	}

	export namespace workspace{
		export let classpath :  ClassPathRoot[];
	}
}