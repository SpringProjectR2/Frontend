import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

type SettingsListener = () => void;

export type SettingsState = {
  language: string;
  temperature: "C" | "F";
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";

  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  hydrated: boolean;
};

const STORAGE_KEY = "app:settings";

const listeners = new Set<SettingsListener>();

export const DEFAULT_SETTINGS: SettingsState = {
  language: "Suomi",
  temperature: "C",
  theme: "light",
  fontSize: "medium",

  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,

  hydrated: false,
};

let state: SettingsState = DEFAULT_SETTINGS;

const emit = () => {
  for (const l of listeners) l();
};

const setState = (next: Partial<SettingsState>) => {
  state = { ...state, ...next };
  emit();
};

const save = async (nextState: SettingsState) => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(nextState)
  );
};

export const hydrateSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setState({
        ...DEFAULT_SETTINGS,
        hydrated: true,
      });
      return;
    }

    const parsed = JSON.parse(raw);

    setState({
      ...DEFAULT_SETTINGS,
      ...parsed,
      hydrated: true,
    });
  } catch {
    setState({
      ...DEFAULT_SETTINGS,
      hydrated: true,
    });
  }
};

export const updateSettings = async (
  next: Partial<SettingsState>
) => {
  const newState = { ...state, ...next };
  setState(newState);
  await save(newState);
};

export const resetSettings = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);

  setState({
    ...DEFAULT_SETTINGS,
    hydrated: true,
  });
};

export const getSettings = () => state;

export const subscribeSettings = (
  listener: SettingsListener
) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSettings = (): SettingsState =>
  useSyncExternalStore(
    subscribeSettings,
    getSettings,
    getSettings
  );