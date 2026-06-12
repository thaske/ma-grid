import type { Activity, DailyXP } from "@/utils/types";
import {
  formatDateKey,
  getLocalWeekdayIndex,
  parseCompletedDate,
  parseDateKey,
} from "./timezone";

type BuildCalendarDataOptions = {
  pageIndex?: number;
  weeksPerPage?: number;
};

const WEEKS_PER_GRID = 53;
const DAYS_PER_GRID = WEEKS_PER_GRID * 7;

export function buildCalendarData(
  activities: Activity[],
  options: BuildCalendarDataOptions = {}
) {
  const pageIndex = Math.max(0, Math.floor(options.pageIndex ?? 0));
  const weeksPerPage = Math.max(
    1,
    Math.min(WEEKS_PER_GRID, Math.floor(options.weeksPerPage ?? WEEKS_PER_GRID))
  );
  const daysPerPage = weeksPerPage * 7;
  if (activities.length === 0) {
    return {
      grid: [],
      stats: {
        activeDays: 0,
        totalDays: 0,
        streak: 0,
        longestStreak: 0,
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
        longestStreak: 0,
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
  const daysUntilSaturday = (6 - endDate.getDay() + 7) % 7;
  const latestAlignedEndDate = new Date(endDate);
  latestAlignedEndDate.setDate(
    latestAlignedEndDate.getDate() + daysUntilSaturday
  );

  const alignedEndDate = new Date(latestAlignedEndDate);
  alignedEndDate.setDate(alignedEndDate.getDate() - pageIndex * daysPerPage);

  const alignedStartDate = new Date(alignedEndDate);
  alignedStartDate.setDate(alignedStartDate.getDate() - (DAYS_PER_GRID - 1));

  const visibleStartDate = new Date(alignedEndDate);
  visibleStartDate.setDate(visibleStartDate.getDate() - (daysPerPage - 1));

  const statsAlignedStartDate = new Date(latestAlignedEndDate);
  statsAlignedStartDate.setDate(
    statsAlignedStartDate.getDate() - (DAYS_PER_GRID - 1)
  );

  const buildGrid = (startDate: Date, endDate: Date) => {
    const result: DailyXP[][] = Array.from({ length: 7 }, () => []);
    const currentDate = new Date(startDate);
    let weekIndex = 0;

    while (currentDate <= endDate && weekIndex < WEEKS_PER_GRID) {
      for (let day = 0; day < 7; day++) {
        const dateKey = formatDateKey(currentDate);
        const dayData = dailyMap.get(dateKey);

        result[day].push(
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

    return result;
  };

  const grid = buildGrid(alignedStartDate, alignedEndDate);
  const statsGrid =
    pageIndex === 0
      ? grid
      : buildGrid(statsAlignedStartDate, latestAlignedEndDate);
  const allDays = statsGrid.flat();
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

  let currentStreakStart: Date | null = null;
  let currentStreakEnd: Date | null = null;
  if (streak > 0) {
    currentStreakEnd = new Date(checkDate);
    currentStreakEnd.setDate(currentStreakEnd.getDate() + 1);
    currentStreakStart = new Date(currentStreakEnd);
    currentStreakStart.setDate(currentStreakStart.getDate() - (streak - 1));
  }

  let longestStreak = 0;
  let longestExcludingCurrent = 0;
  let runningStreak = 0;
  let runningIncludesCurrent = false;
  const currentStartTime = currentStreakStart?.getTime() ?? null;
  const currentEndTime = currentStreakEnd?.getTime() ?? null;

  const scanDate = new Date(statsAlignedStartDate);
  while (scanDate <= latestAlignedEndDate) {
    const dateKey = formatDateKey(scanDate);
    const dayData = dailyMap.get(dateKey);
    const hasXp = !!dayData && dayData.xp > 0;
    const time = scanDate.getTime();
    const isCurrentDate =
      currentStartTime !== null &&
      currentEndTime !== null &&
      time >= currentStartTime &&
      time <= currentEndTime;

    if (hasXp) {
      runningStreak++;
      runningIncludesCurrent = runningIncludesCurrent || isCurrentDate;
    } else if (runningStreak > 0) {
      longestStreak = Math.max(longestStreak, runningStreak);
      if (!runningIncludesCurrent) {
        longestExcludingCurrent = Math.max(
          longestExcludingCurrent,
          runningStreak
        );
      }
      runningStreak = 0;
      runningIncludesCurrent = false;
    }

    scanDate.setDate(scanDate.getDate() + 1);
  }

  if (runningStreak > 0) {
    longestStreak = Math.max(longestStreak, runningStreak);
    if (!runningIncludesCurrent) {
      longestExcludingCurrent = Math.max(
        longestExcludingCurrent,
        runningStreak
      );
    }
  }

  const longestStreakToShow =
    streak > 0 && longestStreak === streak
      ? longestExcludingCurrent
      : longestStreak;

  const pageStartTime = visibleStartDate.getTime();

  return {
    grid,
    stats: {
      activeDays: totalActiveDays,
      totalDays,
      streak,
      longestStreak: longestStreakToShow,
      maxXP,
      avgXP,
    },
    page: {
      index: pageIndex,
      hasPrevious: Array.from(dailyMap.keys()).some(
        (dateKey) => parseDateKey(dateKey).getTime() < pageStartTime
      ),
      hasNext: pageIndex > 0,
      startDate: formatDateKey(alignedStartDate),
      endDate: formatDateKey(alignedEndDate),
    },
  };
}
