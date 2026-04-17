import { useSyncExternalStore } from 'react';

export type AlertActivityItem = {
  id: string;
  message: string;
  createdAt: number;
};

const MAX_ITEMS = 20;
let activityItems: AlertActivityItem[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return activityItems;
}

export function addAlertActivity(label: string) {
  const item: AlertActivityItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: `Alert for ${label} set off`,
    createdAt: Date.now(),
  };

  activityItems = [item, ...activityItems].slice(0, MAX_ITEMS);
  emitChange();
}

export function removeAlertActivity(id: string) {
  const nextItems = activityItems.filter((item) => item.id !== id);
  if (nextItems.length === activityItems.length) {
    return;
  }

  activityItems = nextItems;
  emitChange();
}

export function useAlertActivity() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
