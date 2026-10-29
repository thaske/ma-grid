import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  bracketMatching,
  HighlightStyle,
  indentUnit,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { tags } from "@lezer/highlight";

const highlighting = HighlightStyle.define([
  { tag: [tags.tagName, tags.keyword], color: "#0577c7" },
  { tag: [tags.atom, tags.number], color: "#986000" },
  { tag: [tags.bracket, tags.operator], color: "#555555" },
  { tag: [tags.string, tags.special(tags.variableName)], color: "#287a38" },
  { tag: tags.comment, color: "#808080", fontStyle: "italic" },
]);

/** A local-only editor. Its document/selection APIs never include highlighted HTML. */
export function createLatexEditor(
  parent: HTMLElement,
  callbacks: {
    onChange: () => void;
    onSelectionChange: () => void;
    onCopy: () => void;
  }
) {
  const extensions = [
    StreamLanguage.define(stex),
    syntaxHighlighting(highlighting),
    bracketMatching(),
    indentUnit.of("  "),
    EditorState.tabSize.of(2),
    history(),
    keymap.of([
      {
        key: "Mod-Enter",
        run: () => {
          callbacks.onCopy();
          return true;
        },
      },
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab,
    ]),
    lineNumbers(),
    highlightActiveLineGutter(),
    EditorView.contentAttributes.of({
      id: "source",
      "aria-label": "LaTeX source",
      "aria-describedby": "editor-help",
      spellcheck: "false",
      autocapitalize: "off",
    }),
    EditorView.theme({
      "&": {
        height: "175px",
        color: "#404040",
        backgroundColor: "white",
        fontSize: "12px",
      },
      "&.cm-focused": { outline: "2px solid #0577c7", outlineOffset: "2px" },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        lineHeight: "1.7",
      },
      ".cm-content": { padding: "8px 0", caretColor: "#404040" },
      ".cm-line": { padding: "0 10px" },
      ".cm-gutters": {
        backgroundColor: "#fafafa",
        color: "#808080",
        borderRight: "1px solid #e0e0e0",
      },
      ".cm-activeLineGutter": { backgroundColor: "#edf5fb", color: "#0577c7" },
      ".cm-matchingBracket": {
        backgroundColor: "#d9edfb",
        outline: "1px solid #0577c7",
      },
      ".cm-nonmatchingBracket": { backgroundColor: "#fce8e6" },
      ".cm-content ::selection, .cm-content::selection": {
        backgroundColor: "#d9edfb",
      },
      "@media (max-width: 650px)": { "&": { height: "145px" } },
    }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) callbacks.onChange();
      else if (update.selectionSet) callbacks.onSelectionChange();
    }),
  ];
  const view = new EditorView({
    parent,
    root: parent.getRootNode() as ShadowRoot | Document,
    state: EditorState.create({ extensions }),
  });
  return {
    get value() {
      return view.state.doc.toString();
    },
    set value(value: string) {
      // Row switches/reset start a new undo history; undo must never bring
      // another equation's source into the current row.
      view.setState(EditorState.create({ doc: value, extensions }));
    },
    get selectionStart() {
      return view.state.selection.main.from;
    },
    get selectionEnd() {
      return view.state.selection.main.to;
    },
    setSelectionRange(from: number, to: number) {
      view.dispatch({ selection: { anchor: from, head: to } });
    },
    focus: () => view.focus(),
    select: () =>
      view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } }),
    measure: () => view.requestMeasure(),
    destroy: () => view.destroy(),
  };
}
