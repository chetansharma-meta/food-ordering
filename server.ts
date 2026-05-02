// server.ts — Custom Next.js server with Socket.IO
// Run with: npx ts-node --project tsconfig.server.json server.ts
// Or: node server.js (after compiling)

const { createServer } = require("http");
const { setSocketServer } = require("./lib/socket");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const urlString = req.url || "/";
    const parsedUrl = new URL(urlString, `http://${req.headers.host}`);
    const nextUrl = {
      pathname: parsedUrl.pathname,
      query: Object.fromEntries(parsedUrl.searchParams),
    };
    handle(req, res, nextUrl);
  });

  const io = setSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
