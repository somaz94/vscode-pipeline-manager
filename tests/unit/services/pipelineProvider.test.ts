import * as vscode from 'vscode';
import { PipelineProvider } from '../../../src/pipelineProvider';
import { PipelineItem } from '../../../src/pipelineItem';
import { JenkinsService } from '../../../src/services/jenkins';
import { GitLabService } from '../../../src/services/gitlab';

jest.mock('../../../src/services/jenkins');
jest.mock('../../../src/services/gitlab');

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
        file: (path: string) => ({ path, scheme: 'file' })
    },
    EventEmitter: class EventEmitter {
        event = jest.fn();
        fire = jest.fn();
    },
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn()
    }
}));

describe('PipelineProvider', () => {
    let provider: PipelineProvider;
    let mockJenkinsService: jest.Mocked<JenkinsService>;
    let mockGitLabService: jest.Mocked<GitLabService>;

    beforeEach(() => {
        mockJenkinsService = {
            getPipelines: jest.fn().mockResolvedValue([
                new PipelineItem('jenkins1', 'success', 1, 'http://jenkins/1')
            ])
        } as any;

        mockGitLabService = {
            listPipelines: jest.fn().mockResolvedValue([
                new PipelineItem('gitlab1', 'success', 1, 'http://gitlab/1')
            ])
        } as any;

        provider = new PipelineProvider(mockJenkinsService, mockGitLabService);
    });

    test('getTreeItem should return PipelineItem', () => {
        const item = new PipelineItem('test', 'success', 1, 'http://test');
        const treeItem = provider.getTreeItem(item);
        
        expect(treeItem).toBe(item);
    });

    test('getChildren should return combined pipelines', async () => {
        const children = await provider.getChildren();

        expect(children).toHaveLength(2);
        expect(children[0].name).toBe('jenkins1');
        expect(children[1].name).toBe('gitlab1');
    });

    test('refresh should fire changed event', () => {
        const spy = jest.spyOn(provider['_onDidChangeTreeData'], 'fire');
        
        provider.refresh();
        
        expect(spy).toHaveBeenCalled();
    });
});
