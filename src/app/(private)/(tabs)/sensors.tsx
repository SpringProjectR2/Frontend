import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import Sensor from "@/src/components/Sensor";
import { getAccessToken } from "@/src/lib/auth";
import { useBackendConfig } from "@/src/lib/backendConfig";
import { useTheme } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

export default function Sensors() {
  const { backendUrl, hasConfirmedConnection } = useBackendConfig();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;

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
          message =
            payload.error ?? payload.detail ?? payload.message ?? message;
        } catch {
          // ignore JSON parse errors
        }

        setErrorMessage(message);
        setSensorLabels([]);
        return;
      }

      const payload = (await response.json()) as unknown;
      const macs = Array.isArray(payload)
        ? payload.filter((v): v is string => typeof v === "string")
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
    if (hasConfirmedConnection) {
      loadSensors();
    }
  }, [loadSensors, hasConfirmedConnection]);

  if (!hasConfirmedConnection) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>
          Connecting to backend...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 16 }}
    >
      {isLoading && (
        <View style={{ paddingTop: 24, alignItems: "center" }}>
          <ActivityIndicator color={colors.text} />
        </View>
      )}

      {!isLoading && errorMessage && (
        <View style={{ paddingHorizontal: 12, paddingTop: 16, gap: 12 }}>
          <Text style={{ color: "#a40000", fontSize: 14 }}>
            {errorMessage}
          </Text>

          <Pressable
            onPress={loadSensors}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: pressed
                ? colors.border
                : colors.background,
            })}
          >
            <Text style={{ fontWeight: "600", color: colors.text }}>
              Retry
            </Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !errorMessage && sensorLabels.length === 0 && (
        <View style={{ paddingHorizontal: 12, paddingTop: 16 }}>
          <Text style={{ color: colors.text, opacity: 0.7, fontSize: 14 }}>
            No sensors found.
          </Text>
        </View>
      )}

      {!isLoading && !errorMessage &&
        sensorLabels.map((label) => (
          <Sensor key={label} label={label} />
        ))}
    </ScrollView>
  );
}