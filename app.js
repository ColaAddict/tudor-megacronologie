// Romanian Month Names
const monthsRO = [
  "ianuarie", "februarie", "martie", "aprilie",
  "mai", "iunie", "iulie", "august",
  "septembrie", "octombrie", "noiembrie", "decembrie"
];

// Roman Numerals Conversion Utilities
function romanToInt(roman) {
  const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let total = 0;
  const r = roman.toUpperCase();
  for (let i = 0; i < r.length; i++) {
    const current = map[r[i]];
    const next = map[r[i+1]];
    if (next && current < next) {
      total += next - current;
      i++;
    } else {
      total += current;
    }
  }
  return total;
}

function romanFromInt(num) {
  const absNum = Math.abs(num);
  const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  let n = absNum;
  for (let i in lookup) {
    while (n >= lookup[i]) {
      roman += i;
      n -= lookup[i];
    }
  }
  return roman;
}
// Normalize Romanian diacritics to their base characters for easy matching
function normalizeDiacritics(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    // Standardizes both comma-below and cedilla-below diacritics
    .replace(/[ăâ]/g, 'a')
    .replace(/î/g, 'i')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't');
}

const CATEGORIES = {
  BATTLES: {
    id: "battles",
    label: "⚔️ Război / Revoltă",
    color: "#f43f5e"
  },
  CULTURE: {
    id: "culture",
    label: "📖 Cultură / Școală",
    color: "#fbbf24"
  },
  POLITICS: {
    id: "politics",
    label: "⚖️ Lege / Politică",
    color: "#3b82f6"
  },
  RULERS: {
    id: "rulers",
    label: "👑 Domnitor / Dinastie",
    color: "#a855f7"
  },
  GENERAL: {
    id: "general",
    label: "Diverse",
    color: "#64748b"
  }, 
  THEME1: {
    id: "tema1",
    label: "Tema 1 - Romanitatea românilor în viziunea istoricilor",
    color: "#f4f800"
  },
  THEME2: {
    id: "tema2",
    label: "Tema 2 - Autonomii locale",
    color: "#3f87e6"
  },
  THEME3: {
    id: "tema3",
    label: "Tema 3 - Spațiul Românesc în evul mediu între diplomație și conflict 🏰",
    color: "#00d7f3"
  },
  THEME4: {
    id: "tema4",
    label: "Tema 4 - Statul Român Modern 🇷🇴",
    color: "#a00505"
  },
  THEME5: {
    id: "tema5",
    label: "Tema 5 - Criza Orientală 🪖🇹🇷",
    color: "#61c953"
  },
  THEME6: {
    id: "tema6",
    label: "Tema 6 - Constituțiile 🏛️",
    color: "#27e6ff"
  },
  THEME7: {
    id: "tema7",
    label: "Tema 7 - Sec.XX între democrație și totalitarism",
    color: "#b38c45"
  },
  THEME8: {
    id: "tema8",
    label: "Tema 8 - România Postbelică ☭",
    color: "#CC0000"
  },
  THEME9: {
    id: "tema9",
    label: "Tema 9 - Războiul Rece 🇺🇳 ✯",
    color: "#004990"
  },
};

function getEventCategories(event) {
  let rawCategories = [];
  
  // 1. Gather manual categories from database
  if (Array.isArray(event.categories)) {
    rawCategories = event.categories;
  } else if (event.categories) {
    rawCategories = [event.categories];
  } else if (event.category) {
    rawCategories = [event.category];
  }

  // 2. Map manual categories to our defined CATEGORIES
  const cats = [];
  rawCategories.forEach(c => {
    const upper = c.toUpperCase();
    if (CATEGORIES[upper]) {
      cats.push(CATEGORIES[upper]);
    }
  });

  // 3. Fallback to GENERAL if no valid manual category was provided
  if (cats.length === 0) {
    cats.push(CATEGORIES.GENERAL);
  }
  
  return cats;
}

