import * as vscode from 'vscode';
import { PipelineProvider } from './pipelineProvider';
import { JenkinsService } from './services/jenkins';
import { GitLabService } from './services/gitlab';
import { LogViewer } from './logViewer';
import { PipelineItem } from './pipelineItem';

export function activate(context: vscode.ExtensionContext) {
    // 서비스 초기화
    const jenkinsService = new JenkinsService();
    const gitlabService = new GitLabService();
    
    // Pipeline Provider 및 LogViewer 생성
    const pipelineProvider = new PipelineProvider(jenkinsService, gitlabService);
    const logViewer = new LogViewer(context);
    
    // Pipeline Explorer 뷰 등록
    vscode.window.registerTreeDataProvider('pipelineExplorer', pipelineProvider);

    // 명령어 등록
    context.subscriptions.push(
        vscode.commands.registerCommand('pipeline-manager.triggerBuild', async (item: PipelineItem) => {
            if (item.jobType === 'jenkins') {
                await jenkinsService.triggerBuild(item.label);
            }
        }),

        vscode.commands.registerCommand('pipeline-manager.showLogs', async (item: PipelineItem) => {
            if (item.jobType === 'jenkins' && item.lastBuildNumber) {
                const log = await jenkinsService.getBuildLogs(item.label, item.lastBuildNumber);
                logViewer.show(item.label, log);
            }
        }),

        vscode.commands.registerCommand('pipeline-manager.refreshPipelines', () => {
            pipelineProvider.refresh();
        })
    );
}

export function deactivate() {}