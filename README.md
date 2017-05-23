> Dictionary completion is one of many search facilities provided by Insert mode completion. It allows the user to get a list of keywords, based off of the current word at the cursor. This is useful if you are typing a long word (e.g. acknowledgeable) and don't want to finish typing or don't remember the spelling
>
> From [vim wikia](http://vim.wikia.com/wiki/Dictionary_completions)

Enabled for Markdown and LaTeX.

**Note**: After version 1.10.0, the default vscode setting disables quick suggestions for Markdown. To enable this, put
```
"[markdown]": {
    "editor.quickSuggestions": true
}
```
into your `settings.json`.