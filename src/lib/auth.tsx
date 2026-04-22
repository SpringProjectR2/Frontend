import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let currentAccessToken: string | null = null;

export const getAccessToken = () => currentAccessToken;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const isLoggedIn = Boolean(accessToken);

  const value = useMemo(
    () => ({
      isLoggedIn,
      accessToken,
      login: (token: string) => {
        currentAccessToken = token;
        setAccessToken(token);
      },
      logout: () => {
        currentAccessToken = null;
        setAccessToken(null);
      },
    }),
    [accessToken, isLoggedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
