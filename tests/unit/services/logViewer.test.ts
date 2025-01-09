import * as vscode from 'vscode';
import { LogViewer } from '../../../src/logViewer';
import { JenkinsService } from '../../../src/services/jenkins';
import { GitLabService } from '../../../src/services/gitlab';
import { PipelineItem } from '../../../src/pipelineItem';

// vscode 모킹
const mockWebviewPanel = {
    webview: {
        html: '',
        onDidReceiveMessage: jest.fn()
    },
    reveal: jest.fn(),
    onDidDispose: jest.fn(),
    dispose: jest.fn()
};

jest.mock('vscode', () => ({
    window: {
        createWebviewPanel: jest.fn(() => mockWebviewPanel),
        showErrorMessage: jest.fn()
    },
    ViewColumn: {
        Two: 2
    }
}));

// PipelineItem 모킹
jest.mock('../../../src/pipelineItem', () => ({
    PipelineItem: jest.fn().mockImplementation((name, status, lastBuildNumber, url) => ({
        name,
        status,
        lastBuildNumber,
        url
    }))
}));

// fetch 모킹
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        text: () => Promise.resolve('Test logs content')
    })
) as jest.Mock;

describe('LogViewer', () => {
    let logViewer: LogViewer;
    let mockJenkinsService: jest.Mocked<JenkinsService>;
    let mockGitLabService: jest.Mocked<GitLabService>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockWebviewPanel.webview.html = '';
        mockJenkinsService = {
            getPipelines: jest.fn(),
            buildPipeline: jest.fn()
        } as any;
        mockGitLabService = {
            listPipelines: jest.fn(),
            runPipeline: jest.fn()
        } as any;
        logViewer = new LogViewer(mockJenkinsService, mockGitLabService);
    });

    test('showLogs should display pipeline logs in webview', async () => {
        const pipeline = new PipelineItem('test', 'success', 1, 'http://test');
        await logViewer.showLogs(pipeline);

        expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
            'pipelineLogs',
            'Logs: test',
            vscode.ViewColumn.Two,
            expect.any(Object)
        );
        expect(mockWebviewPanel.webview.html).toContain('Test logs content');
    });

    test('showLogs should reuse existing webview panel', async () => {
        const pipeline = new PipelineItem('test', 'success', 1, 'http://test');
        
        // First call
        await logViewer.showLogs(pipeline);
        
        // Second call
        await logViewer.showLogs(pipeline);
        expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(mockWebviewPanel.reveal).toHaveBeenCalled();
    });

    test('showLogs should handle errors', async () => {
        const pipeline = new PipelineItem('test', 'success', 1, 'http://test');
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        await logViewer.showLogs(pipeline);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            `Failed to fetch logs for test`
        );
    });
});
