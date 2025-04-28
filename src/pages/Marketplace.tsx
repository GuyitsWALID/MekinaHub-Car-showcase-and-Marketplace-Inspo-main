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
    const fetchData = async () => {
      try {
        await fetchListings();
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Add user-friendly error handling here
      }
    };
    
    fetchData();

    // Set up real-time subscription for listings
    const listingsSubscription = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          console.log('Listings change received:', payload);
          fetchListings(); // Refresh the listings when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsSubscription);
    };
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      // Get current user with enhanced error handling
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Authentication error:', userError);
        alert('Authentication error. Please try logging in again.');
        return;
      }
      
      if (!user || !user.id) {
        alert('Please sign in to submit a dealer application');
        return;
      }

      // Validate form data
      const companyName = formData.get('company_name') as string;
      const contactEmail = formData.get('contact_email') as string;
      const contactPhone = formData.get('contact_phone') as string;
      const location = formData.get('location') as string;
      const description = formData.get('description') as string;
      const logoFile = formData.get('logo') as File;

      // Enhanced validation
      if (!companyName || companyName.length < 2) {
        alert('Please enter a valid company name');
        return;
      }

      if (!contactEmail.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }

      if (!contactPhone || contactPhone.length < 10) {
        alert('Please enter a valid phone number');
        return;
      }

      if (!location || location.length < 2) {
        alert('Please enter a valid location');
        return;
      }

      if (!description || description.length < 10) {
        alert('Please provide a detailed description');
        return;
      }

      let logoUrl = '';
      if (logoFile && logoFile.size > 0) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(logoFile.type)) {
          alert('Please upload a valid image file (PNG, JPG, or JPEG)');
          return;
        }

        // Validate file size (max 5MB)
        if (logoFile.size > 5 * 1024 * 1024) {
          alert('Logo file size must be less than 5MB');
          return;
        }

        try {
          // Upload logo to Supabase Storage
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          
          console.log('Attempting to upload file:', {
            fileName,
            fileSize: logoFile.size,
            fileType: logoFile.type
          });

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('dealers')  // Changed from 'dealer-logos' to 'dealers'
            .upload(`logos/${fileName}`, logoFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: logoFile.type
            });

          if (uploadError) {
            console.error('Upload error details:', uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          if (!uploadData?.path) {
            throw new Error('Upload successful but no path returned');
          }

          // Get public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('dealers')
            .getPublicUrl(`logos/${fileName}`);
            
          logoUrl = publicUrl;
          console.log('File uploaded successfully:', logoUrl);
        } catch (uploadError) {
          console.error('Detailed upload error:', uploadError);
          alert('Failed to upload logo. Please ensure the file is a valid image and try again.');
          return;
        }
      }

      // Insert dealer application into Supabase
      // Inside handleFormSubmit function
      const { data, error } = await supabase.from('dealer_applications').insert([
        {
          user_id: user.id,
          company_name: companyName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          location: location,
          description: description,
          logo_url: logoUrl || null,
          status: 'pending'
        }
      ]).select();

      if (error) {
        console.error('Detailed error:', error);
        alert(`Failed to submit application: ${error.message || 'Unknown error occurred'}`);
        return;
      }

      alert('Application submitted successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Company Logo
                </label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload your company logo (PNG, JPG, JPEG)
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
                } text-white py-2 rounded-lg transition-colors duration-200`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

