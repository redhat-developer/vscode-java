'use strict';

import * as assert from 'assert';
import { getJavaConfiguration, getBuildFilePatterns, getInclusionPatternsFromNegatedExclusion, getExclusionBlob, convertToGlob } from '../../src/utils';
import { WorkspaceConfiguration } from 'vscode';

let exclusion: string[];
let isMavenImporterEnabled: boolean;
let isGradleImporterEnabled: boolean;

const config: WorkspaceConfiguration = getJavaConfiguration();
const IMPORT_EXCLUSION: string = "import.exclusions";
const IMPORT_MAVEN_ENABLED: string = "import.maven.enabled";
const IMPORT_GRADLE_ENABLED: string = "import.gradle.enabled";

// tslint:disable: only-arrow-functions
suite('Utils Test', () => {

	suiteSetup(async function() {
		exclusion = config.get<string[]>(IMPORT_EXCLUSION, []);
		isMavenImporterEnabled = config.get<boolean>(IMPORT_MAVEN_ENABLED, true);
		isGradleImporterEnabled = config.get<boolean>(IMPORT_GRADLE_ENABLED, true);
	});

	test('getBuildFilePatterns() - Maven importer is enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, true);
		await config.update(IMPORT_GRADLE_ENABLED, false);

		const result: string[] = getBuildFilePatterns();

		assert.deepEqual(result, ["**/pom.xml"]);
	});

	test('getBuildFilePatterns() - all importers are enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, true);
		await config.update(IMPORT_GRADLE_ENABLED, true);

		const result: string[] = getBuildFilePatterns();

		assert.deepEqual(result, ["**/pom.xml", "**/build.gradle"]);
	});

	test('getBuildFilePatterns() - no importers is enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, false);
		await config.update(IMPORT_GRADLE_ENABLED, false);

		const result: string[] = getBuildFilePatterns();

		assert.deepEqual(result, []);
	});

	test('getInclusionPatternsFromNegatedExclusion() - no negeted exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string[] = getInclusionPatternsFromNegatedExclusion();

		assert.deepEqual(result, []);
	});

	test('getInclusionPatternsFromNegatedExclusion() - have negeted exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"!**/node_modules/test/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string[] = getInclusionPatternsFromNegatedExclusion();

		assert.deepEqual(result, ["**/node_modules/test/**"]);
	});

	test('getExclusionBlob() - no negeted exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string = getExclusionBlob();

		assert.equal(result, "{**/node_modules/**,**/.metadata/**,**/archetype-resources/**,**/META-INF/maven/**}");
	});

	test('getExclusionBlob() - have negeted exclusions', async function () {
		await config.update(IMPORT_EXCLUSION, [
			"**/node_modules/**",
			"!**/node_modules/test/**",
			"**/.metadata/**",
			"**/archetype-resources/**",
			"**/META-INF/maven/**"
		]);

		const result: string = getExclusionBlob();

		assert.equal(result, "{**/node_modules/**,**/.metadata/**,**/archetype-resources/**,**/META-INF/maven/**}");
	});

	test('convertToGlob() - no file patterns', async function () {
		const result: string = convertToGlob([]);
		assert.equal(result, "");
	});

	test('convertToGlob() - no base patterns', async function () {
		const result: string = convertToGlob(["**/pom.xml", "**/build.gradle"]);
		assert.equal(result, "{**/pom.xml,**/build.gradle}");
	});

	test('convertToGlob() - have base patterns', async function () {
		const result: string = convertToGlob(["**/pom.xml"], ["**/node_modules/test/**"]);
		assert.equal(result, "{**/node_modules/test/**/**/pom.xml}");
	});

	teardown(async function() {
		await recover();
	});
});

async function recover(): Promise<void> {
	await config.update(IMPORT_EXCLUSION, exclusion);
	await config.update(IMPORT_MAVEN_ENABLED, isMavenImporterEnabled);
	await config.update(IMPORT_GRADLE_ENABLED, isGradleImporterEnabled);
}
