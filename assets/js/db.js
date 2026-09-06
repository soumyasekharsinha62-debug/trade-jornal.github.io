import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./config.js";
import { computeNetPnL, computeRiskReward } from "./metrics.js";

const tradesCollection = collection(db, "trades");

export function createTrade(tradeData) {
  const activeLots = tradeData.lotSize || tradeData.quantity || 0;
  const netPnl = computeNetPnL(
    tradeData.direction,
    tradeData.entryPrice,
    tradeData.exitPrice,
    activeLots,
    tradeData.fees,
    tradeData.assetClass
  );
  const riskRewardRatio = computeRiskReward(tradeData.entryPrice, tradeData.exitPrice, tradeData.stopLoss);

  return addDoc(tradesCollection, {
    ...tradeData,
    netPnl,
    riskRewardRatio,
    timestamp: serverTimestamp()
  });
}

export function updateTrade(tradeId, tradeData) {
  const activeLots = tradeData.lotSize || tradeData.quantity || 0;
  const netPnl = computeNetPnL(
    tradeData.direction,
    tradeData.entryPrice,
    tradeData.exitPrice,
    activeLots,
    tradeData.fees,
    tradeData.assetClass
  );
  const riskRewardRatio = computeRiskReward(tradeData.entryPrice, tradeData.exitPrice, tradeData.stopLoss);

  return updateDoc(doc(db, "trades", tradeId), {
    ...tradeData,
    netPnl,
    riskRewardRatio
  });
}

export function deleteTrade(tradeId) {
  return deleteDoc(doc(db, "trades", tradeId));
}

export function listenToTeamTrades(callback, onError) {
  const tradesQuery = query(tradesCollection, orderBy("timestamp", "desc"));
  return onSnapshot(
    tradesQuery,
    (snapshot) => {
      const trades = snapshot.docs.map((document) => ({ tradeId: document.id, ...document.data() }));
      callback(trades);
    },
    onError
  );
}

export function subscribeToUserProfile(uid, callback, onError) {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : {});
    },
    onError
  );
}

export function saveUserProfile(uid, profileData) {
  return setDoc(doc(db, "users", uid), profileData, { merge: true });
}

export function listenToAllUserProfiles(callback, onError) {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const profiles = snapshot.docs.map((document) => ({ uid: document.id, ...document.data() }));
      callback(profiles);
    },
    onError
  );
}
