# VSCode Dictionary Completion

[![version](https://vsmarketplacebadge.apphb.com/version/yzhang.dictionary-completion.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=yzhang.dictionary-completion)
[![installs](https://vsmarketplacebadge.apphb.com/installs/yzhang.dictionary-completion.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=yzhang.dictionary-completion)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/yzhang-gh/vscode-dic-completion/CI?style=flat-square)](https://github.com/yzhang-gh/vscode-dic-completion/actions)

<img src="images/completion.png" alt="completion" width="401px">

> Dictionary completion allows user to get a list of keywords, based off of the current word at the cursor.
>
> This is useful if you are typing a long word (e.g. acknowledgeable) and don't want to finish typing or don't remember the spelling
>
> — adapted from [vim wikia](http://vim.wikia.com/wiki/Dictionary_completions)

Enabled for Markdown, LaTeX and HTML.

- **NOTE**: After VSCode v1.10.0, quick suggestions for **Markdown** is disabled by default. To enable it, put
  ```
  "[markdown]": {
      "editor.quickSuggestions": true
  }
  ```
  into your `settings.json`.

- **[Code Spell](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) compatible**. Words in `cSpell.userWords` and `cSpell.words` are included in the suggestion.

## Commands

`Completion: Open User Dictionary`

## Settings

| Name                                     | Default | Description                                                                              |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `dictCompletion.leastNumOfChars`         | `0`     | Only show completion list until typing N characters                                      |
| `dictCompletion.useExternalUserDictFile` | `true`  | When set to `false`, load custom words from `userDictionary` in the VSCode user settings |
| `dictCompletion.userDictionary`          | `[]`    | User wordlist (should be an array of string) if `useExternalUserDictFile` is `false`     |

## Changelog

See [here](CHANGELOG.md).

## Credit

Icons made by [Freepik](http://www.freepik.com) from [www.flaticon.com](http://www.flaticon.com) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)
