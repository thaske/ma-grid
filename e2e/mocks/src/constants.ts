import { join } from "path";

export const PUBLIC_DIR = join(import.meta.dir, "../public");
export const PORT = 3456;
export const TASKS_PAGE_SIZE = 30;
export const MOCK_TASKS_ANCHOR_MS = new Date("2025-12-28T12:00:00Z").getTime();
export const MOCK_TASKS_DAYS = 365;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const COURSE_NAME = "Mathematical Foundations II";
export const COURSE_ID = 111;

export const REVIEW_TOPICS = [
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

export const TIME_SLOTS = [
  { hour: 9, minute: 20, duration: 15 },
  { hour: 10, minute: 45, duration: 20 },
  { hour: 12, minute: 5, duration: 15 },
  { hour: 13, minute: 30, duration: 20 },
  { hour: 15, minute: 10, duration: 15 },
  { hour: 16, minute: 40, duration: 20 },
];
