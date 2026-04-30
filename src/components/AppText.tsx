import { Text, TextProps } from "react-native";
import { useTheme, getFontSizeValue } from "@/src/context/theme";

type Props = TextProps & {
  children: React.ReactNode;
};

export default function AppText({ style, children, ...props }: Props) {
  const { fontSize } = useTheme();

  return (
    <Text
      {...props}
      style={[{ fontSize: getFontSizeValue(fontSize, 18) }, style]}
    >
      {children}
    </Text>
  );
}