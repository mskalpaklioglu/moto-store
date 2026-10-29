// Recently viewed product ids, kept in localStorage (per browser).
import { useCallback, useEffect, useState } from "react";

const KEY = "recently-viewed:v1";
const MAX = 8;

const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(read()), []);

  const record = useCallback((id: string) => {
    const next = [id, ...read().filter((x) => x !== id)].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { ids, record };
}
