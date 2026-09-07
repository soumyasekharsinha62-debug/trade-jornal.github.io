import { loginUser, logoutUser, subscribeAuthState, updateDisplayName } from "./auth.js";
import { createTrade, deleteTrade, listenToTeamTrades, listenToAllUserProfiles, saveUserProfile, subscribeToUserProfile, updateTrade } from "./db.js";
import {
  computeProfitFactor,
  computeWinRate,
  filterTradesByRange,
  computeEquityCurve,
  computeWinLossCounts,
  computeStrategyPerformance,
  computeDailyPnlMap,
  getTradesForDateKey,
  getTradeDate,
  computeAvgWinLoss,
  computeBestWorstTrade,
  computeWinLossStreakSequence,
  computeSymbolPerformance,
  computeDailyTimeline,
  computeNetPnL,
  computePositionValue,
  MAX_ACCOUNT_LIMIT
} from "./metrics.js";

const authView = document.querySelector("#auth-view");
const journalView = document.querySelector("#journal-view");
const welcomeView = document.querySelector("#welcome-view");
const welcomeTitle = document.querySelector("#welcome-title");
const welcomeMessage = document.querySelector("#welcome-message");
const loginForm = document.querySelector("#login-form");
const tradeForm = document.querySelector("#trade-form");
const addTradeButton = document.querySelector("#add-trade-button");
const tradeFormBackdrop = document.querySelector("#trade-form-backdrop");
const tradeFormModal = document.querySelector("#trade-form-modal");
const tradeFormCloseButton = document.querySelector("#trade-form-close");
const tradeFormTitle = document.querySelector("#trade-form-title");
const tradeFormSubmitButton = document.querySelector("#trade-form-submit");
const logoutButton = document.querySelector("#logout-button");
const profileAvatar = document.querySelector("#profile-avatar");
const profileName = document.querySelector("#profile-name");
const sidebarToggleButton = document.querySelector("#sidebar-toggle");
const sidebarToggleAvatar = document.querySelector("#sidebar-toggle-avatar");
const sidebarCloseButton = document.querySelector("#sidebar-close");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
const profileSidebar = document.querySelector("#profile-sidebar");
const sidebarAvatar = document.querySelector("#sidebar-avatar");
const sidebarProfileName = document.querySelector("#sidebar-profile-name");
const sidebarProfileEmail = document.querySelector("#sidebar-profile-email");
const sidebarLogoutButton = document.querySelector("#sidebar-logout-button");
const tradesBody = document.querySelector("#trades-body");
const authError = document.querySelector("#auth-error");
const tradeError = document.querySelector("#trade-error");
const exposureErrorBadge = document.querySelector("#exposure-error-badge");
const syncStatus = document.querySelector("#sync-status");
const passwordInput = document.querySelector("#password");
const togglePasswordButton = document.querySelector("#toggle-password");

const navTabs = document.querySelectorAll(".nav-tab");
const sidebarNavLinks = document.querySelectorAll(".sidebar-nav-link");
const appViews = {
  logger: document.querySelector("#view-logger"),
  analytics: document.querySelector("#view-analytics"),
  profile: document.querySelector("#view-profile")
};

const filterPills = document.querySelectorAll(".filter-bar .filter-pill");
const customRangeContainer = document.querySelector("#custom-range");
const rangeStartInput = document.querySelector("#range-start");
const rangeEndInput = document.querySelector("#range-end");
const applyCustomRangeButton = document.querySelector("#apply-custom-range");
const symbolAssetFilterSelect = document.querySelector("#symbol-asset-filter");
const heatmapGrid = document.querySelector("#heatmap-grid");
const heatmapTitle = document.querySelector("#heatmap-title");
const heatmapPrevMonthButton = document.querySelector("#heatmap-prev-month");
const heatmapNextMonthButton = document.querySelector("#heatmap-next-month");

const dayTradesBackdrop = document.querySelector("#day-trades-backdrop");
const dayTradesModal = document.querySelector("#day-trades-modal");
const dayTradesTitle = document.querySelector("#day-trades-title");
const dayTradesBody = document.querySelector("#day-trades-body");
const dayTradesCloseButton = document.querySelector("#day-trades-close");

const tradesSearchInput = document.querySelector("#trades-search-input");
const tradesDirectionFilter = document.querySelector("#trades-direction-filter");
const tradesOutcomeFilter = document.querySelector("#trades-outcome-filter");
const tradesDateStartInput = document.querySelector("#trades-date-start");
const tradesDateEndInput = document.querySelector("#trades-date-end");
const tradesCustomRangeContainer = document.querySelector("#trades-custom-range");
const tradesApplyCustomRangeButton = document.querySelector("#trades-apply-custom-range");
const tradesDatePresetButtons = document.querySelectorAll(".trades-date-preset");
const tradesFilterResetButton = document.querySelector("#trades-filter-reset");

const profileViewAvatar = document.querySelector("#profile-view-avatar");
const profileViewName = document.querySelector("#profile-view-name");
const profileViewEmail = document.querySelector("#profile-view-email");
const profileTradeCount = document.querySelector("#profile-trade-count");
const profileStatus = document.querySelector("#profile-status");
const profileRoleBadge = document.querySelector("#profile-role-badge");
const editProfileButton = document.querySelector("#edit-profile-button");
const profileEditBackdrop = document.querySelector("#profile-edit-backdrop");
const profileEditModal = document.querySelector("#profile-edit-modal");
const profileEditCloseButton = document.querySelector("#profile-edit-close");
const profileEditForm = document.querySelector("#profile-edit-form");
const profileEditAvatarPreview = document.querySelector("#profile-edit-avatar-preview");
const profileEditChangePhotoButton = document.querySelector("#profile-edit-change-photo");
const profileEditPhotoInput = document.querySelector("#profile-edit-photo-input");
const profileEditNameInput = document.querySelector("#profile-edit-name-input");
const profileEditRoleInput = document.querySelector("#profile-edit-role-input");
const profileEditError = document.querySelector("#profile-edit-error");
const exportCsvButton = document.querySelector("#export-csv-button");
const exportBackdrop = document.querySelector("#export-backdrop");
const exportModal = document.querySelector("#export-modal");
const exportModalCloseButton = document.querySelector("#export-modal-close");
const exportScopeButtons = document.querySelectorAll("[data-export-scope]");
const exportRangeSection = document.querySelector("#export-range-section");
const exportRangeButtons = document.querySelectorAll("[data-export-range]");
const exportDayField = document.querySelector("#export-day-field");
const exportDayInput = document.querySelector("#export-day-input");
const exportCustomRange = document.querySelector("#export-custom-range");
const exportRangeStartInput = document.querySelector("#export-range-start");
const exportRangeEndInput = document.querySelector("#export-range-end");
const exportModalError = document.querySelector("#export-modal-error");
const exportConfirmButton = document.querySelector("#export-confirm-button");

