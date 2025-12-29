type LogFn = (...args: unknown[]) => void;

const isProd = import.meta.env.MODE === "production";
const noop: LogFn = () => undefined;

export const logger = {
  log: isProd ? noop : console.log.bind(console),
  warn: isProd ? noop : console.warn.bind(console),
  error: isProd ? noop : console.error.bind(console),
};
