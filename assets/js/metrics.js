const LOT_SIZE_MULTIPLIERS = {
  STOCK_CRYPTO: 1,
  OPTIONS: 100,
  FOREX: 5000
};

export function computeNetPnL(direction, entry, exit, lotSize, fees = 0, assetClass = "STOCK_CRYPTO") {
  const multiplier = LOT_SIZE_MULTIPLIERS[assetClass] ?? 1;
  const units = lotSize * multiplier;
  const gross = direction === "SHORT" ? (entry - exit) * units : (exit - entry) * units;
  return gross - fees;
}

export function computeRiskReward(entry, exit, stopLoss) {
  const risk = Math.abs(entry - stopLoss);
  if (risk === 0) return 0;
  return Math.abs(exit - entry) / risk;
}

export function computeWinRate(trades) {
  if (!trades.length) return 0;
  const wins = trades.filter((trade) => trade.netPnl > 0).length;
  return (wins / trades.length) * 100;
}

export function computeProfitFactor(trades) {
  const grossGains = trades.filter((trade) => trade.netPnl > 0).reduce((sum, trade) => sum + trade.netPnl, 0);
  const grossLosses = Math.abs(trades.filter((trade) => trade.netPnl < 0).reduce((sum, trade) => sum + trade.netPnl, 0));
  if (grossLosses === 0) return grossGains > 0 ? Infinity : 0;
  return grossGains / grossLosses;
}

export function getTradeDate(trade) {
  const timestamp = trade.timestamp;
  if (!timestamp) return null;
  if (typeof timestamp.toDate === "function") return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function filterTradesByRange(trades, startDate, endDate) {
  return trades.filter((trade) => {
    const date = getTradeDate(trade);
    if (!date) return false;
    return date >= startDate && date <= endDate;
  });
}

export function computeEquityCurve(trades) {
  const dated = trades
    .map((trade) => ({ date: getTradeDate(trade), netPnl: trade.netPnl || 0 }))
    .filter((entry) => entry.date)
    .sort((a, b) => a.date - b.date);

  let running = 0;
  const labels = [];
  const data = [];
  dated.forEach((entry) => {
    running += entry.netPnl;
    labels.push(entry.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    data.push(Number(running.toFixed(2)));
  });
  return { labels, data };
}

export function computeWinLossCounts(trades) {
  const wins = trades.filter((trade) => trade.netPnl > 0).length;
  const losses = trades.filter((trade) => trade.netPnl <= 0).length;
  return { wins, losses };
}

export function computeStrategyPerformance(trades) {
  const totals = new Map();
  trades.forEach((trade) => {
    const key = trade.strategy && trade.strategy.trim() ? trade.strategy.trim() : "Unlabeled";
    totals.set(key, (totals.get(key) || 0) + (trade.netPnl || 0));
  });
  const entries = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map(([label]) => label),
    data: entries.map(([, value]) => Number(value.toFixed(2)))
  };
}

export function computeDailyPnlMap(trades) {
  const map = new Map();
  trades.forEach((trade) => {
    const date = getTradeDate(trade);
    if (!date) return;
    const key = date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + (trade.netPnl || 0));
  });
  return map;
}

export function getTradesForDateKey(trades, dateKey) {
  return trades.filter((trade) => {
    const date = getTradeDate(trade);
    if (!date) return false;
    return date.toISOString().slice(0, 10) === dateKey;
  });
}

export function computeAvgWinLoss(trades) {
  const wins = trades.filter((trade) => trade.netPnl > 0).map((trade) => trade.netPnl);
  const losses = trades.filter((trade) => trade.netPnl < 0).map((trade) => trade.netPnl);
  const avgWin = wins.length ? wins.reduce((sum, value) => sum + value, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((sum, value) => sum + value, 0) / losses.length : 0;
  return { avgWin, avgLoss };
}

export function computeBestWorstTrade(trades) {
  if (!trades.length) return { best: 0, worst: 0 };
  const pnls = trades.map((trade) => trade.netPnl || 0);
  return { best: Math.max(...pnls), worst: Math.min(...pnls) };
}

export function computeWinLossStreakSequence(trades, limit = 20) {
  const sorted = trades
    .map((trade) => ({ date: getTradeDate(trade), netPnl: trade.netPnl || 0 }))
    .filter((entry) => entry.date)
    .sort((a, b) => a.date - b.date);
  return sorted.slice(-limit).map((entry) => (entry.netPnl > 0 ? "W" : "L"));
}

export function computeSymbolPerformance(trades) {
  const totals = new Map();
  const counts = new Map();
  trades.forEach((trade) => {
    const key = trade.symbol && trade.symbol.trim() ? trade.symbol.trim().toUpperCase() : "UNKNOWN";
    totals.set(key, (totals.get(key) || 0) + (trade.netPnl || 0));
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const entries = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map(([label]) => label),
    data: entries.map(([, value]) => Number(value.toFixed(2))),
    counts: entries.map(([label]) => counts.get(label))
  };
}

export function computeDailyTimeline(trades, startDate, endDate, maxDays = 30) {
  const dailyMap = computeDailyPnlMap(trades);
  const oneDay = 24 * 60 * 60 * 1000;
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const totalDays = Math.round((end - start) / oneDay) + 1;
  const days = Math.max(1, Math.min(totalDays, maxDays));

  const labels = [];
  const data = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const dateObj = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    const key = dateObj.toISOString().slice(0, 10);
    labels.push(dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    data.push(Number((dailyMap.get(key) || 0).toFixed(2)));
  }
  return { labels, data };
}
