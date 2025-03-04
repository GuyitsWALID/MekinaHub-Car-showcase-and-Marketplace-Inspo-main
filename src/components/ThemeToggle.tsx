import * as React from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  // Initialize from localStorage with a fallback to 'light'
  const [theme, setTheme] = React.useState(() => {
    // Check if we have a saved theme in localStorage
    const savedTheme = localStorage.getItem("theme");
    // Return the saved theme or default to 'light' if none exists
    return savedTheme || "light";
  });

  // Update theme in both localStorage and document class when theme changes
  React.useEffect(() => {
    // Save current theme to localStorage
    localStorage.setItem("theme", theme);
    
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Initialize theme on first load
  React.useEffect(() => {
    // Check if user has a preference in their system settings
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // If no saved theme, use system preference
    if (!localStorage.getItem("theme")) {
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 p-2 w-full text-left rounded-xl hover:bg-gray-500 hover:text-white"
    >
      {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      <span className="text-sm">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}

export default ThemeToggle;