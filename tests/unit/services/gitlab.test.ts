import { GitLabService } from '../../../src/services/gitlab';
import { PipelineItem } from '../../../src/pipelineItem';
import * as vscode from 'vscode';
import { Gitlab } from '@gitbeaker/node';

// vscode 모듈 모킹
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
    },
    env: {
        openExternal: jest.fn()
    }
}));

jest.mock('@gitbeaker/node');

describe('GitLabService', () => {
    let gitlabService: GitLabService;
    let mockGitlabClient: any;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock configuration
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                switch(key) {
                    case 'url':
                        return 'https://gitlab-test';
                    case 'token':
                        return 'test-token';
                    case 'projectId':
                        return 'test-project';
                    default:
                        return undefined;
                }
            })
        });
        
        // GitLab 클라이언트 모킹 초기화
        mockGitlabClient = {
            Pipelines: {
                all: jest.fn().mockResolvedValue([
                    { id: 1, status: 'success' },
                    { id: 2, status: 'failed' }
                ]),
                create: jest.fn().mockResolvedValue({ id: 1 })
            }
        };
        
        (Gitlab as jest.Mock).mockImplementation(() => mockGitlabClient);
        
        gitlabService = new GitLabService();
    });

    test('listPipelines should return pipeline list', async () => {
        const pipelines = await gitlabService.listPipelines();
        
        expect(pipelines).toHaveLength(2);
        expect(pipelines[0]).toEqual({
            name: 'Pipeline #1',
            status: 'success',
            lastBuildNumber: 1,
            url: 'https://gitlab-test/test-project/-/pipelines/1'
        });
    });

    test('runPipeline should trigger gitlab pipeline', async () => {
        const pipeline = new PipelineItem(
            'Pipeline #1',
            'success',
            1,
            'https://gitlab-test/test-project/-/pipelines/1'
        );

        const result = await gitlabService.runPipeline(pipeline);
        
        expect(result).toBe(true);
        expect(mockGitlabClient.Pipelines.create).toHaveBeenCalledWith('test-project', {
            ref: 'main'
        });
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            `Pipeline triggered for ${pipeline.name}`
        );
    });
});
