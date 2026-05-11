"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            // 1. Check LocalStorage
            const savedTheme = localStorage.getItem("theme") as Theme | null;
            
            // 2. Check System Preference if no saved theme
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            
            const initialTheme = savedTheme ? savedTheme : (prefersDark ? "dark" : "light");
            
            setTheme(initialTheme);
            document.documentElement.classList.toggle("dark", initialTheme === "dark");
            
            // Add soft transition class to body after initial load
            setTimeout(() => {
                document.body.classList.add("theme-transition");
            }, 100);
        } catch (e) {
            // Fallback in case localStorage fails
            setTheme("light");
        }
    }, []);

    const toggleTheme = () => {
        try {
            const next = theme === "light" ? "dark" : "light";
            setTheme(next);
            localStorage.setItem("theme", next);
            document.documentElement.classList.toggle("dark", next === "dark");
        } catch (e) {
            console.error("Failed to save theme to localStorage");
        }
    };

    if (!mounted) {
        // Prevent hydration mismatch by rendering nothing or a hidden state initially
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
