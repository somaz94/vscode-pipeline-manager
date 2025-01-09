module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/unit/**/*.test.ts'],
  setupFiles: ['./tests/unit/setup.ts'],
  moduleNameMapper: {
      '^vscode$': '<rootDir>/tests/unit/vscode.mock.ts'
  },
  transform: {
      '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json'
      }]
  }
};