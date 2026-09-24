import { afterEach, describe, expect, it, mock } from "bun:test";
import { Window } from "happy-dom";
import {
  formatTaskElapsed,
  mountTaskTimes,
  taskElapsedMs,
} from "../src/utils/taskTimes";

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("task times", () => {
  afterEach(() => mock.restore());

  it("uses the site's local wall-clock timestamps instead of shifting by timezone", () => {
    expect(
      taskElapsedMs({
        started: "2026-09-23T21:17:34.000Z",
        completed: "2026-09-23T21:26:42.000Z",
      })
    ).toBe(548000);
    expect(formatTaskElapsed(548000)).toBe("9m 08s");
    expect(taskElapsedMs({ started: "bad", completed: "bad" })).toBeNull();
  });

  it("adds a duration only to rendered completed tasks, including newly appended reviews", async () => {
    const window = new Window({ url: "https://www.mathacademy.com/learn" });
    const oldDocument = globalThis.document;
    const oldObserver = globalThis.MutationObserver;
    globalThis.document = window.document as unknown as Document;
    let notifyAdded: (node: Node) => void = () => {};
    globalThis.MutationObserver = class {
      constructor(callback: MutationCallback) {
        notifyAdded = (node) =>
          callback(
            [
              {
                addedNodes: [node] as unknown as NodeList,
              } as MutationRecord,
            ],
            this as unknown as MutationObserver
          );
      }
      observe() {}
      disconnect() {}
    } as unknown as typeof MutationObserver;
    window.document.body.innerHTML = `<div id="completedTasks">
      <div class="completedTasksDate">Today</div>
      <div id="task-1" class="taskCompleted"><div class="taskTimeCompleted">Completed @ 9:26 PM</div></div>
    </div><div id="task-999" class="taskCompleted"></div>`;
    const loadTasks = mock(async (_ids: number[]) => [
      {
        id: 1,
        started: "2026-09-23T21:17:34.000Z",
        completed: "2026-09-23T21:26:42.000Z",
      },
      {
        id: 2,
        started: "2026-09-23T20:00:00.000Z",
        completed: "2026-09-23T20:12:00.000Z",
      },
      {
        id: 3,
        started: "2026-09-22T15:00:00.000Z",
        completed: "2026-09-22T15:30:00.000Z",
      },
    ]);
    let cleanup = () => {};
    try {
      cleanup = mountTaskTimes(
        loadTasks,
        window.document as unknown as Document
      );
      await tick();
      expect(
        window.document.querySelector("#task-1 .taskTimeCompleted")?.textContent
      ).toBe("Completed @ 9:26 PM · 9m 08s elapsed");
      expect(
        window.document.querySelector("#task-999 .ma-grid-task-time")
      ).toBeNull();
      expect(
        window.document.querySelector(".ma-grid-day-time")?.textContent
      ).toBe("· 9m 08s elapsed");
      const second = window.document.createElement("div");
      second.id = "task-2";
      second.className = "taskCompleted";
      second.innerHTML = `<div class="taskTimeCompleted">Completed @ 8:12 PM</div>`;
      window.document.querySelector("#completedTasks")?.append(second);
      notifyAdded(second as unknown as Node);
      await tick();
      expect(
        window.document.querySelector("#task-2 .ma-grid-task-time")?.textContent
      ).toBe(" · 12m 00s elapsed");
      expect(
        window.document.querySelector(".ma-grid-day-time")?.textContent
      ).toBe("· 21m 08s elapsed");
      const date = window.document.createElement("div");
      date.className = "completedTasksDate";
      date.textContent = "Tue, Sep 22nd, 2026";
      const third = window.document.createElement("div");
      third.id = "task-3";
      third.className = "taskCompleted";
      third.innerHTML = `<div class="taskTimeCompleted">Completed @ 3:30 PM</div>`;
      window.document.querySelector("#completedTasks")?.append(date, third);
      notifyAdded(third as unknown as Node);
      await tick();
      expect(
        [...window.document.querySelectorAll(".ma-grid-day-time")].map(
          (badge) => badge.textContent
        )
      ).toEqual(["· 21m 08s elapsed", "· 30m 00s elapsed"]);
      expect(loadTasks.mock.calls.map(([ids]) => ids)).toEqual([[1], [2], [3]]);
      cleanup();
      expect(window.document.querySelector(".ma-grid-task-time")).toBeNull();
      expect(window.document.querySelector(".ma-grid-day-time")).toBeNull();
    } finally {
      cleanup();
      globalThis.document = oldDocument;
      globalThis.MutationObserver = oldObserver;
      await window.happyDOM.close();
    }
  });
});