const viewTeamButton = document.querySelector("#view-team-button");
const membersBackdrop = document.querySelector("#members-backdrop");
const membersModal = document.querySelector("#members-modal");
const membersModalCloseButton = document.querySelector("#members-modal-close");
const membersList = document.querySelector("#members-list");

const memberDetailBackdrop = document.querySelector("#member-detail-backdrop");
const memberDetailModal = document.querySelector("#member-detail-modal");
const memberDetailCloseButton = document.querySelector("#member-detail-close");
const memberDetailAvatar = document.querySelector("#member-detail-avatar");
const memberDetailName = document.querySelector("#member-detail-name");
const memberDetailEmail = document.querySelector("#member-detail-email");
const memberDetailRole = document.querySelector("#member-detail-role");
const memberDetailTradeCount = document.querySelector("#member-detail-trade-count");

let activeUser = null;
let unsubscribeTrades = null;
let unsubscribeProfile = null;
let unsubscribeMembers = null;
let allMemberProfiles = [];
let currentProfile = { role: "Team Trader", photoURL: "" };
let pendingPhotoURL = null;
let welcomeTimer = null;
let welcomeExitTimer = null;
let isLoggingOut = false;
let allTrades = [];
let editingTradeId = null;
let currentView = "logger";
let activeRangePreset = "week";
let customRange = null;
let heatmapViewDate = startOfMonth(new Date());
let tradeFilters = { search: "", direction: "ALL", outcome: "ALL", dateStart: "", dateEnd: "" };
let exportScope = "mine";
let exportRangeMode = null;

let equityChart = null;
let winLossChart = null;
let strategyChart = null;
let profitFactorRadialChart = null;
let winRateRadialChart = null;
let symbolChart = null;
let timelineChart = null;
let symbolAssetFilter = "ALL";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.textContent = "";

  const formData = new FormData(loginForm);
  try {
    await loginUser(formData.get("email"), formData.get("password"));
    loginForm.reset();
  } catch (error) {
    authError.textContent = error.message;
  }
});

async function handleLogoutClick() {
  isLoggingOut = true;
  logoutButton.disabled = true;
  sidebarLogoutButton.disabled = true;
  closeSidebar();
  try {
    await logoutUser();
    startLogoutFlow();
  } catch (error) {
    isLoggingOut = false;
    logoutButton.disabled = false;
    sidebarLogoutButton.disabled = false;
    tradeError.textContent = error.message;
  }
}

logoutButton.addEventListener("click", handleLogoutClick);
sidebarLogoutButton.addEventListener("click", handleLogoutClick);

sidebarToggleButton.addEventListener("click", () => {
  openSidebar();
});

sidebarCloseButton.addEventListener("click", () => {
  closeSidebar();
});

sidebarBackdrop.addEventListener("click", () => {
  closeSidebar();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSidebar();
});

togglePasswordButton.addEventListener("click", () => {
  const shouldShowPassword = passwordInput.type === "password";
  passwordInput.type = shouldShowPassword ? "text" : "password";
  togglePasswordButton.textContent = shouldShowPassword ? "Hide" : "Show";
  togglePasswordButton.setAttribute("aria-label", shouldShowPassword ? "Hide password" : "Show password");
  togglePasswordButton.setAttribute("aria-pressed", String(shouldShowPassword));
});

function openTradeFormModal(trade = null) {
  editingTradeId = trade ? trade.tradeId : null;
  tradeFormTitle.textContent = trade ? "Edit Trade" : "New Trade";
  tradeFormSubmitButton.textContent = trade ? "Update trade" : "Add trade";
  tradeError.textContent = "";
  hideExposureError();

  if (trade) {
    tradeForm.elements.symbol.value = trade.symbol || "";
    tradeForm.elements.direction.value = trade.direction || "LONG";
    tradeForm.elements.assetClass.value = trade.assetClass || "STOCK_CRYPTO";
    tradeForm.elements.entryPrice.value = trade.entryPrice ?? "";
    tradeForm.elements.exitPrice.value = trade.exitPrice ?? "";
    tradeForm.elements.lotSize.value = trade.lotSize ?? trade.quantity ?? "";
    tradeForm.elements.stopLoss.value = trade.stopLoss ?? "";
    tradeForm.elements.takeProfit.value = trade.takeProfit ?? "";
    tradeForm.elements.fees.value = trade.fees ?? 0;
    tradeForm.elements.strategy.value = trade.strategy || "";
    tradeForm.elements.tags.value = Array.isArray(trade.tags) ? trade.tags.join(", ") : "";
    tradeForm.elements.notes.value = trade.notes || "";
  } else {
    tradeForm.reset();
    tradeForm.elements.direction.value = "LONG";
    tradeForm.elements.assetClass.value = "STOCK_CRYPTO";
    tradeForm.elements.fees.value = "0";
  }

  tradeFormBackdrop.classList.add("is-open");
  tradeFormModal.classList.add("is-open");
  tradeFormModal.setAttribute("aria-hidden", "false");
  addTradeButton.setAttribute("aria-expanded", "true");
  tradeForm.elements.symbol.focus();
}

function closeTradeFormModal() {
  tradeFormBackdrop.classList.remove("is-open");
  tradeFormModal.classList.remove("is-open");
  tradeFormModal.setAttribute("aria-hidden", "true");
  addTradeButton.setAttribute("aria-expanded", "false");
  editingTradeId = null;
  hideExposureError();
}

addTradeButton.addEventListener("click", () => {
  openTradeFormModal();
});

tradeFormCloseButton.addEventListener("click", () => {
  closeTradeFormModal();
});

tradeFormBackdrop.addEventListener("click", () => {
  closeTradeFormModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTradeFormModal();
});

tradeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  tradeError.textContent = "";
  hideExposureError();

  if (!activeUser) return;

  const formData = new FormData(tradeForm);
  const tradeData = {
    userId: activeUser.uid,
    traderName: activeUser.displayName || getFriendlyNameFromEmail(activeUser.email) || activeUser.email,
    symbol: cleanText(formData.get("symbol")).toUpperCase(),
    direction: formData.get("direction"),
    assetClass: formData.get("assetClass"),
    entryPrice: toNumber(formData.get("entryPrice")),
    exitPrice: toNumber(formData.get("exitPrice")),
    lotSize: toNumber(formData.get("lotSize")),
    stopLoss: toNumber(formData.get("stopLoss")),
    takeProfit: toNumber(formData.get("takeProfit")),
    fees: toNumber(formData.get("fees")),
    strategy: cleanText(formData.get("strategy")),
    tags: cleanText(formData.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean),
    notes: cleanText(formData.get("notes"))
  };

  const projectedPnl = computeNetPnL(
    tradeData.direction,
    tradeData.entryPrice,
    tradeData.exitPrice,
    tradeData.lotSize,
    tradeData.fees,
    tradeData.assetClass
  );
  const positionValue = computePositionValue(tradeData.entryPrice, tradeData.lotSize, tradeData.assetClass);

  if (Math.abs(projectedPnl) > MAX_ACCOUNT_LIMIT || positionValue > MAX_ACCOUNT_LIMIT) {
    showExposureError();
    return;
  }

  try {
    if (editingTradeId) {
      const { userId, traderName, ...updateData } = tradeData;
      await updateTrade(editingTradeId, updateData);
    } else {
      await createTrade(tradeData);
    }
    tradeForm.reset();
    tradeForm.elements.direction.value = "LONG";
    tradeForm.elements.assetClass.value = "STOCK_CRYPTO";
    tradeForm.elements.fees.value = "0";
    closeTradeFormModal();
  } catch (error) {
    tradeError.textContent = error.message;
  }
});

