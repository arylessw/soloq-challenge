"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  isSiteThemeId,
  THEME_STORAGE_KEY,
  type SiteThemeId,
} from "@/lib/site-themes";

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteThemeId>("gold");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && isSiteThemeId(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-site-theme", saved);
    } else {
      document.documentElement.setAttribute("data-site-theme", "gold");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-site-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent("soloq-theme", { detail: theme }));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

type ThemeContextValue = {
  theme: SiteThemeId;
  setTheme: (t: SiteThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "gold",
  setTheme: () => {},
});

export function useSiteTheme() {
  return useContext(ThemeContext);
}
