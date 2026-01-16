"use client";

import { createContext, useContext, useEffect } from "react";

interface ThemeContextType {
  theme: "dark";
  resolvedTheme: "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "dark");
    root.classList.add("dark");
    root.classList.remove("light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", resolvedTheme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}
