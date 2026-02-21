// src/services/presetService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getUserId } from "./userId";

export type Preset = {
  id: string;
  name: string;
  topic: string;
  searchTerm: string;
};

export type UserPrefsDoc = {
  presets?: Preset[];
  pinnedSources?: string[];
};

function getUserPrefsRef() {
  const userId = getUserId();
  // Collection "userPrefs", document per user
  return doc(db, "userPrefs", userId);
}

export async function loadPresets(): Promise<Preset[]> {
  try {
    const ref = getUserPrefsRef();
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data() as UserPrefsDoc;
    return data.presets ?? [];
  } catch (e) {
    console.error("loadPresets Firestore error", e);
    throw e;
  }
}

export async function savePresets(presets: Preset[]): Promise<void> {
  try {
    const ref = getUserPrefsRef();
    const payload: UserPrefsDoc = { presets };
    await setDoc(ref, payload, { merge: true });
  } catch (e) {
    console.error("savePresets Firestore error", e);
    throw e;
  }
}
