const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = __dirname;
const SERVER_CONFIG = path.join(ROOT, "data", "server.xml");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4"
};

function xmlAttribute(xml, name) {
  const match = xml.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? match[1].trim() : "";
}

function loadServerConfig() {
  const xml = fs.readFileSync(SERVER_CONFIG, "utf8");
  const configuredPort = Number.parseInt(xmlAttribute(xml, "port"), 10);
  const configuredPage = xmlAttribute(xml, "defaultPage");

  if (!Number.isFinite(configuredPort)) {
    throw new Error(`${SERVER_CONFIG} must include a numeric port attribute.`);
  }

  if (!configuredPage) {
    throw new Error(`${SERVER_CONFIG} must include a defaultPage attribute.`);
  }

  return {
    port: configuredPort,
    defaultPage: configuredPage
  };
}

const serverConfig = loadServerConfig();

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relativePath = requestPath === "/"
    ? serverConfig.defaultPage
    : requestPath.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, relativePath);

  if (!filePath.startsWith(`${ROOT}${path.sep}`) && filePath !== ROOT) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*"
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

function startServer(port) {
  server.once("error", error => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Trying ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, "0.0.0.0", () => {
  console.log(`Dashboard running at http://localhost:${port}`);
  Object.values(os.networkInterfaces())
    .flat()
    .filter(details => details && details.family === "IPv4" && !details.internal)
    .forEach(details => {
      console.log(`Network kiosk URL: http://${details.address}:${port}`);
    });
});
}

startServer(serverConfig.port);
