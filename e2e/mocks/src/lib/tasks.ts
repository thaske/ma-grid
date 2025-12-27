import {
  COURSE_ID,
  COURSE_NAME,
  DAY_MS,
  MOCK_TASKS_ANCHOR_MS,
  MOCK_TASKS_DAYS,
  REVIEW_TOPICS,
  TIME_SLOTS,
} from "../constants";
import { formatDateUtc, formatTimeUtc } from "./date";
import { createSeededRng, randomInt } from "./rng";

type MockTask = {
  id: number;
  completed: string;
  started: string;
  [key: string]: unknown;
};

export const buildMockTasks = () => {
  const anchor = new Date(MOCK_TASKS_ANCHOR_MS);
  const anchorStart = Date.UTC(
    anchor.getUTCFullYear(),
    anchor.getUTCMonth(),
    anchor.getUTCDate()
  );
  const rng = createSeededRng(Math.floor(anchorStart / DAY_MS));

  const tasks: MockTask[] = [];
  const activeDayKeys = new Set<string>();
  let nextId = 1001;
  let nextTopicId = 100;
  let nextTestId = 280515;
  let nextQuizNumber = 10;
  let taskIndex = 0;

  const addTaskForSlot = (day: Date, slot: (typeof TIME_SLOTS)[number]) => {
    const completed = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        slot.hour,
        slot.minute
      )
    );
    const started = new Date(completed.getTime() - slot.duration * 60 * 1000);
    const dayKey = completed.toISOString().slice(0, 10);
    activeDayKeys.add(dayKey);

    const isQuiz = taskIndex % 4 === 2;
    const points = isQuiz ? randomInt(rng, 15, 30) : randomInt(rng, 8, 22);
    const pointsAwarded = Math.max(
      0,
      points - randomInt(rng, 0, isQuiz ? 4 : 2)
    );

    tasks.push({
      id: nextId++,
      type: isQuiz ? "Quiz" : "Review",
      topicCourseId: isQuiz ? null : COURSE_ID,
      locked: isQuiz ? 0 : null,
      importance: isQuiz ? randomInt(rng, 3, 4) : randomInt(rng, 1, 2),
      reason: null,
      progress: 1,
      points,
      pointsAwarded,
      mp: null,
      mpAwarded: null,
      mpDecayRate: null,
      topic: isQuiz
        ? { id: null, name: null, course: { id: null, name: null } }
        : {
            id: nextTopicId++,
            name: REVIEW_TOPICS[taskIndex % REVIEW_TOPICS.length],
            prerequisites: [],
          },
      started: started.toISOString(),
      completed: completed.toISOString(),
      timeCompletedStr: formatTimeUtc(completed),
      dateCompletedStr: formatDateUtc(completed),
      test: isQuiz
        ? {
            id: nextTestId++,
            name: `Quiz ${nextQuizNumber++}`,
            timeLimit: randomInt(rng, 15, 25),
            questionCount: randomInt(rng, 6, 10),
            course: { id: COURSE_ID, name: COURSE_NAME },
          }
        : {
            id: null,
            name: null,
            timeLimit: null,
            questionCount: null,
            course: { id: COURSE_ID, name: COURSE_NAME },
          },
      progressStr: "100%",
    });

    taskIndex++;
  };

  let inActiveStreak = false;
  let daysInCurrentPhase = 0;
  let streakLength = 0;
  let breakLength = randomInt(rng, 2, 6);

  for (let offset = 0; offset < MOCK_TASKS_DAYS; offset++) {
    const dayMs = anchorStart - offset * DAY_MS;
    const day = new Date(dayMs);
    const weekday = day.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    let shouldCreate = false;

    if (inActiveStreak) {
      if (daysInCurrentPhase === 0) {
        streakLength = randomInt(rng, 4, 12);
      }
      const activityChance = isWeekend ? 0.6 : 0.9;
      shouldCreate = rng() < activityChance;
      daysInCurrentPhase++;
      if (daysInCurrentPhase >= streakLength) {
        inActiveStreak = false;
        daysInCurrentPhase = 0;
        breakLength = randomInt(rng, 2, 6);
      }
    } else {
      daysInCurrentPhase++;
      if (daysInCurrentPhase >= breakLength) {
        if (rng() < 0.8) {
          inActiveStreak = true;
          daysInCurrentPhase = 0;
          streakLength = randomInt(rng, 4, 12);
          const activityChance = isWeekend ? 0.6 : 0.9;
          shouldCreate = rng() < activityChance;
        } else {
          daysInCurrentPhase = 0;
          breakLength = randomInt(rng, 2, 6);
        }
      }
    }

    if (!shouldCreate) {
      continue;
    }

    const extraTaskChance = isWeekend ? 0.2 : 0.4;
    const tasksPerDay = rng() < extraTaskChance ? 2 : 1;
    const slotIndexes = new Set<number>();

    for (let i = 0; i < tasksPerDay; i++) {
      let slotIndex = randomInt(rng, 0, TIME_SLOTS.length - 1);
      while (slotIndexes.has(slotIndex)) {
        slotIndex = (slotIndex + 1) % TIME_SLOTS.length;
      }
      slotIndexes.add(slotIndex);
      addTaskForSlot(day, TIME_SLOTS[slotIndex]);
    }
  }

  for (let offset = 0; offset < 4; offset++) {
    const dayMs = anchorStart - offset * DAY_MS;
    const dayKey = new Date(dayMs).toISOString().slice(0, 10);
    if (activeDayKeys.has(dayKey)) continue;

    const slot = TIME_SLOTS[randomInt(rng, 0, TIME_SLOTS.length - 1)];
    addTaskForSlot(new Date(dayMs), slot);
  }

  return tasks;
};

let cachedTasks: MockTask[] | null = null;

export const generateMockTasksData = async () => {
  try {
    if (!cachedTasks) {
      cachedTasks = buildMockTasks();
    }
    return cachedTasks;
  } catch (error) {
    console.error("Failed to generate mock tasks:", error);
    const completed = new Date();
    return [
      {
        id: 1,
        type: "Review",
        started: new Date(completed.getTime() - 15 * 60 * 1000).toISOString(),
        completed: completed.toISOString(),
        timeCompletedStr: formatTimeUtc(completed),
        dateCompletedStr: formatDateUtc(completed),
        points: 10,
        pointsAwarded: 10,
      },
    ];
  }
};
