import { useRouter } from "expo-router";
import { useState } from "react";
import * as Notifications from "expo-notifications";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useAuth } from "@/src/lib/auth";
import {
  isNotificationsEnabled,
  isNotificationSoundEnabled,
  setNotificationsEnabled,
  setNotificationSoundEnabled,
} from "@/src/lib/notificationSettings";

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationsEnabled, setNotifications] = useState(
    isNotificationsEnabled(),
  );
  const [notificationSoundEnabled, setNotificationSound] = useState(
    isNotificationSoundEnabled(),
  );

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (isUpdatingNotifications) {
      return;
    }

    if (!enabled) {
      setNotifications(false);
      setNotificationsEnabled(false);
      return;
    }

    setNotifications(true);
    setIsUpdatingNotifications(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setNotifications(granted);
      setNotificationsEnabled(granted);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleToggleNotificationSound = (enabled: boolean) => {
    setNotificationSound(enabled);
    setNotificationSoundEnabled(enabled);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            accessibilityLabel="Toggle notifications"
            disabled={isUpdatingNotifications}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Notification sound</Text>
          <Switch
            value={notificationSoundEnabled}
            onValueChange={handleToggleNotificationSound}
            accessibilityLabel="Toggle notification sound"
            disabled={!notificationsEnabled}
          />
        </View>
      </View>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  section: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
  },
  label: {
    fontSize: 16,
    color: "#000000",
  },
  button: {
    minWidth: 140,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});
