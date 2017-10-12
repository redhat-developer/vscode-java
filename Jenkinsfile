#!/usr/bin/env groovy

def installBuildRequirements(){
	def nodeHome = tool 'nodejs-7.7.4'
	env.PATH="${env.PATH}:${nodeHome}/bin"
	sh "npm install -g typescript"
	sh "npm install -g vsce"
}

def buildVscodeExtension(){
	sh "npm install"
	sh "npm run vscode:prepublish"
}

node('rhel7'){
	when {
		expression {
			return !publishToMarketPlace.equals('true')
		}
	}
	stage 'Build JDT LS'
	git url: 'https://github.com/eclipse/eclipse.jdt.ls.git'
	sh "./mvnw clean verify -B -U -fae -e -Pserver-distro -DdisableP2Mirrors=true"

	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	stash name: 'server_distro',includes :files[0].path
}

node('rhel7'){
	when {
		expression {
			return publishToMarketPlace.equals('true')
		}
	}
	stage 'Fetch latest JDT LS'
	def serverRepo = "http://download.eclipse.org/jdtls/snapshots"
	def server = new URL ("$serverRepo/latest.txt").getText()

	File binary = new File(server);
	if (!binary.exists()) {
		binary.withOutputStream { out ->
			new URL("$serverRepo/$server").withInputStream { from ->  out << from }
		}
	}
	stash name: 'server_distro',includes :binary.path
}

node('rhel7'){

	stage 'Checkout vscode-java code'
	deleteDir()
	git url: 'https://github.com/redhat-developer/vscode-java.git'

	stage 'install vscode-java build requirements'
	installBuildRequirements()

	stage 'Build vscode-java'
	buildVscodeExtension()
	unstash 'server_distro'
	def files = findFiles(glob: '**/org.eclipse.jdt.ls.product/distro/**.tar.gz')
	sh "mkdir ./server"
	sh "tar -xvzf ${files[0].path} -C ./server"

	stage 'Test vscode-java for staging'
	wrap([$class: 'Xvnc']) {
		sh "npm test --silent"
	}

	stage "Package vscode-java"
	def packageJson = readJSON file: 'package.json'
	sh "vsce package -o java-${packageJson.version}-${env.BUILD_NUMBER}.vsix"

	stage 'Upload vscode-java to staging'
	def vsix = findFiles(glob: '**.vsix')
	sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} tools@10.5.105.197:/downloads_htdocs/jbosstools/jdt.ls/staging"
	stash name:'vsix', includes:files[0].path
}

node('rhel7'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'fbricon'
		}

		stage "Publish to Marketplace"
		unstash 'vsix';
		withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
			def vsix = findFiles(glob: '**.vsix')
			sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
		}
		archive includes:"**.vsix"
	}//if publishMarketPlace
}
