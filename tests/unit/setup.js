"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=setup.js.map