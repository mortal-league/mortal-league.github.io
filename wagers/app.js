(function () {
  "use strict";

  const STORAGE_KEY = "mortal-league-declaration-draft-v1";
  const MAX_DRAFT_AGE = 24 * 60 * 60 * 1000;
  const form = document.querySelector("#declaration-form");
  const declarationInputs = document.querySelectorAll('input[name="declarationType"]');
  const eventLabel = document.querySelector("#event-label");
  const eventDetails = document.querySelector("#event-details");
  const result = document.querySelector("#declaration-result");
  const resultTitle = document.querySelector("#result-title");
  const output = document.querySelector("#declaration-text");
  const status = document.querySelector("#declaration-status");

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

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data: formObject() }));
      status.textContent = "Draft saved on this device for up to 24 hours.";
    } catch (_) {
      status.textContent = "Local saving is unavailable in this browser.";
    }
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      if (!saved.savedAt || Date.now() - saved.savedAt > MAX_DRAFT_AGE || !saved.data) {
        localStorage.removeItem(STORAGE_KEY);
        status.textContent = "An older local draft was cleared under the 24-hour privacy limit.";
        return;
      }
      Object.entries(saved.data).forEach(([name, value]) => {
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
      status.textContent = "Local draft restored. It will expire 24 hours after its last edit.";
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function buildDraft(data) {
    const type = clean(data.declarationType) || "Siege";

    return [
      `MORTAL LEAGUE ${type.toUpperCase()} DECLARATION DRAFT`,
      "This draft was created on the declaring side's device. Nothing was submitted or accepted.",
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
      "PROOF AND REFEREE TERMS",
      clean(data.proofTerms),
      "",
      "CANCELLATION AND RESCHEDULING TERMS",
      clean(data.cancellationTerms),
      "",
      "Authority confirmation: Confirmed by the draft creator.",
      "Beta acknowledgment: Confirmed by the draft creator.",
      "Beta wager status: Gold, Standing, middlers, custody, settlement, and Double Jeopardy are disabled.",
      "Status: LOCAL DRAFT ONLY. Connected declarations and acceptance remain closed until launch checks pass.",
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
    save();
  }

  form.addEventListener("input", handleInput);
  declarationInputs.forEach((input) => input.addEventListener("input", handleInput));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
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
  });

  document.querySelector("#copy-declaration").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      status.textContent = "Declaration draft copied.";
    } catch (_) {
      status.textContent = "Copying was blocked. Select the draft text and copy it manually.";
    }
  });

  document.querySelector("#download-declaration").addEventListener("click", () => {
    const type = declarationType().toLowerCase();
    download(`mortal-league-${type}-declaration.txt`, output.textContent);
  });

  restore();
  updateType();
})();
