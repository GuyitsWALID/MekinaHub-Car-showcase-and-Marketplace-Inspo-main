// src/pages/Favorites.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { type Listing } from './Marketplace'; // Import Listing type

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    // Query 'cars' table through 'favorites' table
    const { data, error } = await supabase
      .from('favorites')
      .select('cars(*)') // Select all columns from the related 'cars' table
      .eq('user_id', user.id); // Filter by the current user's ID

    if (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } else if (data) {
      // Map the returned favorites to their related car objects.
      // Filter out any entries where the car might be null (e.g., if a car was deleted but the favorite entry remained).
      const favoriteCars = data.map((fav: any) => fav.cars).filter(car => car !== null);
      setFavorites(favoriteCars);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    // We want to fetch favorites when the user is available,
    // or clear them if the user logs out or auth state is resolved without a user.
    if (user) {
      fetchFavorites();
    } else if (!authLoading) { // User is not logged in, and authentication is not loading
      setFavorites([]);
      setDataLoading(false);
    }
    // Explicitly not depending on fetchFavorites to avoid re-runs if the function reference changes.
    // The logic within fetchFavorites and its surrounding useEffect handles user and authLoading changes.
  }, [user, authLoading]);

  if (authLoading) return <div>Authenticating...</div>;
  if (!user) return <div className="max-w-7xl mx-auto p-4 text-center"><p>Please log in to view your favorites.</p></div>;
  if (dataLoading) return <div>Loading your favorites...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Favorite Listings</h1>
      {favorites.length === 0 ? (
        <p>You have not favorited any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((listing: Listing) => (
            <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{listing.title}</h3>
                <p>{listing.price}</p>
                <p>{listing.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
