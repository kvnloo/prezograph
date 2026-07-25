#!/usr/bin/env node

import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const realRoot = await realpath(root);
const port = Number(process.env.PREZOGRAPH_PORT || process.argv[2] || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const decoded = decodeURIComponent(url.pathname);
    const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    const candidate = path.resolve(root, relative);
    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    let resolved = await realpath(candidate);
    if (resolved !== realRoot && !resolved.startsWith(`${realRoot}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    let info = await stat(resolved);
    if (info.isDirectory()) {
      resolved = await realpath(path.join(resolved, "index.html"));
      if (!resolved.startsWith(`${realRoot}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      info = await stat(resolved);
    }
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": types[path.extname(resolved)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(resolved).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Prezograph running at http://127.0.0.1:${port}`);
});
