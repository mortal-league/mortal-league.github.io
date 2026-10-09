(function () {
  "use strict";
  const result = document.querySelector("#sherpa-result");
  const title = document.querySelector("#sherpa-result-title");
  const output = document.querySelector("#sherpa-text");
  const status = document.querySelector("#sherpa-status");
  let filename = "mortal-league-sherpa-draft.txt";
  const clean = (value) => String(value || "").trim();
  document.querySelectorAll(".sherpa-form").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const kind = form.dataset.kind;
    const data = Object.fromEntries(new FormData(form).entries());
    const rows = Object.entries(data).filter(([key]) => key !== "age").map(([key, value]) => `${key.replace(/\b\w/g, (letter) => letter.toUpperCase())}: ${clean(value)}`);
    output.textContent = [kind.toUpperCase(), "This private draft was created on the user's device. It was not submitted.", "", ...rows, "", "Age confirmation: Applicant stated they are at least 18.", "Star Vault verification: NOT VERIFIED."].join("\n");
    title.textContent = `${kind} draft`;
    filename = `mortal-league-${kind.toLowerCase().replace(/\s+/g, "-")}.txt`;
    result.hidden = false;
    status.textContent = "Nothing was sent.";
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  document.querySelector("#copy-sherpa").addEventListener("click", async () => { await navigator.clipboard.writeText(output.textContent); status.textContent = "Draft copied."; });
  document.querySelector("#download-sherpa").addEventListener("click", () => { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([output.textContent], { type: "text/plain;charset=utf-8" })); link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1000); });
})();
