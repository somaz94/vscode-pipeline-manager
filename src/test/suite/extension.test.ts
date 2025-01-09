import * as assert from 'assert';
import * as vscode from 'vscode';
import { MockServers } from './mocks/mockServers';

suite('Extension Test Suite', () => {
    let extension: vscode.Extension<any> | undefined;

    suiteSetup(async () => {
        // VS Code 시작 시 모든 에디터 닫기
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        
        // 확장 가져오기 및 활성화
        extension = vscode.extensions.getExtension('somaz.vscode-pipeline-manager');
        if (extension) {
            await extension.activate();
        }
    });

    test('Extension should be present', () => {
        assert.ok(extension, 'Extension should be available');
    });

    test('Extension should activate', () => {
        assert.ok(extension?.isActive, 'Extension should be activated');
    });

    test('Should register all commands', async () => {
        // 명령어가 등록되기를 기다림
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const commands = await vscode.commands.getCommands(true);
        const expectedCommands = [
            'vscode-pipeline-manager.refreshPipelines',
            'vscode-pipeline-manager.openPipeline',
            'vscode-pipeline-manager.buildPipeline',
            'vscode-pipeline-manager.refreshGitLabPipelines',
            'vscode-pipeline-manager.openGitLabPipeline',
            'vscode-pipeline-manager.runGitLabPipeline'
        ];

        for (const command of expectedCommands) {
            assert.ok(
                commands.includes(command),
                `Command ${command} should be registered`
            );
        }
    });

    suite('Jenkins Integration Tests', () => {
        setup(async () => {
            MockServers.setupJenkinsMock();
            const config = vscode.workspace.getConfiguration('pipelineManager');
            await config.update('jenkins.url', 'http://jenkins-mock.local', vscode.ConfigurationTarget.Global);
            await config.update('jenkins.username', 'test-user', vscode.ConfigurationTarget.Global);
            await config.update('jenkins.token', 'test-token', vscode.ConfigurationTarget.Global);
        });

        test('Should fetch Jenkins pipelines', async () => {
            const result = await vscode.commands.executeCommand('vscode-pipeline-manager.refreshPipelines');
            assert.ok(Array.isArray(result), 'Should return an array of pipelines');
            assert.strictEqual(result.length, 2, 'Should return 2 pipelines');
            assert.strictEqual(result[0].name, 'test-pipeline-1');
        });

        teardown(() => {
            MockServers.cleanupMocks();
        });
    });

    suite('GitLab Integration Tests', () => {
        setup(async () => {
            MockServers.setupGitLabMock();
            const config = vscode.workspace.getConfiguration('pipelineManager');
            await Promise.all([
                config.update('gitlab.url', 'http://gitlab-mock.local', vscode.ConfigurationTarget.Global),
                config.update('gitlab.token', 'test-token', vscode.ConfigurationTarget.Global),
                config.update('gitlab.projectId', '1', vscode.ConfigurationTarget.Global)
            ]);
        });

        test('Should fetch GitLab pipelines', async () => {
            const result = await vscode.commands.executeCommand('vscode-pipeline-manager.refreshGitLabPipelines');
            assert.ok(Array.isArray(result), 'Should return an array of pipelines');
            assert.strictEqual(result.length, 2, 'Should return 2 pipelines');
            assert.strictEqual(result[0].status, 'success');
        });

        teardown(() => {
            MockServers.cleanupMocks();
        });
    });

    suiteTeardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });
});