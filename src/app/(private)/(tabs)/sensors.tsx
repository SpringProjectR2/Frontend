import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import Sensor from "@/src/components/Sensor";
import { getAccessToken } from "@/src/lib/auth";
import { useBackendConfig } from "@/src/lib/backendConfig";

const SELECTION_STORAGE_KEY = "sensors:selected";

export default function Sensors() {
  const { backendUrl } = useBackendConfig();
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [draftSelection, setDraftSelection] = useState<string[]>([]);
  const [selectionHydrated, setSelectionHydrated] = useState(false);

  const persistSelection = useCallback(async (nextSelection: string[]) => {
    setSelectedLabels(nextSelection);

    try {
      await AsyncStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(nextSelection));
    } catch {
      // Ignore storage failures
    }
  }, []);

  const hydrateSelection = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          setSelectedLabels(parsed);
        }
      }
    } catch {
      // Leave selection empty when hydration fails.
    } finally {
      setSelectionHydrated(true);
    }
  }, []);

  const loadSensors = useCallback(async () => {
    if (!backendUrl) {
      setErrorMessage("Backend URL is not configured.");
      setAvailableLabels([]);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setErrorMessage("Missing access token. Please log in again.");
      setAvailableLabels([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${backendUrl}/macs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        let message = "Unable to load sensors.";

        try {
          const payload = (await response.json()) as {
            error?: string;
            detail?: string;
            message?: string;
          };
          message = payload.error ?? payload.detail ?? payload.message ?? message;
        } catch {
          // Keep default message when response body is not JSON.
        }

        setErrorMessage(message);
        setAvailableLabels([]);
        return;
      }

      const payload = (await response.json()) as unknown;
      const macs = Array.isArray(payload)
        ? payload.filter((value): value is string => typeof value === "string")
        : [];
      setAvailableLabels(macs);
    } catch {
      setErrorMessage("Unable to reach the server.");
      setAvailableLabels([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  useEffect(() => {
    hydrateSelection();
  }, [hydrateSelection]);

  useEffect(() => {
    if (!selectionHydrated || selectedLabels.length === 0 || availableLabels.length === 0) {
      return;
    }

    const filteredSelection = selectedLabels.filter((label) =>
      availableLabels.includes(label),
    );

    if (filteredSelection.length !== selectedLabels.length) {
      persistSelection(filteredSelection);
    }
  }, [availableLabels, persistSelection, selectedLabels, selectionHydrated]);

  const visibleLabels = useMemo(
    () => selectedLabels.filter((label) => availableLabels.includes(label)),
    [availableLabels, selectedLabels],
  );

  const handleOpenSelector = () => {
    setDraftSelection(selectedLabels);
    setIsSelectorOpen(true);
  };

  const handleToggleDraft = (label: string) => {
    setDraftSelection((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };

  const handleSaveSelection = () => {
    const nextSelection = availableLabels.filter((label) =>
      draftSelection.includes(label),
    );
    void persistSelection(nextSelection);
    setIsSelectorOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 96 }}>
      {isLoading ? (
        <View style={{ paddingTop: 24, alignItems: "center" }}>
          <ActivityIndicator color="#111111" />
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 16, gap: 12 }}>
          <Text style={{ color: "#a40000", fontSize: 14 }}>{errorMessage}</Text>
          <Pressable
            onPress={loadSensors}
            style={{
              borderWidth: 1,
              borderColor: "#000000",
              borderRadius: 8,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !errorMessage && visibleLabels.length === 0 ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 16 }}>
          <Text style={{ color: "#444444", fontSize: 14 }}>
            No sensors selected.
          </Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage
        ? visibleLabels.map((label) => <Sensor key={label} label={label} />)
        : null}
      </ScrollView>

      <Pressable
        onPress={handleOpenSelector}
        accessibilityRole="button"
        accessibilityLabel="Add sensors"
        style={({ pressed }) => [
          {
            position: "absolute",
            right: 16,
            bottom: 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#000000",
            justifyContent: "center",
            alignItems: "center",
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "600" }}>+</Text>
      </Pressable>

      <Modal
        visible={isSelectorOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsSelectorOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              maxHeight: "80%",
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Add sensors</Text>

            {availableLabels.length === 0 ? (
              <Text style={{ color: "#666666", fontSize: 14 }}>
                No sensors available.
              </Text>
            ) : (
              <ScrollView>
                {availableLabels.map((label) => {
                  const isSelected = draftSelection.includes(label);
                  return (
                    <Pressable
                      key={label}
                      onPress={() => handleToggleDraft(label)}
                      style={({ pressed }) => [
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#eeeeee",
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 15 }}>{label}</Text>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: isSelected ? "#000000" : "#999999",
                          backgroundColor: isSelected ? "#000000" : "transparent",
                        }}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setIsSelectorOpen(false)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    height: 44,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#000000",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontWeight: "600" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveSelection}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: "#000000",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
