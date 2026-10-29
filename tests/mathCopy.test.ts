import { describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { EditorView, keymap } from "@codemirror/view";
import { indentMore, undo } from "@codemirror/commands";
import {
  ankiMath,
  ankiLatex,
  formatMathCopy,
  mathRows,
  readMathSource,
} from "../src/utils/mathSource";
import { mountMathCopy } from "../src/utils/mathCopy";

const source = String.raw`\begin{align*}
&\frac{1}{1-x}=\sum_{n=0}^\infty x^n, &&x\in(-1,1)\\[10pt]
&e^x=\sum_{n=0}^\infty\frac{x^n}{n!}, &&x\in(-\infty,\infty)\\[10pt]
\end{align*}`;

describe("math source", () => {
  it("splits standalone rows and strips alignment markers and row spacing", () => {
    const rows = mathRows(source);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toBe(
      String.raw`\frac{1}{1-x}=\sum_{n=0}^\infty x^n, \qquad x\in(-1,1)`
    );
    expect(rows[1]).not.toContain("10pt");
    expect(mathRows("x^2")).toEqual(["x^2"]);
  });

  it("preserves nested matrices, escaped ampersands and grouped row breaks", () => {
    const rows = mathRows(
      String.raw`\begin{aligned}&A=\begin{matrix}a&b\\c&d\end{matrix}\\&\text{a\&b}\end{aligned}`
    );
    expect(rows).toEqual([
      String.raw`A=\begin{matrix}a&b\\c&d\end{matrix}`,
      String.raw`\text{a\&b}`,
    ]);
  });

  it("wraps for Anki without nested display environments or duplicate delimiters", () => {
    expect(ankiMath("x^2")).toBe("\\[\nx^2\n\\]");
    expect(ankiMath(ankiMath(source))).toBe(ankiMath(source));
    expect(ankiMath(source)).toContain("\\begin{aligned}");
    expect(ankiMath(source)).not.toContain("align*");
  });

  it("copies standalone rows as raw TeX or escaped Anki HTML", () => {
    const row = String.raw`&\frac{1}{1-x} = 1 + x + x^2 + x^3 + \cdots, &&x \in (-1, 1)\\[10pt]`;
    const expected = String.raw`\frac{1}{1-x} = 1 + x + x^2 + x^3 + \cdots, \qquad x \in (-1, 1)`;
    expect(formatMathCopy(row, "latex")).toBe(expected);
    expect(formatMathCopy(row, "html")).toBe(
      `<anki-mathjax>${expected}</anki-mathjax><br>`
    );
    expect(formatMathCopy("x < y & z > 0", "html")).toContain(
      "x &lt; y   z &gt; 0"
    );
    expect(
      formatMathCopy(String.raw`\begin{matrix}a&b\\c&d\end{matrix}`, "html")
    ).toContain("a&amp;b");
    expect(ankiLatex(String.raw`&x=1\\[10pt]&y=2\\`)).toBe(
      String.raw`\begin{gathered}` +
        "\nx=1 \\\\\ny=2\n" +
        String.raw`\end{gathered}`
    );
  });

  it("reads plain SVG titles but never mistakes rendered MathML for TeX", () => {
    const window = new Window();
    const doc = window.document;
    doc.body.innerHTML =
      '<span class="mjpage"><svg><title>x^2</title><g></g></svg></span>';
    const element = doc.querySelector("g")!;
    expect(readMathSource(element as unknown as Element)).toBe("x^2");
    doc.querySelector("title")!.innerHTML = "<mjx-container>x2</mjx-container>";
    expect(readMathSource(element as unknown as Element)).toBeNull();
    Object.assign(window, {
      MathJax: {
        startup: {
          document: {
            math: [
              { math: source, typesetRoot: doc.querySelector("mjx-container") },
            ],
          },
        },
      },
    });
    expect(readMathSource(element as unknown as Element)).toBe(source);
    window.happyDOM.abort();
  });
});

it("opens the picker, selects rows, copies a selection, and cleans up", async () => {
  const window = new Window();
  const saved = Object.getOwnPropertyDescriptors(globalThis);
  // happy-dom's CSS parser rejects CodeMirror's valid Unicode class names.
  // Only normalize test stylesheet selectors; browser rendering is checked live.
  const insertRule = window.CSSStyleSheet.prototype.insertRule;
  window.CSSStyleSheet.prototype.insertRule = function (rule, index) {
    return insertRule.call(this, rule.replace(/ͼ/g, "cm-test-"), index);
  };
  const clipboard: string[] = [];
  Object.defineProperty(window.navigator.clipboard, "writeText", {
    configurable: true,
    value: async (text: string) => {
      clipboard.push(text);
    },
  });
  for (const [key, value] of Object.entries({
    window,
    document: window.document,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    Node: window.Node,
    MutationObserver: window.MutationObserver,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    navigator: window.navigator,
  })) {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  let cleanup = () => {};
  let mounted = false;
  try {
    window.document.body.innerHTML =
      '<span class="mjpage"><svg><title></title></svg></span>';
    window.document.querySelector("title")!.textContent = source;
    cleanup = mountMathCopy();
    mounted = true;
    const shadow =
      window.document.querySelector("#ma-grid-math-copy")!.shadowRoot!;
    (shadow.querySelector("#pick") as any).click();
    window.document
      .querySelector("svg")!
      .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    expect(shadow.querySelector("dialog")!.hasAttribute("open")).toBe(true);
    expect(shadow.querySelector("#format-help")!.textContent).toBe("");
    const rows = [
      ...shadow.querySelectorAll("#rows button"),
    ] as unknown as HTMLButtonElement[];
    expect(rows.length).toBe(3);
    rows[1].click();
    const editor = EditorView.findFromDOM(
      shadow.querySelector(".cm-editor") as unknown as HTMLElement
    )!;
    expect(editor.state.doc.toString()).toBe(mathRows(source)[0]);
    expect(shadow.textContent).not.toContain(
      "Edits are kept while you switch equations."
    );
    expect(editor.contentDOM.getAttribute("aria-label")).toBe("LaTeX source");
    expect((shadow.querySelector("#selection") as any).disabled).toBe(true);
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: "x^2 + y^2" },
    });
    rows[2].click();
    rows[1].click();
    expect(editor.state.doc.toString()).toBe("x^2 + y^2");
    editor.dispatch({ selection: { anchor: 0, head: 3 } });
    expect(shadow.querySelector("#selection-count")!.textContent).toBe(
      "3 characters selected"
    );
    (shadow.querySelector("#selection") as any).click();
    await Promise.resolve();
    expect(clipboard).toEqual(["x^2"]);
    expect(shadow.querySelector("#status")!.textContent).toBe(
      "Selection copied."
    );
    const format = shadow.querySelector("select")!;
    format.value = "html";
    format.dispatchEvent(new window.Event("change"));
    (shadow.querySelector("#all") as any).click();
    await Promise.resolve();
    expect(clipboard[1]).toBe("<anki-mathjax>x^2 + y^2</anki-mathjax><br>");
    expect(shadow.querySelector("#format-help")!.textContent).toContain(
      "HTML editor"
    );
    (shadow.querySelector("#reset") as any).click();
    expect(editor.state.doc.toString()).toBe(mathRows(source)[0]);
    format.value = "latex";
    const highlighted = String.raw`\frac{1}{x^2} % comment`;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: highlighted },
      selection: { anchor: 6 },
    });
    expect(
      [...editor.contentDOM.querySelectorAll("span")].some(
        (span) => span.textContent === "\\frac" && span.className
      )
    ).toBe(true);
    expect(
      [...editor.contentDOM.querySelectorAll("span")].some(
        (span) => span.textContent === "% comment" && span.className
      )
    ).toBe(true);
    expect(
      editor.contentDOM.querySelectorAll(".cm-matchingBracket").length
    ).toBe(2);
    expect(indentMore(editor)).toBe(true);
    expect(editor.state.doc.toString()).toBe("  " + highlighted);
    expect(undo(editor)).toBe(true);
    expect(editor.state.doc.toString()).toBe(highlighted);
    editor.dispatch({ selection: { anchor: 0, head: 13 } });
    const shortcut = editor.state
      .facet(keymap)
      .flat()
      .find((binding) => binding.key === "Mod-Enter")!;
    const previousCopies = clipboard.length;
    expect(shortcut.run!(editor)).toBe(true);
    await Promise.resolve();
    expect(clipboard).toHaveLength(previousCopies + 1);
    expect(clipboard.at(-1)).toBe(String.raw`\frac{1}{x^2}`);
    Object.defineProperty(window.navigator.clipboard, "writeText", {
      value: async () => {
        throw new Error("denied");
      },
    });
    (shadow.querySelector("#all") as any).click();
    await Promise.resolve();
    expect(shadow.querySelector("#status")!.textContent).toContain("denied");
    expect(editor.state.selection.main.to).toBe(editor.state.doc.length);
  } finally {
    cleanup();
    window.CSSStyleSheet.prototype.insertRule = insertRule;
    if (mounted)
      expect(window.document.querySelector("#ma-grid-math-copy") === null).toBe(
        true
      );
    for (const key of [
      "window",
      "document",
      "Element",
      "HTMLElement",
      "Node",
      "MutationObserver",
      "getComputedStyle",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "navigator",
    ]) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]);
      else Reflect.deleteProperty(globalThis, key);
    }
    window.happyDOM.abort();
  }
});
