// src/services/bookmarkService.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { NewsArticle } from "./newsApiService";
import { getUserId } from "./userId";

export type BookmarkDoc = {
  articles: NewsArticle[];
};

function getBookmarkRef() {
  const userId = getUserId();
  // Collection "bookmarks", document per user
  return doc(db, "bookmarks", userId);
}

export async function loadBookmarks(): Promise<NewsArticle[]> {
  try {
    const ref = getBookmarkRef();
    const snap = await getDoc(ref);
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
    const ref = getBookmarkRef();
    const payload: BookmarkDoc = { articles };
    await setDoc(ref, payload, { merge: true });
  } catch (e) {
    console.error("saveBookmarks Firestore error", e);
    throw e;
  }
}