function showExposureError() {
  exposureErrorBadge.textContent = "Trade exposure exceeds $5,000 account max limit.";
  exposureErrorBadge.classList.remove("hidden");
}

function hideExposureError() {
  exposureErrorBadge.textContent = "";
  exposureErrorBadge.classList.add("hidden");
}

tradesBody.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-trade]");
  if (editButton) {
    const trade = allTrades.find((item) => item.tradeId === editButton.dataset.editTrade);
    if (trade) openTradeFormModal(trade);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-trade]");
  if (!deleteButton) return;
  await deleteTrade(deleteButton.dataset.deleteTrade);
});

subscribeAuthState(
  (user) => {
    activeUser = user;
    startWelcomeFlow(user);
  },
  () => {
    activeUser = null;
    clearWelcomeFlow();
    if (unsubscribeTrades) unsubscribeTrades();
    if (unsubscribeProfile) unsubscribeProfile();
    if (unsubscribeMembers) unsubscribeMembers();
    if (isLoggingOut) return;
    showLoginView();
  }
);

function startWelcomeFlow(user) {
  clearWelcomeFlow();
  authView.classList.add("hidden");
  journalView.classList.add("hidden");
  welcomeView.classList.remove("hidden", "is-leaving");
  welcomeTitle.textContent = "Welcome";
  welcomeMessage.textContent = "Opening your live trading journal.";
  updateProfileDisplay(user);

  welcomeTimer = window.setTimeout(() => {
    welcomeView.classList.add("is-leaving");
    welcomeExitTimer = window.setTimeout(() => {
      welcomeView.classList.add("hidden");
      welcomeView.classList.remove("is-leaving");
      journalView.classList.remove("hidden");
      switchView("logger");
      startTradeSync();
      startProfileSync();
      startMembersSync();
    }, 430);
  }, 3000);
}

function startLogoutFlow() {
  clearWelcomeFlow();
  authView.classList.add("hidden");
  journalView.classList.add("hidden");
  welcomeView.classList.remove("hidden", "is-leaving");
  welcomeTitle.textContent = "SESSION CLOSED.";
  welcomeMessage.textContent = "Thank you for logging your setups. See you in the markets.";

  welcomeTimer = window.setTimeout(() => {
    welcomeView.classList.add("is-leaving");
    welcomeExitTimer = window.setTimeout(() => {
      isLoggingOut = false;
      logoutButton.disabled = false;
      sidebarLogoutButton.disabled = false;
      showLoginView();
    }, 430);
  }, 3000);
}

function showLoginView() {
  authView.classList.remove("hidden");
  welcomeView.classList.add("hidden");
  welcomeView.classList.remove("is-leaving");
  journalView.classList.add("hidden");
  closeSidebar();
  closeDayTradesModal();
  closeTradeFormModal();
  closeExportModal();
  closeMembersModal();
  closeMemberDetailModal();
  resetProfileDisplay();
  destroyCharts();
  allTrades = [];
  allMemberProfiles = [];
  tradeFilters = { search: "", direction: "ALL", outcome: "ALL", dateStart: "", dateEnd: "" };
  tradesSearchInput.value = "";
  tradesDirectionFilter.value = "ALL";
  tradesOutcomeFilter.value = "ALL";
  tradesDateStartInput.value = "";
  tradesDateEndInput.value = "";
  hideTradesCustomRange();
  setActiveTradesDatePreset(null);
  heatmapViewDate = startOfMonth(new Date());
}

