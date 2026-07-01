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

// ===== XML BRANDING =====
function brandingAttribute(element, name) {
  return element ? String(element.getAttribute(name) || "").trim() : "";
}

async function loadBranding() {
  try {
    const res = await fetch(`${XML_DATA_BASE}branding.xml`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Branding request failed: ${res.status}`);

    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    if (xml.querySelector("parsererror")) throw new Error("Invalid branding XML");

    const logoSettings = xml.querySelector("logo");
    const headerPatternSettings = xml.querySelector("headerPattern");
    const stripSettings = xml.querySelector("strip");
    const logo = document.querySelector(".brand-logo");
    const headerPattern = document.querySelector(".header-pattern");
    const strip = document.querySelector(".strip");

    const logoSrc = safeLocalAssetPath(brandingAttribute(logoSettings, "src"));
    if (logo && logoSrc) logo.src = logoSrc;

    const logoAlt = brandingAttribute(logoSettings, "alt");
    if (logo && logoAlt) logo.alt = logoAlt;

    const fitSizes = {
      cover: "cover",
      contain: "contain",
      stretch: "100% 100%",
      natural: "auto"
    };

    const headerPatternSrc = safeLocalAssetPath(brandingAttribute(headerPatternSettings, "src"));
    if (headerPattern && headerPatternSrc) {
      headerPattern.style.setProperty(
        "--header-pattern-image",
        `url("${headerPatternSrc.replace(/"/g, '\\"')}")`
      );
    }

    if (headerPattern) {
      const requestedHeight = Number.parseInt(brandingAttribute(headerPatternSettings, "height"), 10);
      if (Number.isFinite(requestedHeight)) {
        headerPattern.style.height = `${Math.min(240, Math.max(20, requestedHeight))}px`;
      }

      const fit = brandingAttribute(headerPatternSettings, "fit").toLowerCase();
      if (fitSizes[fit]) {
        headerPattern.style.setProperty("--header-pattern-size", fitSizes[fit]);
      }

      const position = brandingAttribute(headerPatternSettings, "position");
      if (position) {
        headerPattern.style.setProperty("--header-pattern-position", position);
      }
    }

    const stripSrc = safeLocalAssetPath(brandingAttribute(stripSettings, "src"));
    if (strip && stripSrc) {
      strip.style.setProperty("--strip-image", `url("${stripSrc.replace(/"/g, '\\"')}")`);
    }

    if (strip) {
      const requestedHeight = Number.parseInt(brandingAttribute(stripSettings, "height"), 10);
      if (Number.isFinite(requestedHeight)) {
        strip.style.height = `${Math.min(300, Math.max(36, requestedHeight))}px`;
      }

      const fit = brandingAttribute(stripSettings, "fit").toLowerCase();
      if (fitSizes[fit]) strip.style.setProperty("--strip-art-size", fitSizes[fit]);

      const position = brandingAttribute(stripSettings, "position");
      if (position) strip.style.setProperty("--strip-art-position", position);
    }
  } catch (err) {
    console.error(`Branding load error from ${XML_DATA_BASE}branding.xml:`, err);
  }
}

