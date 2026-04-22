import { View, Text } from "react-native";
import Sensor from "@/src/components/Sensor";
import { useBackendConfig } from "@/src/lib/backendConfig";
import { useTheme } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

export default function Sensors() {
  const { hasConfirmedConnection } = useBackendConfig();
  const { theme } = useTheme();

  const colors = theme === "dark" ? darkTheme : lightTheme;

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
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 10,
      }}
    >
      <Sensor label="Sensor1" />
      <Sensor label="Sensor2" />
    </View>
  );
}