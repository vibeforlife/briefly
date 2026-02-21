// src/services/userId.ts

const STORAGE_KEY = "briefly4u_user_id";

function generateId() {
  // Simple random ID, good enough for anonymous user IDs
  return (
    "u_" +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

export function getUserId(): string {
  if (typeof window === "undefined") {
    // SSR not used here, but just in case
    return "u_server";
  }

  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
