import { useEffect, useState } from "react";
import { subscribeSensorStream } from "@/src/lib/socketService";

export type Reading = {
  timestamp: number;
  value: number;
};

const sensorSeries = new Map<string, Reading[]>();
const listenersBySensor = new Map<string, Set<() => void>>();
const socketUnsubscribeBySensor = new Map<string, () => void>();
const MAX_POINTS = 240;

const getSeries = (label: string): Reading[] => {
  const existing = sensorSeries.get(label);
  if (existing) {
    return existing;
  }

  const seeded: Reading[] = [];
  sensorSeries.set(label, seeded);
  return seeded;
};

const notify = (label: string) => {
  const listeners = listenersBySensor.get(label);
  if (!listeners) return;

  for (const listener of listeners) {
    listener();
  }
};

const pushNextReading = (label: string, nextReading: Reading) => {
  const series = getSeries(label);
  const updated = [...series, nextReading].slice(-MAX_POINTS);
  sensorSeries.set(label, updated);
  notify(label);
};

const ensureSocketSubscription = (label: string) => {
  if (socketUnsubscribeBySensor.has(label)) {
    return;
  }

  const unsubscribe = subscribeSensorStream(label, (reading) => {
    pushNextReading(label, {
      timestamp: reading.timestamp,
      value: reading.value,
    });
  });

  socketUnsubscribeBySensor.set(label, unsubscribe);
};

const subscribe = (label: string, listener: () => void) => {
  const listeners = listenersBySensor.get(label) ?? new Set<() => void>();
  listeners.add(listener);
  listenersBySensor.set(label, listeners);

  ensureSocketSubscription(label);

  return () => {
    const currentListeners = listenersBySensor.get(label);
    if (!currentListeners) {
      return;
    }

    currentListeners.delete(listener);

    if (currentListeners.size === 0) {
      listenersBySensor.delete(label);
      const unsubscribe = socketUnsubscribeBySensor.get(label);
      if (unsubscribe) {
        unsubscribe();
        socketUnsubscribeBySensor.delete(label);
      }
    }
  };
};

export const useSensorData = (label: string): Reading[] => {
  const [data, setData] = useState<Reading[]>(() => getSeries(label));

  useEffect(() => {
    setData(getSeries(label));

    const unsubscribe = subscribe(label, () => {
      setData(getSeries(label));
    });

    return unsubscribe;
  }, [label]);

  return data;
};
