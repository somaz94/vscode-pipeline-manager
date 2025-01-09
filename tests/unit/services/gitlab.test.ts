import * as vscode from 'vscode';
import { GitLabService } from '../../../src/services/gitlab';
import { PipelineItem } from '../../../src/pipelineItem';
import { Gitlab } from '@gitbeaker/node';

const mockGitlabClient = {
    Pipelines: {
        all: jest.fn().mockResolvedValue([
            { id: 1, ref: 'main', sha: 'abc123', status: 'success' },
            { id: 2, ref: 'develop', sha: 'def456', status: 'failed' }
        ]),
        create: jest.fn().mockResolvedValue({ id: 3 })
    }
};

jest.mock('@gitbeaker/node');

jest.mock('vscode', () => ({
    TreeItem: class TreeItem {
        constructor(public readonly label: string, public readonly collapsibleState?: any) {}
    },
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    },
    Uri: {
        file: (path: string) => ({ path })
    },
    workspace: {
        getConfiguration: jest.fn()
    },
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn()
    }
}));

describe('GitLabService', () => {
    let gitlabService: GitLabService;
    
    beforeEach(() => {
        jest.clearAllMocks();
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                switch(key) {
                    case 'gitlab.url':
                        return 'http://gitlab-test';
                    case 'gitlab.token':
                        return 'test-token';
                    case 'gitlab.projectId':
                        return 'test-project';
                    default:
                        return '';
                }
            })
        });
        
        gitlabService = new GitLabService();
        (gitlabService as any).gitlab = mockGitlabClient;
        (gitlabService as any).projectId = 'test-project';
    });

    test('listPipelines should return pipeline list', async () => {
        const pipelines = await gitlabService.listPipelines();
        
        expect(pipelines).toHaveLength(2);
        expect(pipelines[0]).toMatchObject({
            name: 'Pipeline #1',
            status: 'success',
            lastBuildNumber: 1,
            url: '/test-project/-/pipelines/1'
        });
    });

    test('runPipeline should trigger pipeline', async () => {
        const pipeline = new PipelineItem('main', 'success', 1, '/test-project/-/pipelines/1');
        mockGitlabClient.Pipelines.create.mockResolvedValueOnce({ id: 1 });
        
        const result = await gitlabService.runPipeline(pipeline);
        
        expect(result).toBe(true);
        expect(mockGitlabClient.Pipelines.create).toHaveBeenCalledWith('test-project', {
            ref: 'main'
        });
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            'Pipeline triggered for main'
        );
    });

    test('listPipelines should handle error and return empty array', async () => {
        mockGitlabClient.Pipelines.all.mockRejectedValueOnce(new Error('API error'));
        
        const pipelines = await gitlabService.listPipelines();
        
        expect(pipelines).toHaveLength(0);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'GitLab configuration is incomplete'
        );
    });

    test('runPipeline should handle creation failure', async () => {
        const pipeline = new PipelineItem('main', 'success', 1, '/test-project/-/pipelines/1');
        mockGitlabClient.Pipelines.create.mockRejectedValueOnce(new Error('Creation failed'));
        
        const result = await gitlabService.runPipeline(pipeline);
        
        expect(result).toBe(false);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'Failed to trigger pipeline: main'
        );
    });
});
