(function () {
  "use strict";

  const targets = [
    ["Alchemist Apothecary T1",280000,80,"Structure",0,0],
    ["Alchemist Apothecary T2",540000,80,"Structure",0,0],
    ["Alchemist Apothecary T3",680000,80,"Structure",0,0],
    ["Alert Tower T1",186000,50,"Structure",0,0],
    ["Alert Tower T2",252000,50,"Structure",0,0],
    ["Alert Tower T3",540000,80,"Structure",0,0],
    ["Bank T1",360000,50,"Structure",0,0],
    ["Bank T2",720000,80,"Structure",0,0],
    ["Bank T3",1080000,80,"Structure",0,0],
    ["Barracks T1",400000,80,"Structure",0,0],
    ["Barracks T2",680000,80,"Structure",0,0],
    ["Barracks T3",980000,80,"Structure",0,0],
    ["Bulwark Statue",1000000,80,"Structure",0,0],
    ["Burster Lamp",1000000,50,"Structure",0,0],
    ["Butchery T1",240000,50,"Structure",0,0],
    ["Butchery T2",336000,50,"Structure",0,0],
    ["Butchery T3",528000,80,"Structure",0,0],
    ["Campodon Statue",1000000,80,"Structure",0,0],
    ["Chancery T1",300000,50,"Structure",0,0],
    ["Chancery T2",540000,80,"Structure",0,0],
    ["Chancery T3",720000,80,"Structure",0,0],
    ["Culinarium T1",300000,50,"Structure",0,0],
    ["Culinarium T2",540000,50,"Structure",0,0],
    ["Culinarium T3",720000,80,"Structure",0,0],
    ["Disgorger Statue",1000000,80,"Structure",0,0],
    ["Foundry T1",448000,80,"Structure",0,0],
    ["Foundry T2",546560,80,"Structure",0,0],
    ["Foundry T3",612100,80,"Structure",0,0],
    ["Gate",1000000,80,"Fortification",0,1],
    ["Gate Expansion",1000000,80,"Fortification",0,1],
    ["General Store T1",196000,50,"Structure",0,0],
    ["General Store T2",241000,50,"Structure",0,0],
    ["General Store T3",320000,80,"Structure",0,0],
    ["Guard Tower T1",360000,50,"Structure",0,0],
    ["Guard Tower T2",660000,80,"Structure",0,0],
    ["Guard Tower T3",960000,80,"Structure",0,0],
    ["Keep T1",15000000,80,"Housing",1,0],
    ["Keep T2",20000000,80,"Housing",1,0],
    ["Keep T3",25000000,80,"Housing",1,0],
    ["Library T1",480000,50,"Structure",0,0],
    ["Library T2",768000,80,"Structure",0,0],
    ["Library T3",1075200,80,"Structure",0,0],
    ["Magic Emporium T1",380000,50,"Structure",0,0],
    ["Magic Emporium T2",600000,80,"Structure",0,0],
    ["Magic Emporium T3",780000,80,"Structure",0,0],
    ["Medium House T1",4000000,80,"Housing",0,0],
    ["Medium House T2",5500000,80,"Housing",0,0],
    ["Medium House T3",7000000,80,"Housing",0,0],
    ["Pig Statue",1000000,80,"Structure",0,0],
    ["Priest Red",590000,80,"Structure",0,0],
    ["Priest T1 Blue",320000,80,"Structure",0,0],
    ["Priest T2 Blue",800000,80,"Structure",0,0],
    ["Priest T3 Blue",1400000,80,"Structure",0,0],
    ["Reliquary",300000,80,"Structure",0,0],
    ["Small House T1",3000000,80,"Housing",0,0],
    ["Small House T2",4000000,80,"Housing",0,0],
    ["Small House T3",5000000,80,"Housing",0,0],
    ["Smithy T1",380000,80,"Structure",0,0],
    ["Smithy T2",456000,80,"Structure",0,0],
    ["Smithy T3",524400,80,"Structure",0,0],
    ["Stable T1",258000,50,"Structure",0,0],
    ["Stable T2",480000,50,"Structure",0,0],
    ["Stable T3",840000,80,"Structure",0,0],
    ["Stone Refinery T1",280000,80,"Structure",0,0],
    ["Stone Refinery T2",372400,80,"Structure",0,0],
    ["Stone Refinery T3",424500,80,"Structure",0,0],
    ["Stronghold T1",8000000,80,"Housing",0,0],
    ["Stronghold T2",10000000,80,"Housing",0,0],
    ["Stronghold T3",12000000,80,"Housing",0,0],
    ["Supply Line",550000,50,"Structure",0,0],
    ["Supply Storehouse",480000,50,"Structure",0,0],
    ["Supply Tower",10000,50,"Structure",0,0],
    ["Tagmaton Campsite",1000000,50,"Structure",0,0],
    ["Wall",3000000,80,"Fortification",0,1],
    ["Wall Corner T2",4000000,80,"Fortification",0,1],
    ["Wall Tower T2",4000000,80,"Fortification",0,1],
  ].map(([name, hp, defense, group, keep, fortification]) => ({
    name, hp, defense, group, keep: Boolean(keep), fortification: Boolean(fortification), slug: slugify(name),
  }));

  const rules = {
    rawDamage: 52000,
    shotsPerManganon: 100,
    boulderStone: 500,
    supplyLineBonus: 5,
    tent: { stone: 8000, gold: 50, prom: 500 },
    machines: {
      wheeled: { label: "Wheeled", gold: 300, prom: 3000, wood: 3600, metal: 600 },
      stationary: { label: "Stationary", gold: 250, prom: 2400, wood: 3000, metal: 500 },
    },
  };

  const storageKey = "molSiegePlannerV2";
  const state = { items: {}, supplyLines: 0, buffer: false, machine: "wheeled", search: "", mode: null };
  const bySlug = new Map(targets.map((target) => [target.slug, target]));
  const $ = (selector) => document.querySelector(selector);
  const format = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value || 0));

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        items: state.items,
        supplyLines: state.supplyLines,
        buffer: state.buffer,
        machine: state.machine,
      }));
      return true;
    } catch (_) {
      $("#copy-status").textContent = "This browser blocked the local save. Download a receipt for backup.";
      return false;
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && typeof saved === "object") {
        if (saved.items && typeof saved.items === "object") {
          state.items = Object.fromEntries(Object.entries(saved.items).map(([key, value]) => [key, Math.min(999, Math.max(0, Math.floor(Number(value) || 0)))]));
        }
        state.supplyLines = Math.min(2, Math.max(0, Math.floor(Number(saved.supplyLines) || 0)));
        state.buffer = Boolean(saved.buffer);
        if (rules.machines[saved.machine]) state.machine = saved.machine;
      }
    } catch (_) {
      state.items = {};
    }
  }

  function defenseFor(target) {
    const bonus = state.mode === "keep" && (target.keep || target.fortification)
      ? state.supplyLines * rules.supplyLineBonus
      : 0;
    return Math.min(100, target.defense + bonus);
  }

  function calculationFor(target) {
    const defense = defenseFor(target);
    if (defense >= 100) return { defense, boulders: Infinity, manganons: Infinity };
    const effectiveDamage = rules.rawDamage * (1 - defense / 100);
    const boulders = Math.ceil(target.hp / effectiveDamage);
    return { defense, boulders, manganons: Math.ceil(boulders / rules.shotsPerManganon) };
  }

  function isAllowed(target) {
    if (state.mode !== "normal") return true;
    return !(target.keep || target.fortification || target.name === "Supply Line");
  }

  function totals() {
    let targetCount = 0;
    let baseBoulders = 0;
    const rows = [];
    const immune = [];

    targets.forEach((target) => {
      const quantity = Number(state.items[target.slug]) || 0;
      if (!quantity || !isAllowed(target)) return;
      targetCount += quantity;
      const calculation = calculationFor(target);
      if (!Number.isFinite(calculation.boulders)) {
        immune.push({ target, quantity, calculation });
        return;
      }
      const boulders = calculation.boulders * quantity;
      baseBoulders += boulders;
      rows.push({ target, quantity, calculation, boulders });
    });

    const baseManganons = baseBoulders ? Math.ceil(baseBoulders / rules.shotsPerManganon) : 0;
    const extraBoulders = state.buffer && baseBoulders ? Math.ceil(baseBoulders * 0.1) : 0;
    const extraManganons = state.buffer && baseManganons ? Math.ceil(baseManganons * 0.1) : 0;
    const boulders = baseBoulders + extraBoulders;
    const manganons = baseManganons + extraManganons;
    const machine = rules.machines[state.machine];
    return {
      rows, immune, targetCount, baseBoulders, baseManganons, extraBoulders, extraManganons,
      boulders, manganons,
      stone: boulders * rules.boulderStone + (targetCount ? rules.tent.stone : 0),
      wood: manganons * machine.wood,
      metal: manganons * machine.metal,
      gold: manganons * machine.gold + (targetCount ? rules.tent.gold : 0),
      prom: manganons * machine.prom + (targetCount ? rules.tent.prom : 0),
    };
  }

  function enterMode(mode) {
    state.mode = mode;
    if (mode === "normal") {
      state.supplyLines = 0;
      targets.forEach((target) => {
        if (!isAllowed(target)) delete state.items[target.slug];
      });
    }
    $("#mode-picker").hidden = true;
    $("#planner-view").hidden = false;
    $("#supply-control").hidden = mode !== "keep";
    $("#mode-label").textContent = mode === "keep" ? "Keep Siege targets" : "Normal Siege targets";
    $("#supply-lines").value = String(state.supplyLines);
    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.mode === mode);
    });
    save();
    render();
  }

  function showModePicker() {
    state.mode = null;
    $("#planner-view").hidden = true;
    $("#mode-picker").hidden = false;
    $("#mode-picker").scrollIntoView({ block: "start" });
  }

  function changeQuantity(slug, change) {
    const next = Math.max(0, (Number(state.items[slug]) || 0) + change);
    if (next) state.items[slug] = next;
    else delete state.items[slug];
    save();
    render();
  }

  function renderTargets() {
    const query = state.search.trim().toLowerCase();
    const visible = targets.filter((target) => isAllowed(target) && (!query || target.name.toLowerCase().includes(query)));
    $("#target-count").textContent = `${visible.length} ${visible.length === 1 ? "target" : "targets"}`;
    $("#target-grid").innerHTML = visible.map((target) => {
      const calculation = calculationFor(target);
      const quantity = Number(state.items[target.slug]) || 0;
      const immune = !Number.isFinite(calculation.boulders);
      return `<article class="target-card${quantity ? " is-selected" : ""}">
        <strong>${target.name}</strong>
        <div class="target-meta">
          <span>HP ${format(target.hp)}</span>
          <span>DEF ${calculation.defense}%</span>
          <span class="${immune ? "warning-text" : ""}">BOULDERS ${immune ? "IMMUNE" : format(calculation.boulders)}</span>
          <span class="${immune ? "warning-text" : ""}">MANGS ${immune ? "∞" : format(calculation.manganons)}</span>
        </div>
        <button type="button" data-add="${target.slug}" ${immune ? "disabled" : ""}>${immune ? "Defense source first" : quantity ? `Add another (${quantity})` : "Add target"}</button>
      </article>`;
    }).join("");

    document.querySelectorAll("[data-add]").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.add, 1));
    });
  }

  function renderReceipt() {
    const result = totals();
    $("#total-targets").textContent = format(result.targetCount);
    $("#total-boulders").textContent = format(result.boulders);
    $("#total-manganons").textContent = format(result.manganons);
    $("#total-stone").textContent = format(result.stone);
    $("#total-wood").textContent = format(result.wood);
    $("#total-metal").textContent = format(result.metal);
    $("#total-gold").textContent = format(result.gold);
    $("#total-prom").textContent = format(result.prom);

    const rows = [...result.rows, ...result.immune];
    $("#selected-targets").innerHTML = rows.length ? rows.map((row) => `
      <div class="selected-target">
        <div>
          <strong>${row.target.name}</strong>
          <small>${Number.isFinite(row.calculation.boulders) ? `${format(row.calculation.boulders)} boulders each` : `Immune at ${row.calculation.defense}% defense`}</small>
        </div>
        <div class="quantity-control" aria-label="Quantity for ${row.target.name}">
          <button type="button" data-decrease="${row.target.slug}" aria-label="Remove one">−</button>
          <span>${row.quantity}</span>
          <button type="button" data-increase="${row.target.slug}" aria-label="Add one">+</button>
        </div>
      </div>`).join("") : '<p class="empty-state">No targets added.</p>';

    document.querySelectorAll("[data-decrease]").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.decrease, -1));
    });
    document.querySelectorAll("[data-increase]").forEach((button) => {
      button.addEventListener("click", () => changeQuantity(button.dataset.increase, 1));
    });
  }

  function render() {
    renderTargets();
    renderReceipt();
  }

  function receiptText() {
    const result = totals();
    const lines = ["MORTAL ONLINE LEAGUE: SIEGE PLANNER"];
    lines.push(state.mode === "keep" ? "KEEP SIEGE" : "NORMAL SIEGE");
    lines.push("SUPPLY STOREHOUSE DEFENSE ASSUMED DRAINED");
    if (state.mode === "keep") lines.push(`KEEP SUPPLY LINES: ${state.supplyLines}`);
    lines.push("", "TARGETS");
    result.rows.forEach((row) => {
      lines.push(`${row.quantity}x ${row.target.name}: ${format(row.target.hp)} HP, ${row.calculation.defense}% defense, ${format(row.boulders)} boulders`);
    });
    result.immune.forEach((row) => {
      lines.push(`${row.quantity}x ${row.target.name}: IMMUNE AT ${row.calculation.defense}% DEFENSE`);
    });
    if (!result.rows.length && !result.immune.length) lines.push("No targets added.");
    lines.push("", "RESOURCES");
    lines.push(`${rules.machines[state.machine].label} Manganons: ${format(result.manganons)}`);
    lines.push(`Boulders: ${format(result.boulders)}`);
    lines.push(`Stone: ${format(result.stone)}`);
    lines.push(`Wood: ${format(result.wood)}`);
    lines.push(`Metal: ${format(result.metal)}`);
    lines.push(`Gold: ${format(result.gold)}`);
    lines.push(`Prominence: ${format(result.prom)}`);
    if (state.buffer) lines.push(`10% buffer: +${format(result.extraBoulders)} boulders, +${format(result.extraManganons)} spare Manganons`);
    return lines.join("\n");
  }

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(receiptText());
      $("#copy-status").textContent = "Siege receipt copied.";
    } catch (_) {
      $("#copy-status").textContent = "Copy was blocked. Use Download instead.";
    }
  }

  function downloadReceipt() {
    const blob = new Blob([receiptText()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MOL-Siege-Planner-Receipt.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => enterMode(button.dataset.mode));
  });
  $("#change-mode").addEventListener("click", showModePicker);
  $("#target-search").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderTargets();
  });
  $("#machine-select").addEventListener("change", (event) => {
    state.machine = event.target.value;
    save();
    renderReceipt();
  });
  $("#supply-lines").addEventListener("change", (event) => {
    state.supplyLines = Math.min(2, Math.max(0, Math.floor(Number(event.target.value) || 0)));
    event.target.value = String(state.supplyLines);
    save();
    render();
  });
  $("#buffer-check").addEventListener("change", (event) => {
    state.buffer = event.target.checked;
    save();
    renderReceipt();
  });
  $("#clear-targets").addEventListener("click", () => {
    state.items = {};
    save();
    render();
  });
  $("#copy-receipt").addEventListener("click", copyReceipt);
  $("#download-receipt").addEventListener("click", downloadReceipt);

  load();
  $("#machine-select").value = state.machine;
  $("#supply-lines").value = String(state.supplyLines);
  $("#buffer-check").checked = state.buffer;
  showModePicker();
})();
