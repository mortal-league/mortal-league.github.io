(function () {
  "use strict";

  const REPOSITORY = "mortal-league/mortal-league.github.io";
  const APPROVED_LABEL = "idea-lot:approved";
  const API_URL = `https://api.github.com/repos/${REPOSITORY}/issues?state=open&labels=${encodeURIComponent(APPROVED_LABEL)}&per_page=100`;
  const CACHE_KEY = "mortal-league-idea-lot-cache-v1";
  const CACHE_TTL = 5 * 60 * 1000;

  const grid = document.querySelector("#parking-grid");
  const status = document.querySelector("#board-status");
  const search = document.querySelector("#idea-search");
  const typeFilter = document.querySelector("#type-filter");
  const gameFilter = document.querySelector("#game-filter");
  const sortFilter = document.querySelector("#sort-filter");
  let posts = [];
  let sourceNote = "";

  function clean(value) {
    return String(value || "").trim();
  }

  function section(body, heading) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = clean(body).match(new RegExp(`###\\s+${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`, "i"));
    if (!match) return "";
    const value = clean(match[1]);
    return value === "_No response_" ? "" : value;
  }

  function plainText(value) {
    return clean(value)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_`>|~-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeType(value, labels) {
    const source = `${value} ${labels.join(" ")}`.toLowerCase();
    if (source.includes("bug")) return "Bug report";
    if (source.includes("site")) return "Site feedback";
    if (source.includes("feedback") || source.includes("quality")) return "Game feedback";
    return "Community idea";
  }

  function normalizeGame(value, labels) {
    const source = `${value} ${labels.join(" ")}`.toLowerCase();
    if (source.includes("both")) return "Both games";
    if (source.includes("mortal league") || source.includes("site")) return "Mortal League";
    if (source.includes("mortal online 1") || /\bmo1\b/.test(source)) return "Mortal Online 1";
    if (source.includes("mortal online 2") || /\bmo2\b/.test(source)) return "Mortal Online 2";
    return "Both games";
  }

  function issueToPost(issue) {
    const labels = (issue.labels || []).map((label) => typeof label === "string" ? label : label.name || "");
    const summary = section(issue.body, "Summary");
    const detail = section(issue.body, "What is happening or what should change?");
    return {
      id: issue.number,
      title: clean(issue.title).replace(/^\[Idea Lot\]\s*/i, ""),
      summary: plainText(summary || detail || issue.body).slice(0, 520),
      type: normalizeType(section(issue.body, "Post type"), labels),
      game: normalizeGame(section(issue.body, "Game"), labels),
      likes: Number(issue.reactions && issue.reactions["+1"]) || 0,
      comments: Number(issue.comments) || 0,
      author: clean(issue.user && issue.user.login) || "Community member",
      createdAt: issue.created_at,
      url: issue.html_url,
    };
  }

  function fallbackToPost(post) {
    return {
      id: Number(post.id) || 0,
      title: clean(post.title),
      summary: plainText(post.summary),
      type: clean(post.type) || "Community idea",
      game: clean(post.game) || "Both games",
      likes: Number(post.likes) || 0,
      comments: Number(post.comments) || 0,
      author: clean(post.author) || "Community member",
      createdAt: post.createdAt || new Date(0).toISOString(),
      url: clean(post.url),
    };
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (!cached || Date.now() - cached.savedAt > CACHE_TTL || !Array.isArray(cached.posts)) return null;
      return cached.posts.map(fallbackToPost);
    } catch (_) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

  function writeCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), posts: items }));
    } catch (_) {
      /* The board still works when storage is unavailable. */
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function updateTotals() {
    document.querySelector("#post-count").textContent = String(posts.length);
    document.querySelector("#like-count").textContent = String(posts.reduce((total, post) => total + post.likes, 0));
    document.querySelector("#bug-count").textContent = String(posts.filter((post) => post.type === "Bug report").length);
    document.querySelector("#feedback-count").textContent = String(posts.filter((post) => post.type === "Game feedback").length);
  }

  function visiblePosts() {
    const query = clean(search.value).toLowerCase();
    const visible = posts.filter((post) => {
      const haystack = `${post.title} ${post.summary} ${post.type} ${post.game}`.toLowerCase();
      return (!query || haystack.includes(query)) &&
        (!typeFilter.value || post.type === typeFilter.value) &&
        (!gameFilter.value || post.game === gameFilter.value || post.game === "Both games");
    });

    return visible.sort((a, b) => {
      if (sortFilter.value === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortFilter.value === "discussed") return b.comments - a.comments || b.likes - a.likes;
      return b.likes - a.likes || b.comments - a.comments || new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  function emptyState(title, copy, className) {
    const wrapper = document.createElement("div");
    wrapper.className = className;
    const inner = document.createElement("div");
    const heading = document.createElement("h3");
    const paragraph = document.createElement("p");
    heading.textContent = title;
    paragraph.textContent = copy;
    inner.append(heading, paragraph);
    wrapper.append(inner);
    return wrapper;
  }

  function createCard(post, index) {
    const article = document.createElement("article");
    article.className = `idea-card${index < 2 && post.likes > 0 ? " is-leader" : ""}`;

    const top = document.createElement("div");
    top.className = "card-topline";
    const rank = document.createElement("span");
    rank.className = "rank-number";
    rank.textContent = String(index + 1).padStart(2, "0");
    rank.setAttribute("aria-label", `Rank ${index + 1}`);
    const tags = document.createElement("div");
    tags.className = "idea-tags";
    [post.type, post.game].forEach((value) => {
      const tag = document.createElement("span");
      tag.className = "idea-tag";
      tag.textContent = value;
      tags.append(tag);
    });
    top.append(rank, tags);

    const title = document.createElement("h3");
    title.textContent = post.title || `Parking space ${post.id}`;
    const summary = document.createElement("p");
    summary.className = "idea-summary";
    summary.textContent = post.summary || "Open the source post to read the full report.";

    const footer = document.createElement("div");
    footer.className = "card-footer";
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const author = document.createElement("span");
    const date = document.createElement("span");
    const comments = document.createElement("span");
    author.textContent = `Parked by ${post.author}`;
    date.textContent = formatDate(post.createdAt);
    comments.textContent = `${post.comments} comment${post.comments === 1 ? "" : "s"}`;
    meta.append(author, date, comments);

    const like = document.createElement("a");
    like.className = "like-link";
    like.href = post.url;
    like.rel = "external";
    like.setAttribute("aria-label", `Like ${post.title} on GitHub. ${post.likes} likes.`);
    const icon = document.createElement("span");
    icon.className = "like-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "♥";
    const count = document.createElement("span");
    count.textContent = `${post.likes} Like${post.likes === 1 ? "" : "s"}`;
    like.append(icon, count);
    footer.append(meta, like);
    article.append(top, title, summary, footer);
    return article;
  }

  function render() {
    const visible = visiblePosts();
    grid.replaceChildren();
    grid.setAttribute("aria-busy", "false");

    if (!posts.length) {
      grid.append(emptyState("The first spaces are open", "No moderator-approved posts are parked yet. Submit a clear bug report or piece of feedback to start the board.", "empty-lot"));
      status.textContent = `0 approved posts. The lot is ready for its first submissions.${sourceNote}`;
      return;
    }

    if (!visible.length) {
      grid.append(emptyState("No post matches these filters", "Clear a filter or search for a different term.", "empty-lot"));
      status.textContent = `0 of ${posts.length} approved posts shown.${sourceNote}`;
      return;
    }

    const fragment = document.createDocumentFragment();
    visible.forEach((post, index) => fragment.append(createCard(post, index)));
    grid.append(fragment);
    status.textContent = `${visible.length} of ${posts.length} approved posts shown. ${sortFilter.options[sortFilter.selectedIndex].text} first.${sourceNote}`;
  }

  async function loadPosts() {
    const cached = readCache();
    if (cached) {
      posts = cached;
      sourceNote = " Counts refresh at most every five minutes.";
      updateTotals();
      render();
      return;
    }

    try {
      const response = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const issues = await response.json();
      posts = issues.filter((issue) => !issue.pull_request).map(issueToPost);
      sourceNote = " Live counts loaded from approved source posts.";
      writeCache(posts);
    } catch (_) {
      try {
        const response = await fetch("./ideas.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Fallback unavailable");
        const data = await response.json();
        posts = Array.isArray(data.posts) ? data.posts.map(fallbackToPost) : [];
        sourceNote = " Live counts are temporarily unavailable; this is the last published snapshot.";
      } catch (_) {
        posts = [];
        grid.replaceChildren(emptyState("The board could not load", "Open the approved source posts link below or try again in a few minutes.", "error-lot"));
        grid.setAttribute("aria-busy", "false");
        status.textContent = "The live board and its backup are temporarily unavailable.";
        updateTotals();
        return;
      }
    }

    updateTotals();
    render();
  }

  [search, typeFilter, gameFilter, sortFilter].forEach((control) => control.addEventListener("input", render));
  loadPosts();
})();
