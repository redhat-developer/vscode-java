'use strict';

import { commands } from "vscode";
import { apiManager } from "./apiManager";
import { Commands } from "./commands";
import { getAllJavaProjects, getJavaConfiguration } from "./utils";

const jsr305JarRegex = /jsr305-\d+.*\.jar$/;
const eclipseAnnotationJarRegex = /org.eclipse.jdt.annotation-\d+.*\.jar$/;

enum AnnotationNullAnalysis {
	disabled = "disabled",
	jsr305 = "jsr305",
	eclipse = "org.eclipse.jdt.annotation",
}

export async function updateAnnotationNullAnalysisConfiguration(): Promise<void> {
	const annotation: string = getJavaConfiguration().get("compile.annotation.nullAnalysis");
	let annotationRegex;
	if (annotation === AnnotationNullAnalysis.disabled) {
		return;
	}
	if (annotation === AnnotationNullAnalysis.jsr305) {
		annotationRegex = jsr305JarRegex;
	} else if (annotation === AnnotationNullAnalysis.eclipse) {
		annotationRegex = eclipseAnnotationJarRegex;
	}
	const projectUris: string[] = await getAllJavaProjects();
	for (const projectUri of projectUris) {
		const classpathResult = await apiManager.getApiInstance().getClasspaths(projectUri, {scope: 'test'});
		for (const classpath of classpathResult.classpaths) {
			if (annotationRegex.test(classpath)) {
				commands.executeCommand<void>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.UPDATE_ANNOTATION_NULL_ANALYSIS, annotation);
				return;
			}
		}
	}
	// if the specific annotation type is not in the classpath, then we should disable null analysis to avoid errors
	// See: https://bugs.eclipse.org/bugs/show_bug.cgi?id=479389
	commands.executeCommand<void>(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.UPDATE_ANNOTATION_NULL_ANALYSIS, AnnotationNullAnalysis.disabled);
}
