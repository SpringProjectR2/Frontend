import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTheme } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";
import { View } from "react-native";

export default function TabLayout() {
  const { theme } = useTheme();

  const colors = theme === "dark" ? darkTheme : lightTheme;

  const sharedContentStyle = {
    paddingHorizontal: 16,
    paddingTop: 64,
    backgroundColor: colors.background, 
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NativeTabs>
        <NativeTabs.Trigger
          name="index"
          contentStyle={sharedContentStyle}
        >
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="sensors"
          contentStyle={sharedContentStyle}
        >
          <NativeTabs.Trigger.Icon sf="sensor" md="sensors" />
          <NativeTabs.Trigger.Label>Sensors</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="settings"
          contentStyle={sharedContentStyle}
        >
          <NativeTabs.Trigger.Icon sf="gear" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}