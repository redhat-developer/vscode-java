'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { workspace, WorkspaceConfiguration, TextDocument, commands, Uri } from 'vscode';
import { Commands } from './commands';

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

export function getExclusionBlob(): string {
	const config = getJavaConfiguration();
	const exclusions: string[] = config.get<string[]>("import.exclusions", []);
	const patterns: string[] = [];
	for (const exclusion of exclusions) {
		if (exclusion.startsWith("!")) {
			continue;
		}

		patterns.push(exclusion);
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
	let projectUris: string[] = await commands.executeCommand<string[]>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.GET_ALL_JAVA_PROJECTS);
	if (excludeDefaultProject) {
		projectUris = projectUris.filter((uriString) => {
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
	gradleDirectories.concat(gradleDirectoriesKts);
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

	const inclusionBlob: string = convertToGlob(inclusionFilePatterns);
	const exclusionBlob: string = getExclusionBlob();
	if (inclusionBlob) {
		buildFiles.push(...await workspace.findFiles(inclusionBlob, exclusionBlob));
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
