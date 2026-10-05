// -----------------------------------------------------------------------
// Firebase-backed version of storage.js — real cross-device sync.
//
// SETUP:
//   1. npm install firebase
//   2. Rename firebaseConfig.example.js -> firebaseConfig.js and fill in
//      your project's config (Firebase console -> Project settings ->
//      Your apps).
//   3. In Firestore (Firebase console -> Build -> Firestore Database),
//      make sure you've created a database.
//   4. Rename THIS file to storage.js, replacing the localStorage version.
//      Every component already imports from "./storage", so nothing else
//      needs to change.
// -----------------------------------------------------------------------

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export async function signUpWithEmail({ email, password, name }) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name && result.user) {
    await updateProfile(result.user, { displayName: name });
  }
  return result.user;
}

export async function signInWithEmail({ email, password }) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOutCurrentUser() {
  await signOut(auth);
}

// Get current user's ID
export function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

// Determine user role ("you" or "partner") based on the signed-in identity.
export function getUserRole(userId) {
  const saved = localStorage.getItem(`user_role_${userId}`);
  if (saved === "you" || saved === "partner") return saved;

  const firstUserId = localStorage.getItem("app_first_user_id");

  if (!firstUserId) {
    localStorage.setItem("app_first_user_id", userId);
    localStorage.setItem(`user_role_${userId}`, "you");
    return "you";
  }

  if (userId === firstUserId) {
    localStorage.setItem(`user_role_${userId}`, "you");
    return "you";
  }

  localStorage.setItem(`user_role_${userId}`, "partner");
  return "partner";
}

// Subscribe to auth changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

function defaultMonth() {
  return { overallBudget: 0, categoryBudgets: {}, expenses: [] };
}

export async function loadMonth(key) {
  try {
    const snap = await getDoc(doc(db, "months", key));
    return snap.exists() ? snap.data() : defaultMonth();
  } catch (e) {
    console.error("loadMonth failed", e);
    return defaultMonth();
  }
}

export async function saveMonth(key, data) {
  try {
    await setDoc(doc(db, "months", key), data);
    return true;
  } catch (e) {
    console.error("saveMonth failed", e);
    return false;
  }
}

/** Live updates: calls `callback(data)` whenever either of you changes this month. */
export function subscribeMonth(key, callback) {
  const unsub = onSnapshot(doc(db, "months", key), (snap) => {
    callback(snap.exists() ? snap.data() : defaultMonth());
  });
  return unsub;
}

export const SYNC_MODE = "firebase";

// ---- Firestore security rules (paste into Firebase console -> Firestore
// -> Rules, replacing the default test-mode rules) ----
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /months/{monthId} {
//       allow read, write: if true; // tighten later with auth if you want
//     }
//   }
// }
