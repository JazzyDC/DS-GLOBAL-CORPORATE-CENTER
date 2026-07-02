const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX_FILE = path.join(ROOT, "index.html");
const DATA_DIR = path.join(ROOT, "data");
const XML_FILES = [
  "settings.xml",
  "branding.xml",
  "videos.xml",
  "footer.xml",
  "directory.xml"
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function buildFallbackObject() {
  const lines = ["const FALLBACK_XML = {"];

  XML_FILES.forEach((fileName, index) => {
    const xmlPath = path.join(DATA_DIR, fileName);
    const xml = readText(xmlPath);
    const comma = index === XML_FILES.length - 1 ? "" : ",";
    lines.push(`  ${JSON.stringify(fileName)}: ${JSON.stringify(xml)}${comma}`);
  });

  lines.push("};");
  return lines.join("\n");
}

function main() {
  const html = readText(INDEX_FILE);
  const nextFallback = buildFallbackObject();
  const pattern = /const FALLBACK_XML = \{[\s\S]*?\n\};\n\nasync function loadXMLText/;

  if (!pattern.test(html)) {
    throw new Error("Could not find FALLBACK_XML block in index.html.");
  }

  const updated = html.replace(pattern, `${nextFallback}\n\nasync function loadXMLText`);
  fs.writeFileSync(INDEX_FILE, updated, "utf8");
  console.log("Updated index.html embedded XML fallback from data/*.xml");
}

main();
