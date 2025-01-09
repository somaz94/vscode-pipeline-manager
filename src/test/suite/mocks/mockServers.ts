import nock from 'nock';

export class MockServers {
    static setupJenkinsMock() {
        nock('http://jenkins-mock.local')
            .get('/api/json')
            .reply(200, {
                jobs: [
                    {
                        name: 'test-pipeline-1',
                        color: 'blue',
                        lastBuild: { number: 1 }
                    },
                    {
                        name: 'test-pipeline-2',
                        color: 'red',
                        lastBuild: { number: 2 }
                    }
                ]
            });
    }

    static setupGitLabMock() {
        nock('http://gitlab-mock.local')
            .get('/api/v4/projects/1/pipelines')
            .reply(200, [
                {
                    id: 1,
                    status: 'success',
                    ref: 'main',
                    web_url: 'http://gitlab-mock.local/project/1/pipelines/1'
                },
                {
                    id: 2,
                    status: 'failed',
                    ref: 'main',
                    web_url: 'http://gitlab-mock.local/project/1/pipelines/2'
                }
            ]);
    }

    static cleanupMocks() {
        nock.cleanAll();
    }
}
