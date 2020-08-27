'use strict';
const gulp = require('gulp');
const cp = require('child_process');
const decompress = require('gulp-decompress');
const download = require('gulp-download');
const fse = require('fs-extra');
const path = require('path');
const server_dir = '../eclipse.jdt.ls';
const originalTestFolder = path.join(__dirname, 'test', 'resources', 'projects', 'maven', 'salut');
const tempTestFolder = path.join(__dirname, 'test-temp');
const testSettings = path.join(tempTestFolder, '.vscode', 'settings.json');
//...

gulp.task('download_server', function(done) {
	download("http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz")
		.pipe(decompress())
		.pipe(gulp.dest('./server'));
	done();
});

gulp.task('build_server', function(done) {
	cp.execSync(mvnw()+ ' -Pserver-distro clean package', {cwd:server_dir, stdio:[0,1,2]} );
	gulp.src(server_dir + '/org.eclipse.jdt.ls.product/distro/*.tar.gz')
		.pipe(decompress())
		.pipe(gulp.dest('./server'));
	done();
});

gulp.task('dev_server', function(done) {
	let command = mvnw() +' -Pserver-distro,fast -o clean package ';
	if(isLinux()){
		command +='-Denvironment.os=linux -Denvironment.ws=gtk -Denvironment.arch=x86_64';
	}
	else if(isMac()){
		command += '-Denvironment.os=macosx -Denvironment.ws=cocoa -Denvironment.arch=x86_64';
	}
	else if(isWin()){
		command += '-Denvironment.os=win32 -Denvironment.ws=win32 -Denvironment.arch=x86_64';
	}
	console.log('executing '+command);
	cp.execSync(command, {cwd:server_dir, stdio:[0,1,2]} );
	gulp.src(server_dir +'/org.eclipse.jdt.ls.product/distro/*.tar.gz')
		.pipe(decompress())
		.pipe(gulp.dest('./server'))
	done();
});

gulp.task('watch_server',function(done) {
	gulp.watch(server_dir+'/org.eclipse.jdt.ls.core/**/*.java',['dev_server']);
	done();
});

gulp.task('generate_standard_test_folder', function(done) {
	fse.copySync(originalTestFolder, tempTestFolder);
	fse.ensureDirSync(path.join(tempTestFolder, '.vscode'));
	fse.writeJSONSync(testSettings, {
		"java.server.launchMode": "Standard",
		"java.configuration.updateBuildConfiguration": "automatic",
		"refactor.renameFromFileExplorer": "autoApply",
	});
	done();
});

gulp.task('generate_lightweight_test_folder', function(done) {
	fse.copySync(originalTestFolder, tempTestFolder);
	fse.ensureDirSync(path.join(tempTestFolder, '.vscode'));
	fse.writeJSONSync(testSettings, {
		"java.server.launchMode": "LightWeight",
	});
	done();
});

gulp.task('clean_test_folder', function(done) {
	fse.removeSync(tempTestFolder);
	done();
});

function isWin() {
	return /^win/.test(process.platform);
}

function isMac() {
	return /^darwin/.test(process.platform);
}

function isLinux() {
	return /^linux/.test(process.platform);
}

function mvnw() {
	return isWin()?"mvnw.cmd":"./mvnw";
}
