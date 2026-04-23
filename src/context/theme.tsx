import { createContext, useContext, useMemo } from "react";
import { useSettings, updateSettings } from "@/src/lib/settings";

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
  const settings = useSettings(); 

  const value = useMemo(
    () => ({
      theme: settings.theme,
      fontSize: settings.fontSize,

      // ✅ write through to persistent store
      setTheme: (theme: Theme) => {
        updateSettings({ theme });
      },

      setFontSize: (fontSize: FontSize) => {
        updateSettings({ fontSize });
      },
    }),
    [settings.theme, settings.fontSize]
  );

  return (
    <ThemeContext.Provider value={value}>
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