// Format Display Date for Romanian
function formatDateRO(original) {
  if (!original) return "";
  const trimmed = original.trim();

  // Roman century (e.g., "II", "XVII")
  if (/^[IVXLCDM]+$/i.test(trimmed)) {
    return `Secolul ${trimmed.toUpperCase()}`;
  }

  // Range (e.g. "1290-1301")
  if (/^(-?\d{1,4})-(\d{3,4})$/.test(trimmed)) {
    const parts = trimmed.split("-");
    const start = Math.abs(Number(parts[0]));
    const startEra = Number(parts[0]) < 0 ? " î.Hr." : "";
    const end = Math.abs(Number(parts[1]));
    const endEra = Number(parts[1]) < 0 ? " î.Hr." : "";
    return `${start}${startEra} - ${end}${endEra}`;
  }

  // Year only (including BC negative years)
  if (/^-?\d{1,4}$/.test(trimmed)) {
    const year = Math.abs(Number(trimmed));
    const era = Number(trimmed) < 0 ? " î.Hr." : "";
    return `${year}${era}`;
  }

  // Year + Month (e.g. "1693-12")
  if (/^-?\d{1,4}-\d{2}$/.test(trimmed)) {
    const [yearStr, monthStr] = trimmed.split("-");
    const year = Math.abs(Number(yearStr));
    const era = Number(yearStr) < 0 ? " î.Hr." : "";
    const month = monthsRO[Number(monthStr) - 1];
    return `${month} ${year}${era}`;
  }

  // Full date (e.g. "1330-11-09")
  const parts = trimmed.split("-");
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const era = year < 0 ? " î.Hr." : "";
    const displayYear = Math.abs(year);
    return `${day} ${monthsRO[month]} ${displayYear}${era}`;
  }

  return original;
}

// Compute Century Label for Grouping
function getCenturyLabel(event) {
  const dateStr = event.date;
  
  if (event.isCentury || /^[IVXLCDM]+$/i.test(dateStr)) {
    return `Secolul ${dateStr.toUpperCase()}`;
  }
  
  let year = 0;
  if (event.isRange) {
    const parts = dateStr.split("-");
    year = (parseInt(parts[0], 10) + parseInt(parts[1], 10)) / 2;
  } else {
    year = parseInt(dateStr, 10);
  }

  if (isNaN(year)) return "Alte Epoci";

  const isBc = year < 0;
  const absYear = Math.abs(year);
  const century = Math.ceil(absYear / 100);
  
  const roman = romanFromInt(century);
  return `Secolul ${roman}${isBc ? " î.Hr." : ""}`;
}

// UI State
let activeView = "timeline";
let searchQuery = "";
let themeFilter = "all"; // <--- Modificat
let categoryFilter = "all";

// DOM Nodes
// DOM Nodes
const timelineContainer = document.getElementById("timeline-container");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const themeFilterSelect = document.getElementById("theme-filter"); // <--- Am schimbat aici
const categoryFilterSelect = document.getElementById("category-filter");
const centuryList = document.getElementById("century-list");
const centurySidebar = document.getElementById("century-sidebar");

const btnTimelineView = document.getElementById("btn-timeline-view");
const btnQuizView = document.getElementById("btn-quiz-view");
const btnAcademyView = document.getElementById("btn-academy-view");
const timelineSection = document.getElementById("timeline-section");
const quizSection = document.getElementById("quiz-section");
const academySection = document.getElementById("academy-section");

