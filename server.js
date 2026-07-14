const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4185);
const MAX_BODY_SIZE = 25 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function send(res, status, body, type = "text/plain; charset=utf-8"){
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendJson(res, status, value){
  send(res, status, JSON.stringify(value), "application/json; charset=utf-8");
}

function readRequestJson(req){
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if(size > MAX_BODY_SIZE){
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function scenarioJsText(scenario){
  return "window.FARM_VILLAGE_SCENARIO = " + JSON.stringify(scenario, null, 2) + ";\n";
}

function writeTextAtomic(filePath, text){
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = filePath + ".tmp";
  fs.writeFileSync(tempPath, text, "utf8");
  fs.renameSync(tempPath, filePath);
}

function writeScenarioFiles(scenario){
  if(!scenario || typeof scenario !== "object" || !scenario.nodes){
    throw new Error("Invalid scenario payload.");
  }
  const text = scenarioJsText(scenario);
  const mainPath = path.join(ROOT, "data", "scenario.js");
  writeTextAtomic(mainPath, text);

  return mainPath;
}

function safeStaticPath(urlPath){
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const resolved = path.resolve(ROOT, cleanPath);
  if(resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function serveStatic(req, res){
  const filePath = safeStaticPath(req.url || "/");
  if(!filePath) return send(res, 403, "Forbidden");

  let target = filePath;
  try {
    const stat = fs.existsSync(target) ? fs.statSync(target) : null;
    if(stat && stat.isDirectory()) target = path.join(target, "index.html");
    if(!fs.existsSync(target)) return send(res, 404, "Not found");

    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(target).pipe(res);
  } catch (error) {
    send(res, 500, error.message || "Server error");
  }
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;

  if(req.method === "GET" && pathname === "/api/save-status"){
    return sendJson(res, 200, { ok: true, root: ROOT });
  }

  if(req.method === "POST" && pathname === "/api/save-scenario"){
    try {
      const body = await readRequestJson(req);
      const savedPath = writeScenarioFiles(body.scenario);
      return sendJson(res, 200, { ok: true, path: savedPath, savedAt: new Date().toISOString() });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message || "Save failed." });
    }
  }

  if(req.method !== "GET" && req.method !== "HEAD"){
    return send(res, 405, "Method not allowed");
  }

  serveStatic(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`RedBound editor is running at http://127.0.0.1:${PORT}/`);
});
