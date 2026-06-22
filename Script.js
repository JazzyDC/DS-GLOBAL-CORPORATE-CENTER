// ===== FULLSCREEN SCALE-TO-FIT =====
const CANVAS_W = 1080;
const CANVAS_H = 1920;
const XML_DATA_BASE = "data/";

function scaleToFit() {
  const screen = document.querySelector(".screen");
  if (!screen) return;
  const scaleX = window.innerWidth / CANVAS_W;
  const scaleY = window.innerHeight / CANVAS_H;
  const isPortrait = window.innerHeight >= window.innerWidth;

  screen.style.transform = isPortrait
    ? `scale(${scaleX}, ${scaleY})`
    : `scale(${Math.min(scaleX, scaleY)})`;
}

scaleToFit();
window.addEventListener("resize", scaleToFit);

// ===== LIVE CLOCK =====
const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  document.getElementById("clockTime").textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  document.getElementById("clockMeridiem").textContent = meridiem;
  document.getElementById("clockDay").textContent = dayNames[now.getDay()];
}

updateClock();
setInterval(updateClock, 1000);

// ===== TICKER =====
const tickerContent = document.getElementById("tickerContent");
const NEWSDATA_API_URL = "https://newsdata.io/api/1/latest?country=ph&apikey=pub_19040c1fa9bd4eaf88c6682a62cecbcc";
const DEFAULT_TICKER_MESSAGES = [
  "BUILDING MAINTENANCE SCHEDULED 12AM TO 4AM",
  "CHECK OUR WEBSITE FOR VENUE BOOKINGS"
];

function renderTickerMessages(messages) {
  if (!tickerContent) return;

  const cleanMessages = messages
    .map(message => String(message || "").trim())
    .filter(Boolean);

  const tickerText = (cleanMessages.length ? cleanMessages : DEFAULT_TICKER_MESSAGES)
    .map(escapeHTML)
    .join("&nbsp;&nbsp;&bull;&nbsp;&nbsp;");

  tickerContent.innerHTML = `<span>${tickerText}&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>`;
  tickerContent.innerHTML += tickerContent.innerHTML;
}

async function fetchNewsTicker() {
  try {
    const res = await fetch(NEWSDATA_API_URL);
    if (!res.ok) throw new Error(`NewsData error: ${res.status}`);

    const data = await res.json();
    const headlines = Array.isArray(data.results)
      ? data.results.slice(0, 5).map(item => item.title)
      : [];

    renderTickerMessages(headlines);
  } catch (err) {
    renderTickerMessages(DEFAULT_TICKER_MESSAGES);
  }
}

renderTickerMessages(DEFAULT_TICKER_MESSAGES);
fetchNewsTicker();
setInterval(fetchNewsTicker, 15 * 60 * 1000);

// ===== WEATHER =====
function weatherIconSVG(code) {
  const sun = `
    <circle cx="13" cy="8.3" r="5.2" fill="#F6B11A"/>
    <g stroke="#D6A03A" stroke-width="1.2" stroke-linecap="round" opacity="0.55">
      <line x1="13" y1="0.8" x2="13" y2="2.7"/>
      <line x1="5.5" y1="8.3" x2="7.4" y2="8.3"/>
      <line x1="18.6" y1="8.3" x2="20.5" y2="8.3"/>
      <line x1="7.7" y1="3" x2="9" y2="4.3"/>
      <line x1="17" y1="4.3" x2="18.3" y2="3"/>
    </g>`;
  const cloud = `
    <path d="M5.8 18.3h11.5c2.4 0 4.2-1.7 4.2-3.8 0-2-1.6-3.6-3.8-3.8A5.4 5.4 0 0 0 7.4 12a3.4 3.4 0 0 0-1.6 6.3Z"
      fill="#75BFEA"/>
    <path d="M6.1 18.3h11.2c2.4 0 4.2-1.7 4.2-3.8 0-.4-.1-.8-.2-1.1-.5 1.4-2 2.4-3.8 2.4H6.2c-1.3 0-2.4-.5-3.1-1.3-.1.2-.1.5-.1.8 0 1.8 1.4 3 3.1 3Z"
      fill="#5AAFE0" opacity="0.55"/>`;
  const rain = `
    <g stroke="#2D9CDB" stroke-width="1.45" stroke-linecap="round">
      <line x1="8.6" y1="20" x2="7.8" y2="22"/>
      <line x1="12.4" y1="20" x2="11.6" y2="22"/>
      <line x1="16.2" y1="20" x2="15.4" y2="22"/>
    </g>`;

  if (code === 0) return sun;
  if ([1, 2].includes(code)) return `${sun}${cloud}`;
  if ([3, 45, 48].includes(code)) return cloud;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return `${cloud}${rain}`;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return `${cloud}<circle cx="9" cy="21" r="1" fill="#BAE6FD"/><circle cx="14" cy="21.5" r="1" fill="#BAE6FD"/>`;
  if ([95, 96, 99].includes(code)) return `${cloud}${rain}<path d="M13 12.3l-2 3.2h2.2l-1.3 3.2 3.4-4.3h-2.2l1.4-2.1H13Z" fill="#FACC15"/>`;
  return `${sun}${cloud}`;
}

