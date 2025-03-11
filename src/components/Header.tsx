import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Moon, Sun, Car } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ darkMode, setDarkMode }) {
  const { signOut } = useAuth();
  const { user } = useUser();

  // Theme Toggle with Local Storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") setDarkMode(true);
  }, [setDarkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <Button variant="link" className="text-2xl font-bold p-0 flex items-center gap-2">
            <Car className="h-6 w-6" />
            MekinaHub
          </Button>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/marketplace">
            <Button variant="ghost" component="a">
              Marketplace
            </Button>
          </Link>
          <Link to="/showcase">
            <Button variant="ghost" component="a">
              3D Showcase
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="ghost" component="a">
              Compare
            </Button>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 border-2"
          >
            <Sun className={`h-5 w-5 transition-all ${darkMode ? "rotate-90 scale-0" : "rotate-0 scale-100"}`} />
            <Moon className={`absolute h-5 w-5 transition-all ${darkMode ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Auth Section */}
          {user ? (
            <>
              {user?.publicMetadata?.role === "dealer" && (
                <Link to="/dashboard">
                  <Button variant="outline" as={Link} to="/dashboard">Dashboard</Button>
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    await signOut();
                  } catch (error) {
                    console.error("Logout failed", error);
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
