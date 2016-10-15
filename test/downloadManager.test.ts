import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as  downloadManager from '../src/downloadManager';


suite('Java Language Extension downloadManager tests', () => {

    // Defines a Mocha unit test
    test('Download server', function(done ) {
        this.timeout(2*60*1000);
        return downloadManager.downloadAndInstallServer()
            .then(() => {
                let pluginsPath = path.resolve(__dirname, '../../server/plugins');
                try {
                    console.log(pluginsPath);
                    let isDirectory = fs.lstatSync(pluginsPath);
                    assert.ok(isDirectory,'plugins folder is not found');
                }
                catch (err) {
                    assert.ifError(err);
                }
                done();
            });
    });
});