'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { workspace, WorkspaceConfiguration, commands, Uri, version, ExtensionContext } from 'vscode';
import { Commands } from './commands';
import { IJavaRuntime } from 'jdk-utils';
import { getSupportedJreNames, listJdks, sortJdksBySource, sortJdksByVersion } from './jdkUtils';
const vscodeVariables = require('vscode-variables');

export function getJavaConfiguration(): WorkspaceConfiguration {
	return workspace.getConfiguration('java');
}

export function isPreferenceOverridden(section: string): boolean {
	const config = workspace.getConfiguration();
	return config.inspect(section).workspaceFolderValue !== undefined ||
			config.inspect(section).workspaceFolderLanguageValue !== undefined ||
			config.inspect(section).workspaceValue !== undefined ||
			config.inspect(section).workspaceLanguageValue !== undefined ||
			config.inspect(section).globalValue !== undefined ||
			config.inspect(section).globalLanguageValue !== undefined;
}

export function cleanJavaLSConfiguration(context: ExtensionContext) {
	const globalStoragePath = context.globalStorageUri?.fsPath; // .../Code/User/globalStorage/redhat.java
	deleteDirectory(globalStoragePath);
}

export function deleteDirectory(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach((child) => {
			const entry = path.join(dir, child);
			if (fs.lstatSync(entry).isDirectory()) {
				deleteDirectory(entry);
			} else {
				fs.unlinkSync(entry);
			}
		});
		fs.rmdirSync(dir);
	}
}

export function deleteClientLog(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach((child) => {
			if (child.startsWith('client.log') || child.endsWith('audit.json')) {
				const entry = path.join(dir, child);
				if (!fs.lstatSync(entry).isDirectory()) {
					fs.unlinkSync(entry);
				}
			}
		});
	}
}

export function getTimestamp(file) {
	if (!fs.existsSync(file)) {
		return -1;
	}
	const stat = fs.statSync(file);
	return stat.mtimeMs;
}

export function ensureExists(folder) {
	if (fs.existsSync(folder)) {
		return;
	}
	ensureExists(path.dirname(folder));
	fs.mkdirSync(folder);
}

export function getBuildFilePatterns(): string[] {
	const config = getJavaConfiguration();
	const isMavenImporterEnabled: boolean = config.get<boolean>("import.maven.enabled");
	const isGradleImporterEnabled: boolean = config.get<boolean>("import.gradle.enabled");
	const patterns: string[] = [];
	if (isMavenImporterEnabled) {
		patterns.push("**/pom.xml");
	}
	if (isGradleImporterEnabled) {
		patterns.push("**/*.gradle");
		patterns.push("**/*.gradle.kts");
	}

	return patterns;
}

export function getInclusionPatternsFromNegatedExclusion(): string[] {
	const config = getJavaConfiguration();
	const exclusions: string[] = config.get<string[]>("import.exclusions", []);
	const patterns: string[] = [];
	for (const exclusion of exclusions) {
		if (exclusion.startsWith("!")) {
			patterns.push(exclusion.substr(1));
		}
	}
	return patterns;
}

export function convertToGlob(filePatterns: string[], basePatterns?: string[]): string {
	if (!filePatterns || filePatterns.length === 0) {
		return "";
	}

	if (!basePatterns || basePatterns.length === 0) {
		return parseToStringGlob(filePatterns);
	}

	const patterns: string[] = [];
	for (const basePattern of basePatterns) {
		for (const filePattern of filePatterns) {
			patterns.push(path.join(basePattern, `/${filePattern}`).replace(/\\/g, "/"));
		}
	}
	return parseToStringGlob(patterns);
}

/**
 * Merge the values of setting 'java.import.exclusions' into one glob pattern.
 * @param additionalExclusions Additional exclusions to be merged into the glob pattern.
 */
export function getExclusionGlob(additionalExclusions?: string[]): string {
	const config = getJavaConfiguration();
	const exclusions: string[] = config.get<string[]>("import.exclusions", []);
	const patterns: string[] = [];
	for (const exclusion of exclusions) {
		if (exclusion.startsWith("!")) {
			continue;
		}

		patterns.push(exclusion);
	}
	if (additionalExclusions) {
		patterns.push(...additionalExclusions);
	}
	return parseToStringGlob(patterns);
}

function parseToStringGlob(patterns: string[]): string {
	if (!patterns || patterns.length === 0) {
		return "";
	}

	return `{${patterns.join(",")}}`;
}

/**
 * Get all Java projects from Java Language Server.
 * @param excludeDefaultProject whether the default project should be excluded from the list, defaults to true.
 * @returns string array for the project uris.
 */
export async function getAllJavaProjects(excludeDefaultProject: boolean = true): Promise<string[]> {
	const projectUris: string[] = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
	return filterDefaultProject(projectUris, excludeDefaultProject);
}

