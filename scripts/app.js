(() => {
 const levelsData = [
    { level: 1, stake: 1, bankrollMin: 1, bankrollMax: 5, nextTarget: 6, rangeDisplay: "$1 – $5" },
    { level: 2, stake: 2, bankrollMin: 6, bankrollMax: 15, nextTarget: 16, rangeDisplay: "$6 – $15" },
    { level: 3, stake: 3, bankrollMin: 16, bankrollMax: 35, nextTarget: 36, rangeDisplay: "$16 – $35" },
    { level: 4, stake: 5, bankrollMin: 36, bankrollMax: 75, nextTarget: 76, rangeDisplay: "$36 – $75" },
    { level: 5, stake: 8, bankrollMin: 76, bankrollMax: 155, nextTarget: 156, rangeDisplay: "$76 – $155" },
    { level: 6, stake: 13, bankrollMin: 156, bankrollMax: 315, nextTarget: 316, rangeDisplay: "$156 – $315" },
    { level: 7, stake: 21, bankrollMin: 316, bankrollMax: 635, nextTarget: 636, rangeDisplay: "$316 – $635" },
    { level: 8, stake: 34, bankrollMin: 636, bankrollMax: 1275, nextTarget: 1276, rangeDisplay: "$636 – $1,275" },
    { level: 9, stake: 55, bankrollMin: 1276, bankrollMax: 2555, nextTarget: 2556, rangeDisplay: "$1,276 – $2,555" },
    { level: 10, stake: 89, bankrollMin: 2556, bankrollMax: 5115, nextTarget: 5116, rangeDisplay: "$2,556 – $5,115" }
];

  const $ = (id) => document.getElementById(id);

  let currentBankroll = 1.0;
  let betLog = [];

  function findLevelByBankroll(bankroll) {
    const br = Number.isFinite(bankroll) ? bankroll : 1;
    for (let i = levelsData.length - 1; i >= 0; i--) {
      const lvl = levelsData[i];
      if (br >= lvl.bankrollMin && br <= lvl.bankrollMax) return lvl;
    }
    return levelsData[0];
  }

  function renderFullTable(currentLevelObj) {
    const tbody = $("tableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    levelsData.forEach((lvl) => {
      const row = document.createElement("tr");
      const isCurrent = Boolean(currentLevelObj && currentLevelObj.level === lvl.level);
      if (isCurrent) row.classList.add("current-row");

      const stakeFormatted = `$${lvl.stake.toFixed(2)}`;
      const targetDisplay = lvl.nextTarget === Infinity || lvl.level === 10 ? "MAX" : `$${lvl.nextTarget.toLocaleString()}`;

      row.innerHTML = `
        <td style="font-weight: 550;">${lvl.level}</td>
        <td class="${isCurrent ? "stake-highlight" : ""}">${stakeFormatted}</td>
        <td>${lvl.rangeDisplay}</td>
        <td>${targetDisplay}</td>
      `;
      tbody.appendChild(row);
    });
  }

  function updateAllUI(bankroll) {
    const br = parseFloat(String(bankroll));
    if (!Number.isFinite(br)) return;

    currentBankroll = br;
    const level = findLevelByBankroll(br);
    const nextText = level.nextTarget === Infinity ? "MAX" : `$${level.nextTarget.toLocaleString()}`;

    $("currentLevel").innerText = String(level.level);
    $("currentStake").innerText = `$${level.stake.toFixed(2)}`;
    $("currentRange").innerText = level.rangeDisplay;
    $("nextTarget").innerText = nextText;

    $("debitLevel").innerText = String(level.level);
    $("debitStake").innerText = `$${level.stake.toFixed(2)}`;
    $("debitRange").innerText = level.rangeDisplay;
    $("debitTarget").innerText = nextText;
    $("debitBankroll").innerText = `$${br.toFixed(2)}`;

    renderFullTable(level);
    $("bankrollInput").value = br.toFixed(2);

    localStorage.setItem("nandoz_bankroll", br.toFixed(2));
  }

  function handleManualCheck() {
    let val = parseFloat($("bankrollInput").value);
    if (!Number.isFinite(val)) val = 1;
    if (val < 0) val = 0;
    updateAllUI(val);
  }

  function addLogEntry(_source, action, newBalance) {
    const time = new Date().toLocaleTimeString();
    betLog.unshift({ time, action, newBalance: newBalance.toFixed(2) });
    if (betLog.length > 20) betLog.pop();
    renderBetLog();
    localStorage.setItem("nandoz_betlog", JSON.stringify(betLog));
  }

  function resetToStart() {
    updateAllUI(1.0);
    addLogEntry("System", "Reset bankroll to $1.00", 1.0);
  }

  function applyBetAndUpdate(stake, resultType) {
    const stakeVal = parseFloat(String(stake));
    if (!Number.isFinite(stakeVal) || stakeVal <= 0) {
      window.alert("Please enter a valid stake amount");
      return false;
    }

    let newBankroll = currentBankroll;
    if (resultType === "win") newBankroll = currentBankroll + stakeVal;
    if (resultType === "loss") newBankroll = currentBankroll - stakeVal;
    if (newBankroll < 0) newBankroll = 0;

    updateAllUI(newBankroll);
    return true;
  }

  function renderBetLog() {
    const logContainer = $("betLogList");
    if (!logContainer) return;
    if (betLog.length === 0) {
      logContainer.innerHTML = '<div class="empty-log">No bets logged yet</div>';
      return;
    }

    logContainer.innerHTML = betLog
      .map(
        (entry) => `
      <div class="log-item">
        <span>${entry.time}</span>
        <span>${entry.action}</span>
        <span>$${entry.newBalance}</span>
      </div>
    `,
      )
      .join("");
  }

  function saveNotes() {
    const notes = $("userNotes").value;
    localStorage.setItem("nandoz_notes", notes);
    window.alert("Notes saved!");
  }

  function loadNotes() {
    const saved = localStorage.getItem("nandoz_notes");
    if (saved) $("userNotes").value = saved;
  }

  function loadSavedData() {
    const savedBankroll = localStorage.getItem("nandoz_bankroll");
    if (savedBankroll && !Number.isNaN(parseFloat(savedBankroll))) {
      updateAllUI(parseFloat(savedBankroll));
    } else {
      updateAllUI(1.0);
    }

    const savedLog = localStorage.getItem("nandoz_betlog");
    if (savedLog) {
      try {
        betLog = JSON.parse(savedLog);
        renderBetLog();
      } catch {
        betLog = [];
      }
    }
    loadNotes();
  }

  function openSidebar() {
    $("sidebar").classList.add("open");
    $("sidebarToggle").setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    $("sidebar").classList.remove("open");
    $("sidebarToggle").setAttribute("aria-expanded", "false");
  }

  function isMobileLayout() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function setPinned(pinned) {
    document.documentElement.classList.toggle("sidebar-pinned", pinned);
    localStorage.setItem("nandoz_sidebar_pinned", pinned ? "1" : "0");
  }

  function getPinned() {
    return localStorage.getItem("nandoz_sidebar_pinned") === "1";
  }

  function bindEvents() {
    $("checkBtn").addEventListener("click", handleManualCheck);
    $("quickCheckBtn").addEventListener("click", handleManualCheck);
    $("quickResetBtn").addEventListener("click", resetToStart);

    $("sidebarToggle").addEventListener("click", () => {
      if (isMobileLayout()) {
        const isOpen = $("sidebar").classList.contains("open");
        if (isOpen) closeSidebar();
        else openSidebar();
        return;
      }

      // Desktop: pinned expand/collapse
      setPinned(!document.documentElement.classList.contains("sidebar-pinned"));
      $("sidebarToggle").setAttribute(
        "aria-expanded",
        document.documentElement.classList.contains("sidebar-pinned") ? "true" : "false",
      );
    });

    $("closeSidebar").addEventListener("click", () => {
      if (isMobileLayout()) {
        closeSidebar();
        return;
      }
      setPinned(false);
      $("sidebarToggle").setAttribute("aria-expanded", "false");
    });
    $("saveNotesBtn").addEventListener("click", saveNotes);

    const applyBtn = $("applyBetBtn");
    const addBtn = $("addBetBtn");

    applyBtn.addEventListener("click", () => {
      const stake = $("betStakeInput").value;
      const result = $("betResultSelect").value;
      if (applyBetAndUpdate(stake, result)) {
        const actionText = result === "win" ? `Won +$${stake}` : `Lost -$${stake}`;
        addLogEntry("Bet", actionText, currentBankroll);
        $("betStakeInput").value = "";
      }
    });

    addBtn.addEventListener("click", () => {
      const stake = $("betStakeInput").value;
      const result = $("betResultSelect").value;
      const stakeVal = parseFloat(String(stake));
      if (!Number.isFinite(stakeVal) || stakeVal <= 0) {
        window.alert("Enter stake amount");
        return;
      }
      const actionText = result === "win" ? `Recorded Win +$${stake}` : `Recorded Loss -$${stake}`;
      addLogEntry("Log", actionText, currentBankroll);
      $("betStakeInput").value = "";
    });

    $("bankrollInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleManualCheck();
    });

    // Keyboard accessibility for the user section “hover card”
    $("userSection").addEventListener("keydown", (e) => {
      if (e.key === "Escape") ($("userSection")).blur();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    window.addEventListener("resize", () => {
      // Keep state sane across breakpoints
      if (!isMobileLayout()) {
        closeSidebar();
        $("sidebarToggle").setAttribute(
          "aria-expanded",
          document.documentElement.classList.contains("sidebar-pinned") ? "true" : "false",
        );
      }
    });
  }

  function init() {
    // Defensive: only run on main.html
    if (!$("bankrollInput")) return;
    setPinned(getPinned());
    $("sidebarToggle").setAttribute("aria-expanded", getPinned() ? "true" : "false");
    loadSavedData();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

