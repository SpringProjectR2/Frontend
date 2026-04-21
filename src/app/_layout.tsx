import { Inter_400Regular } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/src/lib/auth";
import {
  hydrateBackendConfig,
  useBackendConfig,
} from "@/src/lib/backendConfig";

import {
  bootstrapSocket,
  disconnectSocket,
} from "@/src/lib/socketService";

import { ThemeProvider } from "@/src/context/theme";

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();

  const { isLoggedIn } = useAuth();
  const { hasConfirmedConnection } = useBackendConfig();

  useEffect(() => {
    if (!hasConfirmedConnection) {
      if (segments[0] !== "connect") {
        router.replace("/connect");
      }
      return;
    }

    if (!isLoggedIn) {
      if (segments[0] !== "login") {
        router.replace("/login");
      }
      return;
    }

    // logged in
    if (segments[0] === "login" || segments[0] === "connect") {
      router.replace("/(private)/(tabs)");
    }
  }, [isLoggedIn, hasConfirmedConnection, segments]);

  return null;
}

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  const { backendUrl, hasConfirmedConnection } = useBackendConfig();

  useEffect(() => {
    if (isLoggedIn && hasConfirmedConnection && backendUrl) {
      bootstrapSocket();
    } else {
      disconnectSocket();
    }
  }, [backendUrl, hasConfirmedConnection, isLoggedIn]);

  return (
    <>
      <NavigationGuard />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="connect" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(private)/(tabs)" />
        <Stack.Screen
          name="(private)/sensor"
          options={{ title: "Sensor" }}
        />
      </Stack>
    </>
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
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}