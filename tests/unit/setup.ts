// VS Code API mock
const mockVscode = {
  workspace: {
    getConfiguration: jest.fn()
  },
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn()
  }
};

jest.mock('vscode', () => {
  return mockVscode;
}, { virtual: true });
