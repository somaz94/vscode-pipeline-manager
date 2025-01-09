import * as vscode from 'vscode';
import Jenkins = require('jenkins');
import { PipelineItem } from '../pipelineItem';

interface JenkinsJob {
    name: string;
    color: string;
    lastBuild?: {
        number: number;
    };
}

interface JenkinsApiResponse {
    jobs: JenkinsJob[];
}

export class JenkinsService {
    private jenkins: any;
    private baseUrl: string = '';
    private username: string = '';
    private token: string = '';

    constructor() {
        this.initialize();
    }

    private initialize() {
        const config = vscode.workspace.getConfiguration('pipelineManager.jenkins');
        this.baseUrl = config.get<string>('url') || '';
        this.username = config.get<string>('username') || '';
        this.token = config.get<string>('token') || '';

        if (!this.baseUrl) {
            vscode.window.showErrorMessage('Jenkins URL is not configured');
            return;
        }

        const options = {
            baseUrl: this.baseUrl,
            crumbIssuer: true,
            user: this.username,
            token: this.token
        };

        try {
            this.jenkins = new Jenkins(options);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to initialize Jenkins client');
            console.error('Jenkins initialization error:', error);
        }
    }

    async getPipelines(): Promise<PipelineItem[]> {
        try {
            const jobs = await this.jenkins.job.list();
            
            return jobs.map((job: JenkinsJob) => new PipelineItem(
                job.name,
                job.color === 'blue' ? 'success' : 'failed',
                job.lastBuild?.number || 0,
                `${this.baseUrl}/job/${job.name}`
            ));
        } catch (error) {
            console.error('Jenkins error:', error);
            return [];
        }
    }

    async openPipeline(pipeline: PipelineItem) {
        try {
            const config = vscode.workspace.getConfiguration('pipelineManager.jenkins');
            const baseUrl = config.get<string>('url');
            if (!baseUrl) {
                throw new Error('Jenkins URL is not configured');
            }

            const url = `${baseUrl}/job/${pipeline.name}`;
            await vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open pipeline: ${pipeline.name}`);
            console.error('Open pipeline error:', error);
        }
    }

    async buildPipeline(pipeline: PipelineItem) {
        try {
            await this.jenkins.job.build(pipeline.name);
            vscode.window.showInformationMessage(`Build triggered for ${pipeline.name}`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to trigger build for ${pipeline.name}`);
            console.error('Build pipeline error:', error);
            return false;
        }
    }
}
