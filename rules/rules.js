(function () {
  "use strict";

  const sourceUrl = "./mortal-league-beta-rulebook-v1.0.txt";
  const content = document.getElementById("rulebook-content");
  const search = document.getElementById("rule-search");
  const resultCount = document.getElementById("result-count");
  const noResults = document.createElement("section");
  let activeFilter = "all";
  let beforePrintState = [];

  const parts = {
    "Part One": { id: "settled-rules", number: "01", title: "Settled project rules", kind: "settled" },
    "Part Two": { id: "adopted-parameters", number: "02", title: "Set terms for Mortal League Beta", kind: "adopted" },
    "Part Three": { id: "operating-rules", number: "03", title: "Mortal League Beta rules", kind: "operating" },
    "Part Four": { id: "decisions", number: "04", title: "League decisions", kind: "decision" },
    "Part Five": { id: "star-vault-questions", number: "05", title: "Questions requiring a Star Vault answer", kind: "publisher" },
    "Part Six": { id: "research-basis", number: "06", title: "Research basis", kind: "research" },
    "Part Seven": { id: "launch-gates", number: "07", title: "Launch readiness and independence checks", kind: "blocker" },
  };

  const kindLabels = {
    settled: "Settled",
    adopted: "Set term",
    operating: "Season rule",
    decision: "League decision",
    publisher: "Star Vault",
    research: "Research basis",
    blocker: "Launch gate",
  };

  noResults.className = "no-results";
  noResults.hidden = true;
  noResults.innerHTML = "<h2>No matching rule</h2><p>Change the section filter or search for another term.</p>";

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatBody(value) {
    return value
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((sentence) => `<p>${escapeHtml(sentence)}</p>`)
      .join("");
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90);
  }

  function parseEntry(paragraph, defaultKind, index) {
    const colon = paragraph.indexOf(":");
    const hasHeading = colon >= 0 && colon < 120 && !paragraph.slice(0, colon).includes("http");
    const heading = hasHeading ? paragraph.slice(0, colon).trim() : `Rulebook note ${index}`;
    const body = hasHeading ? paragraph.slice(colon + 1).trim() : paragraph.trim();
    let kind = defaultKind;
    let number = "Note";
    let title = heading;
    let contextual = false;

    const patterns = [
      { regex: /^Settled Rule (\d+),\s*(.+)$/i, kind: "settled", label: "Rule" },
      { regex: /^Adopted Parameter (\d+),\s*(.+)$/i, kind: "adopted", label: "Parameter" },
      { regex: /^Beta Rule (\d+),\s*(.+)$/i, kind: "operating", label: "Rule" },
      { regex: /^Decision (\d+),\s*(.+)$/i, kind: "decision", label: "Decision" },
      { regex: /^Star Vault Question (\d+),\s*(.+)$/i, kind: "publisher", label: "Question" },
      { regex: /^Required Star Vault Decision (\d+),\s*(.+)$/i, kind: "blocker", label: "SV decision" },
    ];

    for (const pattern of patterns) {
      const match = heading.match(pattern.regex);
      if (match) {
        kind = pattern.kind;
        number = `${pattern.label} ${match[1]}`;
        title = match[2];
        break;
      }
    }

    if (number === "Note") {
      contextual = true;
      title = heading;
    }

    return {
      kind,
      number,
      title,
      body,
      contextual,
      id: slugify(`${heading}-${index}`),
      searchText: `${heading} ${body}`.toLowerCase(),
    };
  }

  function createEntry(entry) {
    const details = document.createElement("details");
    details.className = `rule-card${entry.contextual ? " context-card" : ""}`;
    details.dataset.kind = entry.kind;
    details.dataset.search = entry.searchText;
    details.id = entry.id;
    if (entry.contextual) details.open = true;

    const tag = entry.contextual
      ? ""
      : `<span class="rule-tag ${entry.kind}">${escapeHtml(entry.number)}</span>`;

    details.innerHTML = `
      <summary>
        ${tag}
        <span class="rule-heading">
          <strong>${escapeHtml(entry.title)}</strong>
          <small>${escapeHtml(kindLabels[entry.kind])}</small>
        </span>
      </summary>
      <div class="rule-body">
        ${formatBody(entry.body)}
        <a class="rule-link" href="#${entry.id}" aria-label="Link to ${escapeHtml(entry.title)}">Copyable rule link</a>
      </div>
    `;

    return details;
  }

  function renderRulebook(text) {
    const paragraphs = text
      .replace(/\r/g, "")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);

    content.innerHTML = "";
    let section = null;
    let sectionBody = null;
    let currentPart = null;
    let entryIndex = 0;
    const counts = { settled: 0, adopted: 0, operating: 0, decision: 0, publisher: 0, research: 0, blocker: 0 };

    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraphIndex === 0 && paragraph === "Mortal League Beta Rulebook Version 1.0") return;
      if (paragraph.startsWith("Document status:")) return;

      const partKey = Object.keys(parts).find((key) => paragraph.startsWith(`${key}:`));
      if (partKey) {
        currentPart = parts[partKey];
        section = document.createElement("section");
        section.className = "rule-section";
        section.id = currentPart.id;
        section.dataset.kind = currentPart.kind;
        section.innerHTML = `
          <header class="section-title">
            <span class="section-number">${currentPart.number}</span>
            <h2>${escapeHtml(currentPart.title)}</h2>
            <span class="section-count" data-section-count>0 entries</span>
          </header>
        `;
        sectionBody = document.createElement("div");
        sectionBody.className = "section-body";
        section.appendChild(sectionBody);
        content.appendChild(section);
        return;
      }

      if (!section || !currentPart) return;
      entryIndex += 1;
      const entry = parseEntry(paragraph, currentPart.kind, entryIndex);
      counts[entry.kind] += entry.contextual ? 0 : 1;
      sectionBody.appendChild(createEntry(entry));
    });

    document.querySelectorAll(".rule-section").forEach((ruleSection) => {
      const count = ruleSection.querySelectorAll(".rule-card").length;
      const label = count === 1 ? "entry" : "entries";
      ruleSection.querySelector("[data-section-count]").textContent = `${count} ${label}`;
    });

    document.getElementById("count-settled").textContent = counts.settled;
    document.getElementById("count-adopted").textContent = counts.adopted;
    document.getElementById("count-decisions").textContent = counts.decision;
    document.getElementById("count-publisher").textContent = counts.publisher;
    content.appendChild(noResults);
    content.setAttribute("aria-busy", "false");
    applyView();
    openDeepLink();
  }

  function applyView() {
    const query = search.value.trim().toLowerCase();
    const entries = Array.from(document.querySelectorAll(".rule-card"));
    let visible = 0;

    entries.forEach((entry) => {
      const sectionMatch = activeFilter === "all" || entry.dataset.kind === activeFilter;
      const searchMatch = !query || entry.dataset.search.includes(query);
      const show = sectionMatch && searchMatch;
      entry.hidden = !show;
      if (show) {
        visible += 1;
        if (query) entry.open = true;
      }
    });

    document.querySelectorAll(".rule-section").forEach((ruleSection) => {
      ruleSection.hidden = !Array.from(ruleSection.querySelectorAll(".rule-card")).some((entry) => !entry.hidden);
    });

    noResults.hidden = visible !== 0;
    const label = visible === 1 ? "entry" : "entries";
    resultCount.textContent = `${visible} ${label} visible`;
  }

  function openDeepLink() {
    if (!window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (target && target.matches("details")) target.open = true;
  }

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
      applyView();
    });
  });

  search.addEventListener("input", applyView);

  document.getElementById("expand-visible").addEventListener("click", () => {
    document.querySelectorAll(".rule-card:not([hidden])").forEach((entry) => { entry.open = true; });
  });

  document.getElementById("collapse-visible").addEventListener("click", () => {
    document.querySelectorAll(".rule-card:not([hidden])").forEach((entry) => { entry.open = false; });
  });

  document.getElementById("print-rulebook").addEventListener("click", () => window.print());

  window.addEventListener("hashchange", openDeepLink);

  window.addEventListener("beforeprint", () => {
    const entries = Array.from(document.querySelectorAll(".rule-card"));
    beforePrintState = entries.map((entry) => entry.open);
    entries.forEach((entry) => { entry.open = true; });
  });

  window.addEventListener("afterprint", () => {
    document.querySelectorAll(".rule-card").forEach((entry, index) => {
      entry.open = beforePrintState[index] || false;
    });
  });

  fetch(sourceUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Rulebook request failed with ${response.status}`);
      return response.text();
    })
    .then(renderRulebook)
    .catch(() => {
      content.setAttribute("aria-busy", "false");
      content.innerHTML = `
        <section class="load-error">
          <h2>The rulebook did not load.</h2>
          <p>Download the plain-text edition above while this page is repaired.</p>
        </section>
      `;
      resultCount.textContent = "Rulebook unavailable";
    });
})();
