// src/pages/Favorites.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext'; // Add auth context import
import GradientText from '../components/GradientText';

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
  const [openDesc, setOpenDesc] = useState<{[key:number]: boolean}>({});
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          cars(*)
        `)
        .eq('user_id', user.id); // Filter favorites by user_id

      if (error) throw error;

      if (data) {
        // Filter out any null cars and map to car objects
        const favoriteListings = data
          .map((fav) => fav.cars)
          .filter((listing): listing is Listing => listing !== null);
        setFavorites(favoriteListings);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]); // Re-fetch when user changes

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <GradientText
        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
        animationSpeed={3}
        showBorder={false}
        className="font-sans font-extrabold text-4xl mb-9"
      >
        Your Favourite Listings
      </GradientText>
      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">You have not favorited any listings yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {favorites.map((listing: Listing) => {
            const isOpen = openDesc[listing.id];
            const shortDesc = listing.details.length > 80 ? listing.details.slice(0, 80) + '...' : listing.details;
            return (
              <div key={listing.id} className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img src={listing.image} alt={listing.title} className="w-48 h-48 object-cover flex-shrink-0" />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">${listing.price}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold border bg-green-100 text-green-800 border-green-400 mr-2`}
                        style={{display: listing.status === 'available' ? 'inline-block' : 'none'}}>
                        Available
                      </span>
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold border bg-red-100 text-red-800 border-red-400`}
                        style={{display: listing.status !== 'available' ? 'inline-block' : 'none'}}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        {isOpen ? listing.details : shortDesc}
                      </span>
                      {listing.details.length > 80 && (
                        <button
                          className="ml-2 text-blue-500 hover:underline text-sm focus:outline-none"
                          onClick={() => setOpenDesc(prev => ({...prev, [listing.id]: !prev[listing.id]}))}
                        >
                          {isOpen ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
