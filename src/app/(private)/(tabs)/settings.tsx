import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Switch, Modal } from "react-native";
import { useState } from "react";
import { useAuth } from "@/src/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

import { useTheme, getFontSizeValue } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

import Screen from "@/src/components/Screen";
import AppText from "@/src/components/AppText";

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  const colors = theme === "dark" ? darkTheme : lightTheme;

  const [modalVisible, setModalVisible] = useState(false);
  const [activeSetting, setActiveSetting] = useState("");

  const [language, setLanguage] = useState("Suomi");
  const [temperature, setTemperature] = useState("C");
  const [themeLabel, setThemeLabel] = useState("Tumma");

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const openModal = (type: string) => {
    setActiveSetting(type);
    setModalVisible(true);
  };

  const selectOption = (value: string) => {
    if (activeSetting === "language") setLanguage(value);
    if (activeSetting === "temperature") setTemperature(value);

    if (activeSetting === "theme") {
      setThemeLabel(value);
      setTheme(value === "Tumma" ? "dark" : "light");
    }

    if (activeSetting === "fontSize") {
      const map: any = {
        Pieni: "small",
        Keskikoko: "medium",
        Suuri: "large",
      };
      setFontSize(map[value]);
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
    switch (fontSize) {
      case "small":
        return "Pieni";
      case "large":
        return "Suuri";
      default:
        return "Keskikoko";
    }
  };

  return (
    <Screen>
      {/* YLEISET */}
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

      {/* FONT SIZE */}
      <Pressable style={styles.row} onPress={() => openModal("fontSize")}>
        <View style={styles.rowLeft}>
          <Ionicons name="text-outline" size={20} color={colors.text} />
          <AppText style={{ color: colors.text }}>Fonttikoko</AppText>
        </View>
        <AppText style={{ color: colors.text }}>
          {getFontLabel()} ›
        </AppText>
      </Pressable>

      {/* LANGUAGE */}
      <Pressable style={styles.row} onPress={() => openModal("language")}>
        <View style={styles.rowLeft}>
          <Ionicons name="language-outline" size={20} color={colors.text} />
          <AppText style={{ color: colors.text }}>Kieli</AppText>
        </View>
        <AppText style={{ color: colors.text }}>{language} ›</AppText>
      </Pressable>

      {/* TEMP */}
      <Pressable style={styles.row} onPress={() => openModal("temperature")}>
        <View style={styles.rowLeft}>
          <Ionicons name="thermometer-outline" size={20} color={colors.text} />
          <AppText style={{ color: colors.text }}>Lämpötila</AppText>
        </View>
        <AppText style={{ color: colors.text }}>{temperature} ›</AppText>
      </Pressable>

      {/* THEME */}
      <Pressable style={styles.row} onPress={() => openModal("theme")}>
        <View style={styles.rowLeft}>
          <Ionicons
            name="color-palette-outline"
            size={20}
            color={colors.text}
          />
          <AppText style={{ color: colors.text }}>Teema</AppText>
        </View>
        <AppText style={{ color: colors.text }}>{themeLabel} ›</AppText>
      </Pressable>

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
        <AppText style={{ color: colors.text }}>Push-ilmoitukset</AppText>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} />
      </View>

      <View style={styles.row}>
        <AppText style={{ color: colors.text }}>Ääni</AppText>
        <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
      </View>

      <View style={styles.row}>
        <AppText style={{ color: colors.text }}>Värinä</AppText>
        <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* LOGOUT */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <AppText style={styles.logoutText}>Kirjaudu ulos</AppText>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

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
          Tekijät: Aapo, Antti, Jan-Henrik ja Ville
        </AppText>

        <AppText style={{ marginTop: 6, color: colors.text }}>
          © 2026
        </AppText>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            {getOptions().map((option) => (
              <Pressable
                key={option}
                style={styles.option}
                onPress={() => selectOption(option)}
              >
                <AppText style={{ color: colors.text }}>
                  {option}
                </AppText>
              </Pressable>
            ))}

            <Pressable onPress={() => setModalVisible(false)}>
              <AppText style={styles.cancel}>Peruuta</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: "600",
    marginVertical: 10,
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
    marginVertical: 16,
  },

  logoutButton: {
    backgroundColor: "#ff3b30",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  logoutText: {
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  modalContent: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
});