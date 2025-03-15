// src/pages/Favorites.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Listing {
  id: number;
  title: string;
  price: string;
  image: string;
  status: string;
  details: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    // Assumes that the "favorites" table has a relationship to "listings"
    const { data, error } = await supabase
      .from('favorites')
      .select('*, listings(*)');
    if (error) {
      console.error('Error fetching favorites:', error);
    } else if (data) {
      // Map the returned favorites to their related listing objects
      const favoriteListings = data.map((fav: any) => fav.listings);
      setFavorites(favoriteListings);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) return <div>Loading your favorites...</div>;

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
