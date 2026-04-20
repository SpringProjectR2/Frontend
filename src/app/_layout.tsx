import { Inter_400Regular } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/src/lib/auth';
import {
  hydrateBackendConfig,
  useBackendConfig,
} from '@/src/lib/backendConfig';
import { bootstrapSocket, disconnectSocket } from '@/src/lib/socketService';
import { ThemeProvider } from '@/src/context/theme';

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

  if (!fontsLoaded || !hydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider> {}
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
