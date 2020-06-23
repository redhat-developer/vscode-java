'use strict';

import * as assert from 'assert';
import { getJavaConfiguration, getInclusionFilePatterns, getInclusionPatternsFromNegatedExclusion, getExclusionBlob, getInclusionBlob } from '../../src/utils';
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

	test('getInclusionFilePatterns() - Maven importer is enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, true);
		await config.update(IMPORT_GRADLE_ENABLED, false);

		const result: string[] = getInclusionFilePatterns();

		assert.deepEqual(result, ["**/pom.xml"]);
	});

	test('getInclusionFilePatterns() - all importers are enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, true);
		await config.update(IMPORT_GRADLE_ENABLED, true);

		const result: string[] = getInclusionFilePatterns();

		assert.deepEqual(result, ["**/pom.xml", "**/build.gradle"]);
	});

	test('getInclusionFilePatterns() - no importers is enabled', async function () {
		await config.update(IMPORT_MAVEN_ENABLED, false);
		await config.update(IMPORT_GRADLE_ENABLED, false);

		const result: string[] = getInclusionFilePatterns();

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

	test('getInclusionBlob() - no file patterns', async function () {
		const result: string = getInclusionBlob([]);
		assert.equal(result, "");
	});

	test('getInclusionBlob() - no base patterns', async function () {
		const result: string = getInclusionBlob(["**/pom.xml", "**/build.gradle"]);
		assert.equal(result, "{**/pom.xml,**/build.gradle}");
	});

	test('getInclusionBlob() - have base patterns', async function () {
		const result: string = getInclusionBlob(["**/pom.xml"], ["**/node_modules/test/**"]);
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
