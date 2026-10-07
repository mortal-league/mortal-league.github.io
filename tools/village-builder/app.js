(function () {
  "use strict";

  const structures = [
    { name: "Small House", category: "Housing", tiers: [
      { wood: 40000, stone: 55000, metal: 5000, gold: 150, prom: 0, deposit: 0 },
      { wood: 20000, stone: 27500, metal: 2500, gold: 150, prom: 0, deposit: 0 },
      { wood: 20000, stone: 27500, metal: 2500, gold: 150, prom: 0, deposit: 0 },
    ] },
    { name: "Medium House", category: "Housing", tiers: [
      { wood: 60000, stone: 82500, metal: 7500, gold: 300, prom: 0, deposit: 0 },
      { wood: 20000, stone: 30000, metal: 3750, gold: 300, prom: 0, deposit: 0 },
      { wood: 40000, stone: 37500, metal: 3750, gold: 300, prom: 0, deposit: 0 },
    ] },
    { name: "Stronghold", category: "Housing", tiers: [
      { wood: 40000, stone: 600000, metal: 20000, gold: 2500, prom: 0, deposit: 0 },
      { wood: 20000, stone: 300000, metal: 10000, gold: 2000, prom: 0, deposit: 0 },
      { wood: 20000, stone: 300000, metal: 10000, gold: 2000, prom: 0, deposit: 0 },
    ] },
    { name: "Chancery", category: "Administration", tiers: [
      { wood: 30000, stone: 10000, metal: 200, gold: 20, prom: 100, deposit: 91.25 },
      { wood: 8000, stone: 70000, metal: 200, gold: 10, prom: 50, deposit: 182.5 },
      { wood: 2000, stone: 20000, metal: 600, gold: 15, prom: 75, deposit: 273.75 },
    ] },
    { name: "Bank", category: "Administration", tiers: [
      { wood: 30000, stone: 80000, metal: 200, gold: 1000, prom: 40000, deposit: 1825 },
      { wood: 12000, stone: 140000, metal: 300, gold: 500, prom: 20000, deposit: 2737.5 },
      { wood: 22000, stone: 100000, metal: 300, gold: 750, prom: 30000, deposit: 3650 },
    ] },
    { name: "Reliquary", category: "Administration", tiers: [
      { wood: 30000, stone: 10000, metal: 200, gold: 1000, prom: 50000, deposit: 3650 },
    ] },
    { name: "Supply Storehouse", category: "Supply", tiers: [
      { wood: 42000, stone: 120000, metal: 1000, gold: 50, prom: 500, deposit: 182.5 },
    ] },
    { name: "Supply Tower", category: "Supply", tiers: [
      { wood: 500, stone: 5000, metal: 0, gold: 5, prom: 100, deposit: 0 },
    ] },
    { name: "Alchemist Apotheca", category: "Crafting", tiers: [
      { wood: 36000, stone: 74000, metal: 500, gold: 160, prom: 1000, deposit: 182.5 },
      { wood: 18000, stone: 152500, metal: 1100, gold: 340, prom: 2500, deposit: 365 },
      { wood: 34200, stone: 103500, metal: 2200, gold: 800, prom: 5000, deposit: 730 },
    ] },
    { name: "Butchery", category: "Crafting", tiers: [
      { wood: 22000, stone: 70000, metal: 200, gold: 80, prom: 1000, deposit: 365 },
      { wood: 8000, stone: 28000, metal: 100, gold: 40, prom: 500, deposit: 547.5 },
      { wood: 17600, stone: 56000, metal: 200, gold: 60, prom: 750, deposit: 730 },
    ] },
    { name: "Culinarium", category: "Crafting", tiers: [
      { wood: 26000, stone: 72000, metal: 800, gold: 25, prom: 500, deposit: 182.5 },
      { wood: 8000, stone: 22000, metal: 400, gold: 37.5, prom: 750, deposit: 365 },
      { wood: 5100, stone: 14000, metal: 180, gold: 50, prom: 1000, deposit: 547.5 },
    ] },
    { name: "Foundry", category: "Crafting", tiers: [
      { wood: 42200, stone: 192000, metal: 800, gold: 400, prom: 2500, deposit: 365 },
      { wood: 1800, stone: 24000, metal: 1400, gold: 200, prom: 5000, deposit: 912.5 },
      { wood: 4000, stone: 28000, metal: 1200, gold: 2000, prom: 10000, deposit: 1825 },
    ] },
    { name: "General Store", category: "Crafting", tiers: [
      { wood: 24000, stone: 154000, metal: 400, gold: 400, prom: 1000, deposit: 182.5 },
      { wood: 24000, stone: 46000, metal: 400, gold: 200, prom: 500, deposit: 365 },
      { wood: 10000, stone: 80000, metal: 600, gold: 300, prom: 750, deposit: 730 },
    ] },
    { name: "Library", category: "Crafting", tiers: [
      { wood: 26000, stone: 150000, metal: 250, gold: 800, prom: 50000, deposit: 365 },
      { wood: 16580, stone: 60000, metal: 150, gold: 400, prom: 25000, deposit: 912.5 },
      { wood: 23420, stone: 110000, metal: 200, gold: 600, prom: 37500, deposit: 1825 },
    ] },
    { name: "Magic Emporium", category: "Crafting", tiers: [
      { wood: 68000, stone: 115000, metal: 800, gold: 300, prom: 3000, deposit: 365 },
      { wood: 14000, stone: 69000, metal: 400, gold: 300, prom: 4000, deposit: 730 },
      { wood: 12000, stone: 146000, metal: 600, gold: 200, prom: 5000, deposit: 1095 },
    ] },
    { name: "Smithy", category: "Crafting", tiers: [
      { wood: 38000, stone: 160000, metal: 400, gold: 200, prom: 1000, deposit: 365 },
      { wood: 5400, stone: 32000, metal: 150, gold: 200, prom: 1000, deposit: 547.5 },
      { wood: 3300, stone: 19200, metal: 90, gold: 100, prom: 500, deposit: 730 },
    ] },
    { name: "Stable", category: "Crafting", tiers: [
      { wood: 18000, stone: 12000, metal: 100, gold: 450, prom: 2000, deposit: 365 },
      { wood: 18000, stone: 0, metal: 100, gold: 225, prom: 1000, deposit: 730 },
      { wood: 6400, stone: 56000, metal: 200, gold: 337.5, prom: 1500, deposit: 1095 },
    ] },
    { name: "Stone Refinery", category: "Crafting", tiers: [
      { wood: 54000, stone: 220000, metal: 8000, gold: 800, prom: 2500, deposit: 365 },
      { wood: 90000, stone: 150600, metal: 26000, gold: 1200, prom: 5000, deposit: 547.5 },
      { wood: 14400, stone: 29400, metal: 31000, gold: 2000, prom: 10000, deposit: 730 },
    ] },
    { name: "Alert Tower", category: "Defense", tiers: [
      { wood: 4400, stone: 0, metal: 400, gold: 50, prom: 1000, deposit: 182.5 },
      { wood: 1600, stone: 0, metal: 100, gold: 75, prom: 1500, deposit: 365 },
      { wood: 2000, stone: 140000, metal: 300, gold: 100, prom: 2500, deposit: 730 },
    ] },
    { name: "Barracks", category: "Defense", tiers: [
      { wood: 24000, stone: 140000, metal: 200, gold: 1000, prom: 50000, deposit: 1825 },
      { wood: 16000, stone: 60000, metal: 200, gold: 500, prom: 25000, deposit: 3650 },
      { wood: 18000, stone: 80000, metal: 200, gold: 750, prom: 37500, deposit: 5475 },
    ] },
    { name: "Guard Tower", category: "Defense", tiers: [
      { wood: 34000, stone: 0, metal: 200, gold: 100, prom: 2500, deposit: 3650 },
      { wood: 34000, stone: 130000, metal: 100, gold: 150, prom: 5000, deposit: 4562.5 },
      { wood: 4000, stone: 110000, metal: 200, gold: 200, prom: 8000, deposit: 5475 },
    ] },
    { name: "Blue Priest", category: "Defense", tiers: [
      { wood: 32000, stone: 24000, metal: 100, gold: 500, prom: 3000, deposit: 730 },
      { wood: 14000, stone: 176000, metal: 300, gold: 250, prom: 4000, deposit: 1095 },
      { wood: 6000, stone: 100000, metal: 400, gold: 375, prom: 8000, deposit: 1460 },
    ] },
    { name: "Red Priest", category: "Defense", tiers: [
      { wood: 0, stone: 82000, metal: 0, gold: 500, prom: 10000, deposit: 1825 },
    ] },
  ];

  const storageKey = "molVillageBuilderV2";
  const state = { items: {}, search: "", category: "all", selected: null };
  const bySlug = new Map(structures.map((structure) => [slugify(structure.name), structure]));
  const $ = (selector) => document.querySelector(selector);
  const format = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value || 0);

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function cumulative(structure, tierNumber) {
    const total = { wood: 0, stone: 0, metal: 0, gold: 0, prom: 0, deposit: 0 };
    structure.tiers.slice(0, tierNumber).forEach((tier) => {
      total.wood += tier.wood;
      total.stone += tier.stone;
      total.metal += tier.metal;
      total.gold += tier.gold;
      total.prom += tier.prom;
    });
    total.deposit = structure.tiers[tierNumber - 1].deposit;
    return total;
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ items: state.items }));
      return true;
    } catch (_) {
      $("#copy-status").textContent = "This browser blocked the local save. Download a receipt for backup.";
      return false;
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && saved.items && typeof saved.items === "object") {
        state.items = Object.fromEntries(Object.entries(saved.items).map(([key, value]) => [key, Math.min(999, Math.max(0, Math.floor(Number(value) || 0)))]));
      }
    } catch (_) {
      state.items = {};
    }
  }

  function renderStructures() {
    const query = state.search.trim().toLowerCase();
    const visible = structures.filter((structure) => {
      const matchesSearch = !query || structure.name.toLowerCase().includes(query);
      const matchesCategory = state.category === "all" || structure.category === state.category;
      return matchesSearch && matchesCategory;
    });

    $("#structure-count").textContent = `${visible.length} ${visible.length === 1 ? "structure" : "structures"}`;
    $("#structure-grid").innerHTML = visible.map((structure) => {
      const slug = slugify(structure.name);
      const tierLabel = structure.tiers.length === 1 ? "Single tier" : `${structure.tiers.length} tiers`;
      return `<button class="structure-button${state.selected === slug ? " is-selected" : ""}" type="button" data-structure="${slug}">
        <strong>${structure.name}</strong>
        <small>${structure.category} · ${tierLabel}</small>
      </button>`;
    }).join("");

    document.querySelectorAll("[data-structure]").forEach((button) => {
      button.addEventListener("click", () => selectStructure(button.dataset.structure));
    });
  }

  function selectStructure(slug) {
    const structure = bySlug.get(slug);
    if (!structure) return;
    state.selected = slug;
    $("#selected-structure").textContent = structure.name;
    $("#tier-select").innerHTML = structure.tiers.map((_, index) => {
      const tier = index + 1;
      return `<option value="${tier}">${structure.tiers.length === 1 ? "Single tier" : `Build through Tier ${tier}`}</option>`;
    }).join("");
    $("#tier-row").hidden = false;
    renderStructures();
    $("#tier-select").focus();
  }

  function addSelected() {
    if (!state.selected) return;
    const tier = Number($("#tier-select").value);
    const key = `${state.selected}:t${tier}`;
    state.items[key] = (state.items[key] || 0) + 1;
    save();
    renderProject();
  }

  function changeQuantity(key, change) {
    const next = Math.max(0, (state.items[key] || 0) + change);
    if (next) state.items[key] = next;
    else delete state.items[key];
    save();
    renderProject();
  }

  function projectRows() {
    return Object.entries(state.items).map(([key, quantity]) => {
      const match = key.match(/^(.+):t(\d+)$/);
      const structure = match ? bySlug.get(match[1]) : null;
      const tier = match ? Number(match[2]) : 0;
      const safeQuantity = Math.min(999, Math.max(0, Math.floor(Number(quantity) || 0)));
      if (!structure || !structure.tiers[tier - 1] || safeQuantity < 1) return null;
      return { key, structure, tier, quantity: safeQuantity, costs: cumulative(structure, tier) };
    }).filter(Boolean);
  }

  function totalsFor(rows) {
    return rows.reduce((total, row) => {
      ["wood", "stone", "metal", "gold", "prom", "deposit"].forEach((field) => {
        total[field] += row.costs[field] * row.quantity;
      });
      total.items += row.quantity;
      return total;
    }, { wood: 0, stone: 0, metal: 0, gold: 0, prom: 0, deposit: 0, items: 0 });
  }

  function renderProject() {
    const rows = projectRows();
    $("#project-list").innerHTML = rows.length ? rows.map((row) => `
      <div class="project-item">
        <div>
          <strong>${row.structure.name}${row.structure.tiers.length > 1 ? ` through Tier ${row.tier}` : ""}</strong>
          <small>${format(row.costs.stone)} stone · ${format(row.costs.wood)} wood · ${format(row.costs.gold)} plan gold each</small>
        </div>
        <div class="quantity-control" aria-label="Quantity for ${row.structure.name}">
          <button type="button" data-decrease="${row.key}" aria-label="Remove one">−</button>
          <span>${row.quantity}</span>
          <button type="button" data-increase="${row.key}" aria-label="Add one">+</button>
        </div>
      </div>`).join("") : '<p class="empty-state">No structures added.</p>';

    document.querySelectorAll("[data-decrease]").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.decrease, -1));
    });
    document.querySelectorAll("[data-increase]").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.increase, 1));
    });

    const totals = totalsFor(rows);
    $("#project-count").textContent = `${totals.items} ${totals.items === 1 ? "item" : "items"}`;
    $("#total-stone").textContent = format(totals.stone);
    $("#total-wood").textContent = format(totals.wood);
    $("#total-metal").textContent = format(totals.metal);
    $("#total-prom").textContent = format(totals.prom);
    $("#total-gold").textContent = format(totals.gold);
    $("#total-deposit").textContent = format(totals.deposit);
    $("#total-all-gold").textContent = format(totals.gold + totals.deposit);
    $("#receipt-note").textContent = rows.length
      ? "Guild reserve is not added for houses or Strongholds."
      : "Add a structure to create a receipt.";
  }

  function receiptText() {
    const rows = projectRows();
    const totals = totalsFor(rows);
    const lines = ["MORTAL ONLINE LEAGUE: VILLAGE BUILDER", "", "PROJECT"];
    if (!rows.length) lines.push("No structures added.");
    rows.forEach((row) => {
      const tier = row.structure.tiers.length > 1 ? ` through Tier ${row.tier}` : "";
      lines.push(`${row.quantity}x ${row.structure.name}${tier}`);
    });
    lines.push("", "TOTALS");
    lines.push(`Stone: ${format(totals.stone)}`);
    lines.push(`Wood: ${format(totals.wood)}`);
    lines.push(`Metal: ${format(totals.metal)}`);
    lines.push(`Prominence: ${format(totals.prom)}`);
    lines.push(`Plan gold: ${format(totals.gold)}`);
    lines.push(`Guild reserve: ${format(totals.deposit)}`);
    lines.push(`Total gold funding: ${format(totals.gold + totals.deposit)}`);
    lines.push("", "Houses and Strongholds carry no guild reserve. Verify live values before committing resources.");
    return lines.join("\n");
  }

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(receiptText());
      $("#copy-status").textContent = "Receipt copied.";
    } catch (_) {
      $("#copy-status").textContent = "Copy was blocked. Use Download instead.";
    }
  }

  function downloadReceipt() {
    const blob = new Blob([receiptText()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MOL-Village-Builder-Receipt.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  $("#structure-search").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderStructures();
  });
  $("#category-filter").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderStructures();
  });
  $("#add-structure").addEventListener("click", addSelected);
  $("#clear-project").addEventListener("click", () => {
    state.items = {};
    save();
    renderProject();
  });
  $("#copy-receipt").addEventListener("click", copyReceipt);
  $("#download-receipt").addEventListener("click", downloadReceipt);

  load();
  renderStructures();
  renderProject();
})();
