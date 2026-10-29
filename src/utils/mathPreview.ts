import { ankiMath } from "./mathSource";

type PreviewMathJax = {
  tex2chtmlPromise?: (
    tex: string,
    options: { display: boolean }
  ) => Promise<HTMLElement>;
};

/** Reuse the page's renderer and fonts; never load a second MathJax runtime. */
export function createMathPreview(shadow: ShadowRoot) {
  let queue = Promise.resolve();
  let disposed = false;
  const versions = new WeakMap<HTMLElement, number>();
  const styles = document.createElement("style");
  shadow.append(styles);

  function render(target: HTMLElement, source: string, display = true) {
    const version = (versions.get(target) ?? 0) + 1;
    versions.set(target, version);
    const current = () => !disposed && versions.get(target) === version;
    const mathJax = (
      document.defaultView as (Window & { MathJax?: PreviewMathJax }) | null
    )?.MathJax;
    if (!source.trim()) {
      target.textContent = "No math to preview";
      return;
    }
    if (!mathJax?.tex2chtmlPromise) {
      target.textContent = display
        ? "Preview unavailable. You can still edit and copy the LaTeX below."
        : source;
      return;
    }
    target.textContent = display ? "Rendering preview…" : source;
    // MathJax maintains shared typesetting state. Serialize requests, and skip
    // stale requests when the user changes rows or edits faster than rendering.
    queue = queue.then(async () => {
      if (!current()) return;
      try {
        const tex = ankiMath(source).slice(2, -2).trim();
        const result = await mathJax.tex2chtmlPromise!(tex, { display });
        if (!current()) return;
        styles.textContent =
          document.getElementById("MJX-CHTML-styles")?.textContent ?? "";
        if (result.querySelector("mjx-merror, [data-mjx-error]")) {
          target.textContent =
            "This LaTeX could not be rendered. Check the source below before copying.";
        } else {
          target.replaceChildren(result);
        }
      } catch {
        if (current())
          target.textContent =
            "Preview unavailable for this LaTeX. You can still edit or copy it.";
      }
    });
  }
  return {
    render,
    dispose: () => {
      disposed = true;
      styles.remove();
    },
  };
}
