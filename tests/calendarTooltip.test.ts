import { describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { Tooltip } from "../src/components/CalendarTooltip";

describe("calendar tooltip", () => {
  it("shows elapsed time next to XP when tasks were completed", async () => {
    const window = new Window();
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    globalThis.document = window.document as unknown as Document;
    globalThis.window = window as unknown as Window & typeof globalThis;
    try {
      const tooltip = Tooltip();
      tooltip.show(
        { date: "2026-09-23", xp: 42, weekday: 3, elapsedMs: 548000 },
        10,
        10
      );
      expect(
        tooltip.element.querySelector(".ma-grid__tooltip-xp")?.textContent
      ).toBe("42 XP · 9m 08s");
      tooltip.show({ date: "2026-09-22", xp: 0, weekday: 2 }, 10, 10);
      expect(
        tooltip.element.querySelector(".ma-grid__tooltip-xp")?.textContent
      ).toBe("No activity");
      const disabled = Tooltip(false);
      disabled.show(
        { date: "2026-09-23", xp: 42, weekday: 3, elapsedMs: 548000 },
        10,
        10
      );
      expect(
        disabled.element.querySelector(".ma-grid__tooltip-xp")?.textContent
      ).toBe("42 XP");
    } finally {
      globalThis.document = originalDocument;
      globalThis.window = originalWindow;
      await window.happyDOM.close();
    }
  });
});
