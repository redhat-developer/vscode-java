'use strict';

/**
 * Commonly used commands
 */
export namespace Commands {
    /**
     * Open Browser
     */
    export const OPEN_BROWSER = 'vscode.open';

    /**
     * Open Output view
     */
    export const OPEN_OUTPUT = 'java.open.output';

    /**
     * Show Java references
     */
    export const SHOW_JAVA_REFERENCES = 'java.show.references';

    /**
     * Show Java implementations
     */
    export const SHOW_JAVA_IMPLEMENTATIONS = 'java.show.implementations';

    /**
     * Show editor references
     */
    export const SHOW_REFERENCES = 'editor.action.showReferences';

    /**
     * Update project configuration
     */
    export const CONFIGURATION_UPDATE = 'java.projectConfiguration.update';

    /**
     * Ignore "Incomplete Classpath" messages
     */
    export const IGNORE_INCOMPLETE_CLASSPATH = 'java.ignoreIncompleteClasspath';

    /**
     * Open help for "Incomplete Classpath" message
     */
    export const IGNORE_INCOMPLETE_CLASSPATH_HELP = 'java.ignoreIncompleteClasspath.help';

    /**
     * Reload VS Code window
     */
    export const RELOAD_WINDOW = 'workbench.action.reloadWindow';

    /**
     * Set project configuration update mode
     */
    export const PROJECT_CONFIGURATION_STATUS = 'java.projectConfiguration.status';

    /**
     * Apply Workspace Edit
     */
    export const APPLY_WORKSPACE_EDIT = 'java.apply.workspaceEdit';

    /**
     * Execute Workspace Command
     */
    export const EXECUTE_WORKSPACE_COMMAND = 'java.execute.workspaceCommand';

	/**
	 * Execute Workspace build (compilation)
	 */
    export const COMPILE_WORKSPACE = 'java.workspace.compile';

    /**
    * Open Java Language Server Log file
    */
    export const OPEN_SERVER_LOG = 'java.open.serverLog';

    /**
     * Organize Java file imports command from language server
     */
    export const EDIT_ORGANIZE_IMPORTS = 'java.edit.organizeImports';
    /**
     * Open Java formatter settings
     */
    export const OPEN_FORMATTER = 'java.open.formatter.settings';
}