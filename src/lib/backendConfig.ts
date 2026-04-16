import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

type BackendConfigListener = () => void;

export type BackendConfigState = {
  backendUrl: string | null;
  hydrated: boolean;
  hasConfirmedConnection: boolean;
};

const BACKEND_URL_STORAGE_KEY = "backend:url";
const backendConfigListeners = new Set<BackendConfigListener>();

let backendConfigState: BackendConfigState = {
  backendUrl: null,
  hydrated: false,
  hasConfirmedConnection: false,
};

const emitBackendConfig = () => {
  for (const listener of backendConfigListeners) {
    listener();
  }
};

const setBackendConfigState = (next: Partial<BackendConfigState>) => {
  backendConfigState = {
    ...backendConfigState,
    ...next,
  };
  emitBackendConfig();
};

export const normalizeBackendUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname) {
      return null;
    }

    parsed.pathname = "";
    parsed.search = "";
    parsed.hash = "";

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
};

export const hydrateBackendConfig = async () => {
  try {
    const storedUrl = await AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY);
    const normalized = storedUrl ? normalizeBackendUrl(storedUrl) : null;

    setBackendConfigState({
      backendUrl: normalized,
      hydrated: true,
      hasConfirmedConnection: false,
    });
  } catch {
    setBackendConfigState({ hydrated: true, hasConfirmedConnection: false });
  }
};

export const setBackendUrl = async (value: string) => {
  const normalized = normalizeBackendUrl(value);
  if (!normalized) {
    throw new Error("Please enter a valid IP or URL.");
  }

  await AsyncStorage.setItem(BACKEND_URL_STORAGE_KEY, normalized);
  setBackendConfigState({
    backendUrl: normalized,
    hydrated: true,
    hasConfirmedConnection: true,
  });
  return normalized;
};

export const clearBackendUrl = async () => {
  await AsyncStorage.removeItem(BACKEND_URL_STORAGE_KEY);
  setBackendConfigState({
    backendUrl: null,
    hydrated: true,
    hasConfirmedConnection: false,
  });
};

export const resetConnectionConfirmation = () => {
  setBackendConfigState({ hasConfirmedConnection: false });
};

export const getBackendUrl = () => backendConfigState.backendUrl;

export const getBackendConfigState = () => backendConfigState;

export const subscribeBackendConfig = (listener: BackendConfigListener) => {
  backendConfigListeners.add(listener);
  return () => {
    backendConfigListeners.delete(listener);
  };
};

export const useBackendConfig = (): BackendConfigState =>
  useSyncExternalStore(subscribeBackendConfig, getBackendConfigState, getBackendConfigState);
