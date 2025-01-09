import { GitLabService } from '../../../src/services/gitlab';
import * as vscode from 'vscode';
import axios from 'axios';

jest.mock('axios');

describe('GitLabService', () => {
  let gitlabService: GitLabService;
  
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
          default:
            return undefined;
        }
      })
    });
    
    gitlabService = new GitLabService();
  });

  test('getPipelines should return pipeline list', async () => {
    const mockResponse = {
      data: [
        { id: 1, status: 'success' },
        { id: 2, status: 'failed' }
      ]
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const pipelines = await gitlabService.getPipelines();
    
    expect(pipelines).toHaveLength(2);
    expect(pipelines[0]).toEqual({
      name: 'Pipeline #1',
      status: 'success',
      lastBuildNumber: 1
    });
  });

  test('triggerBuild should trigger gitlab pipeline', async () => {
    const pipelineId = 'test-pipeline';
    
    (axios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });

    const result = await gitlabService.triggerBuild(pipelineId);
    
    expect(result).toBe(true);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      `GitLab pipeline triggered: ${pipelineId}`
    );
  });
});
