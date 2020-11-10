import { ExtensionContext } from 'vscode';
import { ServerOptions, TransportKind } from 'vscode-languageclient';
import * as path from 'path';

export function prepareExecutable(context: ExtensionContext): ServerOptions {
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(
        path.join('dist', 'analytics-lsp-server.js')
    );
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    process.env['RECOMMENDER_API_URL'] =
      "https://f8a-analytics-2445582058137.production.gw.apicast.io:443/api/v2";
    process.env['THREE_SCALE_USER_TOKEN'] = "9e7da76708fe374d8c10fa752e72989f";

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };
    return serverOptions;
}
