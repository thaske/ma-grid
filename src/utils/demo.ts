import type { CalendarData, DailyXP } from "@/types";

export function enhanceCalendarForDemo(data: CalendarData) {
  const allDays: DailyXP[] = [];
  const numWeeks = data.grid.length > 0 ? data.grid[0].length : 0;

  for (let col = 0; col < numWeeks; col++) {
    for (let row = 0; row < 7; row++) {
      if (data.grid[row] && data.grid[row][col]) {
        allDays.push(data.grid[row][col]);
      }
    }
  }

  let inActiveStreak = false;
  let daysInCurrentPhase = 0;
  let streakLength = 0;
  let breakLength = 0;

  const enhancedDays = allDays.map((day) => {
    const isWeekend = day.weekday === 0 || day.weekday === 6;

    if (day.xp > 0) {
      inActiveStreak = true;
      daysInCurrentPhase = 0;
      const boost = isWeekend ? 1.2 : 1.5;
      const variance = Math.random() * 8;
      return {
        date: day.date,
        weekday: day.weekday,
        xp: Math.min(Math.round(day.xp * boost + variance), 50),
      };
    }

    if (inActiveStreak) {
      daysInCurrentPhase++;

      if (daysInCurrentPhase === 1) {
        streakLength = Math.floor(Math.random() * 6) + 2;
      }

      if (daysInCurrentPhase >= streakLength) {
        inActiveStreak = false;
        daysInCurrentPhase = 0;
        breakLength = Math.floor(Math.random() * 17) + 5;
        return { date: day.date, weekday: day.weekday, xp: 0 };
      }

      const activityChance = isWeekend ? 0.3 : 0.75;

      if (Math.random() < activityChance) {
        const xpRange = isWeekend ? { min: 10, max: 28 } : { min: 18, max: 42 };

        return {
          date: day.date,
          weekday: day.weekday,
          xp:
            Math.floor(Math.random() * (xpRange.max - xpRange.min + 1)) +
            xpRange.min,
        };
      }

      return { date: day.date, weekday: day.weekday, xp: 0 };
    }

    daysInCurrentPhase++;

    if (daysInCurrentPhase >= breakLength) {
      if (Math.random() < 0.5) {
        inActiveStreak = true;
        daysInCurrentPhase = 0;
        streakLength = Math.floor(Math.random() * 6) + 2;

        const xpRange = isWeekend ? { min: 10, max: 28 } : { min: 18, max: 42 };

        return {
          date: day.date,
          weekday: day.weekday,
          xp:
            Math.floor(Math.random() * (xpRange.max - xpRange.min + 1)) +
            xpRange.min,
        };
      }

      breakLength = Math.floor(Math.random() * 17) + 5;
      daysInCurrentPhase = 0;
    }

    return { date: day.date, weekday: day.weekday, xp: 0 };
  });

  const streakDays = Math.floor(Math.random() * 5) + 3;
  for (let i = 1; i <= streakDays && i <= enhancedDays.length; i++) {
    const dayIndex = enhancedDays.length - i;
    const day = enhancedDays[dayIndex];
    const isWeekend = day.weekday === 0 || day.weekday === 6;

    if (day.xp === 0) {
      const xpRange = isWeekend ? { min: 10, max: 25 } : { min: 20, max: 40 };
      enhancedDays[dayIndex] = {
        date: day.date,
        weekday: day.weekday,
        xp:
          Math.floor(Math.random() * (xpRange.max - xpRange.min + 1)) +
          xpRange.min,
      };
    }
  }

  const enhancedGrid: DailyXP[][] = Array.from({ length: 7 }, () => []);
  let dayIndex = 0;

  for (let col = 0; col < numWeeks; col++) {
    for (let row = 0; row < 7; row++) {
      if (dayIndex < enhancedDays.length) {
        enhancedGrid[row].push(enhancedDays[dayIndex]);
        dayIndex++;
      }
    }
  }

  const activeDays = enhancedDays.filter((d) => d.xp > 0);
  const totalActiveDays = activeDays.length;
  const totalDays = enhancedDays.length;
  const maxXP = Math.max(...enhancedDays.map((d) => d.xp), 0);
  const avgXP =
    totalActiveDays > 0
      ? Math.round(
          activeDays.reduce((sum, d) => sum + d.xp, 0) / totalActiveDays
        )
      : 0;

  let enhancedStreak = 0;
  for (let i = enhancedDays.length - 1; i >= 0; i--) {
    if (enhancedDays[i].xp > 0) {
      enhancedStreak++;
    } else {
      break;
    }
  }

  return {
    grid: enhancedGrid,
    stats: {
      activeDays: totalActiveDays,
      totalDays,
      streak: enhancedStreak,
      maxXP: Math.round(maxXP),
      avgXP,
    },
  };
}
