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
    let refreshPipelines = vscode.commands.registerCommand('vscode-pipeline-manager.refreshPipelines', async () => {
        const pipelines = await jenkinsService.getPipelines();
        pipelines.forEach((pipeline: PipelineItem) => {
            pipeline.command = {
                command: 'vscode-pipeline-manager.openPipeline',
                title: 'Open Pipeline',
                arguments: [pipeline]
            };
        });
        pipelineProvider.refresh();
        return pipelines;
    });

    let openPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.openPipeline', async (pipeline: PipelineItem) => {
        const result = await jenkinsService.openPipeline(pipeline);
        pipelineProvider.refresh();
        return result;
    });

    let buildPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.buildPipeline', async (pipeline: PipelineItem) => {
        const result = await jenkinsService.buildPipeline(pipeline);
        pipelineProvider.refresh();
        return result;
    });

    // GitLab 명령어 등록
    let refreshGitLabPipelines = vscode.commands.registerCommand('vscode-pipeline-manager.refreshGitLabPipelines', async () => {
        const pipelines = await gitLabService.listPipelines();
        pipelines.forEach((pipeline: PipelineItem) => {
            pipeline.command = {
                command: 'vscode-pipeline-manager.openGitLabPipeline',
                title: 'Open GitLab Pipeline',
                arguments: [pipeline]
            };
        });
        pipelineProvider.refresh();
        return pipelines;
    });

    let openGitLabPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.openGitLabPipeline', async (pipeline: PipelineItem) => {
        const result = await gitLabService.openPipeline(pipeline);
        pipelineProvider.refresh();
        return result;
    });

    let runGitLabPipeline = vscode.commands.registerCommand('vscode-pipeline-manager.runGitLabPipeline', async (pipeline: PipelineItem) => {
        const result = await gitLabService.runPipeline(pipeline);
        pipelineProvider.refresh();
        return result;
    });

    let showLogs = vscode.commands.registerCommand('pipeline-manager.showLogs', async (item: PipelineItem) => {
        const isGitLab = item.name.startsWith('Pipeline #');
        const result = await logViewer.showLogs(item, isGitLab ? 'gitlab' : 'jenkins');
        pipelineProvider.refresh();
        return result;
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