import type { Activity, DailyXP } from "@/utils/types";
import {
  formatDateKey,
  getLocalWeekdayIndex,
  parseCompletedDate,
  parseDateKey,
} from "./timezone";

export function buildCalendarData(activities: Activity[]) {
  if (activities.length === 0) {
    return {
      grid: [],
      stats: {
        activeDays: 0,
        totalDays: 0,
        streak: 0,
        maxXP: 0,
        avgXP: 0,
      },
    };
  }

  const dailyMap = new Map<string, DailyXP>();
  activities.forEach((activity) => {
    let dateKey: string | null = null;
    let dateForWeekday: Date | null = null;

    const completedDate = parseCompletedDate(activity.completed);
    if (!completedDate) return;
    dateKey = formatDateKey(completedDate);
    dateForWeekday = completedDate;

    if (!dailyMap.has(dateKey)) {
      const weekdaySource = dateForWeekday ?? parseDateKey(dateKey);
      dailyMap.set(dateKey, {
        date: dateKey,
        xp: 0,
        weekday: getLocalWeekdayIndex(weekdaySource),
      });
    }

    const dayData = dailyMap.get(dateKey)!;
    dayData.xp += activity.pointsAwarded;
  });

  if (dailyMap.size === 0) {
    return {
      grid: [],
      stats: {
        activeDays: 0,
        totalDays: 0,
        streak: 0,
        maxXP: 0,
        avgXP: 0,
      },
    };
  }

  const maxDate = new Date(
    Math.max(
      ...Array.from(dailyMap.keys()).map((d) => parseDateKey(d).getTime())
    )
  );
  const today = new Date();
  const todayKey = formatDateKey(today);
  const todayDate = parseDateKey(todayKey);
  const endDate = new Date(Math.max(maxDate.getTime(), todayDate.getTime()));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364); // 365 days inclusive

  const daysSinceSunday = (startDate.getDay() + 7) % 7;
  const alignedStartDate = new Date(startDate);
  alignedStartDate.setDate(alignedStartDate.getDate() - daysSinceSunday);

  const daysUntilSaturday = (6 - endDate.getDay() + 7) % 7;
  const alignedEndDate = new Date(endDate);
  alignedEndDate.setDate(alignedEndDate.getDate() + daysUntilSaturday);

  const grid: DailyXP[][] = Array.from({ length: 7 }, () => []);

  const currentDate = new Date(alignedStartDate);
  let weekIndex = 0;

  while (currentDate <= alignedEndDate && weekIndex < 53) {
    for (let day = 0; day < 7; day++) {
      const dateKey = formatDateKey(currentDate);
      const dayData = dailyMap.get(dateKey);

      grid[day].push(
        dayData || {
          date: dateKey,
          xp: 0,
          weekday: getLocalWeekdayIndex(currentDate),
        }
      );

      currentDate.setDate(currentDate.getDate() + 1);
    }
    weekIndex++;
  }

  const allDays = grid.flat();
  const activeDays = allDays.filter((d) => d.xp > 0);
  const totalActiveDays = activeDays.length;
  const totalDays = allDays.length;
  const maxXP = Math.max(...allDays.map((d) => d.xp), 0);
  const avgXP =
    totalActiveDays > 0
      ? Math.round(
          activeDays.reduce((sum, d) => sum + d.xp, 0) / totalActiveDays
        )
      : 0;

  let streak = 0;
  let checkDate = parseDateKey(todayKey);
  const todayData = dailyMap.get(todayKey);
  if (!todayData || todayData.xp === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateKey = formatDateKey(checkDate);
    const dayData = dailyMap.get(dateKey);

    if (dayData && dayData.xp > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    grid,
    stats: {
      activeDays: totalActiveDays,
      totalDays,
      streak,
      maxXP,
      avgXP,
    },
  };
}
