import * as vscode from 'vscode';
import pangu = require('pangu');

export function activate(context: vscode.ExtensionContext) {

    console.log("Congratulations, your extension 'pangu-spacing' is now active!");

    console.log(pangu)
    var disposable = vscode.commands.registerCommand('extension.pangu', panguPlugin);

    context.subscriptions.push(disposable);
}

function addSpace(e: vscode.TextEditor, d: vscode.TextDocument, sel: vscode.Selection[]) {
	e.edit(function (edit) {
		// itterate through the selections and convert all text to Lower
		for (var x = 0; x < sel.length; x++) {
			let txt: string = d.getText(new vscode.Range(sel[x].start, sel[x].end));
			edit.replace(sel[x], pangu.spacing(txt));
		}
	});
}

function panguPlugin() {
	
	if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage('Open a file first to call pangu');
		return;
	}      
	
	var opts: vscode.QuickPickOptions = { matchOnDescription: true, placeHolder: 'What do you want to do to the selection(s)?' };
	var items: vscode.QuickPickItem[] = [];

	items.push({ label: 'add space', description: 'Add whitespace for your selection' });
	items.push({ label: 'add space all', description: 'Add whitespace for your active window' });

	vscode.window.showQuickPick(items).then((selection) => {
		if (!selection) {
			return;
		}
		let e = vscode.window.activeTextEditor;
		let d = e.document;

		switch (selection.label) {
			case 'add space':
                let sels = e.selections;
				addSpace(e, d, sels);
				break;
            case 'add space all':
                let sel = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE));
				addSpace(e, d, [sel]);
				break;
			default:
				console.log('hum this should not have happend - no selection')
				break;
		}
	});
}