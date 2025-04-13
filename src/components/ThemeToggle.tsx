// ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light"|"dark"|null;
    const initial = stored
      ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    // 🔥 let everyone know we flipped
    window.dispatchEvent(new Event("themeChange"));
  };

  return (
    <Button
      variant="text"
      size="small"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
};

export default ThemeToggle;
