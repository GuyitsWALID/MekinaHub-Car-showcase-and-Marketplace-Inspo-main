import React, { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Define proper types
interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  bio: string;
  avatar_url: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
}

export default function Setting() {
  // Fix the signOut property by adding proper type assertion
  const auth = useAuth();
  const user = auth?.user || null;
  const signOut = auth?.signOut || (async () => {});
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    bio: '',
    avatar_url: '',
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserSettings();
    } else {
      console.log('No user found, cannot load settings');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for user ID:', user?.id);
      
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If the user doesn't exist in the users table, create a new record
        if (error.code === 'PGRST116' || error.code === 'PGRST104') {
          console.log('User not found in database, creating new record');
          
          // Create a new user with default values
          const newUserData = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
            phone: '',
            company_name: '',
            bio: '',
            avatar_url: '',
            role: 'buyer', // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Inserting new user data:', newUserData);
          
          const { error: insertError } = await supabase
            .from('users')
            .insert([newUserData]);
            
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            return;
          }
          
          // Set the profile data with the new user data
          setProfileData({
            full_name: newUserData.full_name,
            email: newUserData.email,
            phone: newUserData.phone,
            company_name: newUserData.company_name,
            bio: newUserData.bio,
            avatar_url: newUserData.avatar_url,
          });
          
          return;
        }
        
        return;
      }

      if (data) {
        console.log('Profile data loaded:', data);
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      } else {
        console.log('No profile data found, using default values');
        // If no data is found, we'll use the default empty values
      }
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
      // Don't show alert, just log the error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available for settings');
        return;
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        
        // If settings don't exist, create default settings
        if (error.code === 'PGRST116' || error.code === 'PGRST104') {
          console.log('User settings not found, creating defaults');
          
          const defaultSettings = {
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert([defaultSettings]);
            
          if (insertError) {
            console.error('Error creating default settings:', insertError);
            return;
          }
          
          setNotificationSettings({
            email_notifications: true,
            push_notifications: true
          });
          
          return;
        }
        
        return;
      }

      if (data) {
        setNotificationSettings({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
        });
      } else {
        console.log('No settings found, using defaults');
        // If no data is found, we'll use the default values
      }
    } catch (error) {
      console.error('Exception in fetchUserSettings:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      console.log('Updating profile for user ID:', user?.id);

      // Upload avatar if changed
      let avatar_url = profileData.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // First, check if there's an existing avatar and delete it
        if (profileData.avatar_url) {
          const existingPath = profileData.avatar_url.split('/').pop();
          if (existingPath) {
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([existingPath]);
            
            if (deleteError) {
              console.error('Error deleting old avatar:', deleteError);
            }
          }
        }

        // Upload new avatar
        console.log('Uploading avatar to path:', filePath);
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = urlData.publicUrl;
        console.log('New avatar URL:', avatar_url);
      }

      // Update profile
      const updateData = {
        full_name: profileData.full_name,
        phone: profileData.phone,
        company_name: profileData.company_name,
        bio: profileData.bio,
        avatar_url,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Updating with data:', updateData);
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id);

      if (error) throw error;

      setProfileData(prev => ({ ...prev, avatar_url }));
      setAvatarFile(null);
      setAvatarPreview(null);
      
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          email_notifications: notificationSettings.email_notifications,
          push_notifications: notificationSettings.push_notifications,
          updated_at: new Date(),
        });

      if (error) throw error;

      alert('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      alert('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  // Fix the event parameter type
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // Fix the type issue with the result
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
    }
  };

  // Remove the conditional rendering that checks for user authentication
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Account Settings</h1>

      <div className="flex border-b mb-6 dark:border-gray-700">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'account' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Personal Information</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Update your personal details and public profile</p>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    placeholder="john@example.com"
                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
                  <input
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    placeholder="Acme Inc."
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself or your dealership"
                  rows={4}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleProfileUpdate} 
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Profile Picture</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Upload a profile picture to personalize your account</p>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {(avatarPreview || profileData.avatar_url) ? (
                  <img 
                    src={avatarPreview || profileData.avatar_url} 
                    alt={profileData.full_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-300 text-2xl font-bold">
                    {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <label 
                  htmlFor="avatar" 
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Choose Image
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Notification Preferences</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Manage how and when you receive notifications</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4 dark:text-white">Email Notifications</h3>
              <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                <div>
                  <div className="font-medium dark:text-white">Email Notifications</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.email_notifications}
                    onChange={(e) => setNotificationSettings(prev => ({ 
                      ...prev, 
                      email_notifications: e.target.checked 
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4 dark:text-white">Push Notifications</h3>
              <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                <div>
                  <div className="font-medium dark:text-white">Push Notifications</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications on your device
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.push_notifications}
                    onChange={(e) => setNotificationSettings(prev => ({ 
                      ...prev, 
                      push_notifications: e.target.checked 
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleNotificationUpdate} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Account Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your account access and data</p>
          
          <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-800 dark:text-amber-400">Data Export</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                You can request a copy of all your data. This includes your profile information, listings, and messages.
              </p>
              <button className="mt-3 border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 px-3 py-1 rounded text-sm">
                Request Data Export
              </button>
            </div>
            
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-400">Delete Account</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Permanently delete your account and all your data. This action cannot be undone.
              </p>
              <button className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                Delete Account
              </button>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={handleLogout}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 rounded flex items-center justify-center gap-2"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}