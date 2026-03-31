"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Read current theme on mount
    const root = document.documentElement;
    
    // Fallback to matchMedia if no data-theme
    let isDark = root.getAttribute("data-theme") === "dark";
    if (!root.hasAttribute("data-theme")) {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", isDark ? "dark" : "light");
    }
    
    setTheme(isDark ? "dark" : "light");

    // Observe data-theme attribute changes to sync all button instances
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          const newTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
          setTheme(newTheme);
        }
      });
    });

    observer.observe(root, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const newTheme = theme === "dark" ? "light" : "dark";
    // Forcefully update the root HTML tag globally
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!theme) return null; // Wait for mount to avoid hydration mismatch

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 flex-shrink-0 rounded-full tap-target transition-colors"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
      title="Toggle Theme"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        // Sun icon for dark mode (to toggle light)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon for light mode (to toggle dark)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
