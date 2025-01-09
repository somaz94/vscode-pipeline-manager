"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gitlab_1 = require("../../../src/services/gitlab");
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
describe('GitLabService', () => {
    let gitlabService;
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock configuration
        vscode.workspace.getConfiguration.mockReturnValue({
            get: jest.fn().mockImplementation((key) => {
                switch (key) {
                    case 'url':
                        return 'https://gitlab-test';
                    case 'token':
                        return 'test-token';
                    default:
                        return undefined;
                }
            })
        });
        gitlabService = new gitlab_1.GitLabService();
    });
    test('getPipelines should return pipeline list', async () => {
        const mockResponse = {
            data: [
                { id: 1, status: 'success' },
                { id: 2, status: 'failed' }
            ]
        };
        axios_1.default.get.mockResolvedValue(mockResponse);
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
        axios_1.default.post.mockResolvedValue({ data: { id: 1 } });
        const result = await gitlabService.triggerBuild(pipelineId);
        expect(result).toBe(true);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(`GitLab pipeline triggered: ${pipelineId}`);
    });
});
//# sourceMappingURL=gitlab.test.js.map