function getInitials(user) {
  const source = (user.displayName || user.email || "").trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getFriendlyNameFromEmail(email) {
  if (!email || typeof email !== "string") return "";
  const localPart = email.split("@")[0];
  if (!localPart) return "";
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTraderDisplayName(trade) {
  const profile = allMemberProfiles.find((member) => member.uid === trade.userId);
  if (profile && profile.displayName && !profile.displayName.includes("@")) {
    return profile.displayName;
  }
  if (trade.traderName && !trade.traderName.includes("@")) {
    return trade.traderName;
  }
  const emailSource = (profile && profile.email) || trade.traderName || "";
  return getFriendlyNameFromEmail(emailSource) || trade.traderName || "Trader";
}

function renderAvatarElement(el, initials, photoURL) {
  if (photoURL) {
    el.innerHTML = `<img src="${photoURL}" alt="Profile photo" />`;
  } else {
    el.textContent = initials;
  }
}

function updateProfileDisplay(user) {
  const displayName = user.displayName || user.email || "Trader";
  const initials = getInitials(user);

  renderAvatarElement(profileAvatar, initials, currentProfile.photoURL);
  profileName.textContent = displayName;
  renderAvatarElement(sidebarToggleAvatar, initials, currentProfile.photoURL);
  renderAvatarElement(sidebarAvatar, initials, currentProfile.photoURL);
  sidebarProfileName.textContent = displayName;
  sidebarProfileEmail.textContent = user.email || "—";

  renderAvatarElement(profileViewAvatar, initials, currentProfile.photoURL);
  profileViewName.textContent = displayName;
  profileViewEmail.textContent = user.email || "—";
}

function resetProfileDisplay() {
  currentProfile = { role: "Team Trader", photoURL: "" };
  profileAvatar.textContent = "--";
  profileName.textContent = "Trader";
  sidebarToggleAvatar.textContent = "--";
  sidebarAvatar.textContent = "--";
  sidebarProfileName.textContent = "Trader";
  sidebarProfileEmail.textContent = "—";

  profileViewAvatar.textContent = "--";
  profileViewName.textContent = "Trader";
  profileViewEmail.textContent = "—";
  profileTradeCount.textContent = "0";
  profileRoleBadge.textContent = "Team Trader";
  profileStatus.textContent = "";
  closeProfileEditModal();
}

function openSidebar() {
  profileSidebar.classList.add("is-open");
  sidebarBackdrop.classList.add("is-open");
  profileSidebar.setAttribute("aria-hidden", "false");
  sidebarToggleButton.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  profileSidebar.classList.remove("is-open");
  sidebarBackdrop.classList.remove("is-open");
  profileSidebar.setAttribute("aria-hidden", "true");
  sidebarToggleButton.setAttribute("aria-expanded", "false");
}

function clearWelcomeFlow() {
  if (welcomeTimer) window.clearTimeout(welcomeTimer);
  if (welcomeExitTimer) window.clearTimeout(welcomeExitTimer);
  welcomeTimer = null;
  welcomeExitTimer = null;
}

function startTradeSync() {
  if (unsubscribeTrades) unsubscribeTrades();
  syncStatus.textContent = "Syncing";
  unsubscribeTrades = listenToTeamTrades(
    (trades) => {
      allTrades = trades;
      renderTrades(getFilteredTrades());
      renderSummary(trades);
      syncStatus.textContent = "Live";

      if (currentView === "analytics") applyActiveFilterAndRender();
      if (currentView === "profile") updateProfileStats();
      renderHeatmap();
    },
    (error) => {
      syncStatus.textContent = "Sync error";
      tradeError.textContent = error.message;
    }
  );
}

function startProfileSync() {
  if (unsubscribeProfile) unsubscribeProfile();
  if (!activeUser) return;

  saveUserProfile(activeUser.uid, {
    displayName: activeUser.displayName || activeUser.email,
    email: activeUser.email
  }).catch(() => { });

  unsubscribeProfile = subscribeToUserProfile(
    activeUser.uid,
    (profile) => {
      currentProfile = { role: profile.role || "Team Trader", photoURL: profile.photoURL || "" };
      renderProfileExtras();
    },
    (error) => {
      profileStatus.textContent = error.message;
    }
  );
}

function startMembersSync() {
  if (unsubscribeMembers) unsubscribeMembers();
  unsubscribeMembers = listenToAllUserProfiles(
    (profiles) => {
      allMemberProfiles = profiles;
      if (membersModal.classList.contains("is-open")) renderMembersList();
    },
    (error) => {
      profileStatus.textContent = error.message;
    }
  );
}

function renderProfileExtras() {
  if (!activeUser) return;
  profileRoleBadge.textContent = currentProfile.role;
  const initials = getInitials(activeUser);
  renderAvatarElement(profileAvatar, initials, currentProfile.photoURL);
  renderAvatarElement(sidebarToggleAvatar, initials, currentProfile.photoURL);
  renderAvatarElement(sidebarAvatar, initials, currentProfile.photoURL);
  renderAvatarElement(profileViewAvatar, initials, currentProfile.photoURL);
}

function getFilteredTrades() {
  const search = tradeFilters.search.trim().toLowerCase();
  const rangeStart = tradeFilters.dateStart ? new Date(`${tradeFilters.dateStart}T00:00:00`) : null;
  const rangeEnd = tradeFilters.dateEnd ? new Date(`${tradeFilters.dateEnd}T23:59:59`) : null;

  return allTrades.filter((trade) => {
    if (tradeFilters.direction !== "ALL" && trade.direction !== tradeFilters.direction) return false;

    if (tradeFilters.outcome === "WIN" && !(trade.netPnl > 0)) return false;
    if (tradeFilters.outcome === "LOSS" && !(trade.netPnl <= 0)) return false;

    if (rangeStart || rangeEnd) {
      const tradeDate = getTradeDate(trade);
      if (!tradeDate) return false;
      if (rangeStart && tradeDate < rangeStart) return false;
      if (rangeEnd && tradeDate > rangeEnd) return false;
    }

    if (search) {
      const haystack = [trade.symbol, trade.traderName, getTraderDisplayName(trade), trade.strategy, ...(trade.tags || [])]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

function renderFilteredTrades() {
  renderTrades(getFilteredTrades());
}

tradesSearchInput.addEventListener("input", () => {
  tradeFilters.search = tradesSearchInput.value;
  renderFilteredTrades();
});

tradesDirectionFilter.addEventListener("change", () => {
  tradeFilters.direction = tradesDirectionFilter.value;
  renderFilteredTrades();
});

tradesOutcomeFilter.addEventListener("change", () => {
  tradeFilters.outcome = tradesOutcomeFilter.value;
  renderFilteredTrades();
});

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setActiveTradesDatePreset(preset) {
  tradesDatePresetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tradesRange === preset);
  });
}

function hideTradesCustomRange() {
  tradesCustomRangeContainer.classList.add("hidden");
}

tradesDatePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = button.dataset.tradesRange;

    if (preset === "custom") {
      tradesCustomRangeContainer.classList.toggle("hidden");
      setActiveTradesDatePreset(preset);
      return;
    }

    const { start, end } = getRangeForPreset(preset);
    tradeFilters.dateStart = formatDateForInput(start);
    tradeFilters.dateEnd = formatDateForInput(end);
    tradesDateStartInput.value = tradeFilters.dateStart;
    tradesDateEndInput.value = tradeFilters.dateEnd;
    hideTradesCustomRange();
    setActiveTradesDatePreset(preset);
    renderFilteredTrades();
  });
});

tradesApplyCustomRangeButton.addEventListener("click", () => {
  const startValue = tradesDateStartInput.value;
  const endValue = tradesDateEndInput.value;
  if (!startValue && !endValue) return;
  if (startValue && endValue && startValue > endValue) return;

  tradeFilters.dateStart = startValue;
  tradeFilters.dateEnd = endValue;
  setActiveTradesDatePreset("custom");
  renderFilteredTrades();
});

tradesFilterResetButton.addEventListener("click", () => {
  tradeFilters = { search: "", direction: "ALL", outcome: "ALL", dateStart: "", dateEnd: "" };
  tradesSearchInput.value = "";
  tradesDirectionFilter.value = "ALL";
  tradesOutcomeFilter.value = "ALL";
  tradesDateStartInput.value = "";
  tradesDateEndInput.value = "";
  hideTradesCustomRange();
  setActiveTradesDatePreset(null);
  renderFilteredTrades();
});

function renderTrades(trades) {
  if (!trades.length) {
    tradesBody.innerHTML = `<tr class="empty-row"><td colspan="9">${allTrades.length ? "No trades match your filters." : "No trades logged yet."}</td></tr>`;
    return;
  }

  tradesBody.innerHTML = trades.map((trade) => {
    const pnlClass = trade.netPnl >= 0 ? "pnl-positive" : "pnl-negative";
    const isOwnTrade = activeUser && trade.userId === activeUser.uid;
    const actionsCell = isOwnTrade
      ? `
        <div class="row-actions">
          <button class="update-button" type="button" data-edit-trade="${trade.tradeId}" aria-label="Update trade" title="Update trade">&#9998;</button>
          <button class="delete-button" type="button" data-delete-trade="${trade.tradeId}">Delete</button>
        </div>
      `
      : `<span class="row-actions-locked" title="Only the trader who logged this can update or delete it">—</span>`;
    return `
      <tr>
        <td>${escapeHtml(trade.symbol)}</td>
        <td>${escapeHtml(getTraderDisplayName(trade))}</td>
        <td><span class="direction-badge direction-${trade.direction === "SHORT" ? "short" : "long"}">${escapeHtml(trade.direction)}</span></td>
        <td>${numberFormatter.format(trade.entryPrice)}</td>
        <td>${numberFormatter.format(trade.exitPrice)}</td>
        <td>${numberFormatter.format(trade.lotSize || trade.quantity || 0)}</td>
        <td>${numberFormatter.format(trade.riskRewardRatio)}</td>
        <td class="${pnlClass}">${currencyFormatter.format(trade.netPnl)}</td>
        <td>${actionsCell}</td>
      </tr>
    `;
  }).join("");
}

