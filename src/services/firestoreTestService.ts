// src/services/firestoreTestService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const TEST_REF = doc(db, "test", "owner");

export type TestDoc = {
  note: string;
  updatedAt: string;
};

export async function loadTestNote(): Promise<string> {
  const snap = await getDoc(TEST_REF);
  if (!snap.exists()) return "";
  const data = snap.data() as TestDoc;
  return data.note ?? "";
}

export async function saveTestNote(note: string): Promise<void> {
  const payload: TestDoc = {
    note,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(TEST_REF, payload, { merge: true });
}
