import { useEffect, useState } from "react";
import { getAccessToken } from "@/src/lib/auth";
import { getBackendUrl } from "@/src/lib/backendConfig";
import { subscribeSensorStream } from "@/src/lib/socketService";

export type Reading = {
  time: string;
  temperature: number;
  humidity: number;
};

const sensorSeries = new Map<string, Reading[]>();
const listenersBySensor = new Map<string, Set<() => void>>();
const socketUnsubscribeBySensor = new Map<string, () => void>();
const hydratedHistoryBySensor = new Set<string>();
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

type HistoryItem = {
  time?: string;
  temperature?: number;
  humidity?: number;
};

const mergeSeriesByTimestamp = (existing: Reading[], incoming: Reading[]): Reading[] => {
  const byTime = new Map<string, Reading>();

  for (const point of existing) {
    byTime.set(point.time, point);
  }

  for (const point of incoming) {
    byTime.set(point.time, point);
  }

  return Array.from(byTime.values())
    .sort((left, right) => Date.parse(left.time) - Date.parse(right.time))
    .slice(-MAX_POINTS);
};

const hydrateHistory = async (label: string) => {
  if (hydratedHistoryBySensor.has(label)) {
    return;
  }

  hydratedHistoryBySensor.add(label);

  const backendUrl = getBackendUrl();
  const accessToken = getAccessToken();
  if (!backendUrl || !accessToken) {
    return;
  }

  try {
    const response = await fetch(
      `${backendUrl}/history/${encodeURIComponent(label)}?hours=24&limit=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      return;
    }

    const incoming: Reading[] = payload
      .map((entry) => {
        const item = entry as HistoryItem;
        if (typeof item.time !== "string" || typeof item.temperature !== "number") {
          return null;
        }

        if (!Number.isFinite(Date.parse(item.time))) {
          return null;
        }

        const parsedHumidity = Number(item.humidity);

        return {
          time: item.time,
          temperature: item.temperature,
          humidity: Number.isFinite(parsedHumidity) ? parsedHumidity : 0,
        };
      })
      .filter((point): point is Reading => point !== null);

    const existing = getSeries(label);
    sensorSeries.set(label, mergeSeriesByTimestamp(existing, incoming));
    notify(label);
  } catch {
    // Keep stream alive even if history fetch fails.
  }
};

const ensureSocketSubscription = (label: string) => {
  if (socketUnsubscribeBySensor.has(label)) {
    return;
  }

  const unsubscribe = subscribeSensorStream(label, (reading) => {
    pushNextReading(label, {
      time: new Date(reading.timestamp * 1000).toISOString(),
      temperature: reading.value,
      humidity: reading.humidity,
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
    hydrateHistory(label);

    const unsubscribe = subscribe(label, () => {
      setData(getSeries(label));
    });

    return unsubscribe;
  }, [label]);

  return data;
};
