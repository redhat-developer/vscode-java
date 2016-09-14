
import * as https from 'https';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as stream from 'stream';
import {Url, parse} from 'url';
const HttpProxyAgent = require('http-proxy-agent');
const HttpsProxyAgent = require('https-proxy-agent');
const tmp = require('tmp');
const decompress = require('decompress');

function download(urlString: string, proxy?: string, strictSSL?: boolean): Promise<stream.Readable> {
    let url = parse(urlString);
    const agent = getProxyAgent(url, proxy, strictSSL);

	let options = getRequestOptions(url, agent)

    return new Promise<stream.Readable>((resolve, reject) => {
        return https.get(options, res => {
            // handle redirection
            if (res.statusCode === 302) {
                return download(res.headers.location).then(is => resolve(is)).catch(err => reject(err));
            }
            else if (res.statusCode !== 200) {
                return reject(Error(`Download failed with code ${res.statusCode}.`));
            }
            return resolve(res);
        });
    });

}

function getRequestOptions(url: Url, agent: any ): https.RequestOptions {
	let options: https.RequestOptions = {
        host: url.host,
        path: url.path,
        agent: agent
    };
	if(url.port != null) {
		options.port = parseInt(url.port);
	}else if(url.protocol === 'http:'){
		//agent-base https will force 443 if not set
		options.port = 80;
	}
	return options;
}


function getSystemProxyURL(requestURL: Url): string {
	if (requestURL.protocol === 'http:') {
		return process.env.HTTP_PROXY || process.env.http_proxy || null;
	} else if (requestURL.protocol === 'https:') {
		return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || null;
	}
	return null;
}

function getProxyAgent(requestURL: Url, proxy?: string, strictSSL?: boolean): any {
	const proxyURL = proxy || getSystemProxyURL(requestURL);
	if (!proxyURL) {
		return null;
	}
	const proxyEndpoint = parse(proxyURL);

	if (!/^https?:$/.test(proxyEndpoint.protocol)) {
		return null;
	}

	strictSSL = strictSSL || true;
	const opts = {
		host: proxyEndpoint.hostname,
		port: Number(proxyEndpoint.port),
		auth: proxyEndpoint.auth,
		rejectUnauthorized: strictSSL
	};
	return requestURL.protocol === 'http:' ? new HttpProxyAgent(opts) : new HttpsProxyAgent(opts);
}

export function downloadAndInstallServer() {
	return new Promise<boolean>((resolve, reject) => {
		const config = vscode.workspace.getConfiguration();
		const proxy = config.get<string>('http.proxy');
		const strictSSL = config.get('http.proxyStrictSSL', true);

		const SERVER_FOLDER = path.resolve(__dirname, '../../server/');
		// const SERVER_ARCHIVE = "https://dl.bintray.com/gorkem/java-language-server/java-server-1.0.0-201609020048.tar.gz";
		const SERVER_ARCHIVE = "http://download.jboss.org/jbosstools/static/vscode/java-server-1.0.0-201609122022.tar.gz";

		return download(SERVER_ARCHIVE, proxy, strictSSL).then(is => {
			tmp.file((err, tmpPath, fd, cleanupCallback) => {
				const out = fs.createWriteStream(null, { fd: fd });
				// handle errors 
				out.once('error', err => reject(err));
				is.once('error', err => reject(err));

				out.once('finish', () => {
					decompress(tmpPath, SERVER_FOLDER).then(files => {
						return resolve(true);
					}).catch(err => {
						return reject(err);
					})
				})
				is.pipe(out);
			})
		}).
			catch(err => {
				console.log(err);
			});
	});
}
