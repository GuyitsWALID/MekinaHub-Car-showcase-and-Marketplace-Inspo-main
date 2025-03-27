import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Bookmark, X } from 'lucide-react';
import BlurText from '../components/BlurText';
import { supabase } from '../supabaseClient';

export interface Listing {
  id: number;
  title: string;
  price: string;
  details: string;
  dealer?: string;
  image: string;
  status: string;
  created_at: string;
}

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state for UI feedback (colors) on favorites and heart clicks
  const [favoritedIds, setFavoritedIds] = useState<number[]>([]);
  const [heartedIds, setHeartedIds] = useState<number[]>([]);

  // Fetch listings from Supabase
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching listings:', error);
    } else if (data) {
      setListings(data as Listing[]);
    }
  };

  useEffect(() => {
    fetchListings();
    // Optionally add realtime subscriptions here.
  }, []);

  // Toggle favorite for a listing (bookmark icon)
  const toggleFavorite = async (listing: Listing) => {
    if (favoritedIds.includes(listing.id)) {
      // Remove favorite
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('listing_id', listing.id);
      if (error) {
        console.error('Error removing favorite:', error);
      } else {
        setFavoritedIds((prev) => prev.filter((id) => id !== listing.id));
      }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('favorites')
        .insert([{ listing_id: listing.id }]);
      if (error) {
        console.error('Error adding favorite:', error);
      } else {
        setFavoritedIds((prev) => [...prev, listing.id]);
      }
    }
  };

  // Handle heart click for dealer analytics
  const toggleHeart = async (listing: Listing) => {
    if (!heartedIds.includes(listing.id)) {
      // Check if an analytics record exists for this listing
      const { data: existing, error: fetchError } = await supabase
        .from('heart_analytics')
        .select('*')
        .eq('listing_id', listing.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching heart analytics:', fetchError);
        return;
      }

      if (existing) {
        // Update the record by incrementing heartClicks
        const { error } = await supabase
          .from('heart_analytics')
          .update({ heartClicks: existing.heartClicks + 1 })
          .eq('listing_id', listing.id);
        if (error) {
          console.error('Error updating heart analytics:', error);
        }
      } else {
        // Insert new record with an initial heart click count of 1
        const { error } = await supabase
          .from('heart_analytics')
          .insert([{ listing_id: listing.id, heartClicks: 1 }]);
        if (error) {
          console.error('Error inserting heart analytics:', error);
        }
      }
      // Mark the listing as hearted in local state (UI feedback)
      setHeartedIds((prev) => [...prev, listing.id]);
    }
  };

  // Handle "Become a Dealer" form submission (placeholder)
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Marketplace
        </h1>
        <div
          className="text-primary-600 font-semibold cursor-pointer hover:underline mt-2"
          onClick={() => setIsModalOpen(true)}
        >
          Become a Dealer - Apply Now!
        </div>
      </div>

      {/* Car Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((car) => (
          <div
            key={car.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <img src={car.image} alt={car.title} className="w-full h-48 object-cover" />
              <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
                {car.status}
              </span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {car.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{car.price}</p>
                </div>
                <div className="flex space-x-2">
                  {/* Heart button: if already clicked, show in red */}
                  <button
                    aria-label="Like (heart)"
                    onClick={() => toggleHeart(car)}
                    className="p-2 transition-colors duration-200"
                  >
                    <Heart className={`w-5 h-5 ${heartedIds.includes(car.id) ? "text-red-600" : "text-gray-600"}`} />
                  </button>
                  {/* Bookmark button: toggles favorite state and color */}
                  <button
                    aria-label="Favorite (bookmark)"
                    onClick={() => toggleFavorite(car)}
                    className="p-2 transition-colors duration-200"
                  >
                    <Bookmark className={`w-5 h-5 ${favoritedIds.includes(car.id) ? "text-blue-600" : "text-gray-600"}`} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600 dark:text-gray-400">{car.details}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Listed by {car.dealer || "Unknown Dealer"}
                </p>
              </div>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Dealer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Become a Dealer Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
            <button
              aria-label="Close modal"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 id="modal-title" className="text-2xl font-bold mb-4">
              Apply to Become a Dealer
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Why do you want to become a dealer?
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

