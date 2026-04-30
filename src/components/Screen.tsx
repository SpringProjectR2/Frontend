import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/theme";
import { darkTheme, lightTheme } from "@/src/theme/colors";

export default function Screen({ children }: any) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]} 
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}