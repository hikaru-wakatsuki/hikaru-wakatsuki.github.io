import { useSyncExternalStore } from 'react';

// Module-level singleton — no Provider needed.
// Both SkillsContainer and PortfolioContainer share this instance.

let _activeTag: string | null = null;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export const tagFilterStore = {
  set(tag: string | null) {
    _activeTag = tag;
    notify();
  },
  toggle(tag: string) {
    _activeTag = _activeTag === tag ? null : tag;
    notify();
  },
  clear() {
    _activeTag = null;
    notify();
  },
  subscribe(listener: () => void) {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },
  getSnapshot: () => _activeTag,
  getServerSnapshot: (): string | null => null,
};

export function useTagFilter() {
  const activeTag = useSyncExternalStore(
    tagFilterStore.subscribe,
    tagFilterStore.getSnapshot,
    tagFilterStore.getServerSnapshot,
  );
  return {
    activeTag,
    setActiveTag: tagFilterStore.set,
    toggleTag: tagFilterStore.toggle,
    clearTag: tagFilterStore.clear,
  };
}
