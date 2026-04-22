import { useSyncExternalStore } from "react";
import { io, type Socket } from "socket.io-client";
import { getBackendUrl } from "@/src/lib/backendConfig";
import { getAccessToken } from "@/src/lib/auth";

export type ReadingPayload = {
  label: string;
  timestamp: number;
  value: number;
  battery: number;
  humidity: number;
};

type IncomingSensorPayload = {
  mac?: unknown;
  time?: unknown;
  temperature?: unknown;
  battery?: unknown;
  humidity?: unknown;
};

export type SocketConnectionState = "idle" | "connecting" | "connected" | "stale" | "error";

export type SocketStatus = {
  state: SocketConnectionState;
  backendUrl: string | null;
  lastMessageAt: number | null;
  errorMessage: string | null;
};

type StatusListener = () => void;
type ReadingListener = (reading: ReadingPayload) => void;

const SENSOR_EVENT = "sensor_update";
const statusListeners = new Set<StatusListener>();
const sensorListenersByLabel = new Map<string, Set<ReadingListener>>();
const RECONNECT_WATCHDOG_MS = 2000;

let socket: Socket | null = null;
let isBootstrapped = false;
let reconnectWatchdog: ReturnType<typeof setInterval> | null = null;

let socketStatus: SocketStatus = {
  state: "idle",
  backendUrl: null,
  lastMessageAt: null,
  errorMessage: null,
};

const emitStatus = () => {
  for (const listener of statusListeners) {
    listener();
  }
};

const setSocketStatus = (next: Partial<SocketStatus>) => {
  socketStatus = {
    ...socketStatus,
    ...next,
  };
  emitStatus();
};

const hasSensorSubscribers = () => sensorListenersByLabel.size > 0;

const stopReconnectWatchdog = () => {
  if (!reconnectWatchdog) {
    return;
  }

  clearInterval(reconnectWatchdog);
  reconnectWatchdog = null;
};

const ensureReconnectWatchdog = () => {
  if (reconnectWatchdog) {
    return;
  }

  reconnectWatchdog = setInterval(() => {
    if (!hasSensorSubscribers()) {
      stopReconnectWatchdog();
      return;
    }

    const instance = ensureSocket();
    if (!instance || instance.connected || instance.active) {
      return;
    }

    setSocketStatus({
      state: "connecting",
      errorMessage: null,
    });
    instance.connect();
  }, RECONNECT_WATCHDOG_MS);
};

const normalizeUnixSeconds = (input: unknown): number => {
  if (typeof input === "number" && Number.isFinite(input)) {
    return input > 1e12 ? Math.floor(input / 1000) : Math.floor(input);
  }

  if (typeof input === "string") {
    const numeric = Number(input);
    if (Number.isFinite(numeric)) {
      return numeric > 1e12 ? Math.floor(numeric / 1000) : Math.floor(numeric);
    }

    const parsedMs = Date.parse(input);
    if (Number.isFinite(parsedMs)) {
      return Math.floor(parsedMs / 1000);
    }
  }

  return Number.NaN;
};

const parseReading = (payload: unknown): ReadingPayload | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as IncomingSensorPayload;
  const label = typeof candidate.mac === "string" ? candidate.mac : null;
  if (!label) {
    return null;
  }

  const timestamp = normalizeUnixSeconds(candidate.time);
  const value = Number(candidate.temperature);
  const battery = Number(candidate.battery);
  const humidity = Number(candidate.humidity);
  if (
    !Number.isFinite(timestamp) ||
    !Number.isFinite(value) ||
    !Number.isFinite(battery) ||
    !Number.isFinite(humidity)
  ) {
    return null;
  }

  return {
    label,
    timestamp,
    value,
    battery,
    humidity,
  };
};

const handleSensorEvent = (payload: unknown) => {
  console.log("[socket] received payload:", payload);

  const reading = parseReading(payload);
  if (!reading) {
    return;
  }

  setSocketStatus({
    state: "connected",
    lastMessageAt: Math.floor(Date.now() / 1000),
    errorMessage: null,
  });

  const listeners = sensorListenersByLabel.get(reading.label);
  if (!listeners || listeners.size === 0) {
    return;
  }

  for (const listener of listeners) {
    listener(reading);
  }
};

const ensureSocket = () => {
  const backendUrl = getBackendUrl() ?? "";
  const accessToken = getAccessToken();

  if (!backendUrl) {
    setSocketStatus({
      state: "error",
      backendUrl: null,
      errorMessage: "Backend URL is not set",
    });
    return null;
  }

  if (socket) {
    if (socketStatus.backendUrl === backendUrl) {
      return socket;
    }

    socket.off(SENSOR_EVENT, handleSensorEvent);
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(`${backendUrl}/sensor-data`, {
    autoConnect: false,
    transports: ["polling"],
    upgrade: false,
    auth: accessToken ? { token: accessToken } : undefined,
    extraHeaders: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  setSocketStatus({
    backendUrl,
    errorMessage: null,
  });

  socket.on("connect", () => {
    setSocketStatus({
      state: "connected",
      errorMessage: null,
    });
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io client disconnect") {
      setSocketStatus({
        state: "idle",
        errorMessage: null,
      });
      return;
    }

    setSocketStatus({
      state: "connecting",
      errorMessage: `Disconnected: ${reason}`,
    });

    if (reason === "io server disconnect") {
      socket?.connect();
    }
  });

  socket.on("connect_error", (error) => {
    setSocketStatus({
      state: "error",
      errorMessage: error.message,
    });
  });

  socket.on(SENSOR_EVENT, handleSensorEvent);

  return socket;
};

export const connectSocket = () => {
  const instance = ensureSocket();
  if (!instance) {
    return;
  }

  if (instance.connected) {
    setSocketStatus({
      state: "connected",
      errorMessage: null,
    });
    return;
  }

  if (instance.active) {
    setSocketStatus({
      state: "connecting",
      errorMessage: null,
    });
    return;
  }

  setSocketStatus({
    state: "connecting",
    errorMessage: null,
  });
  instance.connect();
};

export const disconnectSocket = () => {
  if (!socket) {
    isBootstrapped = false;
    stopReconnectWatchdog();
    setSocketStatus({ state: "idle", backendUrl: getBackendUrl() });
    return;
  }

  socket.off(SENSOR_EVENT, handleSensorEvent);
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  isBootstrapped = false;
  stopReconnectWatchdog();

  setSocketStatus({
    state: "idle",
    backendUrl: getBackendUrl(),
    errorMessage: null,
  });
};

export const bootstrapSocket = () => {
  if (isBootstrapped && socket) {
    return;
  }

  isBootstrapped = true;
  connectSocket();
};

export const subscribeSensorStream = (
  label: string,
  listener: ReadingListener,
): (() => void) => {
  const listeners = sensorListenersByLabel.get(label) ?? new Set<ReadingListener>();
  listeners.add(listener);
  sensorListenersByLabel.set(label, listeners);

  connectSocket();
  ensureReconnectWatchdog();

  return () => {
    const current = sensorListenersByLabel.get(label);
    if (!current) {
      return;
    }

    current.delete(listener);
    if (current.size === 0) {
      sensorListenersByLabel.delete(label);

      if (!hasSensorSubscribers()) {
        stopReconnectWatchdog();
      }
    }
  };
};

export const getSocketStatus = (): SocketStatus => socketStatus;

export const subscribeSocketStatus = (listener: StatusListener) => {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
};

export const useSocketStatus = (): SocketStatus =>
  useSyncExternalStore(subscribeSocketStatus, getSocketStatus, getSocketStatus);
