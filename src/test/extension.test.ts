import * as vscode from 'vscode';

suite('Extension Test Suite', async () => {
    const chai = await import('chai');
    const expect = chai.expect;

    test('Sample test', () => {
        vscode.window.showInformationMessage('Start all tests.');
        expect(1).to.equal(1);
    });
});