function renderSummary(trades) {
  const totalPnl = trades.reduce((sum, trade) => sum + (trade.netPnl || 0), 0);
  const winRate = computeWinRate(trades);
  const profitFactor = computeProfitFactor(trades);

  document.querySelector("#total-pnl").textContent = currencyFormatter.format(totalPnl);
  document.querySelector("#win-rate").textContent = `${winRate.toFixed(1)}%`;
  document.querySelector("#profit-factor").textContent = profitFactor === Infinity ? "Infinity" : profitFactor.toFixed(2);
  document.querySelector("#trade-count").textContent = trades.length;
}

/* ---------------- View routing ---------------- */

function switchView(viewName) {
  if (!appViews[viewName]) return;
  currentView = viewName;

  Object.entries(appViews).forEach(([name, section]) => {
    section.classList.toggle("hidden", name !== viewName);
  });

  navTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === viewName));
  sidebarNavLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.view === viewName));

  if (viewName === "analytics") {
    applyActiveFilterAndRender();
    renderHeatmap();
  }
  if (viewName === "profile") {
    updateProfileStats();
  }
}

function handleNavClick(event) {
  const target = event.currentTarget;
  const viewName = target.dataset.view;
  switchView(viewName);
  closeSidebar();
}

navTabs.forEach((tab) => tab.addEventListener("click", handleNavClick));
sidebarNavLinks.forEach((link) => link.addEventListener("click", handleNavClick));

/* ---------------- Analytics: date filtering ---------------- */

function getRangeForPreset(preset) {
  const now = new Date();
  const end = now;
  let start;

  if (preset === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  } else if (preset === "ytd") {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else {
    start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

function setActivePill(activePill) {
  filterPills.forEach((pill) => pill.classList.toggle("is-active", pill === activePill));
}

filterPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const preset = pill.dataset.range;

    if (preset === "custom") {
      customRangeContainer.classList.toggle("hidden");
      setActivePill(pill);
      return;
    }

    customRangeContainer.classList.add("hidden");
    activeRangePreset = preset;
    customRange = null;
    setActivePill(pill);
    applyActiveFilterAndRender();
  });
});

