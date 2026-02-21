// src/services/pinnedSourceService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { UserPrefsDoc } from "./presetService";

const REF = doc(db, "userPrefs", "owner");

export async function loadPinnedSources(): Promise<string[]> {
  try {
    const snap = await getDoc(REF);
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
    const payload: UserPrefsDoc = {
      pinnedSources: domains,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(REF, payload, { merge: true });
  } catch (e) {
    console.error("savePinnedSources Firestore error", e);
    throw e;
  }
}
