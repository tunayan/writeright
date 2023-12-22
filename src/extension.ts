import * as vscode from 'vscode';
import { Configuration } from './configuration'; // Assuming you'll have a configuration.ts file for managing settings
import { OpenAIChatbot } from './chatbot';      // Assuming you'll create a chatbot.ts for OpenAI Chatbot logic

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "proofreadergpt" is now active!');

    let config = new Configuration(context);
    let chatbot = new OpenAIChatbot(config);

    // Registering a command for the chatbot, ensure the command matches what's in package.json
    let disposable = vscode.commands.registerCommand('rootfish.proofreadergpt.askQuestion', async () => {
		let panel = createInputUI(context);
        panel.webview.onDidReceiveMessage(
            async message => { // Make sure this function is async
                switch (message.command) {
                    case 'sendInput':
                        const answer = await chatbot.getAnswer(message.text);
						
						panel.webview.postMessage({
							command: 'returnAnswer',
							text: answer
						});

                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function createInputUI(context: vscode.ExtensionContext): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
        'chatInput', // Identifies the type of the webview. Used internally
        'Chat Input', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        { enableScripts: true } // Webview options. More on these later.
    );

    // And set its HTML content
    panel.webview.html = getWebviewContent();
    
    return panel; // Return the instantiated panel so it can be used outside this function
}

function getWebviewContent() {
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Answer Display</title>
	</head>
	<body>
		<input type="text" id="inputField"/>
		<button id="sendButton">Send</button>
	
		<!-- Read-only textarea for displaying the returned answer -->
		<textarea id="answerBox" rows="10" cols="50" readonly></textarea>
	
		<script>
			const vscode = acquireVsCodeApi();
	
			// Function to update the content of the read-only textarea
			function updateAnswerBox(text) {
				document.getElementById('answerBox').value = text;
			}
	
			window.addEventListener('message', event => {
				const message = event.data; // The JSON data our extension sent
				
				switch (message.command) {
					case 'returnAnswer':
						updateAnswerBox(message.text); // Update the textarea with the returned answer
						break;
				}
			});
	
			document.getElementById('sendButton').addEventListener('click', () => {
				const input = document.getElementById('inputField').value;
				vscode.postMessage({
					command: 'sendInput',
					text: input
				});
			});
		</script>
	</body>
	</html>
	`;
}
