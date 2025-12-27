import { join } from "path";
import { PORT, PUBLIC_DIR } from "./constants";
import { paginateTasks, parseCursorMs } from "./lib/pagination";
import { generateMockTasksData } from "./lib/tasks";

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": {
      GET: () => Response.redirect("/learn"),
    },
    "/learn": {
      GET: async () => {
        const html = await Bun.file(join(PUBLIC_DIR, "learn.html")).text();
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
    "/*": {
      GET: async (req) => {
        const url = new URL(req.url);
        let filePath = url.pathname.slice(1);

        const publicPath = join(PUBLIC_DIR, filePath);
        const publicFile = Bun.file(publicPath);

        if (await publicFile.exists()) {
          return new Response(publicFile);
        }

        return new Response("Not Found", { status: 404 });
      },
    },
  },
  development: {
    hmr: false,
  },
});

console.log(`Mock server running at http://localhost:${PORT}`);

export { PORT };
