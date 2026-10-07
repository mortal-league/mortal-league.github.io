(function () {
  "use strict";

  const VERIFIED = "September 11, 2026";
  const STORAGE_KEY = "mol-report-assistant-draft-v1";
  const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

  const incidentLabels = {
    threat: "Threat or swatting",
    stalking: "Stalking or harassment",
    ddos: "DDoS or network attack",
    doxxing: "Doxxing or privacy exposure",
    account: "Account compromise",
    fraud: "Fraud or extortion",
    intimate: "Intimate image abuse",
    rules: "Game or platform violation",
  };

  const regionData = {
    us: { label: "United States", emergency: "911", phone: "tel:911" },
    canada: { label: "Canada", emergency: "911", phone: "tel:911" },
    uk: { label: "UK: England, Wales, or Northern Ireland", emergency: "999", phone: "tel:999" },
    scotland: { label: "UK: Scotland", emergency: "999", phone: "tel:999" },
    eu: { label: "European Union or EEA", emergency: "112", phone: "tel:112" },
    australia: { label: "Australia", emergency: "000", phone: "tel:000" },
    nz: { label: "New Zealand", emergency: "111", phone: "tel:111" },
    other: { label: "Another country", emergency: "your local emergency number", phone: "" },
  };

  const platformData = {
    mo1: {
      label: "Mortal Online 1",
      name: "Mortal Online 1 account and support",
      url: "https://account.mortalonline.com/content.php?name=index",
      reason: "Use Star Vault's official MO1 account page to find current account and support routes.",
      steps: [
        "Open the official MO1 account page.",
        "Check the current support and account options.",
        "Send only the details needed for the report.",
        "Save the reply or ticket number.",
      ],
    },
    mo2: {
      label: "Mortal Online 2",
      name: "Mortal Online 2 Help Center",
      url: "https://www.mortalonline2.com/help-center/",
      reason: "Send game, cheat, account, and tech reports to Star Vault.",
      steps: [
        "Open the official Help Center.",
        "Select the blue Help button in the bottom-right corner.",
        "Pick the closest topic and paste your report.",
        "Add only the proof the form asks for. Save the ticket number.",
      ],
    },
    discord: {
      label: "Discord",
      name: "Report to Discord",
      url: "https://discord.com/safety/360044103651-reporting-abusive-behavior-to-discord",
      reason: "Use Discord's report tool. It sends the original message or profile details.",
      steps: [
        "On mobile, hold the message. On desktop, right-click it.",
        "Choose Report Message and select the closest violation.",
        "For a profile, open its three-dot menu and choose Report User Profile.",
        "For an EU legal report, copy the message link first. Then open the DSA form.",
      ],
    },
    steam: {
      label: "Steam",
      name: "Report through Steam",
      url: "https://help.steampowered.com/en/faqs/view/4DE7-17AA-0E8B-C1AD",
      reason: "Report the exact profile, chat, group, review, image, or post.",
      steps: [
        "Open the profile or content connected to the conduct.",
        "Use its More or Report control.",
        "Choose the closest category and identify the specific content.",
        "Save the profile link and report receipt.",
      ],
    },
    twitch: {
      label: "Twitch",
      name: "Report to Twitch",
      url: "https://safety.twitch.tv/s/article/Filing-a-Report?language=en_US",
      reason: "Report the channel, stream, clip, whisper, or chat from that item.",
      steps: [
        "Open the channel, stream, clip, or message.",
        "Choose the three-dot menu, then Report.",
        "Select the closest reason and include relevant timestamps or links.",
        "Send one report. Save the receipt.",
      ],
    },
    youtube: {
      label: "YouTube",
      name: "Report on YouTube",
      url: "https://support.google.com/youtube/answer/2802027",
      reason: "Report the video, channel, comment, post, Short, or live chat.",
      steps: [
        "Open the content and choose More, then Report.",
        "Select the reason that best matches the violation.",
        "For private data, use YouTube's Privacy Complaint form.",
        "For a legal issue, choose Legal issue and fill out the form.",
      ],
    },
    epic: {
      label: "Epic Games",
      name: "Report to Epic Games",
      url: "https://safety.epicgames.com/en-US/policies/reporting-misconduct",
      reason: "Use Epic's official report page for its games and services.",
      steps: [
        "Open Epic's Reporting Misconduct page.",
        "Choose Report Content or the instructions for the relevant product.",
        "Pick the issue and add the IDs the form asks for.",
        "Send one report. Save its number.",
      ],
    },
    network: {
      label: "Internet provider or network",
      name: "Contact your internet provider",
      url: "",
      reason: "Your provider can check the outage, save logs, and help restore service.",
      steps: [
        "Use the support number or app on your provider account.",
        "Say you suspect a network attack and give the start and stop times.",
        "Ask the provider to preserve relevant logs.",
        "Save the ticket number and what the provider did.",
      ],
    },
    other: {
      label: "Another service",
      name: "Report on the service where it happened",
      url: "",
      reason: "Use the service's official report, safety, legal, or account help page.",
      steps: [
        "Open the exact message, profile, transaction, or content.",
        "Use the service's Report or Safety control.",
        "Paste your report when the form asks what happened.",
        "Save the ticket number.",
      ],
    },
  };

  const authorityRoutes = {
    us: {
      cyber: {
        name: "FBI Internet Crime Complaint Center",
        url: "https://complaint.ic3.gov/",
        reason: "IC3 takes FBI reports for DDoS attacks, hacking, fraud, and blackmail.",
        steps: [
          "Open the complaint form, read the terms, and select Accept.",
          "Enter the affected person's contact details on IC3.",
          "Add loss, payment, and account details.",
          "Paste the prepared incident summary into Details.",
          "Save or print the report before you leave. IC3 does not email a copy.",
        ],
      },
      police: {
        name: "Local law enforcement",
        url: "https://www.usa.gov/local-governments",
        reason: "Contact local police for threats, stalking, swatting, blackmail, or urgent harm.",
        steps: [
          "Call 911 for immediate danger. Otherwise use your local police non-emergency route.",
          "State the safety concern first, then give the short timeline.",
          "Give exact account IDs, links, and threat words when asked.",
          "Ask for the report number.",
        ],
      },
    },
    canada: {
      cyber: {
        name: "Canadian Anti-Fraud Centre",
        url: "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
        reason: "Canada's official service takes fraud and cybercrime reports.",
        steps: [
          "Open Report fraud and cybercrime, then choose the online reporting route.",
          "Indicate whether you are a victim or witness and whether money was lost.",
          "Paste your timeline. Add payment or account IDs.",
          "Also contact local police if you were a victim, and keep both report numbers.",
        ],
      },
      police: {
        name: "Local police in Canada",
        url: "https://www.rcmp-grc.gc.ca/detach/en/find",
        reason: "Local police check threats, stalking, swatting, blackmail, and other crimes.",
        steps: [
          "Call 911 for immediate danger.",
          "Otherwise find the police service for your location.",
          "Give the safety risk, timeline, and exact online IDs.",
          "Ask for a police file number.",
        ],
      },
    },
    uk: {
      cyber: {
        name: "Report Fraud",
        url: "https://www.reportfraud.police.uk/reporting-a-fraud/",
        reason: "This service takes fraud and cybercrime reports for England, Wales, and Northern Ireland.",
        steps: [
          "Open the official page and choose Report a cyber crime or fraud.",
          "Select Make a report and follow the identity prompts.",
          "Paste the prepared incident summary and add any loss or transaction details.",
          "Save the crime reference number sent after submission.",
        ],
      },
      police: {
        name: "UK police: stalking and harassment",
        url: "https://www.police.uk/advice/advice-and-information/sh/stalking-harassment/how-to-report-stalking-harassment/",
        reason: "Use police reports for threats, stalking, abuse, swatting, or urgent danger.",
        steps: [
          "Call 999 for an emergency or 101 for a non-emergency occurring now.",
          "Open the police guidance and choose the reporting route for your local force.",
          "State what keeps happening and why you feel unsafe.",
          "You can report before you have collected evidence.",
        ],
      },
    },
    scotland: {
      cyber: {
        name: "Police Scotland",
        url: "https://www.scotland.police.uk/secureforms/c3/",
        reason: "Send cybercrime, fraud, threat, stalking, and abuse reports to Police Scotland.",
        steps: [
          "Call 999 for immediate danger or 101 for a non-emergency occurring now.",
          "Use Police Scotland's online contact form for a non-urgent report.",
          "Paste the prepared timeline and give exact online identifiers.",
          "Keep the incident or reference number.",
        ],
      },
      police: null,
    },
    eu: {
      cyber: {
        name: "Europol national cybercrime directory",
        url: "https://www.europol.europa.eu/report-a-crime/report-cybercrime-online",
        reason: "Europol links you to your national police or cybercrime site. It does not take the report.",
        steps: [
          "Open the official Europol directory.",
          "Choose the country where you need to report.",
          "Open that country's police or cybercrime portal.",
          "Paste the prepared incident summary and keep the national report number.",
        ],
      },
      police: {
        name: "EU emergency services",
        url: "https://europa.eu/youreurope/citizens/travel/security-and-emergencies/emergency/index_en.htm",
        reason: "Call 112 in the EU for danger now. Use national police for other crime reports.",
        steps: [
          "Call 112 if anyone is in immediate danger.",
          "For a non-emergency, use the national route in the Europol directory.",
          "State the safety concern and the short chronology.",
          "Keep the report number and agency name.",
        ],
      },
    },
    australia: {
      cyber: {
        name: "Australian ReportCyber",
        url: "https://www.cyber.gov.au/report-and-recover/report",
        reason: "ReportCyber is Australia's official cybercrime report service.",
        steps: [
          "Open ReportCyber and choose Report a cybercrime or cyber security incident.",
          "Select the option for an individual and follow the incident prompts.",
          "Paste the prepared incident summary and add loss, account, or network details.",
          "Use your email to save, resume, or check the submitted report if offered.",
        ],
      },
      police: {
        name: "eSafety Commissioner",
        url: "https://www.esafety.gov.au/report",
        reason: "eSafety checks serious online abuse, image abuse, child bullying, and illegal content.",
        steps: [
          "Call 000 first if anyone is in immediate danger.",
          "Open Report online harm and choose Report Now.",
          "Select the abuse or content category that matches what happened.",
          "Follow the form prompts, add links and evidence, and keep the reference.",
        ],
      },
    },
    nz: {
      cyber: {
        name: "New Zealand NCSC incident report",
        url: "https://www.ncsc.govt.nz/report/business-and-individuals/",
        reason: "NCSC takes cyber reports from people and small firms. This includes DDoS and account attacks.",
        steps: [
          "Open the individual and small business report page.",
          "Choose the incident type and enter your contact details directly on the form.",
          "Paste the prepared incident summary and add technical details if known.",
          "Keep the report reference and any support instructions.",
        ],
      },
      police: {
        name: "New Zealand Police 105",
        url: "https://www.police.govt.nz/use-105",
        reason: "Use 105 for non-urgent crime. Call 111 for danger now.",
        steps: [
          "Call 111 if anyone is in immediate danger.",
          "For a non-emergency, open 105 and choose Make an online report.",
          "State the current safety concern, then paste the prepared timeline.",
          "Save the police report number.",
        ],
      },
      harm: {
        name: "Netsafe online harm report",
        url: "https://netsafe.org.nz/report",
        reason: "Netsafe helps people in New Zealand with online harm.",
        steps: [
          "Open the Netsafe report page.",
          "Choose the online harm category and preferred contact method.",
          "Provide links, account names, and your short timeline.",
          "Keep any case or contact reference.",
        ],
      },
    },
    other: {
      cyber: {
        name: "Your national cybercrime or police service",
        url: "",
        reason: "Use your country's official police or cybercrime site. The League does not detect your country.",
        steps: [
          "Search your government's official domain for report cybercrime or report online crime.",
          "Confirm the site belongs to the national or local authority before entering personal information.",
          "Paste the prepared incident summary.",
          "Keep the agency name and report number.",
        ],
      },
      police: null,
    },
  };

  const universalEvidence = [
    "Save original files, message links, dates, times, time zones, and account IDs.",
    "Keep one clean copy before you crop, mark, or hide details.",
    "Write a short timeline. Split what you saw from what others told you.",
    "Do not repost threats, doxxing, private images, or personal details.",
    "Save each platform, provider, police, and agency report number.",
  ];

  const incidentEvidence = {
    threat: [
      "Save the exact threat words, message link, and nearby messages.",
      "Write why the threat feels real. Note any place, time, family, or weapon details.",
      "If danger may be near, call emergency services before you warn the person.",
    ],
    stalking: [
      "List repeat contact by date. Include new accounts used after a block.",
      "Save any attempt to link online play to your home, job, family, or travel.",
      "You can report stalking or abuse before all proof is ready.",
    ],
    ddos: [
      "Save the attack start and end, affected services, signs, demands, and warnings.",
      "Ask your internet provider to save logs and give you a ticket number.",
      "Keep firewall, router, server, and service logs. Do not post IP addresses or strike back.",
    ],
    doxxing: [
      "Save the exact link and an image that shows where the personal data appeared.",
      "List what was exposed. Do not copy private values more than needed.",
      "Ask the platform to save and remove the post. Do not repost it as proof.",
    ],
    account: [
      "Save login alerts, reset emails, account notices, and open login details.",
      "Secure your email first. Then change passwords, end open logins, and turn on two-step login.",
      "List purchases, messages, trades, or account changes you did not make.",
    ],
    fraud: [
      "Keep payment dates, amounts, receipts, account details, wallet addresses, and hashes.",
      "Call the bank or payment service soon. Save its ticket number.",
      "Save the offer, wager rules, demands, and messages. Do not send more money.",
    ],
    intimate: [
      "Do not forward or repost private sexual images. Save the link and use the platform's private report.",
      "Save threats, demands, account IDs, and message times.",
      "If an image may show a child, do not download or share it. Contact police or child protection.",
    ],
    rules: [
      "Save the exact post, match, character, server, and time.",
      "Keep the original video or image. Add a short note about what it shows.",
      "Report once through the official route. False or repeat reports may break platform rules.",
    ],
  };

  const form = document.getElementById("report-form");
  const planResults = document.getElementById("plan-results");
  const emptyPlan = document.getElementById("empty-plan");
  const routeCards = document.getElementById("route-cards");
  const summaryOutput = document.getElementById("summary-output");
  const checklist = document.getElementById("evidence-checklist");
  const planCount = document.getElementById("plan-count");
  const formStatus = document.getElementById("form-status");
  const dangerAction = document.getElementById("danger-action");

  function values() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ savedAt: Date.now(), data: values() }),
      );
    } catch (_) {
      // The assistant still works when storage is unavailable.
    }
  }

  function restoreDraft() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored) return;
      const savedAt = Number(stored.savedAt || 0);
      if (!savedAt || Date.now() - savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      Object.entries(stored.data || {}).forEach(([name, value]) => {
        const controls = form.elements.namedItem(name);
        if (!controls) return;
        if (controls instanceof RadioNodeList) {
          controls.value = value;
        } else {
          controls.value = value;
        }
      });
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function authorityCards(data) {
    const region = authorityRoutes[data.region];
    if (!region) return [];
    const cards = [];
    const crimeFirst = ["threat", "stalking", "doxxing", "intimate"].includes(data.incident);
    const cyberNeeded = ["ddos", "account", "fraud"].includes(data.incident);

    if (crimeFirst && region.police) cards.push({ ...region.police, type: "Police or safety authority", priority: 1 });
    if (cyberNeeded && region.cyber) cards.push({ ...region.cyber, type: "Cybercrime authority", priority: 1 });
    if (!crimeFirst && !cyberNeeded && data.incident !== "rules" && region.cyber) {
      cards.push({ ...region.cyber, type: "National reporting route", priority: 2 });
    }
    if (data.region === "australia" && ["stalking", "doxxing", "intimate"].includes(data.incident)) {
      cards.push({ ...region.police, type: "Online safety regulator", priority: 2 });
    }
    if (data.region === "nz" && ["stalking", "doxxing", "intimate"].includes(data.incident)) {
      cards.push({ ...region.harm, type: "Online harm support", priority: 2 });
    }
    if (data.region === "scotland" && region.cyber && crimeFirst) {
      cards.push({ ...region.cyber, type: "Police reporting route", priority: 1 });
    }
    if (data.region === "eu" && region.cyber && crimeFirst) {
      cards.push({ ...region.cyber, type: "National reporting directory", priority: 2 });
    }
    if (data.region === "other" && region.cyber && data.incident !== "rules") {
      cards.push({ ...region.cyber, type: "National reporting route", priority: 2 });
    }
    return uniqueCards(cards);
  }

  function uniqueCards(cards) {
    const seen = new Set();
    return cards.filter((card) => {
      const key = card.name + card.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function allCards(data) {
    const cards = [];
    if (data.danger === "yes") {
      const r = regionData[data.region] || regionData.other;
      cards.push({
        name: `Call ${r.emergency}`,
        url: r.phone,
        reason: "Call emergency services now. Do not wait to finish this report or gather proof.",
        steps: [
          "Move to a safer place if you can do so safely.",
          "Tell the dispatcher your current location and the immediate danger.",
          "Follow the dispatcher's instructions.",
        ],
        type: "Immediate danger",
        priority: 0,
        emergency: true,
      });
    }
    cards.push(...authorityCards(data));
    if (data.platform && platformData[data.platform]) {
      cards.push({ ...platformData[data.platform], type: "Platform report", priority: 3 });
    }
    if (data.incident === "ddos" && data.platform !== "network") {
      cards.push({ ...platformData.network, type: "Technical response", priority: 2 });
    }
    return uniqueCards(cards).sort((a, b) => a.priority - b.priority);
  }

  function routeCard(card, index) {
    const steps = card.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
    const action = card.url
      ? `<a href="${escapeAttr(card.url)}" target="_blank" rel="noopener noreferrer">${card.url.startsWith("tel:") ? "Call now" : "Open official reporting page"}</a>`
      : "";
    return `
      <article class="route-card${card.emergency ? " emergency" : ""}">
        <div class="route-meta"><span>Step ${index + 1}</span><span>${escapeHtml(card.type)}</span></div>
        <h3>${escapeHtml(card.name)}</h3>
        <p>${escapeHtml(card.reason)}</p>
        <ol>${steps}</ol>
        ${action}
      </article>`;
  }

  function buildSummary(data) {
    const date = new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    const region = regionData[data.region]?.label || "Not selected";
    const platform = platformData[data.platform]?.label || "Not selected";
    const happened = data.occurred ? data.occurred.replace("T", " ") : "Not entered";
    const lines = [
      "INCIDENT REPORT DRAFT",
      `Prepared: ${date}`,
      `Official links last verified: ${VERIFIED}`,
      "",
      `Incident category: ${incidentLabels[data.incident] || "Not selected"}`,
      `Country or region (self-selected): ${region}`,
      `Primary platform: ${platform}`,
      `Immediate danger now: ${data.danger === "yes" ? "Yes" : "No"}`,
      `Incident date/time: ${happened}`,
      `Timezone: ${clean(data.timezone)}`,
      "",
      "ACCOUNTS OR IDENTIFIERS INVOLVED",
      clean(data.subjects),
      "",
      "LINKS, CHANNELS, OR EXISTING TICKET NUMBERS",
      clean(data.links),
      "",
      "WHAT HAPPENED",
      clean(data.narrative),
      "",
      "IMPACT, LOSS, OR SAFETY CONCERN",
      clean(data.impact),
      "",
      "EVIDENCE RETAINED",
      clean(data.evidence),
      "",
      "REVIEW BEFORE SUBMITTING",
      "I split what I saw from what others told me.",
      "I will put private details only on an official form that needs them.",
    ];
    if (data.incident === "ddos") {
      lines.splice(15, 0, "Use the term DDoS in the incident description when applicable.", "");
    }
    return lines.join("\n");
  }

  function clean(value) {
    const trimmed = String(value || "").trim();
    return trimmed || "Not entered";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function renderDanger() {
    const data = values();
    if (data.danger !== "yes") {
      dangerAction.hidden = true;
      dangerAction.innerHTML = "";
      return;
    }
    const region = regionData[data.region] || regionData.other;
    const action = region.phone
      ? `<a href="${region.phone}">Call ${escapeHtml(region.emergency)}</a>`
      : "";
    dangerAction.innerHTML = `
      <strong>Stop here and contact ${escapeHtml(region.emergency)} now.</strong>
      <span>Give your current place and say what danger is near. Follow their steps.</span>
      ${action}`;
    dangerAction.hidden = false;
  }

  function renderPlan(data, shouldScroll) {
    const cards = allCards(data);
    routeCards.innerHTML = cards.map(routeCard).join("");
    planCount.textContent = String(cards.length);
    summaryOutput.textContent = buildSummary(data);
    const evidence = [...universalEvidence, ...(incidentEvidence[data.incident] || [])];
    checklist.innerHTML = evidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    emptyPlan.hidden = true;
    planResults.hidden = false;
    if (shouldScroll && window.innerWidth < 1080) {
      document.getElementById("report-plan").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleInput() {
    saveDraft();
    renderDanger();
    const data = values();
    if (data.incident && data.region && data.platform) renderPlan(data, false);
  }

  form.addEventListener("input", handleInput);
  document.querySelectorAll('[name="danger"]').forEach((control) => {
    control.addEventListener("input", handleInput);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = values();
    if (!data.incident || !data.region || !data.platform) {
      formStatus.textContent = "Choose an incident, region, and primary platform first.";
      const missing = !data.incident ? form.querySelector('[name="incident"]') : !data.region ? form.region : form.platform;
      missing.focus();
      return;
    }
    formStatus.textContent = "";
    renderPlan(data, true);
    saveDraft();
  });

  document.getElementById("clear-draft").addEventListener("click", () => {
    if (!window.confirm("Delete this report draft from this browser?")) return;
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    emptyPlan.hidden = false;
    planResults.hidden = true;
    planCount.textContent = "0";
    formStatus.textContent = "Draft deleted from this browser.";
    renderDanger();
  });

  document.getElementById("copy-summary").addEventListener("click", async (event) => {
    const text = summaryOutput.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    event.currentTarget.textContent = "Copied";
    setTimeout(() => (event.currentTarget.textContent = "Copy"), 1800);
  });

  document.getElementById("download-summary").addEventListener("click", () => {
    const blob = new Blob([summaryOutput.textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("print-summary").addEventListener("click", () => window.print());

  function registerWebMcpTool() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const allowedIncidents = Object.keys(incidentLabels);
    const allowedRegions = Object.keys(regionData);
    const allowedPlatforms = Object.keys(platformData);

    void Promise.resolve(
      context.registerTool({
        name: "prepare_incident_report",
        title: "Prepare incident report",
        description:
          "Stage a private-on-device incident report, update the visible Report Assistant, and return the ordered official reporting destinations. This prepares a report but does not submit it.",
        inputSchema: {
          type: "object",
          properties: {
            incident: { type: "string", enum: allowedIncidents },
            region: { type: "string", enum: allowedRegions },
            platform: { type: "string", enum: allowedPlatforms },
            immediateDanger: { type: "boolean" },
            occurred: { type: "string" },
            timezone: { type: "string" },
            subjects: { type: "string" },
            links: { type: "string" },
            narrative: { type: "string" },
            impact: { type: "string" },
            evidence: { type: "string" },
          },
          required: ["incident", "region", "platform", "immediateDanger"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute(input) {
          if (!input || typeof input !== "object") throw new Error("Report details are required.");
          if (!allowedIncidents.includes(input.incident)) throw new Error("Invalid incident category.");
          if (!allowedRegions.includes(input.region)) throw new Error("Invalid region.");
          if (!allowedPlatforms.includes(input.platform)) throw new Error("Invalid platform.");
          if (typeof input.immediateDanger !== "boolean") throw new Error("Immediate danger must be true or false.");

          form.elements.namedItem("incident").value = input.incident;
          form.elements.namedItem("region").value = input.region;
          form.elements.namedItem("platform").value = input.platform;
          form.elements.namedItem("danger").value = input.immediateDanger ? "yes" : "no";
          ["occurred", "timezone", "subjects", "links", "narrative", "impact", "evidence"].forEach((name) => {
            if (typeof input[name] === "string") form.elements.namedItem(name).value = input[name];
          });

          const data = values();
          saveDraft();
          renderDanger();
          renderPlan(data, false);
          document.getElementById("report-plan").scrollIntoView({ behavior: "smooth", block: "start" });
          return {
            status: "prepared",
            submitted: false,
            routeCount: allCards(data).length,
            destinations: allCards(data).map((card) => ({ name: card.name, url: card.url || null })),
          };
        },
      }),
    ).catch(() => {});
  }

  restoreDraft();
  renderDanger();
  const restored = values();
  if (restored.incident && restored.region && restored.platform) renderPlan(restored, false);
  registerWebMcpTool();
})();
