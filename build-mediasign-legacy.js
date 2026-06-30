const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");

const cssStart = html.indexOf("<style>");
const cssEnd = html.indexOf("</style>");
let css = html.slice(cssStart + "<style>".length, cssEnd);

const colors = {
  "--navy": "#2E318E",
  "--navy-light": "#2E318E",
  "--ink": "#0F2549",
  "--muted": "#6687b4",
  "--line": "#E4E9F2",
  "--bg": "#F4F7FC",
  "--white": "#FFFFFF",
  "--accent-cyan": "#22D3EE",
  "--blue": "#3B82F6",
  "--red": "#E5484D",
  "--red-soft": "#FDEDED",
  "--footer-navy": "#2E318E"
};

Object.keys(colors).forEach(key => {
  css = css.replace(new RegExp(`var\\(${key}\\)`, "g"), colors[key]);
});

css = css
  .replace(/:root\{[\s\S]*?\}\s*/, "")
  .replace(/background-image:\s*var\(--header-pattern-image\);/g, 'background-image: url("assets/images/Pattern DS Global Holdings-05.png");')
  .replace(/background-size:\s*var\(--header-pattern-size\);/g, "background-size: cover;")
  .replace(/background-position:\s*var\(--header-pattern-position\);/g, "background-position: center;")
  .replace(/background-image:\s*var\(--strip-image\);/g, 'background-image: url("assets/images/Pattern DS Global Holdings-04.png");')
  .replace(/background-size:\s*var\(--strip-art-size\);/g, "background-size: cover;")
  .replace(/background-position:\s*var\(--strip-art-position\);/g, "background-position: center;");

const bodyStart = html.indexOf("<body>");
const bodyEnd = html.indexOf("<script>");
let body = html.slice(bodyStart + "<body>".length, bodyEnd);

body = body
  .replace(
    /<main class="directory" id="directory">[\s\S]*?<\/main>/,
    `<main class="directory" id="directory">
    <div class="level-divider"><span>BUILDING DIRECTORY</span></div>
    <div class="directory-page" id="directoryPage"></div>
  </main>`
  )
  .replace(
    /<section class="info">[\s\S]*?<\/section>/,
    `<section class="info" id="info">
    <div class="info-col">
      <div class="info-head info-head--red">EMERGENCY HOTLINES</div>
      <div class="quick-dial"><span>Quick Dial</span><strong>122</strong></div>
      <div class="info-block"><span class="info-label">Fire Department</span><span class="info-value">(02) 8343-2222</span></div>
    </div>
    <div class="info-col">
      <div class="info-head info-head--blue">LAW &amp; SAFETY</div>
      <div class="info-block"><span class="info-label">Police Department</span><span class="info-value">(02) 8726-2624</span></div>
      <div class="info-block"><span class="info-label">Bureau of Fire Protection</span><span class="info-value">(02) 8726-2237</span></div>
    </div>
    <div class="info-col">
      <div class="info-head info-head--cyan">GENERAL INQUIRIES</div>
      <div class="info-block">
        <span class="info-value">+63 975 019 2080</span>
        <a class="info-link" href="mailto:inquiries.dsglobal@gmail.com">inquiries.dsglobal@gmail.com</a>
        <span class="info-sub">DS Global Corporate Center, Mindanao Ave Extension, Greater Lagro, Quezon City, Metro Manila, NCR, Philippines 1100</span>
      </div>
    </div>
  </section>`
  );

