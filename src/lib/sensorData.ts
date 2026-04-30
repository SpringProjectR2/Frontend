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
  if (!sensorSeries.has(label)) {
    sensorSeries.set(label, []);
  }
  return sensorSeries.get(label)!;
};

const notify = (label: string) => {
  listenersBySensor.get(label)?.forEach((l) => l());
};

const pushNextReading = (label: string, next: Reading) => {
  const updated = [...getSeries(label), next].slice(-MAX_POINTS);
  sensorSeries.set(label, updated);
  notify(label);
};

const hydrateHistory = async (label: string) => {
  if (hydratedHistoryBySensor.has(label)) return;
  hydratedHistoryBySensor.add(label);

  const backendUrl = getBackendUrl();
  const token = getAccessToken();
  if (!backendUrl || !token) return;

  try {
    const res = await fetch(
      `${backendUrl}/history/${encodeURIComponent(label)}?hours=24&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const payload = await res.json();
    if (!Array.isArray(payload)) return;

    const parsed: Reading[] = payload
      .map((e) => {
        if (!e?.time || !e?.temperature) return null;
        return {
          time: e.time,
          temperature: e.temperature,
          humidity: Number(e.humidity) || 0,
        };
      })
      .filter(Boolean);

    sensorSeries.set(label, [...getSeries(label), ...parsed].slice(-MAX_POINTS));
    notify(label);
  } catch {}
};

const ensureSocket = (label: string) => {
  if (socketUnsubscribeBySensor.has(label)) return;

  const unsub = subscribeSensorStream(label, (r) => {
    pushNextReading(label, {
      time: new Date(r.timestamp * 1000).toISOString(),
      temperature: r.value,
      humidity: r.humidity,
    });
  });

  socketUnsubscribeBySensor.set(label, unsub);
};

const subscribe = (label: string, cb: () => void) => {
  const set = listenersBySensor.get(label) ?? new Set();
  set.add(cb);
  listenersBySensor.set(label, set);

  ensureSocket(label);

  return () => {
    set.delete(cb);
    if (!set.size) {
      listenersBySensor.delete(label);
      socketUnsubscribeBySensor.get(label)?.();
      socketUnsubscribeBySensor.delete(label);
    }
  };
};

export const useSensorData = (label: string) => {
  const [data, setData] = useState(getSeries(label));

  useEffect(() => {
    setData(getSeries(label));
    hydrateHistory(label);

    return subscribe(label, () => {
      setData(getSeries(label));
    });
  }, [label]);

  return data;
};