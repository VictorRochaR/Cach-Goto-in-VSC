// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('test.gotoLine', async () => {
		const input = await vscode.window.showInputBox({
			prompt: 'Onde está o erro?'
		});

		if (input) {
			const fullPath = vscode.window.activeTextEditor?.document.fileName;
			const arquivoAtualExtensao = path.basename(fullPath || '');
			const arquivoAtual = path.parse(arquivoAtualExtensao).name;
			
			const [metodo, arquivoValue] = input.includes('^') ? input.split('^') : [input, arquivoAtual];
			//const [metodo, arquivoValue] = input.split('^');
			const [metodoValue, linhasPularValue] = metodo.includes('+') ? metodo.split('+') : [metodo, '0'];
			//const [linhasPularValue, arquivoValue] = arquivo.split('^');
			const files = await vscode.workspace.findFiles(`**/${arquivoValue}.mac`); // Append '.mac' at the end of the arquivoValue
			if (files.length > 0) {
				const fileUri = files[0];
				const document = await vscode.workspace.openTextDocument(fileUri);
				await vscode.window.showTextDocument(document);

				const symbol = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri);
				if (symbol) {
					const methodSymbol = symbol.find(s => s.name === metodoValue);
					if (methodSymbol) {
						const position = methodSymbol.range.start;
						const editor = vscode.window.activeTextEditor;
						if (editor) {
							editor.selection = new vscode.Selection(position, position);
							editor.revealRange(new vscode.Range(position, position));

							const line = position.line + parseInt(linhasPularValue);
							const newPosition = new vscode.Position(line, position.character);
							editor.selection = new vscode.Selection(newPosition, newPosition);
							editor.revealRange(new vscode.Range(newPosition, newPosition));
						}
					} else {
						vscode.window.showInformationMessage(`Não achamos o símbolo '${metodoValue}'.`);
					}
				}
			} else {
				vscode.window.showInformationMessage(`Não achamos o arquivo '${arquivoValue}'.`);
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
