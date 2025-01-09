import * as vscode from 'vscode';
import Jenkins = require('jenkins');

export class JenkinsService {
    private jenkins: any;

    constructor() {
        this.initialize();
    }

    private initialize() {
        const config = vscode.workspace.getConfiguration('pipelineManager.jenkins');
        const url = config.get<string>('url');
        const username = config.get<string>('username');
        const token = config.get<string>('token');

        if (!url) {
            vscode.window.showErrorMessage('Jenkins URL is not configured');
            return;
        }

        const options = {
            baseUrl: url,
            crumbIssuer: true,
            user: username,
            token: token
        };

        try {
            // @ts-ignore: Jenkins 타입 정의 문제 해결
            this.jenkins = new Jenkins(options);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to initialize Jenkins client');
            console.error('Jenkins initialization error:', error);
        }
    }

    async getPipelines() {
        try {
            const jobs = await this.jenkins?.jobs.list();
            if (!jobs) return [];
            
            return jobs.map((job: any) => ({
                name: job.name,
                status: job.color,
                lastBuildNumber: job.lastBuild?.number
            }));
        } catch (error) {
            console.error('Jenkins error:', error);
            return [];
        }
    }

    async getBuildLogs(jobName: string, buildNumber: number) {
        try {
            const log = await this.jenkins.build.log(jobName, buildNumber);
            return log;
        } catch (error) {
            console.error('Log fetch error:', error);
            return '';
        }
    }

    async triggerBuild(jobName: string) {
        try {
            await this.jenkins.job.build(jobName);
            vscode.window.showInformationMessage(`Build triggered for ${jobName}`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to trigger build for ${jobName}`);
            return false;
        }
    }
}