/**
 * Get all projects from Java Language Server.
 * @param excludeDefaultProject whether the default project should be excluded from the list, defaults to true.
 * @returns string array for the project uris.
 */
export async function getAllProjects(excludeDefaultProject: boolean = true): Promise<string[]> {
	const projectUris: string[] = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS,
		JSON.stringify({ includeNonJava: true }));
	return filterDefaultProject(projectUris, excludeDefaultProject);
}

function filterDefaultProject(projectUris: string[], excludeDefaultProject: boolean): string[] {
	if (excludeDefaultProject) {
		return projectUris.filter((uriString) => {
			const projectPath = Uri.parse(uriString).fsPath;
			return path.basename(projectPath) !== "jdt.ls-java-project";
		});
	}
	return projectUris;
}

export async function hasBuildToolConflicts(): Promise<boolean> {
	const projectConfigurationUris: Uri[] = await getBuildFilesInWorkspace();
	const projectConfigurationFsPaths: string[] = projectConfigurationUris.map((uri) => uri.fsPath);
	const eclipseDirectories = getDirectoriesByBuildFile(projectConfigurationFsPaths, [], ".project");
	// ignore the folders that already has .project file (already imported before)
	const gradleDirectories = getDirectoriesByBuildFile(projectConfigurationFsPaths, eclipseDirectories, ".gradle");
	const gradleDirectoriesKts = getDirectoriesByBuildFile(projectConfigurationFsPaths, eclipseDirectories, ".gradle.kts");
	gradleDirectories.push(...gradleDirectoriesKts);
	const mavenDirectories = getDirectoriesByBuildFile(projectConfigurationFsPaths, eclipseDirectories, "pom.xml");
	return gradleDirectories.some((gradleDir) => {
		return mavenDirectories.includes(gradleDir);
	});
}

async function getBuildFilesInWorkspace(): Promise<Uri[]> {
	const buildFiles: Uri[] = [];
	const inclusionFilePatterns: string[] = getBuildFilePatterns();
	inclusionFilePatterns.push("**/.project");
	const inclusionFolderPatterns: string[] = getInclusionPatternsFromNegatedExclusion();
	// Since VS Code API does not support put negated exclusion pattern in findFiles(),
	// here we first parse the negated exclusion to inclusion and do the search.
	if (inclusionFilePatterns.length > 0 && inclusionFolderPatterns.length > 0) {
		buildFiles.push(...await workspace.findFiles(convertToGlob(inclusionFilePatterns, inclusionFolderPatterns), null /* force not use default exclusion */));
	}

	const inclusionGlob: string = convertToGlob(inclusionFilePatterns);
	const exclusionGlob: string = getExclusionGlob();
	if (inclusionGlob) {
		buildFiles.push(...await workspace.findFiles(inclusionGlob, exclusionGlob));
	}

	return buildFiles;
}

function getDirectoriesByBuildFile(inclusions: string[], exclusions: string[], fileName: string): string[] {
	return inclusions.filter((fsPath) => fsPath.endsWith(fileName)).map((fsPath) => {
		return path.dirname(fsPath);
	}).filter((inclusion) => {
		return !exclusions.includes(inclusion);
	});
}

const detectJdksAtStart: boolean = getJavaConfiguration().get<boolean>('configuration.detectJdksAtStart');

export async function getJavaConfig(javaHome: string) {
	const origConfig = getJavaConfiguration();
	const javaConfig = JSON.parse(JSON.stringify(origConfig));
	javaConfig.home = javaHome;
	// Since source & output path are project specific settings. To avoid pollute other project,
	// we avoid reading the value from the global scope.
	javaConfig.project.outputPath = origConfig.inspect<string>("project.outputPath").workspaceValue;
	javaConfig.project.sourcePaths = origConfig.inspect<string[]>("project.sourcePaths").workspaceValue;

	const editorConfig = workspace.getConfiguration('editor');
	javaConfig.format.insertSpaces = editorConfig.get('insertSpaces');
	javaConfig.format.tabSize = editorConfig.get('tabSize');
	const filesConfig = workspace.getConfiguration('files');
	javaConfig.associations = filesConfig.get('associations');
	const isInsider: boolean = isInsiderEditor();
	const androidSupport = javaConfig.jdt.ls.androidSupport.enabled;
	switch (androidSupport) {
		case "auto":
			javaConfig.jdt.ls.androidSupport.enabled = isInsider;
			break;
		case "on":
			javaConfig.jdt.ls.androidSupport.enabled = true;
			break;
		case "off":
			javaConfig.jdt.ls.androidSupport.enabled = false;
			break;
		default:
			javaConfig.jdt.ls.androidSupport.enabled = false;
			break;
	}

	const javacSupport = javaConfig.jdt.ls.javac.enabled;
	switch (javacSupport) {
		case "on":
			javaConfig.jdt.ls.javac.enabled = true;
			break;
		case "off":
			javaConfig.jdt.ls.javac.enabled = false;
			break;
		default:
			javaConfig.jdt.ls.javac.enabled = false;
			break;
	}

	if (javaConfig.completion.matchCase === "auto") {
		javaConfig.completion.matchCase = "firstLetter";
	}

	const guessMethodArguments = javaConfig.completion.guessMethodArguments;
	if (guessMethodArguments === "auto") {
		javaConfig.completion.guessMethodArguments = isInsider ? "off" : "insertBestGuessedArguments";
	}

	javaConfig.telemetry = { enabled: workspace.getConfiguration('redhat.telemetry').get('enabled', false) };
	if (detectJdksAtStart) {
		const userConfiguredJREs: any[] = javaConfig.configuration.runtimes;
		javaConfig.configuration.runtimes = await addAutoDetectedJdks(userConfiguredJREs);
	}

	if (!isPreferenceOverridden("java.implementationCodeLens") && typeof javaConfig.implementationsCodeLens?.enabled === 'boolean'){
		const deprecatedImplementations = javaConfig.implementationsCodeLens.enabled;
		javaConfig.implementationCodeLens = deprecatedImplementations ? "types" : "none";
	}

	return javaConfig;
}

