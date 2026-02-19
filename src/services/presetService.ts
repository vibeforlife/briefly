// src/services/presetService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export type Preset = {
  id: string;
  name: string;
  topic: string;
  searchTerm: string;
};

const REF = doc(db, "userPrefs", "local-user");

export async function loadPresets(): Promise<Preset[]> {
  const snap = await getDoc(REF);
  if (!snap.exists()) return [];
  return snap.data()?.presets ?? [];
}

export async function savePresets(presets: Preset[]): Promise<void> {
  await setDoc(REF, { presets }, { merge: true });
}
