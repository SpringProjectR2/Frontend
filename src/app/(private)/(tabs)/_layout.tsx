import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTheme } from "@/src/context/theme";
import { darkTheme, lightTheme } from "@/src/theme/colors";

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;

  const sharedContentStyle = {
    paddingHorizontal: 4,
    backgroundColor: colors.background,
  } as const;

  return (
    <NativeTabs
    >
      <NativeTabs.Trigger name="index" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sensors" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Icon sf="sensor" md="sensors" />
        <NativeTabs.Trigger.Label>Sensors</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}