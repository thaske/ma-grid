import type { Activity } from "./types";

type TaskTimes = Pick<Activity, "id" | "started" | "completed">;
type LoadTaskTimes = (ids: number[]) => Promise<TaskTimes[]>;

// The API labels wall-clock local timestamps with Z; see api.ts.
export function taskElapsedMs(task: Pick<TaskTimes, "started" | "completed">) {
  const local = (value: string) => value.replace(/Z$/, "");
  const elapsed =
    Date.parse(local(task.completed)) - Date.parse(local(task.started));
  return Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null;
}

export function formatTaskElapsed(ms: number) {
  const minutes = Math.floor(ms / 60000);
  return minutes < 60
    ? `${minutes}m ${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}s`
    : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** Decorate completed tasks currently rendered in the dashboard feed. */
export function mountTaskTimes(
  loadTasks: LoadTaskTimes,
  root: ParentNode = document
) {
  const container = root.querySelector("#completedTasks");
  if (!container) return () => {};
  const feed = container;

  const tasks = new Map<number, TaskTimes>();
  const requested = new Set<number>();
  let busy = false;
  let scheduled = false;
  let disposed = false;

  const rows = () =>
    [
      ...feed.querySelectorAll<HTMLElement>(".taskCompleted[id^='task-']"),
    ].filter((row) => /^task-\d+$/.test(row.id));

  function decorate() {
    let heading: Element | null = null;
    const dayTotals = new Map<
      Element,
      { total: number; count: number; missing: boolean }
    >();

    // Tasks are siblings of their date heading, including when older days load on scroll.
    for (const child of feed.children) {
      if (child.classList.contains("completedTasksDate")) {
        heading = child;
        dayTotals.set(child, { total: 0, count: 0, missing: false });
        continue;
      }
      if (
        !child.classList.contains("taskCompleted") ||
        !/^task-\d+$/.test(child.id)
      )
        continue;

      const task = tasks.get(Number(child.id.slice(5)));
      const time = task && taskElapsedMs(task);
      const day = heading && dayTotals.get(heading);
      if (day) {
        day.count++;
        if (time === null || time === undefined) day.missing = true;
        else day.total += time;
      }
      if (time === null || time === undefined) continue;
      const label = child.querySelector(".taskTimeCompleted");
      if (!label || child.querySelector(".ma-grid-task-time")) continue;
      const badge = document.createElement("span");
      badge.className = "ma-grid-task-time";
      badge.textContent = ` · ${formatTaskElapsed(time)} elapsed`;
      badge.title =
        "Elapsed wall-clock time from task start to completion (includes breaks)";
      label.append(badge);
    }

    for (const [dateHeading, day] of dayTotals) {
      let badge = dateHeading.querySelector<HTMLElement>(".ma-grid-day-time");
      if (!day.count || day.missing) {
        badge?.remove(); // Never show a partial day's total while tasks are loading.
        continue;
      }
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "ma-grid-day-time";
        badge.style.marginLeft = "8px";
        badge.title =
          "Sum of elapsed times for completed tasks shown in this date section (includes breaks)";
        dateHeading.append(badge);
      }
      badge.textContent = `· ${formatTaskElapsed(day.total)} elapsed`;
    }
  }

  async function update() {
    if (busy || disposed) return;
    const missing = rows()
      .map((row) => Number(row.id.slice(5)))
      .filter((id) => !requested.has(id));
    if (!missing.length) return;
    for (const id of missing) requested.add(id);
    busy = true;
    try {
      // Both entrypoints obtain this from the calendar's shared activity fetch.
      const found = await loadTasks(missing);
      if (disposed) return;
      for (const task of found) tasks.set(task.id, task);
      // A task may not be available yet. Retry unresolved IDs on a later feed update.
      for (const id of missing) {
        if (!tasks.has(id)) requested.delete(id);
      }
      decorate();
    } catch (error) {
      for (const id of missing) requested.delete(id); // allow retry on next feed update
      console.warn("Unable to load task times", error);
    } finally {
      busy = false;
      if (scheduled) {
        scheduled = false;
        queueMicrotask(update);
      }
    }
  }

  const observer = new MutationObserver((mutations) => {
    const addedTask = mutations.some((mutation) =>
      [...mutation.addedNodes].some((node) => {
        if (node.nodeType !== 1) return false;
        const element = node as Element;
        return (
          element.matches(".taskCompleted[id^='task-']") ||
          !!element.querySelector(".taskCompleted[id^='task-']")
        );
      })
    );
    if (!addedTask) return;
    if (busy) {
      scheduled = true;
    } else if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        decorate();
        void update();
      });
    }
  });
  observer.observe(feed, { childList: true, subtree: true });
  void update();
  return () => {
    disposed = true;
    observer.disconnect();
    feed
      .querySelectorAll(".ma-grid-task-time, .ma-grid-day-time")
      .forEach((badge) => badge.remove());
  };
}
