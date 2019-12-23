import * as vscode from 'vscode';
import pangu = require('pangu');

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension 'pangu' is now active!");

	var add_space = vscode.commands.registerCommand('extension.add_space', addSpaceSelection);
	var add_space_all = vscode.commands.registerCommand('extension.add_space_all', addSpaceAll);

	context.subscriptions.push(add_space);
	context.subscriptions.push(add_space_all);
	context.subscriptions.push(new Watcher());
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
function addSpaceSelection() {
	let e = vscode.window.activeTextEditor;
	let d = e.document;
	let sels = e.selections;
	addSpace(e, d, sels);
}

function addSpaceAll() {
		let e = vscode.window.activeTextEditor;
		let d = e.document;
		let sel = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE));
		addSpace(e, d, [sel]);
}

class Watcher {
	private _disposable: vscode.Disposable;
	private _config: vscode.WorkspaceConfiguration

	public getConfig() {
		this._config = vscode.workspace.getConfiguration('pangu');
	}
	constructor() {
		this.getConfig()
		if (this._config.get('auto_space_on_save', false)) {
				let subscriptions: vscode.Disposable[] = [];
				this._disposable = vscode.Disposable.from(...subscriptions);

				vscode.workspace.onDidSaveTextDocument(this._onDidSaveDoc, this, subscriptions);
		}
	}
	dispose() {
		this._disposable.dispose();
	}

	_onDidSaveDoc(e) {
		addSpaceAll();
		addSpaceSelection();
	}
}
