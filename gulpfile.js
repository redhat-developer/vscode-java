'use strict';
const gulp = require('gulp');
const gulp_tslint = require('gulp-tslint');
const cp = require('child_process');
const decompress = require('gulp-decompress');
const download = require('gulp-download');
const server_dir = '../eclipse.jdt.ls';
//...
gulp.task('tslint', () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report());
});

gulp.task('download_server', ()=>
{
	download("http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz")
		.pipe(decompress())
		.pipe(gulp.dest('./server'))
});

gulp.task('build_server', ()=>
{
	cp.execSync(mvnw()+ ' -Pserver-distro clean package', {cwd:server_dir, stdio:[0,1,2]} );
	gulp.src(server_dir + '/org.eclipse.jdt.ls.product/distro/*.tar.gz')
		.pipe(decompress())
		.pipe(gulp.dest('./server'))
});

gulp.task('dev_server', ()=>
{
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
});

gulp.task('watch_server',()=>{
	gulp.watch(server_dir+'/org.eclipse.jdt.ls.core/**/*.java',['dev_server']);
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
