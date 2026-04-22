import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import Sensor from "@/src/components/Sensor";
import { getAccessToken } from "@/src/lib/auth";
import { useBackendConfig } from "@/src/lib/backendConfig";

export default function Sensors() {
  const { backendUrl } = useBackendConfig();
  const [sensorLabels, setSensorLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSensors = useCallback(async () => {
    if (!backendUrl) {
      setErrorMessage("Backend URL is not configured.");
      setSensorLabels([]);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setErrorMessage("Missing access token. Please log in again.");
      setSensorLabels([]);
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
        setSensorLabels([]);
        return;
      }

      const payload = (await response.json()) as unknown;
      const macs = Array.isArray(payload)
        ? payload.filter((value): value is string => typeof value === "string")
        : [];
      setSensorLabels(macs);
    } catch {
      setErrorMessage("Unable to reach the server.");
      setSensorLabels([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
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

      {!isLoading && !errorMessage && sensorLabels.length === 0 ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 16 }}>
          <Text style={{ color: "#444444", fontSize: 14 }}>No sensors found.</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage
        ? sensorLabels.map((label) => <Sensor key={label} label={label} />)
        : null}
    </ScrollView>
  );
}
