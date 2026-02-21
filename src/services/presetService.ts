// src/services/presetService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export type Preset = {
  id: string;
  name: string;
  topic: string;
  searchTerm: string;
};

export type UserPrefsDoc = {
  presets?: Preset[];
  pinnedSources?: string[];
  updatedAt?: string;
};

const REF = doc(db, "userPrefs", "owner");

export async function loadPresets(): Promise<Preset[]> {
  try {
    const snap = await getDoc(REF);
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
    const payload: UserPrefsDoc = {
      presets,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(REF, payload, { merge: true });
  } catch (e) {
    console.error("savePresets Firestore error", e);
    throw e;
  }
}
