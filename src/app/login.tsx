import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import { type Href, useRouter } from "expo-router";
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

import { useAuth } from "@/src/lib/auth";
import {
  resetConnectionConfirmation,
  useBackendConfig,
} from "@/src/lib/backendConfig";

import { useTheme } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { backendUrl } = useBackendConfig();
  const { theme } = useTheme();

  const colors = theme === "dark" ? darkTheme : lightTheme;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBackToConnect = () => {
    resetConnectionConfirmation();
    router.replace("/connect");
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Missing fields", "Please enter username and password.");
      return;
    }

    setIsLoading(true);

    try {
      if (!backendUrl) {
        Alert.alert("Configuration error", "Backend URL is not configured.");
        return;
      }

      const response = await fetch(`${backendUrl}/login`, {
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
        Alert.alert("Login failed", "Invalid username or password.");
        return;
      }

      const payload = (await response.json()) as {
        access_token?: string;
      };

      if (!payload.access_token) {
        Alert.alert("Login failed", "Server did not return an access token.");
        return;
      }

      login(payload.access_token);
      router.replace("/");
    } catch {
      Alert.alert("Network error", "Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.wrapper, { backgroundColor: colors.background }]}
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
              <SymbolView name="sensor" size={88} tintColor={colors.text} />
            ) : (
              <MaterialIcons name="sensors" size={88} color={colors.text} />
            )}
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            returnKeyType="next"
          />

          <Text style={[styles.title, { color: colors.text }]}>
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.text },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Sign in
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => router.push("/register" as Href)}
            disabled={isLoading}
          >
            <Text style={[styles.linkButtonText, { color: colors.text }]}>
              Register
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={handleBackToConnect}
            disabled={isLoading}
          >
            <Text style={[styles.linkButtonText, { color: colors.text }]}>
              Back to Connect
            </Text>
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
    marginBottom: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 6,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 4,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});