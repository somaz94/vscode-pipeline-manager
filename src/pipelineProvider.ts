import * as vscode from 'vscode';
import { JenkinsService } from './services/jenkins';
import { GitLabService } from './services/gitlab';
import { PipelineItem } from './pipelineItem';

interface Pipeline {
    name: string;
    status: string;
    lastBuildNumber?: number;
}

export class PipelineProvider implements vscode.TreeDataProvider<PipelineItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<PipelineItem | undefined | null | void> = new vscode.EventEmitter<PipelineItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PipelineItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private jenkinsService: JenkinsService,
        private gitlabService: GitLabService
    ) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PipelineItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PipelineItem): Promise<PipelineItem[]> {
        if (!element) {
            const items: PipelineItem[] = [];
            
            try {
                const jenkinsPipelines = await this.jenkinsService.getPipelines();
                jenkinsPipelines.forEach((pipeline: PipelineItem) => {
                    pipeline.contextValue = 'jenkins-pipeline';
                    pipeline.command = {
                        command: 'vscode-pipeline-manager.openPipeline',
                        title: 'Open Pipeline',
                        arguments: [pipeline],
                        tooltip: `Open Jenkins Pipeline: ${pipeline.name}`
                    } as vscode.Command;

                    const buildCommand = {
                        command: 'vscode-pipeline-manager.buildPipeline',
                        title: 'Build Pipeline',
                        arguments: [pipeline],
                        tooltip: `Build Jenkins Pipeline: ${pipeline.name}`
                    } as vscode.Command;

                    const logsCommand = {
                        command: 'pipeline-manager.showLogs',
                        title: 'Show Logs',
                        arguments: [pipeline],
                        tooltip: `Show Jenkins Pipeline Logs: ${pipeline.name}`
                    } as vscode.Command;

                    pipeline.commands = [pipeline.command, buildCommand, logsCommand];
                });
                items.push(...jenkinsPipelines);

                const gitlabPipelines = await this.gitlabService.listPipelines();
                gitlabPipelines.forEach((pipeline: PipelineItem) => {
                    pipeline.contextValue = 'gitlab-pipeline';
                    pipeline.command = {
                        command: 'vscode-pipeline-manager.openGitLabPipeline',
                        title: 'Open Pipeline',
                        arguments: [pipeline],
                        tooltip: `Open GitLab Pipeline: ${pipeline.name}`
                    } as vscode.Command;

                    const runCommand = {
                        command: 'vscode-pipeline-manager.runGitLabPipeline',
                        title: 'Run Pipeline',
                        arguments: [pipeline],
                        tooltip: `Run GitLab Pipeline: ${pipeline.name}`
                    } as vscode.Command;

                    const logsCommand = {
                        command: 'pipeline-manager.showLogs',
                        title: 'Show Logs',
                        arguments: [pipeline],
                        tooltip: `Show GitLab Pipeline Logs: ${pipeline.name}`
                    } as vscode.Command;

                    pipeline.commands = [pipeline.command, runCommand, logsCommand];
                });
                items.push(...gitlabPipelines);

            } catch (error) {
                console.error('Failed to fetch pipelines:', error);
                vscode.window.showErrorMessage('Failed to fetch pipelines');
            }

            return items;
        }
        return [];
    }
}