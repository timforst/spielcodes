let pinDict = {};
let codeDict = {};
let nameDict = {};
let listOfNames = [];

let allEvents = [];       // flat list of every game across all teams
let eventsByDay = {};     // "YYYY-MM-DD" -> array of events

let excludedTeams = new Set();     // teamKey (fullName) currently hidden from the calendar
let tempExcludedTeams = new Set(); // working copy while the selection modal is open

let viewYear;
let viewMonth; // 0-indexed

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_LABELS = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
];
const MAX_CHIPS_PER_DAY = 5;

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();

    if (localStorage.getItem("listOfNames")) {
        pinDict = JSON.parse(localStorage.getItem("pinDict")) || {};
        codeDict = JSON.parse(localStorage.getItem("codeDict")) || {};
        nameDict = JSON.parse(localStorage.getItem("nameDict")) || {};
        listOfNames = JSON.parse(localStorage.getItem("listOfNames")) || [];
    }

    if (localStorage.getItem("calendarExcludedTeams")) {
        try {
            excludedTeams = new Set(JSON.parse(localStorage.getItem("calendarExcludedTeams")));
        } catch (e) {
            excludedTeams = new Set();
        }
    }

    if (listOfNames.length === 0) {
        document.getElementById("empty-state").style.display = "block";
        document.getElementById("calendar-wrapper").style.display = "none";
        document.getElementById("team-select-row").style.display = "none";
        return;
    }

    refreshEvents();
});

function refreshEvents() {
    allEvents = buildEvents();
    eventsByDay = groupEventsByDay(allEvents);
    renderCalendar();
}

// ---- Data parsing --------------------------------------------------------

function parseDate(dateStr) {
    // Expected format: "DD.MM.YYYY" (matches notPastDate() in codes.js).
    // Falls back gracefully if the year is missing or 2-digit.
    const parts = dateStr.split(".").filter(p => p.length > 0);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year;
    if (parts.length >= 3) {
        year = parseInt(parts[2], 10);
        if (parts[2].length === 2) year += 2000;
    } else {
        year = new Date().getFullYear();
    }
    return new Date(year, month - 1, day);
}

function dayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Builds one flat event per game across every team, pulling in the
// matching game code the same way codes.js does (codes only exist for
// home games, matched in order via a running counter).
function buildEvents() {
    const events = [];
    for (const fullName of listOfNames) {
        if (excludedTeams.has(fullName)) continue;
        const pins = pinDict[fullName];
        if (!pins) continue;
        const [dates, pinList, gegnerList, heimList] = pins;
        const codes = codeDict[fullName];
        let j = 0;
        for (let i = 0; i < dates.length; i++) {
            const heim = !!heimList[i];
            let code = null;
            if (heim) {
                code = codes && codes[0] ? codes[0][j] : null;
                j += 1;
            }
            const date = parseDate(dates[i]);
            if (isNaN(date.getTime())) continue;
            events.push({
                dateStr: dates[i],
                date: date,
                teamKey: fullName,
                teamName: nameDict[fullName] || fullName,
                gegner: gegnerList[i],
                heim: heim,
                pin: pinList[i],
                code: code,
            });
        }
    }
    return events;
}

function groupEventsByDay(events) {
    const map = {};
    for (const ev of events) {
        const key = dayKey(ev.date);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
    }
    for (const key in map) {
        map[key].sort((a, b) => {
            if (a.heim !== b.heim) return a.heim ? -1 : 1;
            return a.teamName.localeCompare(b.teamName);
        });
    }
    return map;
}

// ---- Rendering ------------------------------------------------------------

function renderCalendar() {
    document.getElementById("month-label").textContent =
        `${MONTH_LABELS[viewMonth]} ${viewYear}`;

    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";

    for (const label of WEEKDAY_LABELS) {
        const el = document.createElement("div");
        el.className = "weekday-label";
        el.textContent = label;
        grid.appendChild(el);
    }

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekdayIndex = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const today = new Date();
    const todayKey = dayKey(today);

    for (let i = 0; i < firstWeekdayIndex; i++) {
        const el = document.createElement("div");
        el.className = "day-cell empty";
        grid.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(viewYear, viewMonth, day);
        const key = dayKey(cellDate);
        const cell = document.createElement("div");
        cell.className = "day-cell" + (key === todayKey ? " today" : "");

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = String(day);
        cell.appendChild(dayNumber);

        const dayEvents = eventsByDay[key] || [];
        const visibleEvents = dayEvents.slice(0, MAX_CHIPS_PER_DAY);
        const overflowCount = dayEvents.length - visibleEvents.length;
        // Leave room for the "+N more" chip if there's overflow.
        const shown = overflowCount > 0
            ? dayEvents.slice(0, MAX_CHIPS_PER_DAY - 1)
            : visibleEvents;

        for (const ev of shown) {
            cell.appendChild(makeGameChip(ev));
        }

        if (overflowCount > 0) {
            const remaining = dayEvents.length - shown.length;
            const moreChip = document.createElement("div");
            moreChip.className = "game-chip more";
            moreChip.textContent = `+${remaining} mehr`;
            moreChip.onclick = () => openDayModal(cellDate, dayEvents);
            cell.appendChild(moreChip);
        }

        grid.appendChild(cell);
    }

    const totalCells = firstWeekdayIndex + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
        const el = document.createElement("div");
        el.className = "day-cell empty";
        grid.appendChild(el);
    }
}

