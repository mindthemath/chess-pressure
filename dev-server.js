// Lightweight static dev server for chess-pressure.
// Serves src/chess_pressure/static/ at the root, matching the production
// static-web-server layout. Files are read fresh per request, so editing a
// JS/CSS/HTML file and refreshing the browser picks up changes immediately.
//
//   bun run dev-server.js          # serves http://0.0.0.0:8888
//   PORT=9000 bun run dev-server.js

const ROOT = new URL("./src/chess_pressure/static/", import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8888);
const PWA = process.env.ENABLE_CHESS_PWA === "1"; // mirror the Docker build flag

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    let pathname = decodeURIComponent(new URL(req.url).pathname);
    if (pathname === "/" || pathname === "") pathname = "/index.html";
    // Strip leading slashes and neutralize any ".." path traversal.
    const rel = pathname.replace(/^\/+/, "").replace(/\.\.(\/|\\|$)/g, "");
    const file = Bun.file(ROOT + rel);
    if (!(await file.exists())) return new Response("Not found", { status: 404 });

    const headers = { "Cache-Control": "no-cache" };
    // Flip the PWA flag in index.html on the fly so `ENABLE_CHESS_PWA=1 make dev`
    // can exercise the service worker without editing source.
    if (PWA && rel === "index.html") {
      const html = (await file.text()).replace("window.CHESS_PWA = false", "window.CHESS_PWA = true");
      return new Response(html, { headers: { ...headers, "Content-Type": "text/html;charset=utf-8" } });
    }
    return new Response(file, { headers });
  },
});

console.log(
  `chess-pressure dev server → http://0.0.0.0:${PORT}  (serving ${ROOT})  PWA=${PWA ? "on" : "off"}`,
);
