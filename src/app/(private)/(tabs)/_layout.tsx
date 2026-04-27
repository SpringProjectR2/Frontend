import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const sharedContentStyle = {
    paddingHorizontal: 16,
    paddingTop: 64,
  } as const;

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sensors" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Icon sf="sensor" md="sensors" />
        <NativeTabs.Trigger.Label>Sensors</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="alerts" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Icon sf="bell" md="notifications" />
        <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" contentStyle={sharedContentStyle}>
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
