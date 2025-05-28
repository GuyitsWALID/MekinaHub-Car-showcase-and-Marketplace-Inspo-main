import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Store,
  Car,
  Users,
  Bell,
  Menu,
  X,
  LogOut,
  GitCompareIcon,
  Settings,
  CarFrontIcon,
  BarChart2,
  List,
  ListChecks,
  ListChecksIcon,
  Heart,

} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useIsMobile } from "../hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { supabase } from "../supabaseClient";

// Common navigation items for all users
const commonNavItems = [
  { icon: Car, label: "Show Room", path: "/showroom" },
  { icon: GitCompareIcon, label: "Compare", path: "/compare" },
  { icon: Store, label: "Marketplace", path: "/marketplace" },
  { icon: Users, label: "Messages", path: "/messages" },
  {icon: Heart, label: "Favorites", path: "/favourite"}
];

// Dealer-specific navigation items
const dealerNavItems = [
  { icon: ListChecksIcon, label: "My Listings", path: "/dealerdashboard" },
  { icon: BarChart2, label: "Analytics", path: "/dealeranalytics" },
];

const navBottomItems = [
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [userData, setUserData] = useState<{
    full_name: string;
    email: string;
    avatar_url: string;
    role?: string;
    type?: string;
  } | null>(null);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile for ID:', user?.id);
      
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      // First try to find user by ID
      let { data, error } = await supabase
        .from('users')
        .select('full_name, email, avatar_url, role, type')
        .eq('id', user.id)
        .single();

      // If not found by ID, try to find by email
      if (error && error.code === 'PGRST116' && user.email) {
        console.log('User not found by ID, trying to find by email:', user.email);
        
        const { data: emailData, error: emailError } = await supabase
          .from('users')
          .select('full_name, email, avatar_url, role, type')
          .eq('email', user.email)
          .single();
          
        if (!emailError && emailData) {
          data = emailData;
          error = null;
          console.log('User found by email');
        }
      }

      // If still not found, create a new user record
      if ((error && error.code === 'PGRST116') || !data) {
        console.log('User not found in database, creating new record');
        
        const newUserData = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'buyer',
          type: 'buyer', // Default type is buyer
          created_at: new Date().toISOString()
        };
        
        console.log('Inserting new user data:', newUserData);
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([newUserData]);
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          
          // Fallback to auth metadata if insertion fails
          setUserData({
            full_name: newUserData.full_name,
            email: newUserData.email || '',
            avatar_url: newUserData.avatar_url,
            role: 'buyer',
            type: 'buyer'
          });
        } else {
          // Set the user data after successful creation
          setUserData({
            full_name: newUserData.full_name,
            email: newUserData.email || '',
            avatar_url: newUserData.avatar_url,
            role: 'buyer',
            type: 'buyer'
          });
          console.log('Created and set new user profile');
        }
        return;
      }

      if (data) {
        console.log('User profile data retrieved:', data);
        setUserData(data);
      } else {
        console.log('No user data found in the database');
        
        // Fallback to auth metadata if available
        if (user.user_metadata) {
          const fallbackData = {
            full_name: user.user_metadata.full_name || user.user_metadata.name || 'User',
            email: user.email || '',
            avatar_url: user.user_metadata.avatar_url || '',
            role: 'buyer',
            type: '', // Default role
          };
          
          setUserData(fallbackData);
          console.log('Using auth metadata as fallback:', fallbackData);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      
      // Final fallback - use whatever we can get from auth
      if (user) {
        setUserData({
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'buyer',
          type: '', // Default role
        });
      }
    }
  };

  const toggle = () => setCollapsed((c) => !c);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (userData?.full_name) {
      return userData.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return 'U';
  };

  // Determine which nav items to show based on user type
  const getNavItems = () => {
    const items = [...commonNavItems];
    
    // Add dealer-specific items if user is a dealer
    if (userData?.type === 'dealer') {
      items.push(...dealerNavItems);
    }
    
    return items;
  };

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
            {commonNavItems.map((item) => {
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

            {/* Show dealer-specific nav items only for users with dealer role */}
            {userData?.role === 'dealer' && dealerNavItems.map((item) => {
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

        {/* User footer with role indicator */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          {collapsed ? (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full" size="icon">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userData?.avatar_url || ''} alt={userData?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{userData?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{userData?.email || ''}</p>
                    <p className="text-xs font-medium text-primary-600 capitalize">{userData?.type}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0" size="icon">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userData?.avatar_url || ''} alt={userData?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex flex-col">
                <p className="text-sm font-medium truncate">{userData?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{userData?.email || ''}</p>
                <p className="text-xs font-medium text-primary-600 capitalize">{userData?.role || 'buyer'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