loadBranding();
setInterval(loadBranding, 5 * 60 * 1000);

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
const NEWSDATA_API_URL = "https://newsdata.io/api/1/latest?country=ph&apikey=pub_8c6cfdcc37a54f168a65dd4b7d0e3ed5";
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
    <circle cx="42" cy="39" r="25" fill="url(#weatherSun)"/>
    <g stroke="#D6A03A" stroke-width="2.8" stroke-linecap="round" opacity="0.42">
      <line x1="18" y1="21" x2="12" y2="16"/>
      <line x1="65" y1="17" x2="71" y2="11"/>
      <line x1="43" y1="5" x2="43" y2="12"/>
      <line x1="14" y1="43" x2="7" y2="44"/>
    </g>`;
  const cloud = `
    <g filter="url(#weatherShadow)">
      <path d="M43 72h58c12.8 0 23.2-9 23.2-20.2 0-10.5-9.2-19.3-21.1-20.1C98.1 19.6 86 12 72.1 12c-15 0-27.6 9.1-30.7 21.5C30.7 34.9 22 43 22 52.8 22 63.4 31.4 72 43 72Z" fill="url(#weatherCloud)"/>
      <path d="M42.6 72h58.9c12.2 0 22.2-8.4 22.2-19.4 0-2.2-.4-4.2-1.1-6.1-3.2 6.3-10.4 10.8-18.8 10.8H44.8c-7.9 0-14.9-3.6-18.9-9.1-2.2 3-3.4 6.4-3.4 10C22.5 66 31.4 72 42.6 72Z" fill="#7FC8EE" opacity="0.58"/>
    </g>`;
  const rain = `
    <path d="M70 79c0 5.7-4.5 9.7-9.5 9.7S51 84.7 51 79c0-5.2 6.7-13.3 9.5-16.4C63.5 65.7 70 73.7 70 79Z" fill="#0B67D6"/>`;
  const lightning = `
    <path d="M128 48l-10 19h10l-12 20 26-28h-12l9-11h-11Z" fill="#F4C20D"/>
    <path d="M15 57L8 70h7L7 84l17-20h-8l6-7h-7Z" fill="#F4C20D"/>`;
  const defs = `
    <defs>
      <linearGradient id="weatherSun" x1="16" y1="13" x2="66" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFE05C"/>
        <stop offset="1" stop-color="#F4B400"/>
      </linearGradient>
      <linearGradient id="weatherCloud" x1="44" y1="14" x2="99" y2="74" gradientUnits="userSpaceOnUse">
        <stop stop-color="#DDF4FF"/>
        <stop offset="0.55" stop-color="#9FD7F5"/>
        <stop offset="1" stop-color="#5AAFE0"/>
      </linearGradient>
      <filter id="weatherShadow" x="14" y="4" width="119" height="77" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#64748B" flood-opacity="0.22"/>
      </filter>
    </defs>`;

  if (code === 0) return `${defs}${sun}`;
  if ([1, 2].includes(code)) return `${defs}${sun}${cloud}`;
  if ([3, 45, 48].includes(code)) return `${defs}${cloud}`;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return `${defs}${sun}${cloud}${rain}`;
  if ([95, 96, 99].includes(code)) return `${defs}${sun}${cloud}${lightning}`;
  return `${defs}${sun}${cloud}`;
}

async function fetchWeather() {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=14.6760&longitude=121.0437&current=temperature_2m,weather_code&timezone=Asia/Manila&_=${Date.now()}`;
    const res = await fetch(weatherUrl, { cache: "no-store" });
    const data = await res.json();
    const weatherCode = data.current.weather_code;

    document.getElementById("weatherCurrent").textContent =
      Math.round(data.current.temperature_2m);

    const iconEl = document.querySelector(".weather-icon");
    if (iconEl) iconEl.innerHTML = weatherIconSVG(weatherCode);
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
const HERO_FADE_OUT_MS = 1200;
const HERO_FADE_IN_MS = 3000;
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
      heroVideo.style.transition = `opacity ${HERO_FADE_OUT_MS}ms ease`;
      heroVideo.style.opacity = '0';

      setTimeout(() => {
        heroVideo.poster = nextVideo.poster;
        heroVideo.src = nextVideo.src;
        heroVideo.load();

        heroVideo.play().catch(() => {});

        // Slowly fade the next video in
        heroVideo.style.transition = `opacity ${HERO_FADE_IN_MS}ms ease`;
        heroVideo.style.opacity = '1';

        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        isTransitioning = false;
      }, HERO_FADE_OUT_MS);
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
const DIRECTORY_FLOOR_IMAGES = {
  "8F": "assets/images/floor-8.svg",
  "9F": "assets/images/floor-9.svg",
  "10F": "assets/images/floor-10.svg"
};
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

function safeLocalAssetPath(value) {
  const path = String(value || '').trim().replace(/\\/g, '/');
  if (!path || path.startsWith('/') || path.includes('..') || /^[a-z]+:/i.test(path)) return '';
  return path;
}

function floorImagePath(floor) {
  return DIRECTORY_FLOOR_IMAGES[String(floor || '').trim().toUpperCase()] || '';
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
      image: safeLocalAssetPath(childText(item, 'image')) || floorImagePath(childText(item, 'floor')),
      imageAlt: childText(item, 'imageAlt'),
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
          <div class="row-icon">
            ${item.image
              ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.imageAlt || item.title)}">`
              : escapeHTML(item.icon)}
          </div>
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

function applyDirectoryLevels(levels) {
  directoryLevels = levels;
  directoryPages = buildDirectoryPages(directoryLevels);
  currentDirectoryPageIndex = directoryPages.length
    ? currentDirectoryPageIndex % directoryPages.length
    : 0;
  renderDirectoryPage();
}

async function loadDirectory() {
  try {
    const res = await fetch(`${XML_DATA_BASE}directory.xml`);
    if (!res.ok) throw new Error(`Directory request failed: ${res.status}`);

    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const levels = Array.from(xml.querySelectorAll('level')).map(parseDirectoryLevel);
    if (levels.length === 0) throw new Error("No directory levels found");

    applyDirectoryLevels(levels);
  } catch (err) {
    console.error("Directory XML load error:", err);
  }
}

loadDirectory();
setInterval(showNextDirectoryLevel, DIRECTORY_ROTATE_MS);
setInterval(loadDirectory, 5 * 60 * 1000);
