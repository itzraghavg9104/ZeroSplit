"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === "system") {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setResolvedTheme(systemDark ? "dark" : "light");
            root.classList.toggle("dark", systemDark);
        } else {
            setResolvedTheme(theme);
            root.classList.toggle("dark", theme === "dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === "system") {
                setResolvedTheme(e.matches ? "dark" : "light");
                document.documentElement.classList.toggle("dark", e.matches);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);



    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
