import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { setBackendUrl, useBackendConfig } from "@/src/lib/backendConfig";

export default function Connect() {
  const router = useRouter();
  const { backendUrl } = useBackendConfig();
  const [address, setAddress] = useState(backendUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAddress(backendUrl ?? "");
  }, [backendUrl]);

  const canSave = useMemo(() => address.trim().length > 0 && !isSaving, [address, isSaving]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setBackendUrl(address);
      router.replace("/login");
    } catch {
      Alert.alert("Invalid address", "Enter an IP or URL like 192.168.0.10:5000");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Backend IP Address</Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="192.168.0.10:5000"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Pressable
            style={[styles.button, !canSave && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Connect</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  form: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },
  subtitle: {
    fontSize: 15,
    color: "#555555",
    marginBottom: 4,
  },
  input: {
    color: "#000000",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  button: {
    marginTop: 8,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
