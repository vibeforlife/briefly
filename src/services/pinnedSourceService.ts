// src/services/pinnedSourceService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const REF = doc(db, "userPrefs", "local-user");

export async function loadPinnedSources(): Promise<string[]> {
  const snap = await getDoc(REF);
  if (!snap.exists()) return [];
  return snap.data()?.pinnedSources ?? [];
}

export async function savePinnedSources(domains: string[]): Promise<void> {
  await setDoc(REF, { pinnedSources: domains }, { merge: true });
}
