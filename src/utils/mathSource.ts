type MathItem = {
  math: string;
  typesetRoot?: Node;
  start?: { node?: Node };
};
type MathWindow = Window & {
  MathJax?: { startup?: { document?: { math?: Iterable<MathItem> } } };
};

export const MATH_SELECTOR = ".mjpage, mjx-container, .MathJax_SVG, .MathJax";

/** Prefer the original TeX, including when MathJax has typeset an SVG title. */
export function readMathSource(element: Element): string | null {
  const root = element.closest(".mjpage") ?? element.closest(MATH_SELECTOR);
  if (!root) return null;
  const items = (root.ownerDocument.defaultView as MathWindow | null)?.MathJax
    ?.startup?.document?.math;
  if (items) {
    for (const item of items) {
      if (
        (item.typesetRoot && root.contains(item.typesetRoot)) ||
        (item.start?.node && root.contains(item.start.node))
      )
        return item.math.trim();
    }
  }
  const annotation = root.querySelector(
    'annotation[encoding="application/x-tex"]'
  );
  if (annotation?.textContent?.trim()) return annotation.textContent.trim();
  const title = root.querySelector("svg > title");
  // A typeset title's textContent is flattened MathML, not usable TeX.
  if (title && !title.children.length && title.textContent?.trim())
    return title.textContent.trim();
  const script = root.nextElementSibling;
  if (script?.matches('script[type^="math/tex"]'))
    return script.textContent?.trim() || null;
  return null;
}

/** Split only outer alignment rows, never rows inside a nested matrix. */
export function mathRows(source: string): string[] {
  const match = source
    .trim()
    .match(
      /^\\begin\{(align\*?|aligned|gather\*?|gathered)\}([\s\S]*)\\end\{\1\}$/
    );
  if (!match) return [source.trim()];
  const body = match[2];
  const rows: string[] = [];
  let row = "";
  let braces = 0;
  let environments = 0;
  for (let i = 0; i < body.length; ) {
    const rest = body.slice(i);
    const environment = rest.match(/^\\(begin|end)\{[^}]+\}/);
    if (environment) {
      environments += environment[1] === "begin" ? 1 : -1;
      row += environment[0];
      i += environment[0].length;
    } else if (rest.startsWith("\\\\") && braces === 0 && environments === 0) {
      if (row.trim()) rows.push(row.trim());
      row = "";
      i += 2;
      const spacing = body.slice(i).match(/^\s*\[[^\]]*\]/);
      if (spacing) i += spacing[0].length;
    } else if (body[i] === "\\") {
      row += body.slice(i, i + 2);
      i += 2;
    } else if (body[i] === "&" && braces === 0 && environments === 0) {
      const markers = rest.match(/^&+/)![0];
      row += markers.length > 1 && row.trim() ? "\\qquad " : " ";
      i += markers.length;
    } else {
      if (body[i] === "{") braces++;
      if (body[i] === "}") braces--;
      row += body[i];
      i++;
    }
  }
  if (row.trim()) rows.push(row.trim());
  return rows.length ? rows : [source.trim()];
}

export type MathCopyFormat = "latex" | "html" | "delimiters";

/** TeX for Anki's MathJax editor: no outer delimiters or stray row layout. */
export function ankiLatex(source: string): string {
  let tex = source.trim();
  if (
    (tex.startsWith("\\[") && tex.endsWith("\\]")) ||
    (tex.startsWith("\\(") && tex.endsWith("\\)"))
  )
    tex = tex.slice(2, -2).trim();
  // A selection may include a leading &, a trailing \\\\[10pt], or several
  // outer rows. Clean those without touching nested matrices or escaped &.
  if (!/^\\begin\{(?:align\*?|aligned|gather\*?|gathered)\}/.test(tex)) {
    const rows = mathRows(`\\begin{aligned}${tex}\\end{aligned}`);
    tex =
      rows.length > 1
        ? `\\begin{gathered}\n${rows.join(" \\\\\n")}\n\\end{gathered}`
        : rows[0];
  }
  // Anki supplies the math context; use inner, unnumbered environments.
  tex = tex
    .replace(/\\(begin|end)\{align\*?\}/g, "\\$1{aligned}")
    .replace(/\\(begin|end)\{gather\*?\}/g, "\\$1{gathered}");
  return tex;
}

export function ankiMath(source: string): string {
  return `\\[\n${ankiLatex(source)}\n\\]`;
}

export function formatMathCopy(source: string, format: MathCopyFormat): string {
  const tex = ankiLatex(source);
  if (format === "delimiters") return ankiMath(tex);
  if (format === "html") {
    const escaped = tex
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<anki-mathjax>${escaped}</anki-mathjax><br>`;
  }
  return tex;
}
