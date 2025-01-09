import * as vscode from 'vscode';
import { JenkinsService } from './services/jenkins';
import { GitLabService } from './services/gitlab';
import { LogViewer } from './logViewer';
import { PipelineItem } from './pipelineItem';
import { PipelineProvider } from './pipelineProvider';

export function activate(context: vscode.ExtensionContext) {
    const jenkinsService = new JenkinsService();
    const gitLabService = new GitLabService();
    const logViewer = new LogViewer(jenkinsService, gitLabService);

    // Pipeline Provider 등록
    const pipelineProvider = new PipelineProvider(jenkinsService, gitLabService);
    vscode.window.registerTreeDataProvider('pipelineManager', pipelineProvider);

    // Jenkins 명령어 등록
    let refreshPipelines = vscode.commands.registerCommand('vscode-pipeline-manager.refreshPipelines', () => {
        pipelineProvider.refresh();
        return jenkinsService.getPipelines();
    });

    let openPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.openPipeline', (pipeline: PipelineItem) => {
        return jenkinsService.openPipeline(pipeline);
    });

    let buildPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.buildPipeline', (pipeline: PipelineItem) => {
        return jenkinsService.buildPipeline(pipeline);
    });

    // GitLab 명령어 등록
    let refreshGitLabPipelines = vscode.commands.registerCommand('vscode-pipeline-manager.refreshGitLabPipelines', () => {
        return gitLabService.listPipelines();
    });

    let openGitLabPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.openGitLabPipeline', (pipeline: PipelineItem) => {
        return gitLabService.openPipeline(pipeline);
    });

    let runGitLabPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.runGitLabPipeline', (pipeline: PipelineItem) => {
        return gitLabService.runPipeline(pipeline);
    });

    let showLogs = vscode.commands.registerCommand('pipeline-manager.showLogs', (item: PipelineItem) => {
        // 파이프라인 타입에 따라 로그 뷰어 호출
        const isGitLab = item.name.startsWith('Pipeline #');
        return logViewer.showLogs(item, isGitLab ? 'gitlab' : 'jenkins');
    });

    // 컨텍스트에 명령어 등록
    context.subscriptions.push(
        refreshPipelines,
        openPipeline,
        buildPipeline,
        refreshGitLabPipelines,
        openGitLabPipeline,
        runGitLabPipeline,
        showLogs
    );

    // 서비스 export
    return {
        getJenkinsService: () => jenkinsService,
        getGitLabService: () => gitLabService
    };
}

export function deactivate() {}