const legacyScript = `
(function () {
  var CANVAS_W = 1080;
  var CANVAS_H = 1920;
  var dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  var rows = [
    ["8F", "Elevator Lobby", "", "assets/images/floor-8.svg", "Level 8 floor image"],
    ["8F", "Common Hallway", "", "assets/images/floor-8.svg", "Level 8 floor image"],
    ["8F", "Fire Exits & Emergency", "", "assets/images/floor-8.svg", "Level 8 floor image"],
    ["9F", "The Top", "(Second Level)", "assets/images/floor-9.svg", "Level 9 floor image"],
    ["9F", "Events & Conference Center", "A/V Suite, Projectors, Mobile Stage, Executive Partitions", "assets/images/floor-9.svg", "Level 9 floor image"],
    ["10F", "Executive Offices", "Reception, Meeting Rooms, Private Offices", "assets/images/floor-10.svg", "Level 10 floor image"],
    ["10F", "Client Lounge", "Waiting Area, Pantry, Consultation Room", "assets/images/floor-10.svg", "Level 10 floor image"],
    ["10F", "Admin Services", "Document Processing and Building Support", "assets/images/floor-10.svg", "Level 10 floor image"],
    ["11F", "Training Hall", "Seminars, Workshops, Briefings", "assets/images/floor-11.svg", "Level 11 floor image"],
    ["11F", "Board Room", "Conference Table, Display System, Video Call Setup", "assets/images/floor-11.svg", "Level 11 floor image"],
    ["12F", "Operations Center", "Daily Coordination, Monitoring, Team Dispatch", "assets/images/floor-12.svg", "Level 12 floor image"],
    ["12F", "Accounting Office", "Billing, Collections, Finance Assistance", "assets/images/floor-12.svg", "Level 12 floor image"],
    ["12F", "Records Room", "Forms, Archives, Document Requests", "assets/images/floor-12.svg", "Level 12 floor image"],
    ["13F", "Sky Lounge", "VIP Holding Area and Private Events", "assets/images/floor-13.svg", "Level 13 floor image"],
    ["13F", "Creative Studio", "Content Room, Production Desk, Editing Suite", "assets/images/floor-13.svg", "Level 13 floor image"],
    ["14F", "Roof Deck Access", "Authorized Personnel Only", "assets/images/floor-14.svg", "Level 14 floor image"],
    ["14F", "Maintenance Office", "Facilities, Electrical, Housekeeping Support", "assets/images/floor-14.svg", "Level 14 floor image"],
    ["14F", "Security Post", "Monitoring and Building Assistance", "assets/images/floor-14.svg", "Level 14 floor image"]
  ];
  var page = 0;
  var rowsPerPage = 6;

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }

  function scaleToFit() {
    var screen = document.querySelector(".screen");
    if (!screen) return;
    var scaleX = window.innerWidth / CANVAS_W;
    var scaleY = window.innerHeight / CANVAS_H;
    if (window.innerHeight >= window.innerWidth) {
      screen.style.transform = "scale(" + scaleX + ", " + scaleY + ")";
    } else {
      screen.style.transform = "scale(" + Math.min(scaleX, scaleY) + ")";
    }
  }

  function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    document.getElementById("clockTime").innerHTML = String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
    document.getElementById("clockMeridiem").innerHTML = meridiem;
    document.getElementById("clockDay").innerHTML = dayNames[now.getDay()];
  }

  function renderDirectory() {
    var target = document.getElementById("directoryPage");
    if (!target) return;
    var start = page * rowsPerPage;
    var currentRows = rows.slice(start, start + rowsPerPage);
    var html = "";
    for (var i = 0; i < currentRows.length; i++) {
      var row = currentRows[i];
      html += '<div class="row">';
      html += '<div class="badge"><div class="badge-label">FLOOR</div><div class="badge-num">' + escapeHTML(row[0]) + '</div></div>';
      html += '<div class="row-body"><div class="row-heading"><div class="row-title">' + escapeHTML(row[1]) + '</div></div>';
      if (row[2]) html += '<div class="row-subtitle">' + escapeHTML(row[2]) + '</div>';
      html += '</div><div class="row-icon"><img src="' + escapeHTML(row[3]) + '" alt="' + escapeHTML(row[4]) + '"></div></div>';
    }
    target.innerHTML = html;
  }

  function nextDirectoryPage() {
    page = (page + 1) % Math.ceil(rows.length / rowsPerPage);
    renderDirectory();
  }

  function duplicateTicker() {
    var ticker = document.getElementById("tickerContent");
    if (ticker) ticker.innerHTML = ticker.innerHTML + ticker.innerHTML;
  }

  scaleToFit();
  updateClock();
  renderDirectory();
  duplicateTicker();
  window.addEventListener("resize", scaleToFit);
  setInterval(updateClock, 1000);
  setInterval(nextDirectoryPage, 10000);
})();
`;

const legacyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DS Global Corporate Center - Mediasign Legacy</title>
<style>${css}</style>
</head>
<body>${body}<script>${legacyScript}</script>
</body>
</html>
`;

fs.writeFileSync("mediasign-legacy.html", legacyHtml);
console.log("Created mediasign-legacy.html");
