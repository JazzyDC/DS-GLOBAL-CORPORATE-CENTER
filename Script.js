// ===== FULLSCREEN SCALE-TO-FIT =====
const CANVAS_W = 1080;
const CANVAS_H = 1920;

function scaleToFit() {
  const screen = document.querySelector(".screen");
  if (!screen) return;
  const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
  screen.style.transform = `scale(${scale})`;
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
if (tickerContent) tickerContent.innerHTML += tickerContent.innerHTML;

// ===== WEATHER =====
const WEATHER_LAT = 14.6760;
const WEATHER_LON = 121.0437;
const WEATHER_TZ = "Asia/Manila";

function weatherIconSVG(code) {
  const c = "#22D3EE";
  if (code === 0) {
    return `<circle cx="12" cy="12" r="4.2" stroke="${c}" stroke-width="1.4"/>
      <g stroke="${c}" stroke-width="1.4" stroke-linecap="round">
        <line x1="12" y1="1.5" x2="12" y2="3.6"/><line x1="12" y1="20.4" x2="12" y2="22.5"/>
        <line x1="1.5" y1="12" x2="3.6" y2="12"/><line x1="20.4" y1="12" x2="22.5" y2="12"/>
        <line x1="4.4" y1="4.4" x2="5.9" y2="5.9"/><line x1="18.1" y1="18.1" x2="19.6" y2="19.6"/>
        <line x1="18.1" y1="5.9" x2="19.6" y2="4.4"/><line x1="4.4" y1="19.6" x2="5.9" y2="18.1"/>
      </g>`;
  }
  return `<circle cx="12" cy="12" r="4.2" stroke="${c}" stroke-width="1.4"/>`; // default
}

async function fetchWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=${encodeURIComponent(WEATHER_TZ)}`;
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById("tempLow").textContent = Math.round(data.daily.temperature_2m_min[0]);
    document.getElementById("tempHigh").textContent = Math.round(data.daily.temperature_2m_max[0]);
    
    const iconEl = document.querySelector(".weather-icon");
    if (iconEl) iconEl.innerHTML = weatherIconSVG(data.current.weather_code);
  } catch (e) {}
}

fetchWeather();
setInterval(fetchWeather, 15 * 60 * 1000);

// ===== SMOOTH FADE VIDEO CYCLER =====
const heroVideo = document.querySelector('.hero-bg');
let currentVideoIndex = 0;
let isTransitioning = false;

async function loadVideos() {
  try {
    const res = await fetch('videos.xml');
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
    console.error("Failed to load videos.xml:", err);
  }
}

loadVideos();

// ===== DIRECTORY LOADER =====
async function loadDirectory() {
  try {
    const res = await fetch('directory.xml');
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const dir = document.getElementById('directory');
    dir.innerHTML = '';

    xml.querySelectorAll('level').forEach(level => {
      const divider = document.createElement('div');
      divider.className = 'level-divider';
      divider.textContent = level.getAttribute('name');
      dir.appendChild(divider);

      level.querySelectorAll('item').forEach(item => {
        const row = document.createElement('div');
        row.className = `row ${item.getAttribute('featured') === 'true' ? 'row--featured' : ''}`;
        row.innerHTML = `
          <div class="badge">
            <div class="badge-label">FLOOR</div>
            <div class="badge-num">${item.querySelector('floor').textContent}</div>
          </div>
          <div class="row-body">
            <div class="row-title">${item.querySelector('title').textContent}</div>
            ${item.querySelector('subtitle') ? `<div class="row-subtitle">${item.querySelector('subtitle').textContent}</div>` : ''}
          </div>
          <div class="row-icon">${item.querySelector('icon').textContent}</div>
        `;
        dir.appendChild(row);
      });
    });
  } catch (err) {
    console.error("Directory load error:", err);
  }
}

loadDirectory();
setInterval(loadDirectory, 5 * 60 * 1000);