import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Switch,
  Modal,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/src/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useTheme } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

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
      default:
        return [];
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Yleiset
      </Text>

      <Pressable style={styles.row} onPress={() => openModal("language")}>
        <View style={styles.rowLeft}>
          <Ionicons name="language-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text }}>Kieli</Text>
        </View>
        <Text style={{ color: colors.text }}>{language} ›</Text>
      </Pressable>

      <Pressable style={styles.row} onPress={() => openModal("temperature")}>
        <View style={styles.rowLeft}>
          <Ionicons name="thermometer-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text }}>Lämpötila</Text>
        </View>
        <Text style={{ color: colors.text }}>{temperature} ›</Text>
      </Pressable>

      <Pressable style={styles.row} onPress={() => openModal("theme")}>
        <View style={styles.rowLeft}>
          <Ionicons name="color-palette-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text }}>Teema</Text>
        </View>
        <Text style={{ color: colors.text }}>{themeLabel} ›</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ilmoitukset
      </Text>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text }}>Push-ilmoitukset</Text>
        </View>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} />
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="volume-high-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text }}>Ääni</Text>
        </View>
        <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="phone-portrait-outline" size={20} color={colors.text} />
          <Text style={{ color: colors.text }}>Värinä</Text>
        </View>
        <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
      </View>

      <View style={styles.divider} />

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Kirjaudu ulos</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Tietoa sovelluksesta
      </Text>

      <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text }}>
          Versio: {Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
        <Text style={{ marginTop: 6, color: colors.text }}>
          Tekijät: Aapo, Antti, Jan-Henrik ja Ville
        </Text>
        <Text style={{ marginTop: 6, color: colors.text }}>© 2026</Text>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {getOptions().map((option) => {
              const isSelected =
                (activeSetting === "language" && option === language) ||
                (activeSetting === "temperature" && option === temperature) ||
                (activeSetting === "theme" && option === themeLabel);

              return (
                <Pressable
                  key={option}
                  style={styles.option}
                  onPress={() => selectOption(option)}
                >
                  <View style={styles.optionRow}>
                    <Text style={{ color: colors.text }}>{option}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.text} />
                    )}
                  </View>
                </Pressable>
              );
            })}

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancel, { color: colors.text }]}>
                Peruuta
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
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
  },
  label: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
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
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
  },
  cancel: {
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
});