async function fetchWeather() {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=14.6760&longitude=121.0437&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Manila&_=${Date.now()}`;
    const res = await fetch(weatherUrl, { cache: "no-store" });
    const data = await res.json();

    document.getElementById("tempLow").textContent =
      Number(data.current.temperature_2m).toFixed(1);

    document.getElementById("tempHigh").textContent =
      Math.round(data.daily.temperature_2m_max[0]);

    const iconEl = document.querySelector(".weather-icon");
    if (iconEl) iconEl.innerHTML = weatherIconSVG(data.current.weather_code);
  } catch (err) {
    console.error("Weather load error:", err);
  }
}

fetchWeather();
setInterval(fetchWeather, 2 * 60 * 1000);

// ===== FOOTER LOADER =====
function footerText(parent, tagName) {
  const child = Array.from(parent.children).find(el => el.localName === tagName);
  return child ? child.textContent.trim() : "";
}

function renderFooterColumn(column) {
  const title = escapeHTML(column.getAttribute("title") || footerText(column, "title"));
  const theme = escapeHTML(column.getAttribute("theme") || "");
  const headClass = theme ? ` info-head--${theme}` : "";
  const quickDial = Array.from(column.children).find(el => el.localName === "quickDial");
  const items = Array.from(column.children).filter(el => el.localName === "item");

  return `
    <div class="info-col">
      <div class="info-head${headClass}">${title}</div>
      ${quickDial ? `
        <div class="quick-dial">
          <span>${escapeHTML(quickDial.getAttribute("label") || footerText(quickDial, "label"))}</span>
          <strong>${escapeHTML(quickDial.getAttribute("value") || footerText(quickDial, "value"))}</strong>
        </div>
      ` : ""}
      ${items.map(item => {
        const label = footerText(item, "label");
        const value = footerText(item, "value");
        const email = footerText(item, "email");
        const note = footerText(item, "note");

        return `
          <div class="info-block">
            ${label ? `<span class="info-label">${escapeHTML(label)}</span>` : ""}
            ${value ? `<span class="info-value">${escapeHTML(value)}</span>` : ""}
            ${email ? `<a class="info-link" href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a>` : ""}
            ${note ? `<span class="info-sub">${escapeHTML(note)}</span>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function loadFooter() {
  const info = document.querySelector(".info");
  if (!info) return;

  try {
    const res = await fetch(`${XML_DATA_BASE}footer.xml`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const columns = Array.from(xml.querySelectorAll("column"));

    if (columns.length === 0) return;
    info.innerHTML = columns.map(renderFooterColumn).join("");
  } catch (err) {
    console.error(`Footer load error from ${XML_DATA_BASE}footer.xml:`, err);
  }
}

loadFooter();

// ===== SMOOTH FADE VIDEO CYCLER =====
const heroVideo = document.querySelector('.hero-bg');
let currentVideoIndex = 0;
let isTransitioning = false;

async function loadVideos() {
  try {
    const res = await fetch(`${XML_DATA_BASE}videos.xml`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");

    const videoList = Array.from(xml.getElementsByTagName('video')).map(v => ({
      src: v.getAttribute('src'),
      poster: v.getAttribute('poster') || ''
    }));

    if (videoList.length === 0) return;

    function playNextVideo() {
      if (isTransitioning) return;
      isTransitioning = true;

      const nextVideo = videoList[currentVideoIndex];

      // Start fade out
      heroVideo.style.transition = 'opacity 1.2s ease';
      heroVideo.style.opacity = '0';

      setTimeout(() => {
        heroVideo.poster = nextVideo.poster;
        heroVideo.src = nextVideo.src;
        heroVideo.load();

        heroVideo.play().catch(() => {});

        // Fade in
        heroVideo.style.opacity = '1';

        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        isTransitioning = false;
      }, 1200); // Wait for fade out
    }

    // Start first video
    const first = videoList[0];
    heroVideo.poster = first.poster;
    heroVideo.src = first.src;
    heroVideo.load();
    heroVideo.play().catch(() => {});
    currentVideoIndex = 1;

    // Remove loop and listen for end
    heroVideo.removeAttribute('loop');
    heroVideo.addEventListener('ended', playNextVideo);

  } catch (err) {
    console.error(`Failed to load ${XML_DATA_BASE}videos.xml:`, err);
  }
}

loadVideos();

// ===== DIRECTORY LOADER =====
const DIRECTORY_ROTATE_MS = 10000;
const DIRECTORY_FADE_MS = 650;
const DIRECTORY_ROWS_PER_PAGE = 6;
let directoryLevels = [];
let directoryPages = [];
let currentDirectoryPageIndex = 0;
let isDirectoryTransitioning = false;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function childText(parent, tagName) {
  const child = Array.from(parent.children).find(el => el.localName === tagName);
  return child ? child.textContent.trim() : '';
}

function parseDirectoryLevel(level) {
  return {
    name: level.getAttribute('name') || childText(level, 'name'),
    date: level.getAttribute('date') || childText(level, 'date'),
    items: Array.from(level.querySelectorAll('item')).map(item => ({
      floor: childText(item, 'floor'),
      title: childText(item, 'title'),
      subtitle: childText(item, 'subtitle'),
      icon: childText(item, 'icon'),
      date: item.getAttribute('date') || childText(item, 'date'),
      featured: item.getAttribute('featured') === 'true'
    }))
  };
}

function buildDirectoryPages(levels) {
  const rows = levels.flatMap(level => level.items.map(item => ({
    ...item,
    levelName: level.name,
    levelDate: level.date
  })));

  const pages = [];
  for (let i = 0; i < rows.length; i += DIRECTORY_ROWS_PER_PAGE) {
    pages.push(rows.slice(i, i + DIRECTORY_ROWS_PER_PAGE));
  }

  return pages;
}

function renderDirectoryPage() {
  const dir = document.getElementById('directory');
  if (!dir || directoryPages.length === 0) return;

  const pageRows = directoryPages[currentDirectoryPageIndex % directoryPages.length];
  dir.innerHTML = `
    <div class="level-divider">
      <span>BUILDING DIRECTORY</span>
    </div>
    <div class="directory-page">
      ${pageRows.map(item => `
        <div class="row ${item.featured ? 'row--featured' : ''}">
          <div class="badge">
            <div class="badge-label">FLOOR</div>
            <div class="badge-num">${escapeHTML(item.floor)}</div>
          </div>
          <div class="row-body">
            <div class="row-heading">
              <div class="row-title">${escapeHTML(item.title)}</div>
            </div>
            ${item.subtitle ? `<div class="row-subtitle">${escapeHTML(item.subtitle)}</div>` : ''}
          </div>
          <div class="row-icon">${escapeHTML(item.icon)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function showNextDirectoryLevel() {
  const dir = document.getElementById('directory');
  if (!dir || directoryPages.length <= 1 || isDirectoryTransitioning) return;

  isDirectoryTransitioning = true;
  dir.classList.add('is-fading-out');

  setTimeout(() => {
    currentDirectoryPageIndex = (currentDirectoryPageIndex + 1) % directoryPages.length;
    renderDirectoryPage();

    requestAnimationFrame(() => {
      dir.classList.remove('is-fading-out');
      isDirectoryTransitioning = false;
    });
  }, DIRECTORY_FADE_MS);
}

async function loadDirectory() {
  try {
    const res = await fetch(`${XML_DATA_BASE}directory.xml`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    directoryLevels = Array.from(xml.querySelectorAll('level')).map(parseDirectoryLevel);
    directoryPages = buildDirectoryPages(directoryLevels);
    currentDirectoryPageIndex = directoryPages.length ? currentDirectoryPageIndex % directoryPages.length : 0;
    renderDirectoryPage();
  } catch (err) {
    console.error("Directory load error:", err);
  }
}

loadDirectory();
setInterval(showNextDirectoryLevel, DIRECTORY_ROTATE_MS);
setInterval(loadDirectory, 5 * 60 * 1000);
