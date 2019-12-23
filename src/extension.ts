import path = require("path");
import vscode = require('vscode');
import pangu = require('pangu');

export function activate(ctx: vscode.ExtensionContext) {
	console.log("Congratulations, your extension 'pangu' is now active!");

	ctx.subscriptions.push(vscode.commands.registerCommand('extension.add_space', addSpaceSelection));
	ctx.subscriptions.push(vscode.commands.registerCommand('extension.add_space_all', addSpaceAll));
	ctx.subscriptions.push(new Watcher());
}

export function deactivate() { }

function addSpace(e: vscode.TextEditor, d: vscode.TextDocument, sel: vscode.Selection[]) {
	e.edit(function (edit: vscode.TextEditorEdit) {
		// itterate through the selections and convert all text to Lower
		for (var x = 0; x < sel.length; x++) {
			let txt: string = d.getText(new vscode.Range(sel[x].start, sel[x].end));
			let parsed: string = pangu.spacing(txt);
			if (txt !== parsed) {
				edit.replace(sel[x], parsed);
			}
		}
	});
}
function addSpaceSelection() {
	let e = vscode.window.activeTextEditor;
	if (e) {
		let d = e.document;
		let sels = e.selections;
		addSpace(e, d, sels);
	}
}

function addSpaceAll() {
	let e = vscode.window.activeTextEditor;
	if (e) {
		let d = e.document;
		let sel = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE));
		addSpace(e, d, [sel]);
	}
}

class Watcher {
	private _disposable!: vscode.Disposable;
	private _config!: vscode.WorkspaceConfiguration;
	private _whitelist: Array<string> = [];

	public getConfig() {
		this._config = vscode.workspace.getConfiguration('pangu');
	}
	constructor() {
		this.getConfig();
		if (this._config.get('auto_space_on_save', false)) {
			this._whitelist = this._config.get('auto_space_on_save_ext', []);
			if (this._whitelist.includes('*')) {
				this._whitelist = ['*'];
			}
			let subscriptions: vscode.Disposable[] = [];
			this._disposable = vscode.Disposable.from(...subscriptions);

			vscode.workspace.onDidSaveTextDocument(this._onDidSaveDoc, this, subscriptions);
		}
	}
	dispose() {
		this._disposable.dispose();
	}

	_onDidSaveDoc(e: vscode.TextDocument) {
		var ext = path.extname(e.fileName);
		if (this._whitelist.includes('*') || this._whitelist.includes(ext)) {
			addSpaceAll();
		}
	}
}