const drawer = document.getElementById("drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const drawerClose = document.getElementById("drawer-close");
const drawerTitle = document.getElementById("drawer-title");
const drawerDate = document.getElementById("drawer-date");
const drawerText = document.getElementById("drawer-text");

const btnScrollTop = document.getElementById("btn-scroll-top");

// Quiz Dashboard DOM Nodes
const statCount0 = document.getElementById("stat-count-0");
const statCount12 = document.getElementById("stat-count-1-2");
const statCount34 = document.getElementById("stat-count-3-4");
const statCount5 = document.getElementById("stat-count-5");
const bar0 = document.getElementById("bar-0");
const bar12 = document.getElementById("bar-1-2");
const bar34 = document.getElementById("bar-3-4");
const bar5 = document.getElementById("bar-5");
const progressPercentText = document.getElementById("progress-percent-text");
const btnResetSRS = document.getElementById("btn-reset-srs");

// Helper to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight Search Matches
// Highlight Search Matches (Diacritic-Insensitive)
function highlightText(text, query) {
  if (!query) return text;
  
  const escaped = escapeRegExp(query);
  let regexPattern = "";
  
  // Map standard characters to their equivalent diacritic groups
  for (let char of escaped) {
    const lowerChar = char.toLowerCase();
    if (lowerChar === 'a' || lowerChar === 'ă' || lowerChar === 'â') {
      regexPattern += "[aăâAĂÂ]";
    } else if (lowerChar === 'i' || lowerChar === 'î') {
      regexPattern += "[iîIÎ]";
    } else if (lowerChar === 's' || lowerChar === 'ș' || lowerChar === 'ş') {
      regexPattern += "[sșşSȘŞ]";
    } else if (lowerChar === 't' || lowerChar === 'ț' || lowerChar === 'ţ') {
      regexPattern += "[tțţTȚŢ]";
    } else {
      regexPattern += escapeRegExp(char);
    }
  }

  try {
    const regex = new RegExp(`(${regexPattern})`, 'gi');
    return text.replace(regex, '<span class="highlight-search">$1</span>');
  } catch (e) {
    return text; // Fallback in case of regex parsing issues
  }
}

// Process and Group Events on the fly
function getFilteredAndGroupedEvents() {
  const filtered = window.events.filter(e => {
    // 1. Theme filter (Înlocuiește complet era filter)
    let matchesTheme = true;
    if (themeFilter !== "all") {
      const cats = getEventCategories(e);
      matchesTheme = cats.some(cat => cat.id === themeFilter);
    }

    // 1.5 Category filter
    let matchesCategory = true;
    if (categoryFilter !== "all") {
      const cats = getEventCategories(e);
      matchesCategory = cats.some(cat => cat.id === categoryFilter);
    }

    // 2. Search filter
    let matchesSearch = true;
    if (searchQuery) {
      const normalizedQuery = normalizeDiacritics(searchQuery);
      const textToSearch = `${formatDateRO(e.date)} ${e.title} ${e.info}`;
      const normalizedText = normalizeDiacritics(textToSearch);
      
      matchesSearch = normalizedText.includes(normalizedQuery);
    }

    return matchesTheme && matchesCategory && matchesSearch; // <--- Modificat aici la return
  });

  // Group sequentially
  const groups = [];
  let currentGroup = null;

  filtered.forEach(event => {
    const label = getCenturyLabel(event);
    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = {
        label: label,
        id: label.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        events: []
      };
      groups.push(currentGroup);
    }
    currentGroup.events.push(event);
  });

  return groups;
}

