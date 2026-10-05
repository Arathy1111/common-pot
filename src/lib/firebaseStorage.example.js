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
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
