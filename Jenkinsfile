#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-12.13.1'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh "npm install -g vsce"
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

node('rhel8'){
	stage 'Build JDT LS'

	env.JAVA_HOME="${tool 'openjdk-11'}"
	env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
	sh 'java -version'

	git url: 'https://github.com/eclipse/eclipse.jdt.ls.git'
	sh "./mvnw clean verify -B -U -e -Pserver-distro -Dtycho.disableP2Mirrors=true -DskipTests -P!jboss-maven-repos,!redhat-ga-repository,!redhat-ea-repository"

	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	stash name: 'server_distro', includes :files[0].path
}

node('rhel8'){
	env.JAVA_HOME="${tool 'openjdk-11'}"
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

	stage "Package vscode-java"
	def packageJson = readJSON file: 'package.json'
	sh "vsce package -o java-${packageJson.version}-${env.BUILD_NUMBER}.vsix"

	stage 'Test vscode-java for staging'
	wrap([$class: 'Xvnc']) {
		sh "npm run compile" //compile the test code too
		env.SKIP_COMMANDS_TEST="true"
		sh "npm test --silent"
	}

	stage 'Upload vscode-java to staging'
	def vsix = findFiles(glob: '**.vsix')
	sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/jdt.ls/staging"
	stash name:'vsix', includes:files[0].path
}

node('rhel8'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'fbricon,rgrunber'
		}

		stage "Publish to Marketplaces"
		unstash 'vsix'
		def vsix = findFiles(glob: '**.vsix')
		// VS Code Marketplace
		withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
			sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
		}

		// Open-vsx Marketplace
		sh "npm install -g ovsx"
		withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
			sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
		}

		archive includes:"**.vsix"

		stage "Publish to http://download.jboss.org/jbosstools/static/jdt.ls/stable/"
		// copy this stable build to Akamai-mirrored /static/ URL, so staging can be cleaned out more easily
		sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/static/jdt.ls/stable/"
	}// if publishToMarketPlace
}
