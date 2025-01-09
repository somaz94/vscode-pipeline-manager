import * as vscode from 'vscode';

export class LogViewer {
    private static readonly viewType = 'pipelineLog';
    private panel: vscode.WebviewPanel | undefined;

    constructor(private context: vscode.ExtensionContext) {}

    public show(jobName: string, log: string) {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                LogViewer.viewType,
                `Pipeline Log: ${jobName}`,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        this.panel.webview.html = this.getWebviewContent(jobName, log);
    }

    private getWebviewContent(jobName: string, log: string) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    pre {
                        padding: 10px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                    }
                </style>
            </head>
            <body>
                <h2>${jobName} Build Log</h2>
                <pre>${log}</pre>
            </body>
            </html>
        `;
    }
}
