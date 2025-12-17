// Based on Github Light theme: https://github.com/shikijs/textmate-grammars-themes/tree/main/packages/tm-themes/themes

import {ThemeRegistration} from 'shiki';

export const rociLight: ThemeRegistration = {
  colors: {
    'activityBar.activeBorder': '#f9826c',
    'activityBar.background': '#fff',
    'activityBar.border': '#e1e4e8',
    'activityBar.foreground': '#2f363d',
    'activityBar.inactiveForeground': '#959da5',
    'activityBarBadge.background': '#2188ff',
    'activityBarBadge.foreground': '#fff',
    'badge.background': '#dbedff',
    'badge.foreground': '#005cc5',
    'breadcrumb.activeSelectionForeground': '#586069',
    'breadcrumb.focusForeground': '#2f363d',
    'breadcrumb.foreground': '#6a737d',
    'breadcrumbPicker.background': '#fafbfc',
    'button.background': '#159739',
    'button.foreground': '#fff',
    'button.hoverBackground': '#138934',
    'button.secondaryBackground': '#e1e4e8',
    'button.secondaryForeground': '#1b1f23',
    'button.secondaryHoverBackground': '#d1d5da',
    'checkbox.background': '#fafbfc',
    'checkbox.border': '#d1d5da',
    'debugToolBar.background': '#fff',
    'descriptionForeground': '#6a737d',
    'diffEditor.insertedTextBackground': '#34d05822',
    'diffEditor.removedTextBackground': '#d73a4922',
    'dropdown.background': '#fafbfc',
    'dropdown.border': '#e1e4e8',
    'dropdown.foreground': '#2f363d',
    'dropdown.listBackground': '#fff',
    'editor.background': '#fff',
    'editor.findMatchBackground': '#ffdf5d',
    'editor.findMatchHighlightBackground': '#ffdf5d66',
    'editor.focusedStackFrameHighlightBackground': '#28a74525',
    'editor.foldBackground': '#d1d5da11',
    'editor.foreground': '#24292e',
    'editor.inactiveSelectionBackground': '#0366d611',
    'editor.lineHighlightBackground': '#f6f8fa',
    'editor.linkedEditingBackground': '#0366d611',
    'editor.selectionBackground': '#0366d625',
    'editor.selectionHighlightBackground': '#34d05840',
    'editor.selectionHighlightBorder': '#34d05800',
    'editor.stackFrameHighlightBackground': '#ffd33d33',
    'editor.wordHighlightBackground': '#34d05800',
    'editor.wordHighlightBorder': '#24943e99',
    'editor.wordHighlightStrongBackground': '#34d05800',
    'editor.wordHighlightStrongBorder': '#24943e50',
    'editorBracketHighlight.foreground1': '#005cc5',
    'editorBracketHighlight.foreground2': '#e36209',
    'editorBracketHighlight.foreground3': '#5a32a3',
    'editorBracketHighlight.foreground4': '#005cc5',
    'editorBracketHighlight.foreground5': '#e36209',
    'editorBracketHighlight.foreground6': '#5a32a3',
    'editorBracketMatch.background': '#34d05840',
    'editorBracketMatch.border': '#34d05800',
    'editorCursor.foreground': '#044289',
    'editorError.foreground': '#cb2431',
    'editorGroup.border': '#e1e4e8',
    'editorGroupHeader.tabsBackground': '#f6f8fa',
    'editorGroupHeader.tabsBorder': '#e1e4e8',
    'editorGutter.addedBackground': '#28a745',
    'editorGutter.deletedBackground': '#d73a49',
    'editorGutter.modifiedBackground': '#2188ff',
    'editorIndentGuide.activeBackground': '#d7dbe0',
    'editorIndentGuide.background': '#eff2f6',
    'editorLineNumber.activeForeground': '#24292e',
    'editorLineNumber.foreground': '#1b1f234d',
    'editorOverviewRuler.border': '#fff',
    'editorWarning.foreground': '#f9c513',
    'editorWhitespace.foreground': '#d1d5da',
    'editorWidget.background': '#f6f8fa',
    'errorForeground': '#cb2431',
    'focusBorder': '#2188ff',
    'foreground': '#444d56',
    'gitDecoration.addedResourceForeground': '#28a745',
    'gitDecoration.conflictingResourceForeground': '#e36209',
    'gitDecoration.deletedResourceForeground': '#d73a49',
    'gitDecoration.ignoredResourceForeground': '#959da5',
    'gitDecoration.modifiedResourceForeground': '#005cc5',
    'gitDecoration.submoduleResourceForeground': '#959da5',
    'gitDecoration.untrackedResourceForeground': '#28a745',
    'input.background': '#fafbfc',
    'input.border': '#e1e4e8',
    'input.foreground': '#2f363d',
    'input.placeholderForeground': '#959da5',
    'list.activeSelectionBackground': '#e2e5e9',
    'list.activeSelectionForeground': '#2f363d',
    'list.focusBackground': '#cce5ff',
    'list.hoverBackground': '#ebf0f4',
    'list.hoverForeground': '#2f363d',
    'list.inactiveFocusBackground': '#dbedff',
    'list.inactiveSelectionBackground': '#e8eaed',
    'list.inactiveSelectionForeground': '#2f363d',
    'notificationCenterHeader.background': '#e1e4e8',
    'notificationCenterHeader.foreground': '#6a737d',
    'notifications.background': '#fafbfc',
    'notifications.border': '#e1e4e8',
    'notifications.foreground': '#2f363d',
    'notificationsErrorIcon.foreground': '#d73a49',
    'notificationsInfoIcon.foreground': '#005cc5',
    'notificationsWarningIcon.foreground': '#e36209',
    'panel.background': '#f6f8fa',
    'panel.border': '#e1e4e8',
    'panelInput.border': '#e1e4e8',
    'panelTitle.activeBorder': '#f9826c',
    'panelTitle.activeForeground': '#2f363d',
    'panelTitle.inactiveForeground': '#6a737d',
    'pickerGroup.border': '#e1e4e8',
    'pickerGroup.foreground': '#2f363d',
    'progressBar.background': '#2188ff',
    'quickInput.background': '#fafbfc',
    'quickInput.foreground': '#2f363d',
    'scrollbar.shadow': '#6a737d33',
    'scrollbarSlider.activeBackground': '#959da588',
    'scrollbarSlider.background': '#959da533',
    'scrollbarSlider.hoverBackground': '#959da544',
    'settings.headerForeground': '#2f363d',
    'settings.modifiedItemIndicator': '#2188ff',
    'sideBar.background': '#f6f8fa',
    'sideBar.border': '#e1e4e8',
    'sideBar.foreground': '#586069',
    'sideBarSectionHeader.background': '#f6f8fa',
    'sideBarSectionHeader.border': '#e1e4e8',
    'sideBarSectionHeader.foreground': '#2f363d',
    'sideBarTitle.foreground': '#2f363d',
    'statusBar.background': '#fff',
    'statusBar.border': '#e1e4e8',
    'statusBar.debuggingBackground': '#f9826c',
    'statusBar.debuggingForeground': '#fff',
    'statusBar.foreground': '#586069',
    'statusBar.noFolderBackground': '#fff',
    'statusBarItem.prominentBackground': '#e8eaed',
    'statusBarItem.remoteBackground': '#fff',
    'statusBarItem.remoteForeground': '#586069',
    'tab.activeBackground': '#fff',
    'tab.activeBorder': '#fff',
    'tab.activeBorderTop': '#f9826c',
    'tab.activeForeground': '#2f363d',
    'tab.border': '#e1e4e8',
    'tab.hoverBackground': '#fff',
    'tab.inactiveBackground': '#f6f8fa',
    'tab.inactiveForeground': '#6a737d',
    'tab.unfocusedActiveBorder': '#fff',
    'tab.unfocusedActiveBorderTop': '#e1e4e8',
    'tab.unfocusedHoverBackground': '#fff',
    'terminal.ansiBlack': '#24292e',
    'terminal.ansiBlue': '#0366d6',
    'terminal.ansiBrightBlack': '#959da5',
    'terminal.ansiBrightBlue': '#005cc5',
    'terminal.ansiBrightCyan': '#3192aa',
    'terminal.ansiBrightGreen': '#22863a',
    'terminal.ansiBrightMagenta': '#5a32a3',
    'terminal.ansiBrightRed': '#cb2431',
    'terminal.ansiBrightWhite': '#d1d5da',
    'terminal.ansiBrightYellow': '#b08800',
    'terminal.ansiCyan': '#1b7c83',
    'terminal.ansiGreen': '#28a745',
    'terminal.ansiMagenta': '#5a32a3',
    'terminal.ansiRed': '#d73a49',
    'terminal.ansiWhite': '#6a737d',
    'terminal.ansiYellow': '#dbab09',
    'terminal.foreground': '#586069',
    'terminal.tab.activeBorder': '#f9826c',
    'terminalCursor.background': '#d1d5da',
    'terminalCursor.foreground': '#005cc5',
    'textBlockQuote.background': '#fafbfc',
    'textBlockQuote.border': '#e1e4e8',
    'textCodeBlock.background': '#f6f8fa',
    'textLink.activeForeground': '#005cc5',
    'textLink.foreground': '#0366d6',
    'textPreformat.foreground': '#586069',
    'textSeparator.foreground': '#d1d5da',
    'titleBar.activeBackground': '#fff',
    'titleBar.activeForeground': '#2f363d',
    'titleBar.border': '#e1e4e8',
    'titleBar.inactiveBackground': '#f6f8fa',
    'titleBar.inactiveForeground': '#6a737d',
    'tree.indentGuidesStroke': '#e1e4e8',
    'welcomePage.buttonBackground': '#f6f8fa',
    'welcomePage.buttonHoverBackground': '#e1e4e8',
  },
  displayName: 'Roci Light',
  name: 'roci-light',
  semanticHighlighting: true,
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: {
        foreground: '#6272a4',
      },
    },
    {
      scope: [
        'constant',
        'constant.language',
        'entity.name.constant',
        'variable.other.constant',
        'variable.other.enummember',
        'variable.language',
      ],
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: ['constant.language.boolean'],
      settings: {
        foreground: '#6f42c1',
      },
    },
    {
      scope: ['constant.numeric', 'constant.language.numeric'],
      settings: {
        foreground: '#fd7e14',
      },
    },
    {
      scope: ['entity', 'entity.name', 'entity.name.type', 'entity.name.class'],
      settings: {
        foreground: '#2b3287',
      },
    },
    {
      scope: [
        'entity.name.function',
        'meta.function-call',
        'support.function',
      ],
      settings: {
        foreground: '#19ad68',
      },
    },
    {
      scope: 'variable.parameter.function',
      settings: {
        foreground: '#24292e',
      },
    },
    {
      scope: ['entity.name.tag', 'meta.tag'],
      settings: {
        foreground: '#2b3287',
      },
    },
    {
      scope: ['entity.other.attribute-name', 'meta.attribute'],
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'keyword',
      settings: {
        foreground: '#fc218a',
      },
    },
    {
      scope: ['storage', 'storage.type'],
      settings: {
        foreground: '#fc218a',
      },
    },
    {
      scope: [
        'storage.modifier.package',
        'storage.modifier.import',
        'storage.type.java',
      ],
      settings: {
        foreground: '#24292e',
      },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
        'string punctuation.section.embedded source',
      ],
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: [
        'punctuation',
        'punctuation.separator',
        'punctuation.terminator',
        'punctuation.accessor',
        'punctuation.definition.tag',
        'punctuation.definition.parameters',
        'punctuation.definition.block',
        'punctuation.section.embedded',
        'meta.brace',
      ],
      settings: {
        foreground: '#6272a4',
      },
    },
    {
      scope: ['storage.type.annotation', 'punctuation.definition.annotation'],
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: 'support',
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'meta.property-name',
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'variable',
      settings: {
        foreground: '#fd7e14',
      },
    },
    {
      scope: 'variable.other',
      settings: {
        foreground: '#24292e',
      },
    },
    {
      scope: 'invalid.broken',
      settings: {
        fontStyle: 'italic',
        foreground: '#b31d28',
      },
    },
    {
      scope: 'invalid.deprecated',
      settings: {
        fontStyle: 'italic',
        foreground: '#b31d28',
      },
    },
    {
      scope: 'invalid.illegal',
      settings: {
        fontStyle: 'italic',
        foreground: '#b31d28',
      },
    },
    {
      scope: 'invalid.unimplemented',
      settings: {
        fontStyle: 'italic',
        foreground: '#b31d28',
      },
    },
    {
      scope: 'carriage-return',
      settings: {
        background: '#d73a49',
        fontStyle: 'italic underline',
        foreground: '#fafbfc',
      },
    },
    {
      scope: 'message.error',
      settings: {
        foreground: '#b31d28',
      },
    },
    {
      scope: 'string variable',
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: ['source.regexp', 'string.regexp'],
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: [
        'string.regexp.character-class',
        'string.regexp constant.character.escape',
        'string.regexp source.ruby.embedded',
        'string.regexp string.regexp.arbitrary-repitition',
      ],
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: 'string.regexp constant.character.escape',
      settings: {
        fontStyle: 'bold',
        foreground: '#19ad68',
      },
    },
    {
      scope: 'support.constant',
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: 'support.variable',
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'meta.module-reference',
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'punctuation.definition.list.begin.markdown',
      settings: {
        foreground: '#fd7e14',
      },
    },
    {
      scope: ['markup.heading', 'markup.heading entity.name'],
      settings: {
        fontStyle: 'bold',
        foreground: '#2b3287',
      },
    },
    {
      scope: 'markup.quote',
      settings: {
        foreground: '#19ad68',
      },
    },
    {
      scope: 'markup.italic',
      settings: {
        fontStyle: 'italic',
        foreground: '#24292e',
      },
    },
    {
      scope: 'markup.bold',
      settings: {
        fontStyle: 'bold',
        foreground: '#24292e',
      },
    },
    {
      scope: ['markup.underline'],
      settings: {
        fontStyle: 'underline',
      },
    },
    {
      scope: ['markup.strikethrough'],
      settings: {
        fontStyle: 'strikethrough',
      },
    },
    {
      scope: 'markup.inline.raw',
      settings: {
        foreground: '#be9f17',
      },
    },
    {
      scope: [
        'markup.deleted',
        'meta.diff.header.from-file',
        'punctuation.definition.deleted',
      ],
      settings: {
        background: '#ffeef0',
        foreground: '#b31d28',
      },
    },
    {
      scope: [
        'markup.inserted',
        'meta.diff.header.to-file',
        'punctuation.definition.inserted',
      ],
      settings: {
        background: '#f0fff4',
        foreground: '#19ad68',
      },
    },
    {
      scope: ['markup.changed', 'punctuation.definition.changed'],
      settings: {
        background: '#ffebda',
        foreground: '#fd7e14',
      },
    },
    {
      scope: ['markup.ignored', 'markup.untracked'],
      settings: {
        background: '#6272a4',
        foreground: '#f6f8fa',
      },
    },
    {
      scope: 'meta.diff.range',
      settings: {
        fontStyle: 'bold',
        foreground: '#2b3287',
      },
    },
    {
      scope: 'meta.diff.header',
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'meta.separator',
      settings: {
        fontStyle: 'bold',
        foreground: '#0d6efd',
      },
    },
    {
      scope: 'meta.output',
      settings: {
        foreground: '#0d6efd',
      },
    },
    {
      scope: [
        'brackethighlighter.tag',
        'brackethighlighter.curly',
        'brackethighlighter.round',
        'brackethighlighter.square',
        'brackethighlighter.angle',
        'brackethighlighter.quote',
      ],
      settings: {
        foreground: '#586069',
      },
    },
    {
      scope: 'brackethighlighter.unmatched',
      settings: {
        foreground: '#b31d28',
      },
    },
    {
      scope: ['constant.other.reference.link', 'string.other.link'],
      settings: {
        fontStyle: 'underline',
        foreground: '#0d6efd',
      },
    },
  ],
  type: 'light',
};
