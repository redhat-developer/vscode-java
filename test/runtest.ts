import * as path from 'path';
import * as fse from 'fs-extra';
import { runTests } from '@vscode/test-electron';

async function main() {
	const testProjectOriginPath: string = path.join(__dirname, '..', '..', 'test', 'resources', 'projects', 'maven', 'salut');
	const testProjectPath: string = path.join(__dirname, '..', '..', 'test-temp');
	const settingsJsonPath: string = path.join(testProjectPath, '.vscode', 'settings.json');
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../..');
		await fse.copy(testProjectOriginPath, testProjectPath);
		await fse.ensureDir(path.join(testProjectPath, '.vscode'));

		// run tests for lightweight mode
		console.log("setup settings.json for lightweight mode...");
		/* eslint-disable @typescript-eslint/naming-convention */
		await fse.writeJSON(settingsJsonPath, {
			"java.server.launchMode": "LightWeight",
		});

		console.log("running lightweight cases...");
		/* eslint-enable @typescript-eslint/naming-convention */
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: path.resolve(__dirname, './lightweight-mode-suite'),
			launchArgs: [
				testProjectPath,
				'--disable-extensions',
				'--disable-workspace-trust'
			]
		});


		// run tests for standard mode

		console.log("setup settings.json for standard mode...");
		/* eslint-disable @typescript-eslint/naming-convention */
		await fse.writeJSON(settingsJsonPath, {
			"java.server.launchMode": "Standard",
			"java.configuration.updateBuildConfiguration": "automatic"
		});

		console.log("running standard cases...");
		/* eslint-enable @typescript-eslint/naming-convention */
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: path.resolve(__dirname, './standard-mode-suite'),
			launchArgs: [
				testProjectPath,
				'--disable-extensions',
				'--disable-workspace-trust'
			]
		});


	} catch (err) {
		console.error(`Failed to run tests: ${err}`);
		process.exit(1);
	} finally {
		await fse.remove(testProjectPath);
	}
}

main();
