import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      <div className={`toggle-track ${theme === "light" ? "light" : ""}`}>
        <span className="toggle-icon">{theme === "dark" ? "🌙" : "☀️"}</span>
        <div className={`toggle-thumb ${theme === "light" ? "light" : ""}`} />
      </div>
    </button>
  );
}
