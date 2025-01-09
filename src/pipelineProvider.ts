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
                items.push(...jenkinsPipelines);

                const gitlabPipelines = await this.gitlabService.listPipelines();
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