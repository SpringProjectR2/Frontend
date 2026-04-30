import { Inter_400Regular } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
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

import {
  hydrateSettings,
  useSettings,
} from "@/src/lib/settings";

import { isNotificationsEnabled } from "@/src/lib/notificationSettings";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
      if (segments[0] !== "login" && segments[0] !== "register") {
        router.replace("/login");
      }
      return;
    }

    if (
      segments[0] === "login" ||
      segments[0] === "connect" ||
      segments[0] === "register"
    ) {
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
        <Stack.Screen name="register" />
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

  const { hydrated: backendHydrated } = useBackendConfig();
  const { hydrated: settingsHydrated } = useSettings();

  useEffect(() => {
    hydrateBackendConfig();
    hydrateSettings();
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      if (!isNotificationsEnabled()) return;

      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      } catch (err) {
        console.warn("Notification permission error:", err);
      }
    };

    requestPermission();
  }, []);

  if (!fontsLoaded || !backendHydrated || !settingsHydrated) {
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