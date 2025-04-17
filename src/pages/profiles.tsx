// src/pages/Profile.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [fullName, setFullName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq("id", user!.id);
    setSaving(false);
    alert("Profile updated!");
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to see your profile.</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Your Profile</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium">Full Name</label>
        <input
          type="text"
          className="mt-1 block w-full border p-2 rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Avatar URL</label>
        <input
          type="text"
          className="mt-1 block w-full border p-2 rounded"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>
      {avatarUrl && (
        <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full mb-4" />
      )}
      <button
        onClick={saveProfile}
        disabled={saving}
        className="px-4 py-2 bg-primary-600 text-white rounded"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
