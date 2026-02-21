// src/services/pinnedSourceService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getUserId } from "./userId";
import type { UserPrefsDoc } from "./presetService";

function getUserPrefsRef() {
  const userId = getUserId();
  return doc(db, "userPrefs", userId);
}

export async function loadPinnedSources(): Promise<string[]> {
  try {
    const ref = getUserPrefsRef();
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as UserPrefsDoc;
    return data.pinnedSources ?? [];
  } catch (e) {
    console.error("loadPinnedSources Firestore error", e);
    throw e;
  }
}

export async function savePinnedSources(domains: string[]): Promise<void> {
  try {
    const ref = getUserPrefsRef();
    const payload: UserPrefsDoc = { pinnedSources: domains };
    await setDoc(ref, payload, { merge: true });
  } catch (e) {
    console.error("savePinnedSources Firestore error", e);
    throw e;
  }
}