// Render Timeline & Sidebar
function renderTimeline() {
  const groups = getFilteredAndGroupedEvents();
  
  // Clear containers
  timelineContainer.innerHTML = "";
  centuryList.innerHTML = "";

  if (groups.length === 0) {
    timelineContainer.innerHTML = `
      <div class="empty-state">
        <p>Nu s-au găsit evenimente care să corespundă criteriilor de căutare.</p>
      </div>
    `;
    return;
  }

  groups.forEach(group => {
    // 1. Append Century Header
    const groupSection = document.createElement("section");
    groupSection.className = "century-group";
    groupSection.id = group.id;

    const header = document.createElement("h2");
    header.className = "century-header";
    header.textContent = group.label;
    groupSection.appendChild(header);

    // 2. Append Timeline List
    const list = document.createElement("div");
    list.className = "timeline-list";

    group.events.forEach(event => {
      // Determine Era for dot coloring
      let isBc = false;
      if (!event.isCentury && !/^[IVXLCDM]+$/i.test(event.date)) {
        let y = event.isRange ? parseInt(event.date.split("-")[0], 10) : parseInt(event.date, 10);
        isBc = y < 0;
      }

      const item = document.createElement("div");
      item.className = `event-item ${isBc ? 'era-bc' : 'era-ad'}`;
      
      // We store the full event object reference on the DOM node for the click drawer handler
      item.eventData = event;

      // Extract raw html for rendering snippet safely
      let snippet = (event.info || "");
      if (snippet.length > 180) {
        snippet = snippet.substring(0, 180) + "...";
      }

      const displayDate = formatDateRO(event.date);
      const categories = getEventCategories(event);
      const categoryBadges = categories.map(cat => 
        `<span class="event-category badge-category-${cat.id}">${cat.label}</span>`
      ).join(" ");

      item.innerHTML = `
        <div class="event-card">
          <div class="event-card-header">
            <span class="event-date">${highlightText(displayDate, searchQuery)}</span>
            ${categoryBadges}
          </div>
          <h3 class="event-title">${highlightText(event.title, searchQuery)}</h3>
          ${snippet ? `<p class="event-snippet">${highlightText(snippet, searchQuery)}</p>` : ''}
        </div>
      `;

      list.appendChild(item);
    });

    groupSection.appendChild(list);
    timelineContainer.appendChild(groupSection);

    // 3. Append to Sidebar
    const sidebarItem = document.createElement("li");
    sidebarItem.className = "century-item";
    sidebarItem.innerHTML = `<button data-target="${group.id}">${group.label}</button>`;
    centuryList.appendChild(sidebarItem);
  });

  // Setup click handlers for Sidebar button scrolling
  centuryList.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const header = document.querySelector(".app-header");
        const headerHeight = header ? header.offsetHeight : 80;
        const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        
        // Highlight active sidebar item
        centuryList.querySelectorAll(".century-item").forEach(item => item.classList.remove("active"));
        btn.parentElement.classList.add("active");
      }
    });
  });
}

// Side Drawer Actions
function openDrawer(event) {
  let isBc = false;
  if (!event.isCentury && !/^[IVXLCDM]+$/i.test(event.date)) {
    let y = event.isRange ? parseInt(event.date.split("-")[0], 10) : parseInt(event.date, 10);
    isBc = y < 0;
  }

  drawerDate.textContent = formatDateRO(event.date);
  drawerDate.className = `drawer-date-badge ${isBc ? 'era-bc' : 'era-ad'}`;
  drawerTitle.textContent = event.title;
  
  // Replace custom inline tags inside info descriptions
  let text = event.info || "Fără descriere detaliată disponibilă.";
  // If no html formatting is inside and there are line breaks, format them
  if (!text.includes("<br") && !text.includes("<p>")) {
    text = text.replace(/\n/g, "<br>");
  }

  drawerText.innerHTML = text;

  drawer.classList.add("open");
  drawerOverlay.classList.add("open");
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

// Drawer Event Listeners
timelineContainer.addEventListener("click", (e) => {
  const item = e.target.closest(".event-item");
  if (item && item.eventData) {
    openDrawer(item.eventData);
  }
});

drawerClose.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

// Search & Filter Listeners
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  if (searchQuery) {
    clearSearchBtn.classList.remove("hidden");
  } else {
    clearSearchBtn.classList.add("hidden");
  }
  renderTimeline();
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  clearSearchBtn.classList.add("hidden");
  renderTimeline();
});

themeFilterSelect.addEventListener("change", (e) => {
  themeFilter = e.target.value;
  
  if (activeView === "timeline") {
    renderTimeline();
  } else if (activeView === "quiz") {
    recentQuestionsQueue = []; // Clear queue so we don't lock small themes
    loadNextQuizQuestion();
  }
});

categoryFilterSelect.addEventListener("change", (e) => {
  categoryFilter = e.target.value;
  renderTimeline();
});

// View Switching Logic (generic, supports Timeline / Chestionar / Test Academie)
const VIEWS = {
  timeline: { btn: btnTimelineView, section: timelineSection, onEnter: () => { centurySidebar.classList.remove("hidden"); renderTimeline(); } },
  quiz: { btn: btnQuizView, section: quizSection, onEnter: () => { centurySidebar.classList.add("hidden"); startQuizGame(); } },
  academy: { btn: btnAcademyView, section: academySection, onEnter: () => { centurySidebar.classList.add("hidden"); startAcademyGame(); } }
};

