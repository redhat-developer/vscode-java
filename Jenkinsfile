#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-14.19.1'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh 'npm install -g --force "@vscode/vsce"'
	sh 'npm install -g "ovsx"'
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

def downloadLombokJar(){
	stage "Download lombok.jar"
	sh "npx gulp download_lombok"
}

def packageSpecificExtensions() {
	stage "Package platform specific vscode-java"
	def platforms = ["win32-x64", "linux-x64", "linux-arm64", "darwin-x64", "darwin-arm64"]
	def embeddedJRE = 17
	for(platform in platforms){
		sh "npx gulp download_jre --target ${platform} --javaVersion ${embeddedJRE}"
		sh "vsce package ${env.publishPreReleaseFlag} --target ${platform} -o java-${platform}-${env.EXTENSION_VERSION}-${env.BUILD_NUMBER}.vsix"
	}
}

def packageExtensions() {
	env.publishPreReleaseFlag = ""
	if (publishPreRelease.equals('true')) {
		stage "replace extension version"
		sh "npx gulp prepare_pre_release"

		def packageJson = readJSON file: 'package.json'
		env.EXTENSION_VERSION = "${packageJson.version}"
		env.publishPreReleaseFlag = "--pre-release"

		packageSpecificExtensions()
	} else {
		stage "package generic version"
		def packageJson = readJSON file: 'package.json'
		env.EXTENSION_VERSION = "${packageJson.version}"

		sh "vsce package ${env.publishPreReleaseFlag} -o java-${env.EXTENSION_VERSION}-${env.BUILD_NUMBER}.vsix"

		packageSpecificExtensions()
		stash name:'platformVsix', includes:'java-win32-*.vsix,java-linux-*.vsix,java-darwin-*.vsix'

		stage 'Upload vscode-java to staging'
		def artifactDir = "java-${env.EXTENSION_VERSION}-${env.BUILD_NUMBER}"
		sh "mkdir ${artifactDir}"
		sh "mv *.vsix ${artifactDir}"

		sh "sftp ${UPLOAD_LOCATION}/jdt.ls/staging <<< \$'mkdir ${artifactDir}\nput -r ${artifactDir}'"
		// Clean up build vsix
		sh "rm -rf ${artifactDir}"
		unstash 'platformVsix'
	}
}

def publishExtensions() {
	// Clean up embedded jre folder from previous build
	sh 'npx gulp clean_jre'

	if (publishToMarketPlace.equals('true') || publishToOVSX.equals('true')) {
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'fbricon,rgrunber'
		}
	}

	def platformVsixes = findFiles(glob: '**.vsix')

	stage "publish generic version to VS Code Marketplace"
	withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
		sh 'vsce publish -p ${TOKEN}' + " ${env.publishPreReleaseFlag}"
	}

	stage "publish specific version to VS Code Marketplace"

	withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
		for(platformVsix in platformVsixes){
			sh 'vsce publish -p ${TOKEN}' + " --packagePath ${platformVsix.path}"
		}
	}

	stage "Publish generic version to Open-VSX Marketplace"
	withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
		sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${env.publishPreReleaseFlag}"
	}

	stage "Publish specific version to Open-VSX Marketplace"
	withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
		for(platformVsix in platformVsixes){
			sh 'ovsx publish -p ${OVSX_TOKEN}' + " --packagePath ${platformVsix.path}"
		}
	}

	if (publishToMarketPlace.equals('true') || publishToOVSX.equals('true')) {
		stage "Publish to http://download.jboss.org/jbosstools/static/jdt.ls/stable/"
		def artifactDir = "java-${env.EXTENSION_VERSION}"
		sh "mkdir ${artifactDir}"
		sh "mv *.vsix ${artifactDir}"

		archive includes:"${artifactDir}/**/*.*"

		// copy this stable build to Akamai-mirrored /static/ URL, so staging can be cleaned out more easily
		sh "sftp ${UPLOAD_LOCATION}/static/jdt.ls/stable/ <<< \$'mkdir ${artifactDir}\nput -r ${artifactDir}'"
	}
}

node('rhel8'){
	stage 'Build JDT LS'

	env.JAVA_HOME="${tool 'openjdk-17'}"
	env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
	sh 'java -version'

	git url: 'https://github.com/eclipse/eclipse.jdt.ls.git'
	sh "./mvnw clean verify -B -U -e -Pserver-distro -Dtycho.disableP2Mirrors=true -DskipTests -P!jboss-maven-repos,!redhat-ga-repository,!redhat-ea-repository"

	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	stash name: 'server_distro', includes :files[0].path
}

node('rhel8'){
	env.JAVA_HOME="${tool 'openjdk-17'}"
	env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
	stage 'Checkout vscode-java code'
	deleteDir()
	git url: 'https://github.com/redhat-developer/vscode-java.git'

	stage 'install vscode-java build requirements'
	installBuildRequirements()

	stage 'Build vscode-java'
	buildVscodeExtension()
	unstash 'server_distro'
	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	sh "rm -rf ./out"
	sh "mkdir ./server"
	sh "tar -xvzf ${files[0].path} -C ./server"

	stage 'Test vscode-java for staging'
	wrap([$class: 'Xvnc']) {
		sh "npm run compile" //compile the test code too
		env.SKIP_COMMANDS_TEST="true"
		sh "npm test --silent"
	}

	downloadLombokJar()

	packageExtensions()

	if (publishPreRelease.equals('true') || publishToMarketPlace.equals('true') || publishToOVSX.equals('true')) {
		publishExtensions()
	}
}
