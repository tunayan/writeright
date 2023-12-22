import * as vscode from 'vscode';

export class Configuration {
    constructor(private context: vscode.ExtensionContext) {}

    get openAIKey(): string | undefined {
        return vscode.workspace.getConfiguration('rootfish.proofreadergpt').get<string>('openAIKey');
    }

    // Add more configuration retrieval methods here if needed
}
