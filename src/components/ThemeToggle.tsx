// ThemeToggle.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/theme";

function ThemeToggle() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 p-2 w-full text-left rounded-xl hover:bg-gray-500 hover:text-white"
    >
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="text-sm">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}

export default ThemeToggle;
