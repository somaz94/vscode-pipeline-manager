import * as vscode from 'vscode';
import { Gitlab } from '@gitbeaker/node';
import { PipelineItem } from '../pipelineItem';

export class GitLabService {
    private gitlab: any;
    private projectId: string = '';

    constructor() {
        this.initialize();
    }

    private initialize() {
        const config = vscode.workspace.getConfiguration('pipelineManager.gitlab');
        const url = config.get<string>('url');
        const token = config.get<string>('token');
        this.projectId = config.get<string>('projectId') || '';

        if (!url || !token) {
            vscode.window.showErrorMessage('GitLab configuration is incomplete');
            return;
        }

        try {
            this.gitlab = new Gitlab({
                host: url,
                token: token
            });
        } catch (error) {
            vscode.window.showErrorMessage('Failed to initialize GitLab client');
            console.error('GitLab initialization error:', error);
        }
    }

    async listPipelines() {
        try {
            if (!this.gitlab || !this.projectId) {
                return [];
            }

            const config = vscode.workspace.getConfiguration('pipelineManager.gitlab');
            const baseUrl = config.get<string>('url');
            const pipelines = await this.gitlab.Pipelines.all(this.projectId);
            
            return pipelines.map((p: any) => ({
                name: `Pipeline #${p.id}`,
                status: p.status,
                lastBuildNumber: p.id,
                url: `${baseUrl}/${this.projectId}/-/pipelines/${p.id}`
            }));
        } catch (error) {
            console.error('GitLab error:', error);
            return [];
        }
    }

    async openPipeline(pipeline: PipelineItem) {
        try {
            const config = vscode.workspace.getConfiguration('pipelineManager.gitlab');
            const baseUrl = config.get<string>('url');
            if (!baseUrl) {
                throw new Error('GitLab URL is not configured');
            }

            const url = `${baseUrl}/${this.projectId}/-/pipelines/${pipeline.lastBuildNumber}`;
            await vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open pipeline: ${pipeline.name}`);
            console.error('Open pipeline error:', error);
        }
    }

    async runPipeline(pipeline: PipelineItem) {
        try {
            if (!this.gitlab || !this.projectId) {
                throw new Error('GitLab client not initialized');
            }

            await this.gitlab.Pipelines.create(this.projectId, {
                ref: 'main'  // 기본 브랜치로 설정
            });
            vscode.window.showInformationMessage(`Pipeline triggered for ${pipeline.name}`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to trigger pipeline: ${pipeline.name}`);
            console.error('Run pipeline error:', error);
            return false;
        }
    }
}
