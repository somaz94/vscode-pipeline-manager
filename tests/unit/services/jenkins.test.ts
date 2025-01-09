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
    jobs: {
        list: jest.fn()
    },
    job: {
        build: jest.fn()
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
                        return undefined;
                }
            })
        });
        
        jenkinsService = new JenkinsService();
    });

    test('getPipelines should return pipeline list', async () => {
        const mockJobs = [
            { name: 'job1', color: 'blue', lastBuild: { number: 1 } },
            { name: 'job2', color: 'red', lastBuild: { number: 2 } }
        ];

        mockJenkins.jobs.list.mockResolvedValue(mockJobs);

        const pipelines = await jenkinsService.getPipelines();
        
        expect(pipelines).toHaveLength(2);
        expect(pipelines[0]).toEqual({
            name: 'job1',
            status: 'blue',
            lastBuildNumber: 1,
            url: 'http://jenkins-test/job/job1/1'
        });
    });

    test('buildPipeline should trigger jenkins build', async () => {
        const pipeline = new PipelineItem(
            'test-job',
            'blue',
            1,
            'http://jenkins-test/job/test-job/1'
        );
        
        mockJenkins.job.build.mockResolvedValue(true);

        const result = await jenkinsService.buildPipeline(pipeline);
        
        expect(result).toBe(true);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            `Build triggered for ${pipeline.name}`
        );
    });
});