function switchToView(viewName) {
  if (activeView === viewName) return;
  activeView = viewName;

  Object.keys(VIEWS).forEach(name => {
    const view = VIEWS[name];
    if (!view.btn || !view.section) return;
    if (name === viewName) {
      view.btn.classList.add("active");
      view.section.classList.add("active");
    } else {
      view.btn.classList.remove("active");
      view.section.classList.remove("active");
    }
  });

  VIEWS[viewName].onEnter();
}

btnTimelineView.addEventListener("click", () => switchToView("timeline"));
btnQuizView.addEventListener("click", () => switchToView("quiz"));
if (btnAcademyView) {
  btnAcademyView.addEventListener("click", () => switchToView("academy"));
}

// Scroll to Top Logic
window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    btnScrollTop.classList.add("visible");
  } else {
    btnScrollTop.classList.remove("visible");
  }

  // Highlight active century in sidebar based on scroll position
  if (activeView === "timeline") {
    const groups = timelineContainer.querySelectorAll(".century-group");
    let activeGroupId = null;

    groups.forEach(g => {
      const rect = g.getBoundingClientRect();
      // If the top of the section is in the top portion of the viewport
      if (rect.top <= 180) {
        activeGroupId = g.id;
      }
    });

    if (activeGroupId) {
      centuryList.querySelectorAll("li").forEach(li => {
        const btn = li.querySelector("button");
        if (btn.getAttribute("data-target") === activeGroupId) {
          li.classList.add("active");
        } else {
          li.classList.remove("active");
        }
      });
    }
  }
});

btnScrollTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


// ----------------------------------------------------
// ----------------------------------------------------
// QUIZ GAME MODE (ACTIVE RECALL with Spaced Repetition SRS)
// ----------------------------------------------------
let quizState = {
  score: 0,
  totalQuestions: 0,
  currentEvent: null,
  options: []
};

// Leitner SRS state
let srsState = {};
let recentQuestionsQueue = [];

function getEventKey(event) {
  return `${event.date}::${event.title.substring(0, 30)}`;
}

function loadSRSState() {
  try {
    const raw = localStorage.getItem("mega_cronologie_srs");
    srsState = raw ? JSON.parse(raw) : {};
  } catch (e) {
    srsState = {};
  }
}

function saveSRSState() {
  try {
    localStorage.setItem("mega_cronologie_srs", JSON.stringify(srsState));
  } catch (e) {}
}

function updateSRSDashboard() {
  const validEvents = window.events.filter(e => e.title && e.date);
  const total = validEvents.length;
  if (total === 0) return;

  let count0 = 0;
  let count12 = 0;
  let count34 = 0;
  let count5 = 0;

  validEvents.forEach(e => {
    const key = getEventKey(e);
    const lvl = srsState[key] || 0;
    if (lvl === 0) count0++;
    else if (lvl === 1 || lvl === 2) count12++;
    else if (lvl === 3 || lvl === 4) count34++;
    else if (lvl === 5) count5++;
  });

  if (statCount0) statCount0.textContent = count0;
  if (statCount12) statCount12.textContent = count12;
  if (statCount34) statCount34.textContent = count34;
  if (statCount5) statCount5.textContent = count5;

  const pct0 = (count0 / total) * 100;
  const pct12 = (count12 / total) * 100;
  const pct34 = (count34 / total) * 100;
  const pct5 = (count5 / total) * 100;

  if (bar0) bar0.style.width = `${pct0}%`;
  if (bar12) bar12.style.width = `${pct12}%`;
  if (bar34) bar34.style.width = `${pct34}%`;
  if (bar5) bar5.style.width = `${pct5}%`;

  if (progressPercentText) {
    progressPercentText.textContent = `${pct5.toFixed(1)}% finalizat (termen lung)`;
  }
}

const quizQuestionTitle = document.getElementById("quiz-question-title");
const quizQuestionInfo = document.getElementById("quiz-question-info");
const quizOptionsContainer = document.getElementById("quiz-options-container");
const quizScoreText = document.getElementById("quiz-score");
const quizSrsLevel = document.getElementById("quiz-srs-level");
const quizFeedbackDiv = document.getElementById("quiz-feedback");
const quizFeedbackText = document.getElementById("quiz-feedback-text");
const btnNextQuestion = document.getElementById("btn-next-question");