applyCustomRangeButton.addEventListener("click", () => {
  const startValue = rangeStartInput.value;
  const endValue = rangeEndInput.value;
  if (!startValue || !endValue) return;

  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T23:59:59`);
  if (start > end) return;

  customRange = { start, end };
  activeRangePreset = "custom";
  applyActiveFilterAndRender();
});

function applyActiveFilterAndRender() {
  let range;
  if (activeRangePreset === "custom" && customRange) {
    range = customRange;
  } else {
    range = getRangeForPreset(activeRangePreset);
  }

  const filtered = filterTradesByRange(allTrades, range.start, range.end);
  renderAnalyticsCharts(filtered);
  renderKpiRadials(filtered);
  renderTradeAnalysis(filtered);
  renderStreaks(filtered);
  renderSymbolChart(filtered);
  renderTimelineChart(filtered, range);
}

symbolAssetFilterSelect.addEventListener("change", () => {
  symbolAssetFilter = symbolAssetFilterSelect.value;
  applyActiveFilterAndRender();
});

/* ---------------- Analytics: charts ---------------- */

function baseChartOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111111",
        bodyColor: "#111111",
        borderColor: "#111111",
        borderWidth: 2,
        cornerRadius: 0,
        padding: 10,
        titleFont: { weight: 900 },
        bodyFont: { weight: 700 }
      }
    },
    ...extra
  };
}

function renderAnalyticsCharts(trades) {
  renderEquityChart(trades);
  renderWinLossChart(trades);
  renderStrategyChart(trades);
}

function renderEquityChart(trades) {
  const { labels, data } = computeEquityCurve(trades);
  const canvas = document.querySelector("#equity-chart");
  if (equityChart) equityChart.destroy();

  equityChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [{
        label: "Cumulative Net P&L",
        data: data.length ? data : [0],
        borderColor: "#111111",
        borderWidth: 3,
        backgroundColor: "transparent",
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#facc15",
        pointBorderColor: "#111111",
        pointBorderWidth: 2,
        tension: 0
      }]
    },
    options: baseChartOptions({
      scales: {
        x: { grid: { color: "rgba(0,0,0,0.08)" }, ticks: { color: "#111111", font: { weight: 700 } } },
        y: { grid: { color: "rgba(0,0,0,0.08)" }, ticks: { color: "#111111", font: { weight: 700 } } }
      }
    })
  });
}

function renderWinLossChart(trades) {
  const { wins, losses } = computeWinLossCounts(trades);
  const canvas = document.querySelector("#winloss-chart");
  if (winLossChart) winLossChart.destroy();

  winLossChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Wins", "Losses"],
      datasets: [{
        data: [wins, losses],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: "#111111",
        borderWidth: 2
      }]
    },
    options: baseChartOptions({
      cutout: "58%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { color: "#111111", font: { weight: 900 } }
        },
        tooltip: baseChartOptions().plugins.tooltip
      }
    })
  });
}

function renderStrategyChart(trades) {
  const { labels, data } = computeStrategyPerformance(trades);
  const canvas = document.querySelector("#strategy-chart");
  if (strategyChart) strategyChart.destroy();

  strategyChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [{
        data: data.length ? data : [0],
        backgroundColor: (data.length ? data : [0]).map((value) => (value >= 0 ? "#10b981" : "#ef4444")),
        borderColor: "#111111",
        borderWidth: 2
      }]
    },
    options: baseChartOptions({
      indexAxis: "y",
      scales: {
        x: { grid: { color: "rgba(0,0,0,0.08)" }, ticks: { color: "#111111", font: { weight: 700 } } },
        y: { grid: { display: false }, ticks: { color: "#111111", font: { weight: 900 } } }
      }
    })
  });
}

/* ---------------- Analytics: KPI radials ---------------- */

function renderRadialGauge(canvas, percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  return new Chart(canvas, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [clamped, 100 - clamped],
        backgroundColor: ["#10b981", "#111111"],
        borderColor: "#111111",
        borderWidth: 2,
        circumference: 360,
        rotation: -90
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

function renderKpiRadials(trades) {
  const winRate = computeWinRate(trades);
  const profitFactor = computeProfitFactor(trades);

  const winRateCanvas = document.querySelector("#win-rate-radial");
  if (winRateRadialChart) winRateRadialChart.destroy();
  winRateRadialChart = renderRadialGauge(winRateCanvas, winRate);
  document.querySelector("#win-rate-radial-value").textContent = `${winRate.toFixed(1)}%`;

  const profitFactorCanvas = document.querySelector("#profit-factor-radial");
  if (profitFactorRadialChart) profitFactorRadialChart.destroy();
  const displayFactor = profitFactor === Infinity ? 3 : profitFactor;
  profitFactorRadialChart = renderRadialGauge(profitFactorCanvas, (displayFactor / 3) * 100);

  const valueLabel = document.querySelector("#profit-factor-radial-value");
  const qualityLabel = document.querySelector("#profit-factor-radial-label");
  valueLabel.textContent = profitFactor === Infinity ? "\u221e" : profitFactor.toFixed(2);

  qualityLabel.classList.remove("radial-label-good", "radial-label-warn", "radial-label-bad");
  if (profitFactor === Infinity || profitFactor >= 2) {
    qualityLabel.textContent = "Excellent";
    qualityLabel.classList.add("radial-label-good");
  } else if (profitFactor >= 1) {
    qualityLabel.textContent = "Good";
    qualityLabel.classList.add("radial-label-warn");
  } else {
    qualityLabel.textContent = "Needs Work";
    qualityLabel.classList.add("radial-label-bad");
  }
}

/* ---------------- Analytics: trade analysis ---------------- */

function renderTradeAnalysis(trades) {
  const { avgWin, avgLoss } = computeAvgWinLoss(trades);
  const { best, worst } = computeBestWorstTrade(trades);

  document.querySelector("#avg-win-value").textContent = currencyFormatter.format(avgWin);
  document.querySelector("#avg-loss-value").textContent = currencyFormatter.format(avgLoss);
  document.querySelector("#best-trade-value").textContent = currencyFormatter.format(best);
  document.querySelector("#worst-trade-value").textContent = currencyFormatter.format(worst);

  const winMagnitude = Math.abs(avgWin);
  const lossMagnitude = Math.abs(avgLoss);
  const total = winMagnitude + lossMagnitude;
  const winPct = total > 0 ? (winMagnitude / total) * 100 : 50;
  const lossPct = 100 - winPct;

  const ratioBarWin = document.querySelector("#ratio-bar-win");
  const ratioBarLoss = document.querySelector("#ratio-bar-loss");
  ratioBarWin.style.width = `${winPct}%`;
  ratioBarLoss.style.width = `${lossPct}%`;
  ratioBarWin.textContent = total > 0 ? currencyFormatter.format(avgWin) : "\u2014";
  ratioBarLoss.textContent = total > 0 ? currencyFormatter.format(avgLoss) : "\u2014";
}

/* ---------------- Analytics: streaks ---------------- */

function renderStreaks(trades) {
  const sequence = computeWinLossStreakSequence(trades, 20);
  const streaksGrid = document.querySelector("#streaks-grid");

  if (!sequence.length) {
    streaksGrid.innerHTML = '<p class="streaks-empty">No trades to show streaks yet.</p>';
    return;
  }

  streaksGrid.innerHTML = sequence.map((outcome) => {
    const cls = outcome === "W" ? "streak-win" : "streak-loss";
    return `<span class="streak-badge ${cls}">${outcome}</span>`;
  }).join("");
}

/* ---------------- Analytics: performance by symbol ---------------- */

function renderSymbolChart(trades) {
  const scoped = symbolAssetFilter === "ALL"
    ? trades
    : trades.filter((trade) => trade.assetClass === symbolAssetFilter);
  const { labels, data } = computeSymbolPerformance(scoped);
  const canvas = document.querySelector("#symbol-chart");
  if (symbolChart) symbolChart.destroy();

  symbolChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [{
        data: data.length ? data : [0],
        backgroundColor: (data.length ? data : [0]).map((value) => (value >= 0 ? "#10b981" : "#ef4444")),
        borderColor: "#111111",
        borderWidth: 2
      }]
    },
    options: baseChartOptions({
      indexAxis: "y",
      scales: {
        x: { grid: { color: "rgba(0,0,0,0.08)" }, ticks: { color: "#111111", font: { weight: 700 } } },
        y: { grid: { display: false }, ticks: { color: "#111111", font: { weight: 900 } } }
      }
    })
  });
}

/* ---------------- Analytics: performance by day ---------------- */

function renderTimelineChart(trades, range) {
  const { labels, data } = computeDailyTimeline(trades, range.start, range.end);
  const canvas = document.querySelector("#timeline-chart");
  if (timelineChart) timelineChart.destroy();

  timelineChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [{
        data: data.length ? data : [0],
        backgroundColor: (data.length ? data : [0]).map((value) => (value >= 0 ? "#10b981" : "#ef4444")),
        borderColor: "#111111",
        borderWidth: 2
      }]
    },
    options: baseChartOptions({
      scales: {
        x: {
          grid: { display: false },
          border: { color: "#111111", width: 3 },
          ticks: { color: "#111111", font: { weight: 700 } }
        },
        y: {
          grid: { color: "rgba(0,0,0,0.08)" },
          ticks: { color: "#111111", font: { weight: 700 } }
        }
      }
    })
  });
}

function destroyCharts() {
  if (equityChart) { equityChart.destroy(); equityChart = null; }
  if (winLossChart) { winLossChart.destroy(); winLossChart = null; }
  if (strategyChart) { strategyChart.destroy(); strategyChart = null; }
  if (profitFactorRadialChart) { profitFactorRadialChart.destroy(); profitFactorRadialChart = null; }
  if (winRateRadialChart) { winRateRadialChart.destroy(); winRateRadialChart = null; }
  if (symbolChart) { symbolChart.destroy(); symbolChart = null; }
  if (timelineChart) { timelineChart.destroy(); timelineChart = null; }
}

/* ---------------- Analytics: heatmap calendar ---------------- */

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function updateHeatmapNavState() {
  const currentMonthStart = startOfMonth(new Date());
  heatmapNextMonthButton.disabled = heatmapViewDate.getTime() >= currentMonthStart.getTime();
}

heatmapPrevMonthButton.addEventListener("click", () => {
  heatmapViewDate = new Date(heatmapViewDate.getFullYear(), heatmapViewDate.getMonth() - 1, 1);
  renderHeatmap();
});

heatmapNextMonthButton.addEventListener("click", () => {
  if (heatmapNextMonthButton.disabled) return;
  heatmapViewDate = new Date(heatmapViewDate.getFullYear(), heatmapViewDate.getMonth() + 1, 1);
  renderHeatmap();
});

function renderHeatmap() {
  const year = heatmapViewDate.getFullYear();
  const month = heatmapViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyMap = computeDailyPnlMap(allTrades);

  heatmapTitle.textContent = `Heatmap Calendar — ${heatmapViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  heatmapGrid.innerHTML = "";
  updateHeatmapNavState();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(year, month, day);
    const key = dateObj.toISOString().slice(0, 10);
    const pnl = dailyMap.get(key);

    const cell = document.createElement("div");
    cell.className = "heatmap-cell heatmap-clickable";
    cell.textContent = String(day);
    cell.dataset.dateKey = key;
    cell.setAttribute("role", "button");
    cell.setAttribute("tabindex", "0");

    if (pnl === undefined) {
      cell.classList.add("heatmap-neutral");
      cell.title = "No trades — click for details";
    } else if (pnl > 0) {
      cell.classList.add("heatmap-win");
      cell.title = `${currencyFormatter.format(pnl)} — click for details`;
    } else if (pnl < 0) {
      cell.classList.add("heatmap-loss");
      cell.title = `${currencyFormatter.format(pnl)} — click for details`;
    } else {
      cell.classList.add("heatmap-neutral");
      cell.title = `${currencyFormatter.format(pnl)} — click for details`;
    }

    heatmapGrid.appendChild(cell);
  }
}

heatmapGrid.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-date-key]");
  if (!cell) return;
  openDayTradesModal(cell.dataset.dateKey);
});

heatmapGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const cell = event.target.closest("[data-date-key]");
  if (!cell) return;
  event.preventDefault();
  openDayTradesModal(cell.dataset.dateKey);
});

/* ---------------- Day trades modal ---------------- */

function openDayTradesModal(dateKey) {
  const trades = getTradesForDateKey(allTrades, dateKey);
  const dateObj = new Date(`${dateKey}T00:00:00`);
  dayTradesTitle.textContent = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (!trades.length) {
    dayTradesBody.innerHTML = '<p class="day-trades-empty">No trades logged on this day.</p>';
  } else {
    dayTradesBody.innerHTML = trades.map((trade) => {
      const pnlClass = trade.netPnl >= 0 ? "pnl-positive" : "pnl-negative";
      return `
        <article class="day-trade-item">
          <div class="day-trade-item-top">
            <span>${escapeHtml(trade.symbol)} <span class="direction-badge direction-${trade.direction === "SHORT" ? "short" : "long"}">${escapeHtml(trade.direction)}</span></span>
            <span class="${pnlClass}">${currencyFormatter.format(trade.netPnl)}</span>
          </div>
          <div class="day-trade-item-meta">
            <span>Trader: <strong>${escapeHtml(getTraderDisplayName(trade))}</strong></span>
            <span>Entry: <strong>${numberFormatter.format(trade.entryPrice)}</strong></span>
            <span>Exit: <strong>${numberFormatter.format(trade.exitPrice)}</strong></span>
            <span>Lot Size: <strong>${numberFormatter.format(trade.lotSize || trade.quantity || 0)}</strong></span>
            <span>R:R: <strong>${numberFormatter.format(trade.riskRewardRatio)}</strong></span>
          </div>
        </article>
      `;
    }).join("");
  }

  dayTradesBackdrop.classList.add("is-open");
  dayTradesModal.classList.add("is-open");
  dayTradesModal.setAttribute("aria-hidden", "false");
}

function closeDayTradesModal() {
  dayTradesBackdrop.classList.remove("is-open");
  dayTradesModal.classList.remove("is-open");
  dayTradesModal.setAttribute("aria-hidden", "true");
}

dayTradesCloseButton.addEventListener("click", closeDayTradesModal);
dayTradesBackdrop.addEventListener("click", closeDayTradesModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDayTradesModal();
});

/* ---------------- Profile & Settings ---------------- */

function updateProfileStats() {
  if (!activeUser) return;
  const lifetimeTrades = allTrades.filter((trade) => trade.userId === activeUser.uid).length;
  profileTradeCount.textContent = String(lifetimeTrades);
}

/* ---------------- Team Members directory ---------------- */

function renderMembersList() {
  if (!allMemberProfiles.length) {
    membersList.innerHTML = '<p class="day-trades-empty">No team members found yet.</p>';
    return;
  }

  const sorted = [...allMemberProfiles].sort((a, b) => {
    const nameA = (a.displayName || a.email || "").toLowerCase();
    const nameB = (b.displayName || b.email || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  membersList.innerHTML = sorted.map((profile) => {
    const displayName = profile.displayName || profile.email || "Trader";
    const initials = getInitials({ displayName: profile.displayName, email: profile.email });
    const avatarInner = profile.photoURL
      ? `<img src="${profile.photoURL}" alt="" />`
      : escapeHtml(initials);

    return `
      <button class="member-row" type="button" data-member-uid="${escapeHtml(profile.uid)}">
        <span class="profile-avatar">${avatarInner}</span>
        <span class="member-row-name">${escapeHtml(displayName)}</span>
      </button>
    `;
  }).join("");
}

function openMembersModal() {
  renderMembersList();
  membersBackdrop.classList.add("is-open");
  membersModal.classList.add("is-open");
  membersModal.setAttribute("aria-hidden", "false");
  viewTeamButton.setAttribute("aria-expanded", "true");
}

function closeMembersModal() {
  membersBackdrop.classList.remove("is-open");
  membersModal.classList.remove("is-open");
  membersModal.setAttribute("aria-hidden", "true");
  viewTeamButton.setAttribute("aria-expanded", "false");
}

viewTeamButton.addEventListener("click", () => {
  if (!activeUser) return;
  openMembersModal();
});

membersModalCloseButton.addEventListener("click", closeMembersModal);
membersBackdrop.addEventListener("click", closeMembersModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMembersModal();
});

membersList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-member-uid]");
  if (!row) return;
  openMemberDetailModal(row.dataset.memberUid);
});

function openMemberDetailModal(uid) {
  const profile = allMemberProfiles.find((item) => item.uid === uid) || { uid };
  const displayName = profile.displayName || profile.email || "Trader";
  const initials = getInitials({ displayName: profile.displayName, email: profile.email });

  renderAvatarElement(memberDetailAvatar, initials, profile.photoURL);
  memberDetailName.textContent = displayName;
  memberDetailEmail.textContent = profile.email || "—";
  memberDetailRole.textContent = profile.role || "Team Trader";

  const lifetimeTrades = allTrades.filter((trade) => trade.userId === uid).length;
  memberDetailTradeCount.textContent = String(lifetimeTrades);

  closeMembersModal();
  memberDetailBackdrop.classList.add("is-open");
  memberDetailModal.classList.add("is-open");
  memberDetailModal.setAttribute("aria-hidden", "false");
}

