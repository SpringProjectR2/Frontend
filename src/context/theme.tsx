import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
type FontSize = "small" | "medium" | "large";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  fontSize: "medium",
  setFontSize: () => {},
});

export const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, fontSize, setFontSize }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const getFontSizeValue = (size: FontSize, base: number) => {
  switch (size) {
    case "small":
      return base - 4;
    case "large":
      return base + 4;
    default:
      return base;
  }
};