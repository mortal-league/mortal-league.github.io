(function () {
  "use strict";

  const grid = document.querySelector("#issue-grid");
  const search = document.querySelector("#archive-search");
  const topic = document.querySelector("#archive-topic");
  const status = document.querySelector("#archive-status");
  let issues = [];

  function clean(value) {
    return String(value || "").trim();
  }

  function visibleIssues() {
    const query = clean(search.value).toLowerCase();
    return issues
      .filter((issue) => {
        const topics = Array.isArray(issue.topics) ? issue.topics : [];
        const haystack = `${issue.title} ${issue.summary} ${topics.join(" ")}`.toLowerCase();
        return (!query || haystack.includes(query)) && (!topic.value || topics.includes(topic.value));
      })
      .sort((a, b) => Number(b.number) - Number(a.number));
  }

  function createIssueCard(issue) {
    const card = document.createElement("article");
    card.className = "issue-card";
    const number = document.createElement("span");
    number.className = "issue-card-number";
    number.textContent = String(issue.number).padStart(3, "0");
    const date = document.createElement("p");
    date.className = "eyebrow";
    date.textContent = clean(issue.date);
    const title = document.createElement("h3");
    title.textContent = clean(issue.title);
    const summary = document.createElement("p");
    summary.textContent = clean(issue.summary);
    const link = document.createElement("a");
    link.href = clean(issue.url);
    link.textContent = `Read Issue ${String(issue.number).padStart(3, "0")}`;
    card.append(number, date, title, summary, link);
    return card;
  }

  function render() {
    const visible = visibleIssues();
    grid.replaceChildren();
    grid.setAttribute("aria-busy", "false");
    if (!visible.length) {
      const empty = document.createElement("div");
      empty.className = "empty-archive";
      empty.textContent = "No issue matches this search and topic.";
      grid.append(empty);
      status.textContent = `0 of ${issues.length} issues shown.`;
      return;
    }
    const fragment = document.createDocumentFragment();
    visible.forEach((issue) => fragment.append(createIssueCard(issue)));
    grid.append(fragment);
    status.textContent = `${visible.length} of ${issues.length} issue${issues.length === 1 ? "" : "s"} shown.`;
  }

  [search, topic].forEach((control) => control.addEventListener("input", render));

  fetch("./issues.json", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("Archive unavailable")))
    .then((data) => {
      issues = Array.isArray(data.issues) ? data.issues : [];
      render();
    })
    .catch(() => {
      grid.setAttribute("aria-busy", "false");
      status.textContent = "The archive index could not refresh. The latest issue link remains available above.";
    });
})();
