(function () {
  "use strict";

  const storageKey = "molMo1SkillPlannerV1";
  const allowedTypes = new Set(["Primary", "Secondary", "Deva"]);
  const allowedCategories = new Set(["Action", "Learning", "World", "Crafting", "Combat", "Other"]);
  const state = { budget: 1000, skills: [] };
  const $ = (selector) => document.querySelector(selector);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const format = (value) => new Intl.NumberFormat("en-US").format(value);

  function cleanSkill(value) {
    if (!value || typeof value !== "object") return null;
    const name = String(value.name || "").trim().slice(0, 80);
    if (!name) return null;
    return {
      id: String(value.id || `${Date.now()}-${Math.random()}`).slice(0, 100),
      name,
      type: allowedTypes.has(value.type) ? value.type : "Primary",
      category: allowedCategories.has(value.category) ? value.category : "Other",
      current: clamp(value.current, 0, 100),
      target: clamp(value.target, 0, 100),
    };
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    } catch (_) {
      $("#backup-status").textContent = "This browser blocked the local save. Download a JSON backup.";
      return false;
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || typeof saved !== "object") return;
      state.budget = clamp(saved.budget || 1000, 0, 5000);
      state.skills = Array.isArray(saved.skills) ? saved.skills.map(cleanSkill).filter(Boolean).slice(0, 500) : [];
    } catch (_) {
      state.skills = [];
    }
  }

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function numberField(label, value, skill, key) {
    const wrapper = make("label", "inline-field");
    wrapper.append(make("span", "", label));
    const input = make("input");
    input.type = "number";
    input.min = "0";
    input.max = "100";
    input.value = String(value);
    input.addEventListener("change", () => {
      skill[key] = clamp(input.value, 0, 100);
      input.value = String(skill[key]);
      save();
      renderTotals();
    });
    wrapper.append(input);
    return wrapper;
  }

  function renderTotals() {
    const primary = state.skills.filter((skill) => skill.type === "Primary");
    const current = primary.reduce((sum, skill) => sum + skill.current, 0);
    const target = primary.reduce((sum, skill) => sum + skill.target, 0);
    $("#current-total").textContent = format(current);
    $("#target-total").textContent = format(target);
    $("#remaining-total").textContent = format(state.budget - target);
    $("#remaining-total").closest(".receipt-stat").classList.toggle("over-budget", target > state.budget);
  }

  function renderSkills() {
    const list = $("#skill-list");
    list.replaceChildren();
    if (!state.skills.length) {
      list.append(make("p", "empty-state", "No skills added."));
      renderTotals();
      return;
    }
    state.skills.forEach((skill) => {
      const row = make("article", "skill-row");
      const info = make("div", "skill-info");
      info.append(make("strong", "", skill.name), make("small", "", `${skill.type} / ${skill.category}`));
      const fields = make("div", "skill-points");
      fields.append(numberField("Current", skill.current, skill, "current"), numberField("Target", skill.target, skill, "target"));
      const remove = make("button", "text-button", "Remove");
      remove.type = "button";
      remove.addEventListener("click", () => {
        state.skills = state.skills.filter((item) => item.id !== skill.id);
        save();
        renderSkills();
      });
      row.append(info, fields, remove);
      list.append(row);
    });
    renderTotals();
  }

  function snapshot() {
    return JSON.stringify({ version: 1, game: "Mortal Online 1", budget: state.budget, skills: state.skills }, null, 2);
  }

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
      if (!parsed || !Array.isArray(parsed.skills)) throw new Error("bad file");
      state.budget = clamp(parsed.budget || 1000, 0, 5000);
      state.skills = parsed.skills.map(cleanSkill).filter(Boolean).slice(0, 500);
      $("#point-budget").value = String(state.budget);
      save();
      renderSkills();
      $("#backup-status").textContent = "Build imported.";
    } catch (_) {
      $("#backup-status").textContent = "That file is not a valid Skill Planner backup.";
    }
  }

  load();
  $("#point-budget").value = String(state.budget);
  $("#point-budget").addEventListener("change", (event) => {
    state.budget = clamp(event.target.value, 0, 5000);
    event.target.value = String(state.budget);
    save();
    renderTotals();
  });
  $("#skill-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const skill = cleanSkill({ id: `${Date.now()}-${Math.random()}`, name: $("#skill-name").value, type: $("#skill-type").value, category: $("#skill-category").value, current: $("#skill-current").value, target: $("#skill-target").value });
    if (!skill) return;
    state.skills.push(skill);
    save();
    renderSkills();
    event.target.reset();
    $("#skill-current").value = "0";
    $("#skill-target").value = "100";
    $("#form-status").textContent = `${skill.name} added.`;
    $("#skill-name").focus();
  });
  $("#clear-skills").addEventListener("click", () => {
    if (!state.skills.length || !window.confirm("Clear every skill in this build?")) return;
    state.skills = [];
    save();
    renderSkills();
  });
  $("#copy-build").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(snapshot()); $("#backup-status").textContent = "Build copied."; }
    catch (_) { $("#backup-status").textContent = "Copy was blocked. Use Download JSON."; }
  });
  $("#download-build").addEventListener("click", () => download("mo1-skill-build.json", snapshot(), "application/json"));
  $("#import-build").addEventListener("change", (event) => { const [file] = event.target.files; if (file) importFile(file); event.target.value = ""; });
  renderSkills();
}());