function startQuizGame() {
  loadSRSState();
  quizState.score = 0;
  quizState.totalQuestions = 0;
  quizScoreText.textContent = `Scor: 0/0`;
  updateSRSDashboard();
  loadNextQuizQuestion();
}

function loadNextQuizQuestion() {
  // Clear feedback UI
  quizFeedbackDiv.className = "quiz-feedback hidden";
  quizOptionsContainer.innerHTML = "";
  quizQuestionInfo.style.display = "none";
  quizQuestionInfo.innerHTML = "";

  // 1. Filter events that have a title and date, AND match the active theme filter
  const validEvents = window.events.filter(e => {
    if (!e.title || !e.date) return false;
    
    // If a specific theme is selected, make sure this event belongs to it
    if (themeFilter !== "all") {
      const cats = getEventCategories(e);
      return cats.some(cat => cat.id === themeFilter);
    }
    
    return true;
  });

  // Handle case where no events match the selected theme
  if (validEvents.length === 0) {
    quizQuestionTitle.textContent = "Niciun eveniment disponibil pentru tema selectată.";
    if (quizSrsLevel) quizSrsLevel.textContent = "---";
    return;
  }

  // Filter out recently asked questions to prevent immediate repetition
  const eligibleEvents = validEvents.filter(e => {
    const key = getEventKey(e);
    return !recentQuestionsQueue.includes(key);
  });

  // If we ran out of unseen events in this category, reset and use the whole valid theme pool
  const pool = eligibleEvents.length > 0 ? eligibleEvents : validEvents;

  // Weighted SRS selection (roulette wheel)
  const weights = pool.map(e => {
    const key = getEventKey(e);
    const lvl = srsState[key] || 0;
    // Weight decays exponentially by 50% per level
    return Math.pow(0.5, lvl);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let rand = Math.random() * totalWeight;
  let selectedEvent = pool[pool.length - 1]; // fallback

  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      selectedEvent = pool[i];
      break;
    }
  }

  quizState.currentEvent = selectedEvent;

  // Add to recent questions queue (limit to 15 items, or pool size if it's smaller)
  const currentKey = getEventKey(selectedEvent);
  recentQuestionsQueue.push(currentKey);
  const maxQueueSize = Math.min(15, Math.floor(validEvents.length / 2));
  if (recentQuestionsQueue.length > maxQueueSize) {
    recentQuestionsQueue.shift();
  }

  // Format the display title (hide dates in title if any to prevent cheating)
  let displayTitle = selectedEvent.title;
  displayTitle = displayTitle.replace(/\(\d+.*?\)/g, "").replace(/\(-\d+.*?\)/g, "");

  quizQuestionTitle.textContent = `În ce dată a avut loc: "${displayTitle}"?`;

  // Display description details (without cheating answers) if info exists
  if (selectedEvent.info) {
    let cleanInfo = selectedEvent.info.replace(/\d+/g, "[an/sec]").replace(/î\.Hr\./g, "").replace(/sec/g, "");
    if (cleanInfo.length > 250) {
      cleanInfo = cleanInfo.substring(0, 250) + "...";
    }
    quizQuestionInfo.innerHTML = `<strong>Indiciu:</strong> ${cleanInfo}`;
    quizQuestionInfo.style.display = "block";
  }

  // Display SRS level badge
  const currentLvl = srsState[currentKey] || 0;
  const srsLabels = {
    0: "🔴 Nou",
    1: "🟠 Nivel 1",
    2: "🟡 Nivel 2",
    3: "🟢 Nivel 3",
    4: "🔵 Nivel 4",
    5: "👑 Master"
  };
  if (quizSrsLevel) {
    quizSrsLevel.textContent = srsLabels[currentLvl] || "🔴 Nou";
  }

  // 2. Generate 4 choices (1 correct, 3 wrong ones closely matched in year AND same format)
  const correctOption = formatDateRO(selectedEvent.date);
  const optionsSet = new Set([correctOption]);

  // Determine the format of the correct response
  const trimmedDate = selectedEvent.date.trim();
  let correctFormat = 'other';
  if (/^[IVXLCDM]+$/i.test(trimmedDate)) correctFormat = 'century';
  else if (/^(-?\d{1,4})-(\d{3,4})$/.test(trimmedDate)) correctFormat = 'range';
  else if (/^-?\d{1,4}$/.test(trimmedDate)) correctFormat = 'year-only';
  else if (/^-?\d{1,4}-\d{2}$/.test(trimmedDate)) correctFormat = 'year-month';
  else if (trimmedDate.split("-").length === 3) correctFormat = 'full-date';

  let currentYear = parseInt(selectedEvent.date, 10);
  if (isNaN(currentYear) && selectedEvent.date.includes('-')) {
    currentYear = parseInt(selectedEvent.date.split("-")[0], 10);
  }

  // Find distractors from the entire valid pool of this theme
  if (!isNaN(currentYear)) {
    const nearbyEvents = validEvents
      .filter(e => {
        const tDate = e.date.trim();
        let eFormat = 'other';
        if (/^[IVXLCDM]+$/i.test(tDate)) eFormat = 'century';
        else if (/^(-?\d{1,4})-(\d{3,4})$/.test(tDate)) eFormat = 'range';
        else if (/^-?\d{1,4}$/.test(tDate)) eFormat = 'year-only';
        else if (/^-?\d{1,4}-\d{2}$/.test(tDate)) eFormat = 'year-month';
        else if (tDate.split("-").length === 3) eFormat = 'full-date';

        if (eFormat !== correctFormat) return false;
        return formatDateRO(e.date) !== correctOption;
      })
      .sort((a, b) => {
        let yA = parseInt(a.date, 10);
        if (isNaN(yA) && a.date.includes('-')) yA = parseInt(a.date.split("-")[0], 10);
        let yB = parseInt(b.date, 10);
        if (isNaN(yB) && b.date.includes('-')) yB = parseInt(b.date.split("-")[0], 10);
        return Math.abs(yA - currentYear) - Math.abs(yB - currentYear);
      });




   // Define custom pool sizes depending on how precise the format is
    let poolSize = 40; // Default fallback
    if (correctFormat === 'year-only') {
      poolSize = 12;
    } else if (correctFormat === 'full-date') {
      poolSize = 6;  // Crucial for Academy tests: only looks at the 6 closest dates
    } else if (correctFormat === 'year-month') {
      poolSize = 8;  // Only looks at the 8 closest months
    }

    // Grab the tightly filtered subset of closest historical events
    const closePool = nearbyEvents.slice(0, poolSize);
    


    while (optionsSet.size < 4 && closePool.length > 0) {
      const randomIndex = Math.floor(Math.random() * closePool.length);
      const wrongEvent = closePool.splice(randomIndex, 1)[0];
      const option = formatDateRO(wrongEvent.date);
      if (option) {
        optionsSet.add(option);
      }
    }
  }

  // Fallback 1: Try to pull matching formats from the entire database if the current theme pool is small
  let attempts = 0;
  const globalValidEvents = window.events.filter(e => e.title && e.date);
  while (optionsSet.size < 4 && attempts < 200) {
    const wrongEvent = globalValidEvents[Math.floor(Math.random() * globalValidEvents.length)];
    const tDate = wrongEvent.date.trim();
    let eFormat = 'other';
    if (/^[IVXLCDM]+$/i.test(tDate)) eFormat = 'century';
    else if (/^(-?\d{1,4})-(\d{3,4})$/.test(tDate)) eFormat = 'range';
    else if (/^-?\d{1,4}$/.test(tDate)) eFormat = 'year-only';
    else if (/^-?\d{1,4}-\d{2}$/.test(tDate)) eFormat = 'year-month';
    else if (tDate.split("-").length === 3) eFormat = 'full-date';

    if (eFormat === correctFormat) {
      const option = formatDateRO(wrongEvent.date);
      if (option) {
        optionsSet.add(option);
      }
    }
    attempts++;
  }

  // Fallback 2: Extreme fallback
  while (optionsSet.size < 4) {
    const wrongEvent = globalValidEvents[Math.floor(Math.random() * globalValidEvents.length)];
    optionsSet.add(formatDateRO(wrongEvent.date));
  }

  // Convert set to array and shuffle
  quizState.options = Array.from(optionsSet);
  shuffleArray(quizState.options);

  // 3. Render buttons
  quizState.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(btn, opt, correctOption));
    quizOptionsContainer.appendChild(btn);
  });
}

