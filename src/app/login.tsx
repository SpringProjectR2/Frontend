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
import { useAuth } from "@/src/lib/auth";

const SKIP_LOGIN_FETCH = true;

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Missing fields", "Please enter username and password.");
      return;
    }

    setIsLoading(true);
    try {
      if (SKIP_LOGIN_FETCH) {
        login();
        router.replace("/");
        return;
      }

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        Alert.alert("Configuration error", "Backend URL is not configured.");
        return;
      }

      const encoded = btoa(`${username}:${password}`);
      const response = await fetch(`${backendUrl}/login`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${encoded}`,
        },
      });

      if (!response.ok) {
        Alert.alert("Login failed", "Invalid username or password.");
        return;
      }

      login();
      router.replace("/");
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
              <SymbolView name="sensor" size={88} tintColor="#000000" />
            ) : (
              <MaterialIcons name="sensors" size={88} color="#000000" />
            )}
          </View>
          <Text style={styles.title}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder=""
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="next"
          />
          <Text style={styles.title}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder=""
            secureTextEntry
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
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
});
