import * as vscode from 'vscode';
import { JenkinsService } from './services/jenkins';
import { GitLabService } from './services/gitlab';
import { PipelineItem } from './pipelineItem';

export class LogViewer {
    private panel: vscode.WebviewPanel | undefined;

    constructor(
        private jenkinsService: JenkinsService,
        private gitlabService: GitLabService
    ) {}

    async showLogs(pipeline: PipelineItem, type: 'jenkins' | 'gitlab' = 'jenkins') {
        if (!pipeline.lastBuildNumber) {
            vscode.window.showErrorMessage(`No build number available for ${pipeline.name}`);
            return;
        }

        // 이미 열려있는 패널이 있다면 재사용
        if (this.panel) {
            this.panel.reveal();
        } else {
            // 새 패널 생성
            this.panel = vscode.window.createWebviewPanel(
                'pipelineLogs',
                `Logs: ${pipeline.name}`,
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // 패널이 닫힐 때 정리
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        try {
            let logs: string;
            if (type === 'jenkins') {
                const response = await fetch(`${pipeline.url}/consoleText`);
                logs = await response.text();
            } else {
                const response = await fetch(`${pipeline.url}/jobs/${pipeline.lastBuildNumber}/trace`);
                logs = await response.text();
            }

            // HTML로 로그 표시
            this.panel.webview.html = this.getWebviewContent(pipeline.name, logs);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch logs for ${pipeline.name}`);
            console.error('Log fetch error:', error);
        }
    }

    private getWebviewContent(title: string, logs: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title} - Logs</title>
                <style>
                    body {
                        padding: 10px;
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                        line-height: 1.4;
                    }
                    .log-header {
                        margin-bottom: 10px;
                        padding: 5px;
                        background-color: var(--vscode-editor-background);
                        border-bottom: 1px solid var(--vscode-panel-border);
                    }
                    .log-content {
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 10px;
                        border-radius: 4px;
                        white-space: pre-wrap;
                        font-family: monospace;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <div class="log-header">
                    <h2>${this.escapeHtml(title)}</h2>
                </div>
                <div class="log-content">${this.formatLogs(logs)}</div>
            </body>
            </html>
        `;
    }

    private formatLogs(logs: string): string {
        // ANSI 이스케이프 코드 제거
        const cleanLogs = logs.replace(/\x1b\[[0-9;]*[mGK]/g, '');
        return this.escapeHtml(cleanLogs);
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
