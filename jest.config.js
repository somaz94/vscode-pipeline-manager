module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/test/**',
        '!**/node_modules/**'
    ],
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    testMatch: [
        '**/tests/**/*.test.ts'
    ],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^vscode$': '<rootDir>/tests/unit/vscode.mock'
    },
    setupFilesAfterEnv: [
        '<rootDir>/tests/unit/setup.ts'
    ]
};