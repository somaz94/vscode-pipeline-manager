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
                items.push(...jenkinsPipelines.map((p: Pipeline) => 
                    new PipelineItem(p.name, p.status, 'jenkins', p.lastBuildNumber)
                ));
            } catch (error) {
                vscode.window.showErrorMessage('Failed to fetch pipelines');
            }

            return items;
        }
        return [];
    }
}