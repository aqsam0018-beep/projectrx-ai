import type { HistoryRecord } from "@/types/project";

const KEY = "projectrx.history.v1";

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: HistoryRecord) {
  if (typeof window === "undefined") return;
  const all = getHistory();
  all.unshift(record);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
}

export function updateRecord(id: string, patch: Partial<HistoryRecord>) {
  if (typeof window === "undefined") return;
  const all = getHistory().map((r) => (r.id === id ? { ...r, ...patch } : r));
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteRecord(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(getHistory().filter((r) => r.id !== id)));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function getRecord(id: string) {
  return getHistory().find((r) => r.id === id);
}
