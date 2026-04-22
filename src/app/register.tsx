import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
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
import { useBackendConfig } from "@/src/lib/backendConfig";

export default function Register() {
  const router = useRouter();
  const { backendUrl } = useBackendConfig();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Missing fields", "Please enter username and password.");
      return;
    }

    if (!backendUrl) {
      Alert.alert("Configuration error", "Backend URL is not configured.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        let message = "Unable to create account.";

        try {
          const payload = (await response.json()) as {
            error?: string;
            detail?: string;
            message?: string;
          };
          message = payload.error ?? payload.detail ?? payload.message ?? message;
        } catch {
          // Keep default message when response body is not JSON.
        }

        Alert.alert("Registration failed", message);
        return;
      }

      Alert.alert("Success", "Account created. Please sign in.");
      router.replace("/login");
    } catch {
      Alert.alert("Network error", "Unable to reach the server.");
    } finally {
      setIsLoading(false);
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
          <View style={styles.iconWrapper}>
            {Platform.OS === "ios" ? (
              <SymbolView name="person.badge.plus" size={88} tintColor="#000000" />
            ) : (
              <MaterialIcons name="person-add" size={88} color="#000000" />
            )}
          </View>

          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="next"
          />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.linkButton, isLoading && styles.buttonDisabled]}
            onPress={() => router.replace("/login")}
            disabled={isLoading}
          >
            <Text style={styles.linkButtonText}>Back to Login</Text>
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
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  scroll: {
    flex: 1,
  },
  form: {
    gap: 10,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
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
    marginTop: 6,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000000",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 2,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
