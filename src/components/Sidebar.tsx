import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Car,
  Scale,
  Store,
  MessageSquare,
  Bell,
  LogOut,
  Sun,
  Moon,
  UserCog,
} from 'lucide-react';
import { useThemeStore } from '../store/theme';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', icon: Car, label: 'Car Showroom' },
  { to: '/compare', icon: Scale, label: 'Car Comparison' },
  { to: '/marketplace', icon: Store, label: 'Marketplace' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dealer-dashboard', icon: UserCog, label: 'Dealer Dashboard' },
];

export default function Sidebar() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Handle logout logic here
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          MekinaHub
        </h1>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-6 py-3 text-gray-700 dark:text-gray-200',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                isActive && 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg w-full"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 mr-3" />
          ) : (
            <Moon className="w-5 h-5 mr-3" />
          )}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 mt-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}