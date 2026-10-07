(function () {
  "use strict";

  const storageKey = "molMo1CampaignTrackerV1";
  const allowedTypes = new Set(["Battle", "Trade", "Event", "Discovery", "Diplomacy", "Goal", "Other"]);
  const state = { entries: [], search: "", type: "all" };
  const $ = (selector) => document.querySelector(selector);
  const clean = (value, max) => String(value || "").trim().slice(0, max);

  function cleanEntry(value) {
    if (!value || typeof value !== "object") return null;
    const title = clean(value.title, 100);
    const result = clean(value.result, 600);
    if (!title || !result || !/^\d{4}-\d{2}-\d{2}$/.test(String(value.date || ""))) return null;
    return { id: clean(value.id || `${Date.now()}-${Math.random()}`, 100), date: value.date, type: allowedTypes.has(value.type) ? value.type : "Other", title, place: clean(value.place, 100), result, next: clean(value.next, 300) };
  }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ entries: state.entries })); return true; }
    catch (_) { $("#backup-status").textContent = "This browser blocked the local save. Download a JSON backup."; return false; }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      state.entries = saved && Array.isArray(saved.entries) ? saved.entries.map(cleanEntry).filter(Boolean).slice(0, 1000) : [];
    } catch (_) { state.entries = []; }
  }

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function visibleEntries() {
    const query = state.search.toLowerCase();
    return [...state.entries].sort((a, b) => b.date.localeCompare(a.date)).filter((entry) => {
      const typeMatch = state.type === "all" || entry.type === state.type;
      const text = `${entry.title} ${entry.place} ${entry.result} ${entry.next}`.toLowerCase();
      return typeMatch && (!query || text.includes(query));
    });
  }

  function render() {
    const entries = visibleEntries();
    $("#entry-count").textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
    const list = $("#campaign-list");
    list.replaceChildren();
    if (!entries.length) { list.append(make("p", "empty-state", "No matching entries.")); return; }
    entries.forEach((entry) => {
      const card = make("article", "campaign-entry");
      const head = make("div", "campaign-entry-head");
      const title = make("div");
      title.append(make("strong", "", entry.title), make("small", "", `${entry.date} / ${entry.type}${entry.place ? ` / ${entry.place}` : ""}`));
      const remove = make("button", "text-button", "Remove");
      remove.type = "button";
      remove.addEventListener("click", () => { state.entries = state.entries.filter((item) => item.id !== entry.id); save(); render(); });
      head.append(title, remove);
      card.append(head, make("p", "", entry.result));
      if (entry.next) card.append(make("p", "next-step", `Next: ${entry.next}`));
      list.append(card);
    });
  }

  function snapshot() { return JSON.stringify({ version: 1, game: "Mortal Online 1", entries: state.entries }, null, 2); }
  function csvCell(value) { return `"${String(value || "").replace(/"/g, '""')}"`; }
  function csv() { return ["Date,Type,Title,Place,Result,Next step", ...state.entries.map((entry) => [entry.date, entry.type, entry.title, entry.place, entry.result, entry.next].map(csvCell).join(","))].join("\n"); }
  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.entries)) throw new Error("bad file");
      state.entries = parsed.entries.map(cleanEntry).filter(Boolean).slice(0, 1000);
      save();
      render();
      $("#backup-status").textContent = "Campaign log imported.";
    } catch (_) { $("#backup-status").textContent = "That file is not a valid Campaign Tracker backup."; }
  }

  load();
  $("#entry-date").value = new Date().toISOString().slice(0, 10);
  $("#entry-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const entry = cleanEntry({ id: `${Date.now()}-${Math.random()}`, date: $("#entry-date").value, type: $("#entry-type").value, title: $("#entry-title-field").value, place: $("#entry-place").value, result: $("#entry-result").value, next: $("#entry-next").value });
    if (!entry) return;
    state.entries.push(entry);
    save();
    render();
    event.target.reset();
    $("#entry-date").value = new Date().toISOString().slice(0, 10);
    $("#form-status").textContent = `${entry.title} added.`;
    $("#entry-title-field").focus();
  });
  $("#entry-search").addEventListener("input", (event) => { state.search = event.target.value.trim(); render(); });
  $("#type-filter").addEventListener("change", (event) => { state.type = event.target.value; render(); });
  $("#download-json").addEventListener("click", () => download("mo1-campaign-log.json", snapshot(), "application/json"));
  $("#download-csv").addEventListener("click", () => download("mo1-campaign-log.csv", csv(), "text/csv"));
  $("#import-json").addEventListener("change", (event) => { const [file] = event.target.files; if (file) importFile(file); event.target.value = ""; });
  $("#clear-log").addEventListener("click", () => { if (!state.entries.length || !window.confirm("Clear every campaign entry?")) return; state.entries = []; save(); render(); });
  render();
}());
