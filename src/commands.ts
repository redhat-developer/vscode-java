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
     * Go to editor location
     */
    export const GOTO_LOCATION = 'editor.action.goToLocations';

    /**
     * Render markdown string to html string
     */
    export const MARKDOWN_API_RENDER = 'markdown.api.render';

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
    * Open Java client Log file
    */
    export const OPEN_CLIENT_LOG = 'java.open.clientLog';

    /**
    * Open Java log files side by side
    */
    export const OPEN_LOGS = 'java.open.logs';

    /**
     * Open Java formatter settings
     */
    export const OPEN_FORMATTER = 'java.open.formatter.settings';
    /**
     * Clean the Java language server workspace
     */
    export const CLEAN_WORKSPACE = 'java.clean.workspace';
    /**
     * Update the source attachment for the selected class file
     */
    export const UPDATE_SOURCE_ATTACHMENT = 'java.project.updateSourceAttachment';
    /**
     * Resolve the source attachment information for the selected class file
     */
    export const RESOLVE_SOURCE_ATTACHMENT = 'java.project.resolveSourceAttachment';
    /**
     * Mark the folder as the source root of the closest project.
     */
    export const ADD_TO_SOURCEPATH = 'java.project.addToSourcePath';
    /**
     * Unmark the folder as the source root of the project.
     */
    export const REMOVE_FROM_SOURCEPATH = 'java.project.removeFromSourcePath';
    /**
     * List all recognized source roots in the workspace.
     */
    export const LIST_SOURCEPATHS = 'java.project.listSourcePaths';
    /**
     * Import new projects
     */
    export const IMPORT_PROJECTS = 'java.project.import';
    /**
     * Override or implements the methods from the supertypes.
     */
    export const OVERRIDE_METHODS_PROMPT = 'java.action.overrideMethodsPrompt';
    /**
     * Generate hashCode() and equals().
     */
    export const HASHCODE_EQUALS_PROMPT = 'java.action.hashCodeEqualsPrompt';
	/**
     * Open settings.json
     */
    export const OPEN_JSON_SETTINGS = 'workbench.action.openSettingsJson';
    /**
     * Organize imports.
     */
    export const ORGANIZE_IMPORTS = "java.action.organizeImports";
    /**
     * Organize imports silently.
     */
    export const ORGANIZE_IMPORTS_SILENTLY = "java.edit.organizeImports";
    /**
     * Custom paste action (triggers auto-import)
     */
    export const CLIPBOARD_ONPASTE = 'java.action.clipboardPasteAction';
    /**
     * Choose type to import.
     */
    export const CHOOSE_IMPORTS = "java.action.organizeImports.chooseImports";
    /**
     * Generate toString().
     */
    export const GENERATE_TOSTRING_PROMPT = 'java.action.generateToStringPrompt';
    /**
     * Generate Getters and Setters.
     */
    export const GENERATE_ACCESSORS_PROMPT = 'java.action.generateAccessorsPrompt';
    /**
     * Generate Constructors.
     */
    export const GENERATE_CONSTRUCTORS_PROMPT = 'java.action.generateConstructorsPrompt';
    /**
     * Generate Delegate Methods.
     */
    export const GENERATE_DELEGATE_METHODS_PROMPT = 'java.action.generateDelegateMethodsPrompt';
    /**
     * Apply Refactoring Command.
     */
    export const APPLY_REFACTORING_COMMAND = 'java.action.applyRefactoringCommand';
    /**
     * Rename Command.
     */
    export const RENAME_COMMAND = 'java.action.rename';
    /**
     * Navigate To Super Method Command.
     */
    export const NAVIGATE_TO_SUPER_IMPLEMENTATION_COMMAND = 'java.action.navigateToSuperImplementation';
    /**
     * Open Type Hierarchy of given Selection.
     */
    export const SHOW_TYPE_HIERARCHY = 'java.action.showTypeHierarchy';
    /**
     * Show SuperType Hierarchy of given Selection.
     */
    export const SHOW_SUPERTYPE_HIERARCHY = 'java.action.showSupertypeHierarchy';
    /**
     * Show SubType Hierarchy of given Selection.
     */
    export const SHOW_SUBTYPE_HIERARCHY = 'java.action.showSubtypeHierarchy';
    /**
     * Show Type Hierarchy of given Selection.
     */
    export const SHOW_CLASS_HIERARCHY = 'java.action.showClassHierarchy';
    /**
     * Change the base type of Type Hierarchy.
     */
    export const CHANGE_BASE_TYPE = 'java.action.changeBaseType';
    /**
     * Open the given TypeHierarchy Item.
     */
    export const OPEN_TYPE_HIERARCHY = 'java.navigate.openTypeHierarchy';
    /**
     * Resolve the given TypeHierarchy Item.
     */
    export const RESOLVE_TYPE_HIERARCHY = 'java.navigate.resolveTypeHierarchy';
    /**
     * Show server task status
     */
    export const SHOW_SERVER_TASK_STATUS = 'java.show.server.task.status';
    /**
     * Get the project settings
     */
    export const GET_PROJECT_SETTINGS = 'java.project.getSettings';
    /**
     * Get the classpaths and modulepaths
     */
    export const GET_CLASSPATHS = 'java.project.getClasspaths';
    /**
     * Check the input file is a test file or not
     */
    export const IS_TEST_FILE = 'java.project.isTestFile';
    /**
     * Get all java projects root path in URI format
     */
    export const GET_ALL_JAVA_PROJECTS = 'java.project.getAll';
    /**
     * Temporary command for Semantic Highlighting. To remove when LSP v3.16 is ready.
     */
    export const PROVIDE_SEMANTIC_TOKENS = 'java.project.provideSemanticTokens';
    /**
     * Temporary command to fetch Semantic Tokens Legend. To remove when LSP v3.16 is ready.
     */
    export const GET_SEMANTIC_TOKENS_LEGEND = 'java.project.getSemanticTokensLegend';
    /**
     * Command to switch between standard mode and lightweight mode.
     */
    export const SWITCH_SERVER_MODE = 'java.server.mode.switch';

    export const LEARN_MORE_ABOUT_REFACTORING = '_java.learnMoreAboutRefactorings';

    export const TEMPLATE_VARIABLES = '_java.templateVariables';

    export const RUNTIME_VALIDATION_OPEN = 'java.runtimeValidation.open';
}
