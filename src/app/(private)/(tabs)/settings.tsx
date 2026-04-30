import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
  Switch,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/src/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";

import { useTheme, getFontSizeValue } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

import Screen from "@/src/components/Screen";
import AppText from "@/src/components/AppText";

import {
  useSettings,
  updateSettings,
  resetSettings,
} from "@/src/lib/settings";

import {
  isNotificationsEnabled,
  isNotificationSoundEnabled,
  setNotificationsEnabled,
  setNotificationSoundEnabled,
} from "@/src/lib/notificationSettings";

type SettingKey =
  | "language"
  | "temperature"
  | "theme"
  | "fontSize"
  | "";

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, fontSize } = useTheme();

  const settings = useSettings();
  const colors = theme === "dark" ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [activeSetting, setActiveSetting] =
    useState<SettingKey>("");

  const [isUpdatingNotifications, setIsUpdatingNotifications] =
    useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const openModal = (type: SettingKey) => {
    setActiveSetting(type);
    setModalVisible(true);
  };

  const selectOption = (value: string) => {
    Haptics.selectionAsync();

    if (activeSetting === "language") {
      updateSettings({ language: value });
    }

    if (activeSetting === "temperature") {
      updateSettings({ temperature: value as "C" | "F" });
    }

    if (activeSetting === "theme") {
      updateSettings({
        theme: value === "Tumma" ? "dark" : "light",
      });
    }

    if (activeSetting === "fontSize") {
      const map: Record<string, "small" | "medium" | "large"> = {
        Pieni: "small",
        Keskikoko: "medium",
        Suuri: "large",
      };

      updateSettings({ fontSize: map[value] });
    }

    setModalVisible(false);
  };

  const getOptions = () => {
    switch (activeSetting) {
      case "language":
        return ["Suomi", "English"];
      case "temperature":
        return ["C", "F"];
      case "theme":
        return ["Tumma", "Vaalea"];
      case "fontSize":
        return ["Pieni", "Keskikoko", "Suuri"];
      default:
        return [];
    }
  };

  const getFontLabel = () => {
    switch (settings.fontSize) {
      case "small":
        return "Pieni";
      case "large":
        return "Suuri";
      default:
        return "Keskikoko";
    }
  };

  const themeLabel =
    settings.theme === "dark" ? "Tumma" : "Vaalea";

  const getCurrentValue = () => {
    switch (activeSetting) {
      case "language":
        return settings.language;
      case "temperature":
        return settings.temperature;
      case "theme":
        return themeLabel;
      case "fontSize":
        return getFontLabel();
      default:
        return "";
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (isUpdatingNotifications) return;

    Haptics.selectionAsync();

    if (!enabled) {
      updateSettings({ pushEnabled: false });
      setNotificationsEnabled(false);
      return;
    }

    setIsUpdatingNotifications(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";

      updateSettings({ pushEnabled: granted });
      setNotificationsEnabled(granted);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleToggleSound = (enabled: boolean) => {
    Haptics.selectionAsync();
    updateSettings({ soundEnabled: enabled });
    setNotificationSoundEnabled(enabled);
  };

  const SettingsRow = ({
    icon,
    label,
    value,
    onPress,
  }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.text} />
        <AppText style={{ color: colors.text }}>
          {label}
        </AppText>
      </View>
      <AppText style={{ color: colors.text }}>
        {value} ›
      </AppText>
    </Pressable>
  );

  return (
    <Screen>
      {/* GENERAL */}
      <AppText
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            fontSize: getFontSizeValue(fontSize, 24),
          },
        ]}
      >
        Yleiset
      </AppText>

      <SettingsRow
        icon="text-outline"
        label="Fonttikoko"
        value={getFontLabel()}
        onPress={() => openModal("fontSize")}
      />

      <SettingsRow
        icon="language-outline"
        label="Kieli"
        value={settings.language}
        onPress={() => openModal("language")}
      />

      <SettingsRow
        icon="thermometer-outline"
        label="Lämpötila"
        value={settings.temperature}
        onPress={() => openModal("temperature")}
      />

      <SettingsRow
        icon="color-palette-outline"
        label="Teema"
        value={themeLabel}
        onPress={() => openModal("theme")}
      />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* NOTIFICATIONS */}
      <AppText
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            fontSize: getFontSizeValue(fontSize, 24),
          },
        ]}
      >
        Ilmoitukset
      </AppText>

      <View style={styles.row}>
        <AppText style={{ color: colors.text }}>
          Push-ilmoitukset
        </AppText>
        <Switch
          value={settings.pushEnabled}
          onValueChange={handleToggleNotifications}
          disabled={isUpdatingNotifications}
        />
      </View>

      <View style={styles.row}>
        <AppText style={{ color: colors.text }}>
          Ääni
        </AppText>
        <Switch
          value={settings.soundEnabled}
          onValueChange={handleToggleSound}
          disabled={!settings.pushEnabled}
        />
      </View>

      <View style={styles.row}>
        <AppText style={{ color: colors.text }}>
          Värinä
        </AppText>
        <Switch
          value={settings.vibrationEnabled}
          onValueChange={(value) => {
            Haptics.selectionAsync();
            updateSettings({ vibrationEnabled: value });
          }}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* ACTIONS */}
      <Pressable
        style={[styles.actionButton, { backgroundColor: "#ff9500" }]}
        onPress={() => {
          Alert.alert(
            "Palauta asetukset",
            "Haluatko varmasti palauttaa oletusasetukset?",
            [
              { text: "Ei", style: "cancel" },
              {
                text: "Kyllä",
                style: "destructive",
                onPress: async () => {
                  await resetSettings();
                },
              },
            ]
          );
        }}
      >
        <AppText style={styles.actionText}>
          Palauta oletukset
        </AppText>
      </Pressable>

      <Pressable
        style={[styles.actionButton, { backgroundColor: "#ff3b30" }]}
        onPress={handleLogout}
      >
        <AppText style={styles.actionText}>
          Kirjaudu ulos
        </AppText>
      </Pressable>

      {/* INFO */}
      <AppText
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            fontSize: getFontSizeValue(fontSize, 24),
          },
        ]}
      >
        Tietoa sovelluksesta
      </AppText>

      <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <AppText style={{ color: colors.text }}>
          Versio: {Constants.expoConfig?.version ?? "1.0.0"}
        </AppText>
        <AppText style={{ marginTop: 6, color: colors.text }}>
          © 2026
        </AppText>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {getOptions().map((option) => {
              const selected =
                option === getCurrentValue();

              return (
                <Pressable
                  key={option}
                  style={styles.option}
                  onPress={() => selectOption(option)}
                >
                  <AppText style={{ color: colors.text }}>
                    {option} {selected ? "✓" : ""}
                  </AppText>
                </Pressable>
              );
            })}

            <Pressable onPress={() => setModalVisible(false)}>
              <AppText
                style={[styles.cancel, { color: colors.text }]}
              >
                Peruuta
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: "600",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  infoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
    width: "80%",
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cancel: {
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
});