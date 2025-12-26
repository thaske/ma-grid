import { join } from "path";

const MOCK_DATA_DIR = import.meta.dir;
const PORT = 3456;
const TASKS_PAGE_SIZE = 30;
const MOCK_TASKS_ANCHOR_MS = Date.now();
const MOCK_TASKS_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;
const COURSE_NAME = "Mathematical Foundations II";
const COURSE_ID = 111;

type MockTask = {
  id: number;
  completed: string;
  started: string;
  [key: string]: unknown;
};

const formatTimeUtc = (date: Date) => {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDateUtc = (date: Date) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getUTCDate();
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? "st"
      : day % 10 === 2 && day % 100 !== 12
        ? "nd"
        : day % 10 === 3 && day % 100 !== 13
          ? "rd"
          : "th";
  return `${dayNames[date.getUTCDay()]}, ${monthNames[date.getUTCMonth()]} ${day}${suffix}, ${date.getUTCFullYear()}`;
};

const createSeededRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const buildMockTasks = (): MockTask[] => {
  const anchor = new Date(MOCK_TASKS_ANCHOR_MS);
  const anchorStart = Date.UTC(
    anchor.getUTCFullYear(),
    anchor.getUTCMonth(),
    anchor.getUTCDate()
  );
  const rng = createSeededRng(Math.floor(anchorStart / DAY_MS));

  const reviewTopics = [
    "Calculus Fundamentals",
    "Algebra Review",
    "Trigonometry Basics",
    "Linear Functions",
    "Quadratic Equations",
    "Polynomial Functions",
    "Exponential Growth",
    "Functions and Graphs",
    "Systems of Equations",
    "Logarithms",
    "Sequences and Series",
    "Limits and Continuity",
    "Derivatives Basics",
    "Integrals Basics",
    "Vectors and Matrices",
    "Probability Foundations",
    "Statistics Intro",
    "Complex Numbers",
    "Polar Coordinates",
    "Conic Sections",
    "Differential Equations",
    "Series Convergence",
    "Matrix Determinants",
  ];

  const timeSlots = [
    { hour: 9, minute: 20, duration: 15 },
    { hour: 10, minute: 45, duration: 20 },
    { hour: 12, minute: 5, duration: 15 },
    { hour: 13, minute: 30, duration: 20 },
    { hour: 15, minute: 10, duration: 15 },
    { hour: 16, minute: 40, duration: 20 },
  ];

  const tasks: MockTask[] = [];
  const activeDayKeys = new Set<string>();
  let nextId = 1001;
  let nextTopicId = 100;
  let nextTestId = 280515;
  let nextQuizNumber = 10;
  let taskIndex = 0;

  const addTaskForSlot = (day: Date, slot: (typeof timeSlots)[number]) => {
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
            name: reviewTopics[taskIndex % reviewTopics.length],
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
      let slotIndex = randomInt(rng, 0, timeSlots.length - 1);
      while (slotIndexes.has(slotIndex)) {
        slotIndex = (slotIndex + 1) % timeSlots.length;
      }
      slotIndexes.add(slotIndex);
      addTaskForSlot(day, timeSlots[slotIndex]);
    }
  }

  for (let offset = 0; offset < 4; offset++) {
    const dayMs = anchorStart - offset * DAY_MS;
    const dayKey = new Date(dayMs).toISOString().slice(0, 10);
    if (activeDayKeys.has(dayKey)) continue;

    const slot = timeSlots[randomInt(rng, 0, timeSlots.length - 1)];
    addTaskForSlot(new Date(dayMs), slot);
  }

  return tasks;
};

let cachedTasks: MockTask[] | null = null;

// Generate mock tasks data
const generateMockTasksData = async () => {
  try {
    if (!cachedTasks) {
      cachedTasks = buildMockTasks();
    }
    return cachedTasks;
  } catch (error) {
    console.error("Failed to generate mock tasks:", error);
    // Fallback mock data if generation fails
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

const parseCursorMs = (raw: string | undefined) => {
  if (!raw) return Date.now();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const parsed = Date.parse(decoded);
  return Number.isFinite(parsed) ? parsed : Date.now();
};

const paginateTasks = (tasks: MockTask[], cursorMs: number) => {
  if (tasks.length === 0) return [];

  const sorted = [...tasks].sort((a, b) => {
    const ta = Date.parse(a.completed);
    const tb = Date.parse(b.completed);
    return (
      (Number.isFinite(tb) ? tb : -Infinity) -
      (Number.isFinite(ta) ? ta : -Infinity)
    );
  });

  const minCompletedMs = Math.min(
    ...sorted.map((task) => Date.parse(task.completed)).filter(Number.isFinite)
  );

  const lastPageStart =
    sorted.length === 0
      ? 0
      : Math.floor((sorted.length - 1) / TASKS_PAGE_SIZE) * TASKS_PAGE_SIZE;
  const lastPage = sorted.slice(lastPageStart);

  if (cursorMs <= minCompletedMs) {
    return lastPage;
  }

  const page = sorted.filter((task) => {
    const completedMs = Date.parse(task.completed);
    return Number.isFinite(completedMs) && completedMs <= cursorMs;
  });

  return page.slice(0, TASKS_PAGE_SIZE);
};

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": {
      GET: () => Response.redirect("/learn"),
    },
    "/learn": {
      GET: async () => {
        const html = await Bun.file(join(MOCK_DATA_DIR, "learn.html")).text();
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      },
    },
    "/api/previous-tasks/:date": {
      GET: async (req) => {
        const url = new URL(req.url);
        const rawCursor = url.pathname.split("/api/previous-tasks/")[1];
        const cursorMs = parseCursorMs(rawCursor);
        const tasks = await generateMockTasksData();
        const page = paginateTasks(tasks, cursorMs);
        return Response.json(page);
      },
    },
    // Serve static assets
    "/*": {
      GET: async (req) => {
        const url = new URL(req.url);
        let filePath = url.pathname.slice(1); // Remove leading slash

        // Try to serve the file from the mock data directory.
        const mockPath = join(MOCK_DATA_DIR, filePath);
        const mockFile = Bun.file(mockPath);

        if (await mockFile.exists()) {
          return new Response(mockFile);
        }

        return new Response("Not Found", { status: 404 });
      },
    },
  },
  development: {
    hmr: false,
  },
});

console.log(`Mock Math Academy server running at http://localhost:${PORT}`);
console.log(`Navigate to http://localhost:${PORT}/learn to test`);

export { PORT };
