import * as vscode from 'vscode';
import axios from 'axios';

export class GitLabService {
    private baseUrl: string = '';
    private token: string = '';

    constructor() {
        this.initialize();
    }

    private initialize() {
        const config = vscode.workspace.getConfiguration('pipelineManager.gitlab');
        const url = config.get<string>('url');
        const token = config.get<string>('token');

        if (!url) {
            vscode.window.showErrorMessage('GitLab URL is not configured');
            return;
        }

        if (!token) {
            vscode.window.showErrorMessage('GitLab token is not configured');
            return;
        }

        this.baseUrl = `${url}/api/v4`;
        this.token = token;
    }

    async getPipelines() {
        try {
            const response = await axios.get(`${this.baseUrl}/projects/:id/pipelines`, {
                headers: {
                    'PRIVATE-TOKEN': this.token
                }
            });

            return response.data.map((pipeline: any) => ({
                name: `Pipeline #${pipeline.id}`,
                status: this.mapGitLabStatus(pipeline.status),
                lastBuildNumber: pipeline.id
            }));
        } catch (error) {
            console.error('GitLab error:', error);
            return [];
        }
    }

    async triggerBuild(pipelineId: string) {
        try {
            await axios.post(`${this.baseUrl}/projects/:id/pipeline`, {}, {
                headers: {
                    'PRIVATE-TOKEN': this.token
                }
            });
            vscode.window.showInformationMessage(`GitLab pipeline triggered: ${pipelineId}`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to trigger GitLab pipeline: ${pipelineId}`);
            return false;
        }
    }

    async getBuildLogs(pipelineId: string, jobId: number) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/projects/:id/pipelines/${pipelineId}/jobs/${jobId}/trace`,
                {
                    headers: {
                        'PRIVATE-TOKEN': this.token
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('GitLab log fetch error:', error);
            return '';
        }
    }

    private mapGitLabStatus(status: string): string {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'failed';
            case 'running':
                return 'running';
            default:
                return 'unknown';
        }
    }
}
