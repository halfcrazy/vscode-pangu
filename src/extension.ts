import * as vscode from 'vscode';
import pangu = require('pangu');

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension'pangu'is now active!");
	const pangu = new Pangu();
	var add_space = vscode.commands.registerCommand('extension.add_space', pangu.addSpaceSelection);
	var add_space_all = vscode.commands.registerCommand('extension.add_space_all', pangu.addSpaceAll);

	const _onSaveDisposable = vscode.workspace.onWillSaveTextDocument(pangu.onWillSaveDoc);

	context.subscriptions.push(add_space);
	context.subscriptions.push(add_space_all);
	context.subscriptions.push(pangu);
	context.subscriptions.push(_onSaveDisposable);
}

interface ISpace {
	e: vscode.TextEditor;
	d: vscode.TextDocument;
	sel: vscode.Selection[];
}

class Pangu {
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
		}
	}

	private _addSpace = (space: ISpace): void => {
		const { e, d, sel } = space;
		e.edit(function (edit) {
			// itterate through the selections and convert all text to Lower
			for (var x = 0; x < sel.length; x++) {
					let txt: string = d.getText(new vscode.Range(sel[x].start, sel[x].end));
					edit.replace(sel[x], pangu.spacing(txt));
			}
		});
	}
	public addSpaceSelection = (): void => {
		let e = vscode.window.activeTextEditor;
		let d = e.document;
		let sels = e.selections;
		const space: ISpace = {
			e,
			d,
			sel: sels,
		}
		this._addSpace(space);
	}

	public addSpaceAll = (): void => {
		let e = vscode.window.activeTextEditor;
		let d = e.document;
		let sel = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE));
		const space: ISpace = {
			e,
			d,
			sel: [sel],
		}
		this._addSpace(space);
	}

	public onWillSaveDoc = (): void => {
		this.addSpaceAll();
		// this.addSpaceSelection();
	}
	dispose() {
		this._disposable.dispose();
	}
}

export function deactivate() {}
