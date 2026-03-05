import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "light" | "dark" | "dracula" | "alucard" | "wine" | "wine-light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "otoreport-theme";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Theme) || "dracula";
  });

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "light") {
    delete el.dataset.theme;
  } else {
    el.dataset.theme = theme;
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
