"use client";

import { useCallback, useSyncExternalStore } from "react";

// A tiny localStorage-backed list of ids shared by every component and browser tab
// (shortlist, compare — SPEC §16, §17). All storage access is guarded: private windows and
// blocked storage fall back to an in-memory list.

export interface LocalListStore {
  useIds(): string[];
  useHas(id: string): boolean;
  toggle(id: string): { added: boolean; limitReached: boolean };
  remove(id: string): void;
  clear(): void;
  max: number;
}

const EMPTY: string[] = [];

export function createLocalListStore(key: string, max: number): LocalListStore {
  let memory: string[] = [];
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();

  function read(): string[] {
    if (cache) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, max) : [];
    } catch {
      cache = memory;
    }
    return cache;
  }

  function write(ids: string[]) {
    cache = ids;
    memory = ids;
    try {
      window.localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      // Storage unavailable — keep the in-memory copy.
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  const getServerSnapshot = () => EMPTY;

  return {
    max,
    useIds() {
      return useSyncExternalStore(subscribe, read, getServerSnapshot);
    },
    useHas(id: string) {
      const has = useCallback(() => read().includes(id), [id]);
      return useSyncExternalStore(subscribe, has, () => false);
    },
    toggle(id: string) {
      const ids = read();
      if (ids.includes(id)) {
        write(ids.filter((x) => x !== id));
        return { added: false, limitReached: false };
      }
      if (ids.length >= max) return { added: false, limitReached: true };
      write([...ids, id]);
      return { added: true, limitReached: false };
    },
    remove(id: string) {
      write(read().filter((x) => x !== id));
    },
    clear() {
      write([]);
    },
  };
}

export const shortlistStore = createLocalListStore("jr:shortlist", 50);
export const compareStore = createLocalListStore("jr:compare", 3);
