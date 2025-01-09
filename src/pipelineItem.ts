import * as vscode from 'vscode';
import * as path from 'path';

export class PipelineItem extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly status: string,
        public readonly lastBuildNumber?: number,
        public readonly url?: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(name, collapsibleState);

        // 상태에 따른 아이콘 설정
        this.iconPath = this.getIconPath(status);
        
        // 툴팁 설정
        this.tooltip = `${name} (${status})`;
        
        // 설명 설정
        this.description = lastBuildNumber ? `#${lastBuildNumber}` : '';

        // 컨텍스트 값 설정 (메뉴 표시 조건에 사용)
        this.contextValue = 'pipeline';
    }

    private getIconPath(status: string): { light: vscode.Uri; dark: vscode.Uri } | undefined {
        const iconName = this.getIconName(status);
        if (!iconName) return undefined;

        return {
            light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', `${iconName}.svg`)),
            dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', `${iconName}.svg`))
        };
    }

    private getIconName(status: string): string | undefined {
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
            case 'queued':
            case 'yellow':
                return 'queued';
            default:
                return 'unknown';
        }
    }
}