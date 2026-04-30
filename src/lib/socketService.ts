import { useSyncExternalStore } from "react";
import { io, type Socket } from "socket.io-client";
import { getBackendUrl } from "@/src/lib/backendConfig";
import { getAccessToken } from "@/src/lib/auth";

export type ReadingPayload = {
  label: string;
  timestamp: number;
  value: number;
  humidity: number;
  battery: number;
};

type Incoming = {
  mac?: unknown;
  time?: unknown;
  temperature?: unknown;
  humidity?: unknown;
  battery?: unknown;
};

export type SocketConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "stale"
  | "error";

export type SocketStatus = {
  state: SocketConnectionState;
  backendUrl: string | null;
  lastMessageAt: number | null;
  errorMessage: string | null;
};

type Listener = () => void;
type ReadingListener = (r: ReadingPayload) => void;

const SENSOR_EVENT = "sensor_update";

let socket: Socket | null = null;
let socketStatus: SocketStatus = {
  state: "idle",
  backendUrl: null,
  lastMessageAt: null,
  errorMessage: null,
};

const statusListeners = new Set<Listener>();
const sensorListeners = new Map<string, Set<ReadingListener>>();

const emit = () => statusListeners.forEach((l) => l());

const setStatus = (next: Partial<SocketStatus>) => {
  socketStatus = { ...socketStatus, ...next };
  emit();
};

const parse = (p: unknown): ReadingPayload | null => {
  const c = p as Incoming;
  if (typeof c.mac !== "string") return null;

  const ts = Date.parse(String(c.time));
  const temp = Number(c.temperature);
  const hum = Number(c.humidity);
  const bat = Number(c.battery);

  if (!Number.isFinite(ts) || !Number.isFinite(temp)) return null;

  return {
    label: c.mac,
    timestamp: Math.floor(ts / 1000),
    value: temp,
    humidity: hum,
    battery: bat,
  };
};

const handle = (p: unknown) => {
  const r = parse(p);
  if (!r) return;

  setStatus({
    state: "connected",
    lastMessageAt: Date.now(),
    errorMessage: null,
  });

  sensorListeners.get(r.label)?.forEach((l) => l(r));
};

const ensureSocket = () => {
  const url = getBackendUrl();
  const token = getAccessToken();

  if (!url) {
    setStatus({ state: "error", errorMessage: "No backend URL" });
    return null;
  }

  if (socket) return socket;

  socket = io(`${url}/sensor-data`, {
    autoConnect: false,
    auth: token ? { token } : undefined,
    extraHeaders: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  });

  socket.on("connect", () => setStatus({ state: "connected" }));
  socket.on("disconnect", () => setStatus({ state: "connecting" }));
  socket.on("connect_error", (e) =>
    setStatus({ state: "error", errorMessage: e.message })
  );

  socket.on(SENSOR_EVENT, handle);

  return socket;
};

export const connectSocket = () => {
  const s = ensureSocket();
  if (!s) return;

  setStatus({ state: "connecting" });
  s.connect();
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  setStatus({ state: "idle" });
};

export const subscribeSensorStream = (
  label: string,
  listener: ReadingListener
) => {
  const set = sensorListeners.get(label) ?? new Set();
  set.add(listener);
  sensorListeners.set(label, set);

  connectSocket();

  return () => {
    set.delete(listener);
    if (!set.size) sensorListeners.delete(label);
  };
};

export const useSocketStatus = () =>
  useSyncExternalStore(
    (cb) => {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },
    () => socketStatus
  );