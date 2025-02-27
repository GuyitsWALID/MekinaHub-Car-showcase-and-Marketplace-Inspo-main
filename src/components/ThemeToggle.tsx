import * as React from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const [theme, setTheme] = React.useState("light");

  // Update the document root class based on the theme.
  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 p-2 w-full text-left hover:bg-sidebar-accent rounded-md"
    >
      {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      <span className="text-sm">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}

export default ThemeToggle;