function handleQuizAnswer(selectedBtn, selectedOption, correctOption) {
  // Disable all option buttons
  const buttons = quizOptionsContainer.querySelectorAll(".quiz-option-btn");
  buttons.forEach(btn => btn.disabled = true);

  quizState.totalQuestions++;
  const isCorrect = (selectedOption === correctOption);
  const currentKey = getEventKey(quizState.currentEvent);
  const currentLvl = srsState[currentKey] || 0;

  if (isCorrect) {
    quizState.score++;
    selectedBtn.classList.add("correct");
    
    // Correct answer: increment Leitner box up to level 5
    srsState[currentKey] = Math.min(5, currentLvl + 1);
    saveSRSState();

    quizFeedbackText.innerHTML = `<strong>Corect!</strong> Evenimentul a avut loc în: <strong>${correctOption}</strong>.`;
    quizFeedbackDiv.className = "quiz-feedback success";
  } else {
    selectedBtn.classList.add("wrong");
    // Find and highlight correct button
    buttons.forEach(btn => {
      if (btn.textContent === correctOption) {
        btn.classList.add("correct");
      }
    });

    // Incorrect answer: reset Leitner box to 0
    srsState[currentKey] = 0;
    saveSRSState();

    quizFeedbackText.innerHTML = `<strong>Incorect.</strong> Răspunsul corect este <strong>${correctOption}</strong>. Ai selectat ${selectedOption}.`;
    quizFeedbackDiv.className = "quiz-feedback error";
  }

  // Append full description for learning value
  if (quizState.currentEvent.info) {
    quizFeedbackText.innerHTML += `<br><br><em>Informații suplimentare:</em><br>${quizState.currentEvent.info}`;
  }

  quizScoreText.textContent = `Scor: ${quizState.score}/${quizState.totalQuestions}`;
  quizFeedbackDiv.classList.remove("hidden");
  updateSRSDashboard();
}

