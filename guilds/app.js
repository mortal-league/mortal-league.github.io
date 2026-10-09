(function () {
  "use strict";

  const DIRECTORY_URL = "./guilds.json";
  const STORAGE_KEY = "mortal-league-guild-application-v1";
  const directory = document.querySelector("#guild-directory");
  const count = document.querySelector("#directory-count");
  const search = document.querySelector("#guild-search");
  const gameFilter = document.querySelector("#game-filter");
  const continentFilter = document.querySelector("#continent-filter");
  const focusFilter = document.querySelector("#focus-filter");
  const form = document.querySelector("#guild-application");
  const targetGuild = document.querySelector("#target-guild");
  const result = document.querySelector("#application-result");
  const output = document.querySelector("#application-text");
  const status = document.querySelector("#application-status");
  let guilds = [];

  function text(value) {
    return String(value || "").trim();
  }

  function matches(guild) {
    const query = text(search.value).toLowerCase();
    const haystack = [guild.name, guild.description, guild.language, guild.focus, guild.timezone].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) &&
      (!gameFilter.value || guild.game === gameFilter.value) &&
      (!continentFilter.value || guild.continent === continentFilter.value || guild.continent === "Both") &&
      (!focusFilter.value || (guild.focus || []).includes(focusFilter.value));
  }

  function renderDirectory() {
    const visible = guilds.filter(matches);
    count.textContent = String(visible.length);
    directory.replaceChildren();

    if (!visible.length) {
      const empty = document.createElement("div");
      empty.className = "empty-directory";
      const heading = document.createElement("h3");
      heading.textContent = guilds.length ? "No guild matches these filters" : "No guild listings have been published yet";
      const copy = document.createElement("p");
      copy.textContent = guilds.length ? "Change one filter and try again." : "The directory is ready. Listings open after guild registration and the shared database pass their launch checks.";
      empty.append(heading, copy);
      directory.append(empty);
      return;
    }

    visible.forEach((guild) => {
      const card = document.createElement("article");
      card.className = "guild-card";
      const code = document.createElement("span");
      code.className = "feature-code";
      code.textContent = `${guild.game} / ${guild.continent}`;
      const title = document.createElement("h3");
      title.textContent = guild.name;
      const description = document.createElement("p");
      description.textContent = guild.description;
      const details = document.createElement("dl");
      [["Focus", (guild.focus || []).join(", ")], ["Time zone", guild.timezone], ["Language", guild.language], ["New players", guild.newPlayers ? "Welcome" : "Requirements apply"]].forEach(([label, value]) => {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label;
        dd.textContent = value;
        details.append(dt, dd);
      });
      const apply = document.createElement("a");
      apply.className = "secondary-button";
      apply.href = "#apply";
      apply.textContent = "Prepare application";
      apply.addEventListener("click", () => { targetGuild.value = guild.name; saveForm(); });
      card.append(code, title, description, details, apply);
      directory.append(card);
    });
  }

  function formObject() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function saveForm() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formObject()));
    status.textContent = "Draft saved on this device.";
  }

  function restoreForm() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      Object.entries(saved).forEach(([name, value]) => {
        const control = form.elements.namedItem(name);
        if (!control) return;
        if (control.type === "checkbox") control.checked = value === "on";
        else control.value = value;
      });
      status.textContent = "Local draft restored.";
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function buildApplication(data) {
    return [
      "PRIVATE GUILD APPLICATION DRAFT",
      "This draft was created on the applicant's device. Mortal League did not send it.",
      "",
      `Guild: ${text(data.guild)}`,
      `Chosen character name: ${text(data.character)}`,
      `Game: ${text(data.game)}`,
      `Continent: ${text(data.continent)}`,
      `Time zone: ${text(data.timezone)}`,
      `Usual playtimes: ${text(data.schedule)}`,
      `Preferred roles or builds: ${text(data.roles) || "Not provided"}`,
      `Experience: ${text(data.experience)}`,
      "",
      "What I want from a guild:",
      text(data.goals),
      "",
      "Introduction:",
      text(data.introduction),
      "",
      "Age confirmation: Applicant stated they are at least 18.",
      "Public-roster consent: Separate confirmation is still required after acceptance."
    ].join("\n");
  }

  function download(filename, content) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  [search, gameFilter, continentFilter, focusFilter].forEach((control) => control.addEventListener("input", renderDirectory));
  form.addEventListener("input", saveForm);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const application = buildApplication(formObject());
    output.textContent = application;
    result.hidden = false;
    status.textContent = "Private draft created. Nothing was sent.";
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#clear-application").addEventListener("click", () => {
    form.reset();
    localStorage.removeItem(STORAGE_KEY);
    result.hidden = true;
    output.textContent = "";
    status.textContent = "Local draft cleared.";
  });
  document.querySelector("#copy-application").addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    status.textContent = "Draft copied.";
  });
  document.querySelector("#download-application").addEventListener("click", () => download("mortal-league-guild-application.txt", output.textContent));

  restoreForm();
  fetch(DIRECTORY_URL)
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("Directory unavailable")))
    .then((data) => { guilds = Array.isArray(data.guilds) ? data.guilds : []; renderDirectory(); })
    .catch(() => { guilds = []; renderDirectory(); });
})();
