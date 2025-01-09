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
Object.defineProperty(exports, "__esModule", { value: true });
const jenkins_1 = require("../../../src/services/jenkins");
const vscode = __importStar(require("vscode"));
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
    let jenkinsService;
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock configuration
        vscode.workspace.getConfiguration.mockReturnValue({
            get: jest.fn().mockImplementation((key) => {
                switch (key) {
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
        jenkinsService = new jenkins_1.JenkinsService();
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
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(`Build triggered for ${jobName}`);
    });
});
//# sourceMappingURL=jenkins.test.js.map