function closeMemberDetailModal() {
  memberDetailBackdrop.classList.remove("is-open");
  memberDetailModal.classList.remove("is-open");
  memberDetailModal.setAttribute("aria-hidden", "true");
}

memberDetailCloseButton.addEventListener("click", closeMemberDetailModal);
memberDetailBackdrop.addEventListener("click", closeMemberDetailModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMemberDetailModal();
});

function openProfileEditModal() {
  if (!activeUser) return;
  pendingPhotoURL = null;
  profileEditError.textContent = "";
  profileEditNameInput.value = activeUser.displayName || "";
  profileEditRoleInput.value = currentProfile.role || "";
  renderAvatarElement(profileEditAvatarPreview, getInitials(activeUser), currentProfile.photoURL);

  profileEditBackdrop.classList.add("is-open");
  profileEditModal.classList.add("is-open");
  profileEditModal.setAttribute("aria-hidden", "false");
  editProfileButton.setAttribute("aria-expanded", "true");
  profileEditNameInput.focus();
}

function closeProfileEditModal() {
  profileEditBackdrop.classList.remove("is-open");
  profileEditModal.classList.remove("is-open");
  profileEditModal.setAttribute("aria-hidden", "true");
  editProfileButton.setAttribute("aria-expanded", "false");
  pendingPhotoURL = null;
}

editProfileButton.addEventListener("click", () => {
  openProfileEditModal();
});

profileEditCloseButton.addEventListener("click", () => {
  closeProfileEditModal();
});

profileEditBackdrop.addEventListener("click", () => {
  closeProfileEditModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProfileEditModal();
});

profileEditChangePhotoButton.addEventListener("click", () => {
  profileEditPhotoInput.click();
});

profileEditPhotoInput.addEventListener("change", async () => {
  const file = profileEditPhotoInput.files && profileEditPhotoInput.files[0];
  profileEditPhotoInput.value = "";
  if (!file) return;

  try {
    pendingPhotoURL = await resizeImageToDataUrl(file, 160, 160, 0.82);
    renderAvatarElement(profileEditAvatarPreview, getInitials(activeUser), pendingPhotoURL);
  } catch (error) {
    profileEditError.textContent = error.message || "Could not read photo.";
  }
});

profileEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeUser) return;

  const newName = cleanText(profileEditNameInput.value);
  const newRole = cleanText(profileEditRoleInput.value);
  if (!newName || !newRole) return;

  const submitButton = profileEditForm.querySelector("button[type=submit]");
  submitButton.disabled = true;
  profileEditError.textContent = "";
  try {
    await updateDisplayName(newName);
    const profileUpdate = { role: newRole };
    if (pendingPhotoURL) profileUpdate.photoURL = pendingPhotoURL;
    await saveUserProfile(activeUser.uid, profileUpdate);
    updateProfileDisplay(activeUser);
    closeProfileEditModal();
    profileStatus.textContent = "Profile updated.";
  } catch (error) {
    profileEditError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

function resizeImageToDataUrl(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image."));
      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function resetExportForm() {
  exportScope = "mine";
  exportRangeMode = null;
  exportScopeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.exportScope === "mine"));
  exportRangeButtons.forEach((button) => button.classList.remove("is-active"));
  exportDayField.classList.add("hidden");
  exportCustomRange.classList.add("hidden");
  exportDayInput.value = "";
  exportRangeStartInput.value = "";
  exportRangeEndInput.value = "";
  exportModalError.textContent = "";
}

function openExportModal() {
  resetExportForm();
  exportBackdrop.classList.add("is-open");
  exportModal.classList.add("is-open");
  exportModal.setAttribute("aria-hidden", "false");
}

function closeExportModal() {
  exportBackdrop.classList.remove("is-open");
  exportModal.classList.remove("is-open");
  exportModal.setAttribute("aria-hidden", "true");
}

exportCsvButton.addEventListener("click", () => {
  if (!activeUser) return;
  openExportModal();
});

exportModalCloseButton.addEventListener("click", closeExportModal);
exportBackdrop.addEventListener("click", closeExportModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeExportModal();
});

exportScopeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    exportScope = button.dataset.exportScope;
    exportScopeButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    exportModalError.textContent = "";
  });
});

exportRangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    exportRangeMode = button.dataset.exportRange;
    exportRangeButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    exportDayField.classList.toggle("hidden", exportRangeMode !== "day");
    exportCustomRange.classList.toggle("hidden", exportRangeMode !== "custom");
    exportModalError.textContent = "";
  });
});

exportConfirmButton.addEventListener("click", () => {
  if (!activeUser) return;
  exportModalError.textContent = "";

  let tradesToExport = exportScope === "mine"
    ? allTrades.filter((trade) => trade.userId === activeUser.uid)
    : allTrades;

  if (exportRangeMode) {
    const now = new Date();
    let start;
    let end;

    if (exportRangeMode === "day") {
      if (!exportDayInput.value) {
        exportModalError.textContent = "Pick a date to export.";
        return;
      }
      start = new Date(`${exportDayInput.value}T00:00:00`);
      end = new Date(`${exportDayInput.value}T23:59:59`);
    } else if (exportRangeMode === "week") {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = now;
    } else if (exportRangeMode === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = now;
    } else if (exportRangeMode === "custom") {
      if (!exportRangeStartInput.value || !exportRangeEndInput.value) {
        exportModalError.textContent = "Pick a start and end date.";
        return;
      }
      start = new Date(`${exportRangeStartInput.value}T00:00:00`);
      end = new Date(`${exportRangeEndInput.value}T23:59:59`);
      if (start > end) {
        exportModalError.textContent = "Start date must be before end date.";
        return;
      }
    }

    tradesToExport = filterTradesByRange(tradesToExport, start, end);
  }

  downloadTradesCsv(tradesToExport);
  closeExportModal();
});

function downloadTradesCsv(trades) {
  const headers = ["Date", "Symbol", "Trader", "Direction", "AssetClass", "Entry", "Exit", "LotSize", "StopLoss", "TakeProfit", "Fees", "Strategy", "Tags", "Notes", "NetPnl", "RiskReward"];
  const rows = trades.map((trade) => {
    const tradeDate = getTradeDate(trade);
    return [
      tradeDate ? tradeDate.toISOString().slice(0, 10) : "",
      trade.symbol,
      getTraderDisplayName(trade),
      trade.direction,
      trade.assetClass || "STOCK_CRYPTO",
      trade.entryPrice,
      trade.exitPrice,
      trade.lotSize || trade.quantity || 0,
      trade.stopLoss,
      trade.takeProfit,
      trade.fees,
      trade.strategy,
      (trade.tags || []).join(" | "),
      trade.notes,
      trade.netPnl,
      trade.riskRewardRatio
    ].map(csvEscape).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "trades-export.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  profileStatus.textContent = `Exported ${trades.length} trade(s) to CSV.`;
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function toNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function cleanText(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
