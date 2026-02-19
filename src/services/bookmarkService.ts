// src/services/bookmarkService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { NewsArticle } from "./newsApiService";

const REF = doc(db, "bookmarks", "local-user");

export async function loadBookmarks(): Promise<NewsArticle[]> {
  const snap = await getDoc(REF);
  if (!snap.exists()) return [];
  return snap.data()?.articles ?? [];
}

export async function saveBookmarks(articles: NewsArticle[]): Promise<void> {
  await setDoc(REF, { articles }, { merge: true });
}
