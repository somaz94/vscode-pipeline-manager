import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                '--no-sandbox',
                '--disable-gpu',
                '--disable-workspace-trust',
                '--skip-welcome',
                '--skip-release-notes',
                '--disable-extensions'
            ],
            timeout: 20000
        });
    } catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}

main();