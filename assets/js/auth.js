import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, deleteUser, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "./config.js";

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

export function subscribeAuthState(onLogin, onLogout) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onLogin(user);
      return;
    }

    onLogout();
  });
}

export function resetPasswordForCurrentUser(email) {
  return sendPasswordResetEmail(auth, email);
}

export function updateDisplayName(displayName) {
  if (!auth.currentUser) {
    return Promise.reject(new Error("No active session."));
  }
  return updateProfile(auth.currentUser, { displayName });
}

export function deleteCurrentAccount() {
  if (!auth.currentUser) {
    return Promise.reject(new Error("No active session."));
  }
  return deleteUser(auth.currentUser);
}
