"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";

export type ThemeMode = "light" | "dark" | "system";

function resolveDark(mode: ThemeMode): boolean {
  return (
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

const ThemeContext = createContext<{
  mode: ThemeMode;
  dark: boolean;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}>({ mode: "system", dark: false, setMode: () => {}, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `try{var t=localStorage.getItem("fh-theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
      }}
    />
  ));

  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("fh-theme") ?? "system";
    return stored === "light" || stored === "dark" ? stored : "system";
  });
  const [dark, setDark] = useState(() => resolveDark(mode));

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      setDark(e.matches);
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const apply = (m: ThemeMode) => {
    const d = resolveDark(m);
    setModeState(m);
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    try {
      localStorage.setItem("fh-theme", m);
    } catch {
      /* private mode */
    }
  };

  return (
    <ThemeContext.Provider
      value={{ mode, dark, setMode: apply, toggle: () => apply(dark ? "light" : "dark") }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}