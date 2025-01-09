import * as vscode from 'vscode';
import * as path from 'path';

export class PipelineItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly status: string,
        public readonly jobType: 'jenkins' | 'gitlab',
        public readonly lastBuildNumber?: number
    ) {
        super(label);
        this.tooltip = `${this.label} - ${this.status}`;
        this.description = this.status;
        this.iconPath = this.getStatusIcon(status);
        this.contextValue = 'pipeline';
    }

    private getStatusIcon(status: string): { light: vscode.Uri; dark: vscode.Uri } {
        const iconName = this.getIconName(status);
        return {
            light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', `${iconName}.svg`)),
            dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', `${iconName}.svg`))
        };
    }

    private getIconName(status: string): string {
        switch (status.toLowerCase()) {
            case 'success':
            case 'blue':
                return 'success';
            case 'failed':
            case 'red':
                return 'failed';
            case 'running':
            case 'blue_anime':
                return 'running';
            default:
                return 'unknown';
        }
    }
}