// src/services/bookmarkService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { NewsArticle } from "./newsApiService";

export type BookmarkDoc = {
  articles: NewsArticle[];
  updatedAt?: string;
};

const REF = doc(db, "bookmarks", "owner");

export async function loadBookmarks(): Promise<NewsArticle[]> {
  try {
    const snap = await getDoc(REF);
    if (!snap.exists()) return [];
    const data = snap.data() as BookmarkDoc;
    return data.articles ?? [];
  } catch (e) {
    console.error("loadBookmarks Firestore error", e);
    throw e;
  }
}

export async function saveBookmarks(articles: NewsArticle[]): Promise<void> {
  try {
    const payload: BookmarkDoc = {
      articles,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(REF, payload, { merge: true });
  } catch (e) {
    console.error("saveBookmarks Firestore error", e);
    throw e;
  }
}
