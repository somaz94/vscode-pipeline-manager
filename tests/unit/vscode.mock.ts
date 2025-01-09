export default {
  workspace: {
    getConfiguration: jest.fn()
  },
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn()
  }
};