async function addAutoDetectedJdks(configuredJREs: any[]): Promise<any[]> {
	// search valid JDKs from env.JAVA_HOME, env.PATH, SDKMAN, jEnv, jabba, Common directories
	const autoDetectedJREs: IJavaRuntime[] = await listJdks();
	sortJdksByVersion(autoDetectedJREs);
	sortJdksBySource(autoDetectedJREs);
	const addedJreNames: Set<string> = new Set<string>();
	const supportedJreNames: string[] = getSupportedJreNames();
	for (const jre of configuredJREs) {
		if (jre.name) {
			addedJreNames.add(jre.name);
		}
	}
	for (const jre of autoDetectedJREs) {
		const majorVersion: number = jre.version?.major ?? 0;
		if (!majorVersion) {
			continue;
		}

		let jreName: string = `JavaSE-${majorVersion}`;
		if (majorVersion <= 5) {
			jreName = `J2SE-1.${majorVersion}`;
		} else if (majorVersion <= 8) {
			jreName = `JavaSE-1.${majorVersion}`;
		}

		if (addedJreNames.has(jreName) || !supportedJreNames?.includes(jreName)) {
			continue;
		}

		configuredJREs.push({
			name: jreName,
			path: jre.homedir,
		});

		addedJreNames.add(jreName);
	}

	return configuredJREs;
}

export function resolveActualCause(callstack: any): any {
	if (!callstack) {
		return;
	}

	const callstacks = callstack.split(/\r?\n/);
	if (callstacks?.length) {
		for (let i = callstacks.length - 1; i >= 0; i--) {
			if (callstacks[i]?.startsWith("Caused by:")) {
				return callstacks.slice(i).join("\n");
			}
		}
	}

	return callstack;
}

export function getVersion(extensionPath: string): string {
	const packagePath = path.resolve(extensionPath, "package.json");
	const packageFile = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
	if (packageFile) {
		return packageFile.version;
	}

	return '0.0.0';
}

export function getVSCodeVariablesMap(): any {
	const keys = [
		"userHome", "workspaceFolder", "workspaceFolderBasename"
	];
	const res = {};
	keys.forEach(key => res[key] = vscodeVariables(`\${${key}}`));
	return res;
}

/**
 * Check if the extension version is a pre-release version or running an insider editor.
 * @param context The extension context or extension path
 * @returns true if the version is a pre-release version or running an insider editor
 */
export function isPrereleaseOrInsiderVersion(context: ExtensionContext | string): boolean {
	return  isInsiderEditor() || isPreReleaseVersion(context);
}

/**
 * Check if the extension version is a pre-release version.
 * Pre-release versions follow the pattern: major.minor.timestamp (e.g., 1.47.1234567890)
 * @param context The extension context or extension path
 * @returns true if the version is a pre-release version
 */
export function isPreReleaseVersion(context: ExtensionContext | string): boolean {
	const extensionPath = typeof context === 'string' ? context : context.extensionPath;
	const extVersion = getVersion(extensionPath);
	return /^\d+\.\d+\.\d{10}/.test(extVersion);
}

/**
 * Check if the editor is an insider release.
 * @returns true if the editor is an insider release
 */
export function isInsiderEditor(): boolean {
	return version.includes("insider");
}
/*
* cyrb53 (c) 2018 bryc (github.com/bryc)
* Public domain (or MIT if needed). Attribution appreciated.
* A fast and simple 53-bit string hash function with decent collision resistance.
* Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
export function cyrb53 (str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
