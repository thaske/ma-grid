import { expect, it } from "bun:test";
import { Window } from "happy-dom";
import { createMathPreview } from "../src/utils/mathPreview";

it("serializes previews, skips stale work, and handles renderer errors", async () => {
  const window = new Window();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    value: window.document,
    configurable: true,
  });
  const host = window.document.createElement("div");
  window.document.body.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const target = window.document.createElement("div");
  shadow.append(target);
  const renderer = createMathPreview(shadow as unknown as ShadowRoot);
  const renderTarget = target as unknown as HTMLElement;
  const calls: string[] = [];
  let concurrent = 0;
  let maxConcurrent = 0;
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
  try {
    renderer.render(renderTarget, "x");
    expect(target.textContent).toContain("Preview unavailable");
    const style = window.document.createElement("style");
    style.id = "MJX-CHTML-styles";
    style.textContent = "mjx-math { color: inherit; }";
    window.document.head.append(style);
    Object.assign(window, {
      MathJax: {
        tex2chtmlPromise: async (tex: string) => {
          concurrent++;
          maxConcurrent = Math.max(concurrent, maxConcurrent);
          calls.push(tex);
          await Promise.resolve();
          concurrent--;
          if (tex === "bad") throw new Error("Invalid TeX");
          const result = window.document.createElement("span");
          result.textContent = tex;
          return result;
        },
      },
    });
    renderer.render(renderTarget, "old");
    renderer.render(renderTarget, "new");
    await settle();
    expect(calls).toEqual(["new"]);
    expect(target.textContent).toBe("new");
    expect(shadow.querySelector("style")!.textContent).toBe(style.textContent);
    renderer.render(renderTarget, "bad");
    await settle();
    expect(target.textContent).toContain("Preview unavailable");
    renderer.render(renderTarget, "recovered");
    await settle();
    expect(target.textContent).toBe("recovered");
    expect(maxConcurrent).toBe(1);
    renderer.render(renderTarget, "cancelled");
    renderer.dispose();
    await settle();
    expect(calls).not.toContain("cancelled");
  } finally {
    renderer.dispose();
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else Reflect.deleteProperty(globalThis, "document");
    window.happyDOM.abort();
  }
});
