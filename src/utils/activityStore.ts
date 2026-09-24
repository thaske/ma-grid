import type { Activity } from "./types";

/** Share in-flight fetches without treating settled results as permanently fresh. */
export function createActivityStore(
  loadActivities: (origin: string) => Promise<Activity[]>
) {
  const cachedByOrigin = new Map<string, Activity[]>();
  const pendingByOrigin = new Map<string, Promise<Activity[]>>();

  function getActivities(origin: string, refresh = false): Promise<Activity[]> {
    const pending = pendingByOrigin.get(origin);
    if (pending) return pending;

    const cached = cachedByOrigin.get(origin);
    if (!refresh && cached) return Promise.resolve(cached);

    const request = loadActivities(origin)
      .then((activities) => {
        cachedByOrigin.set(origin, activities);
        return activities;
      })
      .finally(() => pendingByOrigin.delete(origin));
    pendingByOrigin.set(origin, request);
    return request;
  }

  async function loadTaskTimes(origin: string, ids: number[]) {
    let activities = await getActivities(origin);
    const newest = activities.reduce((max, task) => Math.max(max, task.id), 0);
    if (ids.some((id) => id > newest)) {
      activities = await getActivities(origin, true);
    }
    const wanted = new Set(ids);
    return activities.filter((task) => wanted.has(task.id));
  }

  return { getActivities, loadTaskTimes };
}
