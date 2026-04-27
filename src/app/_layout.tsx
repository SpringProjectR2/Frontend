import { Inter_400Regular } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/src/lib/auth';
import { isNotificationsEnabled } from '@/src/lib/notificationSettings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
import {
  hydrateBackendConfig,
  useBackendConfig,
} from '@/src/lib/backendConfig';
import { bootstrapSocket, disconnectSocket } from '@/src/lib/socketService';

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  const { backendUrl, hasConfirmedConnection } = useBackendConfig();

  useEffect(() => {
    if (isLoggedIn && hasConfirmedConnection && backendUrl) {
      bootstrapSocket();
      return;
    }

    disconnectSocket();
  }, [backendUrl, hasConfirmedConnection, isLoggedIn]);

  return (
    <Stack>
      <Stack.Protected guard={!hasConfirmedConnection}>
        <Stack.Screen name="connect" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasConfirmedConnection && !isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasConfirmedConnection && isLoggedIn}>
        <Stack.Screen name="(private)/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(private)/sensor" options={{ title: "Sensor" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const { hydrated } = useBackendConfig();

  useEffect(() => {
    hydrateBackendConfig();
  }, []);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (!isNotificationsEnabled()) {
        return;
      }

      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      } catch (error) {
        console.warn('Unable to request notification permissions', error);
      }
    };

    requestNotificationPermission();
  }, []);

  if (!fontsLoaded || !hydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
