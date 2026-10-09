(function () {
  "use strict";
  const form = document.querySelector("#reputation-report");
  const proof = document.querySelector("#reputation-proof");
  const result = document.querySelector("#reputation-result");
  const output = document.querySelector("#reputation-text");
  const status = document.querySelector("#reputation-status");
  const clean = (value) => String(value || "").trim();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    output.textContent = ["MORTAL LEAGUE GUILD REPUTATION DRAFT", "This draft and screenshot remain on this device.", "", `Guild: ${clean(data.guild)}`, `Ladder: ${clean(data.ladder)}`, `Category: ${clean(data.category)}`, `Requested points: ${clean(data.points)}`, `Date and time: ${clean(data.time)}`, `Place: ${clean(data.place)}`, `Participants: ${clean(data.participants)}`, `Event length: ${clean(data.length)}`, `Reached people outside the guild: ${clean(data.external)}`, `Screenshot to attach manually: ${proof.files[0] ? proof.files[0].name : "None"}`, "", "Explanation:", clean(data.description), "", "Status after future submission: Provisional for 48 hours, then final unless objected to.", "Disputed review: Uninvolved referee."].join("\n");
    result.hidden = false;
    status.textContent = "Draft created. The screenshot was not uploaded.";
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#copy-reputation").addEventListener("click", async () => { await navigator.clipboard.writeText(output.textContent); status.textContent = "Draft copied."; });
  document.querySelector("#download-reputation").addEventListener("click", () => { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([output.textContent], { type: "text/plain;charset=utf-8" })); link.download = "mortal-league-reputation-draft.txt"; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1000); });
})();
