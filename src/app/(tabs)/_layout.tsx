import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontFamily: 'Inter_400Regular' },
        tabBarLabelStyle: { fontFamily: 'Inter_400Regular' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="sensors" options={{ title: 'Sensors' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
