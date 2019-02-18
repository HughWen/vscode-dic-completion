'use strict'

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let indexedComplItems = {};
const indexes = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const userDictFilename = getUserDictFilename();

export function activate(context: vscode.ExtensionContext) {
    // Built-in wordlist
    const builtInWords = fs.readFileSync(context.asAbsolutePath('words')).toString().split(/\r?\n/);

    loadUserWordsAndRebuildIndex(builtInWords);

    context.subscriptions.push(vscode.commands.registerCommand('completion.openUserDict', () => {
        if (vscode.workspace.getConfiguration('dictCompletion').get<boolean>('externalUserDictFile')) {
            if (!fs.existsSync(userDictFilename)) {
                fs.closeSync(fs.openSync(userDictFilename, 'w'));
            }

            vscode.workspace.openTextDocument(userDictFilename).then(doc => vscode.window.showTextDocument(doc));
        } else {
            vscode.commands.executeCommand('workbench.action.openSettingsJson');
        }
    }));

    vscode.workspace.onDidSaveTextDocument(doc => {
        if (
            vscode.workspace.getConfiguration('dictCompletion').get<boolean>('externalUserDictFile')
            && doc.fileName.toLowerCase() === userDictFilename.toLowerCase()
        ) {
            loadUserWordsAndRebuildIndex(builtInWords);
        }
    });

    vscode.workspace.onDidChangeConfiguration(e => {
        if (
            e.affectsConfiguration('dictCompletion.externalUserDictFile')
            || (
                e.affectsConfiguration('dictCompletion.userDictionary')
                && !vscode.workspace.getConfiguration('dictCompletion').get<boolean>('externalUserDictFile')
            )
        ) {
            loadUserWordsAndRebuildIndex(builtInWords);
        }
    });

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(getDocSelector('markdown'), new DictionaryCompletionItemProvider("markdown")),
        vscode.languages.registerCompletionItemProvider(getDocSelector('latex'), new DictionaryCompletionItemProvider("latex")),
        vscode.languages.registerCompletionItemProvider(getDocSelector('html'), new DictionaryCompletionItemProvider("html"))
    );
}

function getDocSelector(lang: string) {
    return [{ language: lang, scheme: 'file' }, { language: lang, scheme: 'untitled' }];
}

function loadUserWordsAndRebuildIndex(builtInWords: string[]) {
    let words = [];
    // User wordlist
    if (vscode.workspace.getConfiguration('dictCompletion').get<boolean>('externalUserDictFile')) {
        if (fs.existsSync(userDictFilename)) {
            let userWordListStr = fs.readFileSync(userDictFilename).toString();
            if (userWordListStr.length > 0) {
                words = builtInWords.concat(userWordListStr.split(/\r?\n/));
            }
        }
    } else {
        words = builtInWords.concat(vscode.workspace.getConfiguration('dictCompletion').get<Array<string>>('userDictionary'))
    }

    words = Array.from(new Set(words));
    words = words.filter(word => word.length > 0 && !word.startsWith('//'));

    indexedComplItems = {};
    indexes.forEach(i => {
        indexedComplItems[i] = [];
    });

    words.forEach(word => {
        let firstLetter = word.charAt(0).toLowerCase();
        let item = new vscode.CompletionItem(word, vscode.CompletionItemKind.Text);
        indexedComplItems[firstLetter].push(item);
    });
}

// From https://github.com/bartosz-antosik/vscode-spellright/blob/master/src/spellright.js
function getUserDictFilename() {
    let codeFolder = 'Code';
    const dictName = 'wordlist';
    if (vscode.version.indexOf('insider') >= 0)
        codeFolder = 'Code - Insiders';
    if (process.platform == 'win32')
        return path.join(process.env.APPDATA, codeFolder, 'User', dictName);
    else if (process.platform == 'darwin')
        return path.join(process.env.HOME, 'Library', 'Application Support', codeFolder, 'User', dictName);
    else if (process.platform == 'linux')
        return path.join(process.env.HOME, '.config', codeFolder, 'User', dictName);
    else
        return '';
};

/**
 * Provide completion according to the first letter
 */
class DictionaryCompletionItemProvider implements vscode.CompletionItemProvider {
    fileType: string;
    constructor(fileType: string) {
        this.fileType = fileType;
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {

        const lineText = document.lineAt(position.line).text;
        const textBefore = lineText.substring(0, position.character);
        const wordBefore = textBefore.replace(/\W/g, ' ').split(/[\s]+/).pop();
        const firstLetter = wordBefore.charAt(0);
        const followingChar = lineText.charAt(position.character);
        const addSpace = vscode.workspace.getConfiguration('dictCompletion').get<boolean>('addSpaceAfterCompletion') && !followingChar.match(/[ ,.:;?!\-]/);

        if (wordBefore.length < vscode.workspace.getConfiguration('dictCompletion').get<number>('leastNumOfChars')) {
            return [];
        }

        switch (this.fileType) {
            case "markdown":
                // [caption](don't complete here)
                if (/\[[^\]]*\]\([^\)]*$/.test(textBefore)) {
                    return [];
                }
                return this.completeByFirstLetter(firstLetter, addSpace);
            case "latex":
                // `|` means cursor
                // \command|
                if (/\\[^ {\[]*$/.test(textBefore)) {
                    return [];
                }
                // \begin[...|] or \begin{...}[...|]
                if (/\\(documentclass|usepackage|begin|end|cite|ref)({[^}]*}|)?\[[^\]]*$/.test(textBefore)) {
                    return [];
                }
                // \begin{...|} or \begin[...]{...|}
                if (/\\(documentclass|usepackage|begin|end|cite|ref)(\[[^\]]*\]|)?{[^}]*$/.test(textBefore)) {
                    return [];
                }
                return this.completeByFirstLetter(firstLetter, addSpace);
            case "html":
                // <don't complete here>
                if (/<[^>]*$/.test(textBefore)) {
                    return [];
                }
                let docBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
                if (docBefore.includes('<style>') &&
                    (!docBefore.includes('</style>') || docBefore.match(/<style>/g).length > docBefore.match(/<\/style>/g).length)) {
                    return new Promise((resolve, reject) => reject());
                }
                if (docBefore.includes('<script>') &&
                    (!docBefore.includes('</script>') || docBefore.match(/<script>/g).length > docBefore.match(/<\/script>/g).length)) {
                    return new Promise((resolve, reject) => reject());
                }
                return this.completeByFirstLetter(firstLetter, addSpace);
        }
    }

    private completeByFirstLetter(firstLetter: string, addSpace: boolean): Thenable<vscode.CompletionItem[]> {
        if (firstLetter.toLowerCase() == firstLetter) { /* Lowercase */
            let completions: vscode.CompletionItem[] = indexedComplItems[firstLetter];
            if (addSpace) {
                completions.forEach(item => item.insertText = item.label + ' ');
            }
            return new Promise((resolve, reject) => resolve(completions));
        } else { /* Uppercase */
            let completions: vscode.CompletionItem[] = indexedComplItems[firstLetter.toLowerCase()].map(item => {
                let newLabel = item.label.charAt(0).toUpperCase() + item.label.slice(1);
                let newItem = new vscode.CompletionItem(newLabel, vscode.CompletionItemKind.Text);
                if (addSpace) {
                    newItem.insertText = newLabel + ' ';
                }
                return newItem;
            });
            return new Promise((resolve, reject) => resolve(completions));
        }
    }
}
