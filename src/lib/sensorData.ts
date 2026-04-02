import { useEffect, useState } from "react";

export type Reading = {
  timestamp: number;
  value: number;
};

const sensorSeries = new Map<string, Reading[]>();
const sensorIntervals = new Map<string, ReturnType<typeof setInterval>>();
const listenersBySensor = new Map<string, Set<() => void>>();

const DEFAULT_BASE_VALUE = 25;
const SENSOR_BASE_VALUES: Record<string, number> = {
  Sensor1: 25,
  Sensor2: 21,
};

const getBaseValue = (label: string) =>
  SENSOR_BASE_VALUES[label] ?? DEFAULT_BASE_VALUE;

const createSeedReading = (label: string): Reading => ({
  timestamp: Math.floor(Date.now() / 1000),
  value: getBaseValue(label),
});

const getSeries = (label: string): Reading[] => {
  const existing = sensorSeries.get(label);
  if (existing) {
    return existing;
  }

  const seeded = [createSeedReading(label)];
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

const pushNextReading = (label: string) => {
  const series = getSeries(label);
  const last = series[series.length - 1] ?? createSeedReading(label);

  const nextValue = Number((last.value + (Math.random() - 0.5) * 0.6).toFixed(1));
  const nextReading: Reading = {
    timestamp: last.timestamp + 5,
    value: nextValue,
  };

  const updated = [...series.slice(-59), nextReading];
  sensorSeries.set(label, updated);
  notify(label);
};

const ensureTicker = (label: string) => {
  if (sensorIntervals.has(label)) {
    return;
  }

  const interval = setInterval(() => {
    pushNextReading(label);
  }, 5000);

  sensorIntervals.set(label, interval);
};

const subscribe = (label: string, listener: () => void) => {
  const listeners = listenersBySensor.get(label) ?? new Set<() => void>();
  listeners.add(listener);
  listenersBySensor.set(label, listeners);

  ensureTicker(label);

  return () => {
    const currentListeners = listenersBySensor.get(label);
    if (!currentListeners) {
      return;
    }

    currentListeners.delete(listener);

    if (currentListeners.size === 0) {
      listenersBySensor.delete(label);
      const interval = sensorIntervals.get(label);
      if (interval) {
        clearInterval(interval);
        sensorIntervals.delete(label);
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
