import { Text, View } from "react-native";
import { useTheme } from "@/src/context/theme";
import { lightTheme, darkTheme } from "@/src/theme/colors";

export default function Index() {
  const { theme } = useTheme();

  const colors = theme === "dark" ? darkTheme : lightTheme;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 18 }}>
        Index
      </Text>
    </View>
  );
}