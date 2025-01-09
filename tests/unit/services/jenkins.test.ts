import { JenkinsService } from '../../../src/services/jenkins';
import * as vscode from 'vscode';

const mockJenkins = {
    jobs: {
        list: jest.fn()
    },
    job: {
        build: jest.fn()
    },
    build: {
        log: jest.fn()
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

        // Mock Jenkins API response
        mockJenkins.jobs.list.mockResolvedValue(mockJobs);

        const pipelines = await jenkinsService.getPipelines();
        
        expect(pipelines).toHaveLength(2);
        expect(pipelines[0]).toEqual({
            name: 'job1',
            status: 'blue',
            lastBuildNumber: 1
        });
    });

    test('triggerBuild should trigger jenkins build', async () => {
        const jobName = 'test-job';
        
        mockJenkins.job.build.mockResolvedValue(true);

        const result = await jenkinsService.triggerBuild(jobName);
        
        expect(result).toBe(true);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            `Build triggered for ${jobName}`
        );
    });
});