btnNextQuestion.addEventListener("click", loadNextQuizQuestion);

if (btnResetSRS) {
  btnResetSRS.addEventListener("click", () => {
    if (confirm("Sigur dorești să resetezi întregul progres de memorare? Toate nivelele de învățare vor fi resetate la 0.")) {
      srsState = {};
      saveSRSState();
      recentQuestionsQueue = [];
      updateSRSDashboard();
      loadNextQuizQuestion();
    }
  });
}

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ----------------------------------------------------
// APP INITIALIZATION
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Normalize missing properties at startup (for manual additions)
  if (window.events) {
    window.events.forEach(e => {
      if (e) {
        if (e.isCentury === undefined) {
          e.isCentury = /^[IVXLCDM]+$/i.test(e.date || "");
        }
        if (e.isRange === undefined) {
          e.isRange = /^\d{1,4}-\d{3,4}$/.test(e.date || "");
        }
      }
    });
  }

  renderTimeline();
});
// Funcție ajutătoare pentru a extrage doar anul din string-ul datei
function getYearOnly(dateStr) {
  if (!dateStr) return '';
  
  // Dacă este un secol (ex: "Secolul XIV") sau conține litere, îl lăsăm așa
  if (/[a-zA-Z]/.test(dateStr)) return dateStr;
  
  // Separăm după cratimă (ex: "2007-01-01" devine ["2007", "01", "01"])
  const parts = dateStr.split('-');
  
  // Dacă anul este negativ (ex: "-514"), prima parte din split va fi goală ""
  if (dateStr.startsWith('-')) {
    return `-${parts[1]}`;
  }
  
  return parts[0]; // Returnează doar primul element (anul, ex: "2007")
}