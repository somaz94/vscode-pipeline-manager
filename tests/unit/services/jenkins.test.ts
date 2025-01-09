import { JenkinsService } from '../../../src/services/jenkins';
import { PipelineItem } from '../../../src/pipelineItem';
import * as vscode from 'vscode';

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

const mockJenkins = {
    job: {
        list: jest.fn().mockResolvedValue([
            { name: 'job1', color: 'blue', lastBuild: { number: 1 } },
            { name: 'job2', color: 'red', lastBuild: { number: 2 } }
        ]),
        build: jest.fn().mockResolvedValue(true)
    }
};

jest.mock('jenkins', () => {
    return jest.fn().mockImplementation(() => mockJenkins);
});

describe('JenkinsService', () => {
    let jenkinsService: JenkinsService;
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock configuration
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                switch(key) {
                    case 'url':
                        return 'http://jenkins-test';
                    case 'username':
                        return 'test-user';
                    case 'token':
                        return 'test-token';
                    default:
                        return '';
                }
            })
        });
        
        jenkinsService = new JenkinsService();
    });

    test('getPipelines should return pipeline list', async () => {
        const pipelines = await jenkinsService.getPipelines();
        
        expect(pipelines).toHaveLength(2);
        expect(pipelines[0]).toMatchObject({
            name: 'job1',
            status: 'success',
            lastBuildNumber: 1,
            url: 'http://jenkins-test/job/job1'
        });
    });

    test('buildPipeline should trigger build', async () => {
        const pipeline = new PipelineItem(
            'job1',
            'success',
            1,
            'http://jenkins-test/job/job1'
        );
        
        const result = await jenkinsService.buildPipeline(pipeline);
        
        expect(result).toBe(true);
        expect(mockJenkins.job.build).toHaveBeenCalledWith('job1');
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            'Build triggered for job1'
        );
    });

    test('getPipelines should handle error and return empty array', async () => {
        mockJenkins.job.list.mockRejectedValueOnce(new Error('Connection failed'));
        
        const pipelines = await jenkinsService.getPipelines();
        
        expect(pipelines).toHaveLength(0);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'Failed to get pipelines'
        );
    });

    test('buildPipeline should handle build failure', async () => {
        const pipeline = new PipelineItem(
            'job1',
            'success',
            1,
            'http://jenkins-test/job/job1'
        );
        mockJenkins.job.build.mockRejectedValueOnce(new Error('Build failed'));
        
        const result = await jenkinsService.buildPipeline(pipeline);
        
        expect(result).toBe(false);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'Failed to trigger build for job1'
        );
    });
});
