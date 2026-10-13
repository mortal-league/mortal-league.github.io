(function () {
  "use strict";

  const STORAGE_KEY = "mortal-league-declaration-draft-v1";
  const form = document.querySelector("#declaration-form");
  const standingStake = document.querySelector("#standing-stake");
  const goldStake = document.querySelector("#gold-stake");
  const doubleJeopardy = document.querySelector("#double-jeopardy");
  const exposureFormula = document.querySelector("#exposure-formula");
  const exposureNote = document.querySelector("#exposure-note");
  const declarationInputs = document.querySelectorAll('input[name="declarationType"]');
  const eventLabel = document.querySelector("#event-label");
  const eventDetails = document.querySelector("#event-details");
  const result = document.querySelector("#declaration-result");
  const resultTitle = document.querySelector("#result-title");
  const output = document.querySelector("#declaration-text");
  const status = document.querySelector("#declaration-status");
  const dialog = document.querySelector("#double-jeopardy-info");

  const typeCopy = {
    Siege: {
      label: "Siege target and terms",
      placeholder: "Name the structure or position, attacker and defender roles, siege window, eligible forces, and victory condition.",
    },
    Scrim: {
      label: "Scrim format and terms",
      placeholder: "State team sizes, location, rounds, equipment limits, respawn rules, and victory condition.",
    },
    Objective: {
      label: "Objective and completion terms",
      placeholder: "Describe the escort, defense, capture, recovery, delivery, or control objective and the exact completion condition.",
    },
  };

  function clean(value) {
    return String(value || "").trim();
  }

  function number(value, maximum) {
    const parsed = Math.max(0, Math.floor(Number(value) || 0));
    return typeof maximum === "number" ? Math.min(parsed, maximum) : parsed;
  }

  function declarationType() {
    return document.querySelector('input[name="declarationType"]:checked')?.value || "Siege";
  }

  function formObject() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function updateType() {
    const type = declarationType();
    eventLabel.textContent = typeCopy[type].label;
    eventDetails.placeholder = typeCopy[type].placeholder;
  }

  function updateExposure() {
    const stake = number(standingStake.value, 500);
    standingStake.value = String(stake);
    goldStake.value = String(number(goldStake.value));

    if (doubleJeopardy.checked && stake > 0) {
      exposureFormula.textContent = `${stake} + (${stake} × friendly deaths)`;
      exposureNote.textContent = `Every eligible friendly death adds ${stake} Standing. The 500-point cap applies to the base stake, so final exposure may exceed 500.`;
    } else if (doubleJeopardy.checked) {
      exposureFormula.textContent = "Set a Standing stake";
      exposureNote.textContent = "Double Jeopardy is on, but a 0-point Standing stake creates no additional exposure.";
    } else {
      exposureFormula.textContent = `${stake} point${stake === 1 ? "" : "s"}`;
      exposureNote.textContent = "Double Jeopardy is off. The declared Standing stake is the maximum Standing at risk.";
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formObject()));
      status.textContent = "Draft saved on this device.";
    } catch (_) {
      status.textContent = "Local saving is unavailable in this browser.";
    }
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      Object.entries(saved).forEach(([name, value]) => {
        const controls = form.elements.namedItem(name);
        if (!controls) return;
        if (controls instanceof RadioNodeList) {
          controls.value = value;
        } else if (controls.type === "checkbox") {
          controls.checked = value === "on";
        } else {
          controls.value = value;
        }
      });
      status.textContent = "Local draft restored.";
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function buildDraft(data) {
    const type = clean(data.declarationType) || "Siege";
    const standing = number(data.standingStake, 500);
    const jeopardy = data.doubleJeopardy === "on";
    const jeopardyTerms = jeopardy
      ? `ENABLED. Base stake ${standing} + (${standing} × eligible friendly deaths). Final exposure may exceed 500.`
      : "DISABLED. Base Standing stake is the maximum Standing exposure.";

    return [
      `MORTAL LEAGUE ${type.toUpperCase()} DECLARATION DRAFT`,
      "This draft was created on the declaring side's device. Nothing was submitted, accepted, held, or transferred.",
      "",
      `Declaration type: ${type}`,
      `Declaring side: ${clean(data.declaringSide)}`,
      `Declaring representative: ${clean(data.declaringRepresentative)}`,
      `Challenged side: ${clean(data.challengedSide)}`,
      `Challenged representative: ${clean(data.challengedRepresentative) || "Not provided"}`,
      `Game: ${clean(data.game)}`,
      `Continent: ${clean(data.continent)}`,
      `Proposed event time: ${clean(data.eventTime)}`,
      `Acceptance deadline: ${clean(data.acceptanceDeadline)}`,
      "",
      typeCopy[type].label.toUpperCase(),
      clean(data.eventDetails),
      "",
      "DECLARING SIDE'S OFFERED STAKES",
      `Gold: ${number(data.goldStake)}`,
      `Base Standing: ${standing} of 500 maximum`,
      `Standing Double Jeopardy: ${jeopardyTerms}`,
      "",
      "MIDDLER PREFERENCES",
      `First choice: ${clean(data.middlerFirst) || "Not provided"}`,
      `Second choice: ${clean(data.middlerSecond) || "Not provided"}`,
      `Third choice: ${clean(data.middlerThird) || "Not provided"}`,
      `Requested role: ${clean(data.middlerRole)}`,
      "",
      "PROOF AND REFEREE TERMS",
      clean(data.proofTerms),
      "",
      "CANCELLATION AND RETURN TERMS",
      clean(data.cancellationTerms),
      "",
      "Authority confirmation: Confirmed by the draft creator.",
      "Beta acknowledgment: Confirmed by the draft creator.",
      "Status: LOCAL DRAFT ONLY. Live declarations, wagers, custody, and settlement remain closed during Beta.",
    ].join("\n");
  }

  function download(filename, content) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function handleInput() {
    updateType();
    updateExposure();
    save();
  }

  form.addEventListener("input", handleInput);
  declarationInputs.forEach((input) => input.addEventListener("input", handleInput));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateExposure();
    if (!form.reportValidity()) return;
    const type = declarationType();
    output.textContent = buildDraft(formObject());
    resultTitle.textContent = `${type} declaration draft`;
    result.hidden = false;
    status.textContent = "Declaration draft created. Nothing was submitted.";
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector("#clear-declaration").addEventListener("click", () => {
    form.reset();
    localStorage.removeItem(STORAGE_KEY);
    result.hidden = true;
    output.textContent = "";
    status.textContent = "Local draft cleared.";
    updateType();
    updateExposure();
  });

  document.querySelector("#copy-declaration").addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    status.textContent = "Declaration draft copied.";
  });

  document.querySelector("#download-declaration").addEventListener("click", () => {
    const type = declarationType().toLowerCase();
    download(`mortal-league-${type}-declaration.txt`, output.textContent);
  });

  document.querySelector("#open-jeopardy-info").addEventListener("click", () => dialog.showModal());
  document.querySelector("#close-jeopardy-info").addEventListener("click", () => dialog.close());
  document.querySelector("#acknowledge-jeopardy").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  restore();
  updateType();
  updateExposure();
})();