function makeGameChip(ev) {
    const chip = document.createElement("div");
    chip.className = "game-chip" + (ev.heim ? " heim" : "");
    chip.textContent = `${ev.teamName}: ${ev.gegner}`;
    chip.title = `${ev.teamName} ${ev.heim ? "vs" : "bei"} ${ev.gegner} (${ev.dateStr})`;
    chip.onclick = () => openGameModal(ev);
    return chip;
}

// ---- Month navigation -------------------------------------------------

function changeMonth(delta) {
    viewMonth += delta;
    if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
    } else if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
    }
    renderCalendar();
}

function goToday() {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    renderCalendar();
}

// ---- Modals -------------------------------------------------------------

function openGameModal(ev) {
    document.getElementById("game-modal-team").textContent = ev.teamName;
    const details = ev.heim
        ? `Heimspiel gegen ${ev.gegner} – ${ev.dateStr}`
        : `Auswärtsspiel bei ${ev.gegner} – ${ev.dateStr}`;
    document.getElementById("game-modal-details").textContent = details;

    const buttonsContainer = document.getElementById("game-modal-buttons");
    buttonsContainer.innerHTML = "";
    addCodeButton(buttonsContainer, ev.gegner, ev.dateStr, ev.code, ev.heim);
    addPinButton(buttonsContainer, ev.pin, ev.heim);

    document.getElementById("gameModal").style.display = "flex";
}

function closeGameModal() {
    document.getElementById("gameModal").style.display = "none";
}

function openDayModal(date, dayEvents) {
    const dateLabel = date.toLocaleDateString("de-DE", {
        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
    });
    document.getElementById("day-modal-title").textContent = dateLabel;

    const list = document.getElementById("day-modal-list");
    list.innerHTML = "";
    for (const ev of dayEvents) {
        addCodeButton(list, `${ev.teamName}: ${ev.gegner}`, ev.dateStr, ev.code, ev.heim);
        addPinButton(list, ev.pin, ev.heim);
    }

    document.getElementById("dayModal").style.display = "flex";
}

function closeDayModal() {
    document.getElementById("dayModal").style.display = "none";
}

// ---- Buttons (mirrors scripts/codes.js so behavior stays consistent) ------

function addCodeButton(buttonsContainer, gegner, date, link = null, heimspiel = false) {
    const button = document.createElement("button");
    const baseUrl = "https://ttde-apps.liga.nu/nuliga/nuscore-tt/meetings-list?gamecode=";
    button.innerHTML = `${gegner}<br>${date}`;
    if (heimspiel) {
        button.style.backgroundColor = "#50b36d";
    }
    if (link) {
        button.onclick = () => openLink(`${baseUrl}${link}`);
    } else {
        button.onclick = () => copyText("Auswärtsspiel");
    }
    buttonsContainer.appendChild(button);
}

function addPinButton(buttonsContainer, text, heimspiel = false) {
    const button = document.createElement("button");
    button.innerHTML = text;
    if (heimspiel) {
        button.style.backgroundColor = "#50b36d";
    }
    button.onclick = () => copyText(text);
    buttonsContainer.appendChild(button);
}

// ---- Team selection ----------------------------------------------------

function openTeamSelectModal() {
    tempExcludedTeams = new Set(excludedTeams);
    renderTeamSelectButtons();
    document.getElementById("teamSelectModal").style.display = "flex";
}

function renderTeamSelectButtons() {
    const container = document.getElementById("team-select-buttons");
    container.innerHTML = "";
    for (const fullName of listOfNames) {
        const btn = document.createElement("button");
        btn.textContent = nameDict[fullName] || fullName;
        setTeamButtonExcluded(btn, tempExcludedTeams.has(fullName));
        btn.onclick = () => {
            if (tempExcludedTeams.has(fullName)) {
                tempExcludedTeams.delete(fullName);
            } else {
                tempExcludedTeams.add(fullName);
            }
            setTeamButtonExcluded(btn, tempExcludedTeams.has(fullName));
        };
        container.appendChild(btn);
    }
}

function setTeamButtonExcluded(btn, excluded) {
    btn.classList.toggle("excluded", excluded);
}

function includeAllTeamsTemp() {
    tempExcludedTeams.clear();
    renderTeamSelectButtons();
}

function excludeAllTeamsTemp() {
    tempExcludedTeams = new Set(listOfNames);
    renderTeamSelectButtons();
}

function confirmTeamSelection() {
    excludedTeams = new Set(tempExcludedTeams);
    localStorage.setItem("calendarExcludedTeams", JSON.stringify(Array.from(excludedTeams)));
    document.getElementById("teamSelectModal").style.display = "none";
    refreshEvents();
}

function discardTeamSelection() {
    // tempExcludedTeams is simply thrown away; excludedTeams stays as it was.
    document.getElementById("teamSelectModal").style.display = "none";
}

function openLink(url) {
    window.open(url, "_blank");
}

function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error("Error copying text:", err);
    });
}
