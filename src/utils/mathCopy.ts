import {
  formatMathCopy,
  mathRows,
  MATH_SELECTOR,
  readMathSource,
  type MathCopyFormat,
} from "./mathSource";
import { createMathPreview } from "./mathPreview";
import { createLatexEditor } from "./latexEditor";

/** Runs in the page world so MathJax's retained original source is accessible. */
export function mountMathCopy() {
  if (document.getElementById("ma-grid-math-copy")) return () => {};
  const host = document.createElement("div");
  host.id = "ma-grid-math-copy";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      /* Match app.css and the site's bookmark/flag-content dialogs. */
      :host {
        all: initial;
        --ma-font: "Futura Light", "Trebuchet MS", Arial, sans-serif;
        --ma-blue: #0577c7;
        --ma-text: #404040;
        --ma-muted: #808080;
        --ma-border: #e0e0e0;
        font: 15px var(--ma-font);
        color: var(--ma-text);
      }
      * { box-sizing: border-box; }
      button, select { font: inherit; }
      select { display: block; max-width: 100%; padding: 6px 28px 6px 6px; border: 1px solid var(--ma-border); border-radius: 3px; background: white; color: var(--ma-text); font-size: 13px; }
      button { padding: 8px 15px; border: 1px solid var(--ma-border); border-radius: 3px; background: white; color: var(--ma-text); cursor: pointer; font-size: 13px; font-weight: normal; }
      button:hover:not(:disabled) { background: #f2f2f2; }
      button:disabled { color: #888; background: #ececec; cursor: default; }
      button:focus-visible, select:focus-visible { outline: 2px solid var(--ma-blue); outline-offset: 3px; }
      #pick { position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; padding: 6px 15px; background: var(--ma-blue); color: white; border: none; font-size: 12px; }
      #pick:hover { background: var(--ma-blue); opacity: .9; }
      dialog { width: min(1080px, 94vw); max-height: 92vh; padding: 0; overflow: auto; border: 1px solid var(--ma-border); border-radius: 3px; box-shadow: 0 1px 1px #00000013, 0 2px 2px #00000013, 0 4px 4px #00000013, 0 8px 8px #00000013, 0 16px 16px #00000013; color: var(--ma-text); background: white; font: 15px/1.5 var(--ma-font); }
      dialog::backdrop { background: rgb(0 0 0 / 35%); }
      header { padding: 18px 25px; border-bottom: 1px solid var(--ma-border); display: flex; align-items: center; gap: 14px; }
      h2 { flex: 1; font-size: 18px; font-weight: bold; color: #1e194e; margin: 0; }
      #close { font-size: 22px; line-height: 1; border: 0; padding: 8px; color: var(--ma-muted); }
      .workspace { display: grid; grid-template-columns: 200px minmax(0, 1fr); }
      aside { padding: 20px 12px; background: #fafafa; border-right: 1px solid var(--ma-border); max-height: 560px; overflow: auto; }
      .eyebrow { font-size: 13px; font-weight: normal; color: var(--ma-text); }
      aside > .eyebrow { padding: 0 10px 12px; display: block; }
      #rows { display: grid; gap: 4px; }
      .row { width: 100%; text-align: left; padding: 9px 12px; background: transparent; border: 1px solid transparent; min-height: 60px; }
      .row[aria-pressed="true"] { background: #edf5fb; border-color: var(--ma-border); color: var(--ma-blue); box-shadow: inset 3px 0 var(--ma-blue); }
      .row-label { display: block; font: 12px var(--ma-font); color: var(--ma-muted); margin-bottom: 6px; }
      .row-math { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; pointer-events: none; }
      main { min-width: 0; padding: 20px 25px; }
      .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
      .badge { font-size: 12px; color: var(--ma-muted); }
      #preview { padding: 18px 16px; min-height: 100px; max-height: 235px; overflow: auto; border: 1px solid var(--ma-border); border-radius: 3px; font-size: 15px; background: white; }
      #preview mjx-container[display="true"] { margin: .4em 0 !important; text-align: left !important; }
      .editor-heading { margin: 20px 0 8px; }
      #reset { padding: 0; border: 0; font-size: 12px; color: var(--ma-blue); }
      #reset:hover:not(:disabled) { background: none; text-decoration: underline; }
      #reset:disabled { color: var(--ma-muted); background: none; }
      #source-editor { min-width: 0; border: 1px solid var(--ma-border); }
      .editor-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--ma-muted); font-size: 12px; padding-top: 7px; }
      footer { border-top: 1px solid var(--ma-border); padding: 16px 25px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; background: white; }
      .format { display: grid; gap: 4px; font-size: 13px; }
      .format small { display: block; color: var(--ma-muted); font-size: 12px; }
      .format small:empty { display: none; }
      .actions { display: flex; gap: 8px; }
      .actions button { padding: 6px 15px; border-radius: 3px; border: none; text-align: center; font-size: 12px; font-weight: normal; background: var(--ma-blue); color: white; }
      .actions button:hover:not(:disabled) { background: var(--ma-blue); color: white; opacity: .9; }
      .actions button:disabled { color: #c4c4c4; background: #ececec; }
      #status { padding: 0 25px 12px; min-height: 30px; font-size: 12px; color: var(--ma-muted); background: white; margin: 0; }
      #status[data-success="true"] { color: #287a38; }
      @media (max-width: 650px) {
        header { padding: 16px; } .workspace { grid-template-columns: 1fr; }
        aside { max-height: 150px; padding: 12px; border-right: 0; border-bottom: 1px solid var(--ma-border); }
        #rows { grid-template-columns: repeat(2, minmax(0, 1fr)); } aside > .eyebrow { padding-bottom: 6px; }
        main { padding: 16px; } footer { padding: 16px; }
        .editor-meta { flex-wrap: wrap; }
      }
    </style>
    <button id="pick" type="button">Copy math</button>
    <dialog aria-labelledby="heading">
      <header>
        <h2 id="heading">Math to Anki</h2>
        <button id="close" type="button" aria-label="Close math source" title="Close (Esc)">×</button>
      </header>
      <div class="workspace">
        <aside aria-label="Equations"><span class="eyebrow" id="equation-count">Equations</span><div id="rows" role="group" aria-label="Formula row"></div></aside>
        <main>
          <div class="section-heading"><span class="eyebrow">Preview</span><span class="badge" id="current-row">Entire formula</span></div>
          <div id="preview" aria-label="Rendered math preview"></div>
          <div class="section-heading editor-heading"><span class="eyebrow">LaTeX source</span><button id="reset" type="button">Reset edits</button></div>
          <div id="source-editor"></div>
          <div class="editor-meta"><span id="editor-help">Edit freely, or highlight a fragment to copy.</span><span id="selection-count">No text selected</span></div>
        </main>
      </div>
      <footer>
        <label class="format"><span class="eyebrow">Copy format</span><select id="format" aria-label="Copy format"><option value="latex">LaTeX · Anki math editor</option><option value="html">Anki HTML · field HTML editor</option><option value="delimiters">Display math · \\[ … \\]</option></select><small id="format-help"></small></label>
        <div class="actions"><button id="selection" type="button" disabled>Copy selection</button><button id="all" type="button">Copy entire formula</button></div>
      </footer>
      <p id="status" role="status" aria-live="polite">Tip: Ctrl/⌘ + Enter copies your selection, or the current formula.</p>
    </dialog>`;
  document.body.append(host);
  const query = <T extends Element>(selector: string) =>
    shadow.querySelector<T>(selector)!;
  const picker = query<HTMLButtonElement>("#pick");
  const dialog = query<HTMLDialogElement>("dialog");
  const editor = createLatexEditor(query<HTMLElement>("#source-editor"), {
    onChange: onEditorChange,
    onSelectionChange: updateSelection,
    onCopy: () => void copy(editor.selectionEnd > editor.selectionStart),
  });
  const rowsContainer = query<HTMLElement>("#rows");
  const status = query<HTMLElement>("#status");
  const copySelection = query<HTMLButtonElement>("#selection");
  const copyAll = query<HTMLButtonElement>("#all");
  const reset = query<HTMLButtonElement>("#reset");
  const preview = createMathPreview(shadow);
  const format = query<HTMLSelectElement>("#format");
  const formatHints: Record<MathCopyFormat, string> = {
    latex: "",
    html: "Paste in the card field’s HTML editor, not the MathJax editor.",
    delimiters: "Paste into a regular card field as display math.",
  };
  format.onchange = () => {
    query("#format-help").textContent =
      formatHints[format.value as MathCopyFormat];
  };
  let picking = false;
  let sources: string[] = [];
  let drafts: string[] = [];
  let active = 0;
  let previewTimer: ReturnType<typeof setTimeout> | undefined;
  const rowName = (index: number) =>
    index === 0 ? "Entire formula" : `Equation ${index}`;
  const highlight = document.createElement("div");
  highlight.style.cssText =
    "position:fixed;pointer-events:none;border:2px solid #0577c7;background:#0577c712;z-index:2147483646;display:none";
  shadow.append(highlight);

  function setStatus(message: string, success = false) {
    status.textContent = message;
    status.dataset.success = String(success);
  }
  function updateSelection() {
    const length = editor.selectionEnd - editor.selectionStart;
    copySelection.disabled = !editor.value
      .slice(editor.selectionStart, editor.selectionEnd)
      .trim();
    copyAll.disabled = !editor.value.trim();
    reset.disabled = editor.value === (sources[active] ?? "");
    query("#selection-count").textContent = length
      ? `${length} characters selected`
      : "No text selected";
  }
  function renderPreview() {
    clearTimeout(previewTimer);
    preview.render(query<HTMLElement>("#preview"), editor.value);
  }
  function activate(index: number) {
    drafts[active] = editor.value;
    active = index;
    editor.value = drafts[index] ?? "";
    editor.setSelectionRange(0, 0);
    rowsContainer
      .querySelectorAll("button")
      .forEach((button, i) =>
        button.setAttribute("aria-pressed", String(i === active))
      );
    query("#current-row").textContent = rowName(active);
    copyAll.textContent =
      active === 0 ? "Copy entire formula" : "Copy equation";
    updateSelection();
    renderPreview();
    setStatus("Ctrl/⌘ + Enter to copy.");
  }
  function onEditorChange() {
    drafts[active] = editor.value;
    updateSelection();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 250);
    setStatus("Preview updates as you edit. Changes only affect your copy.");
  }
  reset.onclick = () => {
    editor.value = sources[active] ?? "";
    drafts[active] = editor.value;
    updateSelection();
    renderPreview();
    setStatus("Original source restored for this equation.");
  };
  function stopPicking() {
    picking = false;
    highlight.style.display = "none";
    picker.textContent = "Copy math";
  }
  picker.onclick = () => {
    if (picking) stopPicking();
    else {
      picking = true;
      picker.textContent = "Click a formula · Esc to cancel";
    }
  };
  function hover(event: MouseEvent) {
    if (!picking) return;
    const target =
      event.target instanceof Element
        ? event.target.closest(MATH_SELECTOR)
        : null;
    if (!target) {
      highlight.style.display = "none";
      return;
    }
    const rect = target.getBoundingClientRect();
    Object.assign(highlight.style, {
      display: "block",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }
  function choose(event: MouseEvent) {
    if (!picking || !(event.target instanceof Element) || event.target === host)
      return;
    const target = event.target.closest(MATH_SELECTOR);
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const source = readMathSource(target);
    stopPicking();
    rowsContainer.replaceChildren();
    sources = source ? [source] : [];
    if (source) {
      const rows = mathRows(source);
      if (rows.length > 1) sources.push(...rows);
    }
    drafts = [...sources];
    active = 0;
    editor.value = source ?? "";
    query("#equation-count").textContent =
      sources.length > 1 ? `${sources.length - 1} equations` : "Equation";
    sources.forEach((tex, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "row";
      button.setAttribute("aria-label", rowName(index));
      const label = document.createElement("span");
      label.className = "row-label";
      label.textContent = index === 0 ? "All equations" : `Equation ${index}`;
      const math = document.createElement("span");
      math.className = "row-math";
      math.setAttribute("aria-hidden", "true");
      button.append(label, math);
      button.onclick = () => activate(index);
      rowsContainer.append(button);
      if (index === 0)
        math.textContent =
          sources.length > 1 ? "Entire formula" : "Single formula";
      else preview.render(math, tex.split("=")[0].trim(), false);
    });
    activate(0);
    if (!source)
      setStatus(
        "Original LaTeX is unavailable for this formula. Rendered SVG/MathML is not copied as LaTeX."
      );
    dialog.showModal();
    editor.measure();
    query<HTMLButtonElement>("#close").focus();
  }
  query<HTMLButtonElement>("#close").onclick = () => dialog.close();
  dialog.addEventListener("close", () => picker.focus());
  async function copy(selection: boolean) {
    const value = selection
      ? editor.value.slice(editor.selectionStart, editor.selectionEnd)
      : editor.value;
    if (!value.trim()) {
      setStatus(
        selection
          ? "Select some LaTeX in the editor first."
          : "No LaTeX to copy."
      );
      return;
    }
    const selectedFormat = format.value as MathCopyFormat;
    const output = formatMathCopy(value, selectedFormat);
    try {
      await navigator.clipboard.writeText(output);
      setStatus(
        `${selection ? "Selection" : rowName(active)} copied. ${formatHints[selectedFormat]}`.trim(),
        true
      );
    } catch {
      editor.value = output;
      drafts[active] = output;
      editor.focus();
      editor.select();
      updateSelection();
      renderPreview();
      setStatus(
        "Clipboard access was denied. The output is selected: press Ctrl+C or ⌘C to copy."
      );
    }
  }
  copySelection.onclick = () => void copy(true);
  copyAll.onclick = () => void copy(false);
  dialog.addEventListener("keydown", (event) => {
    if (
      !event.defaultPrevented &&
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      void copy(editor.selectionEnd > editor.selectionStart);
    }
  });
  function keydown(event: KeyboardEvent) {
    if (event.key === "Escape" && picking) {
      stopPicking();
      event.preventDefault();
    }
  }
  document.addEventListener("mousemove", hover);
  document.addEventListener("click", choose, true);
  document.addEventListener("keydown", keydown);
  return () => {
    clearTimeout(previewTimer);
    preview.dispose();
    editor.destroy();
    document.removeEventListener("mousemove", hover);
    document.removeEventListener("click", choose, true);
    document.removeEventListener("keydown", keydown);
    host.remove();
  };
}
