import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Store,
  Car,
  Users,
  Bell,
  Home,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  GitCompare,
  GitCompareIcon,
  Settings,
  CarFrontIcon,
  BarChart2
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useIsMobile } from "../hooks/use-mobile";
import { ListBulletIcon } from "@radix-ui/react-icons";

const navTopItems = [
  { icon: Car, label: "Show Room", path: "/showroom" },
  { icon: GitCompareIcon, label: "Compare", path: "/compare" },
  { icon: Store, label: "Marketplace", path: "/marketplace" },
  { icon: Users, label: "Messages", path: "/messages" },
  { icon: ListBulletIcon, label: "My Listings", path: "/dealerdashboard" },
  { icon: BarChart2, label: "Analytics", path: "/dealeranalytics" },
];

const navBottomItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const toggle = () => setCollapsed((c) => !c);

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && collapsed && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="fixed top-4 left-4 z-50 rounded-full shadow-md bg-white dark:bg-gray-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </Button>
      )}

      {/* Overlay when open on mobile */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggle}
        />
      )}

      <aside
        className={cn(
          "h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 relative z-50",
          collapsed ? "w-20" : "w-64",
          isMobile && collapsed ? "hidden" : "",
          isMobile && !collapsed ? "fixed inset-y-0 left-0" : ""
        )}
      >
        {/* Header: Logo + collapse button */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-800">
          <Link
            to="/"
            className={cn(
              "flex items-center space-x-2",
              collapsed && "justify-center w-full"
            )}
          >
            <CarFrontIcon className="w-6 h-6 text-primary-600" />
            {!collapsed && <span className="text-xl font-bold">MekinaHub</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={cn(
              "text-gray-600 dark:text-gray-400",
              collapsed
                ? "absolute right-0 top-4 -mr-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-r-full"
                : ""
            )}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </Button>
        </div>

        {/* Main nav + bottom nav */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navTopItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={isMobile ? toggle : undefined}
                  className={cn(
                    "group flex items-center px-3 py-2 rounded-md transition-colors",
                    active
                      ? "bg-primary-100 text-primary-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      active
                        ? "text-primary-600"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-primary-600"
                    )}
                  />
                  {!collapsed && <span className="ml-3 flex-1">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* push these to bottom */}
          <nav className="px-2 pb-4 space-y-1">
            {navBottomItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={isMobile ? toggle : undefined}
                  className={cn(
                    "group flex items-center px-3 py-2 rounded-md transition-colors",
                    active
                      ? "bg-primary-100 text-primary-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      active
                        ? "text-primary-600"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-primary-600"
                    )}
                  />
                  {!collapsed && <span className="ml-3 flex-1">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divider + User footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className={cn("flex items-center", collapsed && "justify-center")}>
            <button
            >
            <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            {!collapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            )}
            </button>
            
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
