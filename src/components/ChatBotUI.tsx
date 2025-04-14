import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Store,
  Users,
  Car,
  Home,
  Menu,
  X,
  LogOut,
  GitCompare,
  GitCompareIcon,
  Settings,
  BellDotIcon,
  User as UserIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useIsMobile } from "../hooks/use-mobile";
import { BellIcon, ListBulletIcon } from "@radix-ui/react-icons";

const navTopItems = [
  { icon: Car, label: "Show Room", path: "/showroom" },
  { icon: GitCompareIcon, label: "Compare", path: "/compare" },
  { icon: Store, label: "Marketplace", path: "/marketplace" },
  { icon: Users, label: "Messages", path: "/messages" },
  { icon: ListBulletIcon, label: "My Listings", path: "/dealerdashboard" },
  { icon: GitCompare, label: "Analytics", path: "/dealeranalytics" },
];

const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);
  const toggleProfileDetails = () => setShowProfileDetails((prev) => !prev);

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && collapsed && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 rounded-full shadow-md bg-white dark:bg-gray-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </Button>
      )}
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleSidebar}
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
        {/* Header: Logo & Collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link
            to="/"
            className={cn(
              "flex items-center space-x-2",
              collapsed && "justify-center w-full"
            )}
          >
            <Home className="w-6 h-6 text-primary-600" />
            {!collapsed && (
              <span className="text-xl font-bold">MekinaHub</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
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

        {/* Main Navigation */}
        <nav className="flex flex-col flex-grow overflow-y-auto px-2 py-4 space-y-1">
          {navTopItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={isMobile ? toggleSidebar : undefined}
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

        {/* Bottom Section */}
        <div className="mt-auto">
          {/* Notification & Settings Buttons */}
          <div className="flex justify-around p-2 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              size="icon"
              onClick={isMobile ? toggleSidebar : undefined}
              aria-label="Notifications"
              className="text-gray-600 dark:text-gray-400"
            >
              <BellDotIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={isMobile ? toggleSidebar : undefined}
              aria-label="Settings"
              className="text-gray-600 dark:text-gray-400"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Divider */}
          <hr className="border-t border-gray-200 dark:border-gray-800" />

          {/* Profile Section */}
          <div className="p-4">
            {user && !collapsed && (
              <>
                {/* Condensed Profile Info */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Profile Actions Dropdown */}
                {showProfileDetails && (
                  <div className="mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        // Implement view profile action here
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        // Implement account settings action here
                      }}
                    >
                      Account Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </div>
                )}

                {/* Toggle Dropdown Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleProfileDetails}
                  aria-label="Toggle profile options"
                  className="mt-2 text-gray-600 dark:text-gray-400 w-full flex justify-center"
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
