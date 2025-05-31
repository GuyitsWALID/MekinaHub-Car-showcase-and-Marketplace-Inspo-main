import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path as needed
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  price: string;
  status: string;
  image: string;
  description: string; // <-- changed from details to description
  created_at: string;
  car_type?: string;
  fuel_type?: string;
  transmission?: string; // <-- Add this line
}

export default function DealerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);

  const [addDetails, setAddDetails] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const MAX_WORDS = 100;

  useEffect(() => {
    if (editListing) {
      setEditDetails(editListing.description);
    }
  }, [editListing]);

  // Fetch all listings for the current dealer only
  const fetchListings = async () => {
    // Get the authenticated user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setListings([]);
      return;
    }

    // Query the dealers table to get the dealer's id
    const { data: dealerData, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (dealerError || !dealerData) {
      setListings([]);
      return;
    }

    const dealer_id = dealerData.id;

    // Fetch only listings for this dealer
    // We fetch only the current user's listings to enforce security via RLS;
    // avoids loading unnecessary rows and reduces client-side filtering.
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('dealer_id', dealer_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error.message);
      alert(`Could not fetch listings: ${error.message}`);
      setListings([]);
    } else if (data) {
      setListings(data as Listing[]);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Word-count util
  const countWords = (text: string | undefined | null) =>
    (text ?? '').trim().split(/\s+/).filter((w) => w).length;

  // Handlers for controlled textareas
  const handleAddDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (countWords(text) <= MAX_WORDS) setAddDetails(text);
  };
  const handleEditDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (countWords(text) <= MAX_WORDS) setEditDetails(text);
  };

  // Add new listing
  const handleAddListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = (formData.get('title') as string) || '';
    const price = (formData.get('price') as string) || '';
    const status = (formData.get('status') as string) || 'Available';
    const carType = (formData.get('car_type') as string) || '';
    const fuelType = (formData.get('fuel_type') as string) || '';
    const transmission = (formData.get('transmission') as string) || ''; // NEW
    const imageUrlInput = (formData.get('imageUrl') as string) || '';
    const fileInput = formData.get('imageFile') as File;

    // Decide image URL
    let finalImage = imageUrlInput;
    if (fileInput && fileInput.size > 0) {
      const { error: uploadError } = await supabase.storage
        .from('car.images')
        .upload(`public/${fileInput.name}`, fileInput);
      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        alert(`Image upload failed: ${uploadError.message}`);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('car.images')
        .getPublicUrl(`public/${fileInput.name}`);
      finalImage = urlData.publicUrl;
    }

    const details = addDetails.trim();
    if (countWords(details) > MAX_WORDS) {
      alert(`Details must be ≤ ${MAX_WORDS} words.`);
      return;
    }

    // Get the authenticated user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to add a listing.');
      return;
    }

    // Query the dealers table to get the dealer's id
    const { data: dealerData, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (dealerError || !dealerData) {
      alert('Dealer profile not found for this user.');
      return;
    }

    const dealer_id = dealerData.id;

    const { error } = await supabase
      .from('cars')
      .insert([
        { 
          title, price, status, image: finalImage, details, 
          car_type: carType, fuel_type: fuelType, transmission, 
          dealer_id // <-- use dealer_id from dealers table
        }
      ]);

    if (error) {
      console.error('Insert error:', error.message);
      alert(`Failed to add listing: ${error.message}`);
    } else {
      form.reset();
      setAddDetails('');
      setIsAddModalOpen(false);
      fetchListings();
    }
  };

  // Edit existing listing
  const handleEditListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editListing) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = (formData.get('title') as string) || '';
    const price = (formData.get('price') as string) || '';
    const status = (formData.get('status') as string) || editListing.status;
    const carType = (formData.get('car_type') as string) || '';
    const fuelType = (formData.get('fuel_type') as string) || '';
    const transmission = (formData.get('transmission') as string) || ''; // <-- Add this line
    const imageUrlInput = (formData.get('imageUrl') as string) || '';
    const fileInput = formData.get('imageFile') as File;

    let finalImage = imageUrlInput || editListing.image;
    if (fileInput && fileInput.size > 0) {
      const { error: uploadError } = await supabase.storage
        .from('car.images')
        .upload(`public/${fileInput.name}`, fileInput);
      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        alert(`Image upload failed: ${uploadError.message}`);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('car.images')
        .getPublicUrl(`public/${fileInput.name}`);
      finalImage = urlData.publicUrl;
    }

    const details = editDetails.trim();
    if (countWords(details) > MAX_WORDS) {
      alert(`Details must be ≤ ${MAX_WORDS} words.`);
      return;
    }

    const { error } = await supabase
      .from('cars')
      .update({
        title,
        price,
        status,
        image: finalImage,
        details,
        car_type: carType,
        fuel_type: fuelType,
        transmission // Now this works because it's declared above
      })
      .eq('id', editListing.id);

    if (error) {
      console.error('Update error:', error.message);
      alert(`Failed to save changes: ${error.message}`);
    } else {
      setEditListing(null);
      setEditDetails('');
      fetchListings();
    }
  };

  // Delete listing with improved error handling
  const handleDelete = async (id: number) => {
    try {
      console.log('Attempting to delete listing with ID:', id);
      
      const { error, data } = await supabase
        .from('cars')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Delete error:', error);
        alert(`Could not delete: ${error.message}`);
        return false;
      } else {
        console.log('Successfully deleted listing:', data);
        await fetchListings();
        return true;
      }
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      alert(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  // Mark as Sold
  const handleMarkSold = async (id: number) => {
    try{
      console.log('Attempting to update status listing with ID:', id);
      const { error, data } = await supabase
       .from('cars')
       .update({ status: 'Sold' })
       .eq('id', id)
       if (error) {
        console.error('status error:', error);
        alert(`Could not update status: ${error.message}`);
        return false;
      } else {
        console.log('Successfully updated status of listing:', data);
        await fetchListings();
        return true;
      }
    }
    catch(err){
      console.error('Update error:', err);
      alert(`Could not mark as sold: ${err}`);
      return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
        
        <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center shadow transition"
          style={{ fontWeight: 600, fontSize: '1rem' }}
        >
          <Plus className="w-5 h-5 mr-2" /> Add Listing
        </button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white  dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition"
          >
            <img
              src={listing.image}
              alt={listing.title}
              className="h-32 w-32 rounded-lg object-cover mx-auto sm:mx-0"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                <p className="mt-2 text-base">
                  Price: <span className="font-medium">{listing.price}</span>
                </p>
                <p className="mt-1">
                  Status:{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    listing.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {listing.status}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => setEditListing(listing)}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                  title="Edit"
                >
                  <Edit2 />
                </button>
                <button
                  onClick={() => {
                    console.log('Delete button clicked for listing ID:', listing.id);
                    handleDelete(listing.id);
                  }}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                  title="Delete"
                >
                  <Trash2 />
                </button>
                {listing.status === 'Available' && (
                  <button
                    onClick={() => handleMarkSold(listing.id)}
                    className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                    title="Mark as Sold"
                  >
                    <Tag />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Listing Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6">Add New Listing</h2>
            <form onSubmit={handleAddListing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Title</label>
                  <input name="title" required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1">Price</label>
                  <input name="price" required className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Status</label>
                  <select name="status" defaultValue="Available" className="w-full p-2 border rounded-lg">
                    <option>Available</option>
                    <option>Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Car Type</label>
                  <select name="car_type" required className="w-full p-2 border rounded-lg">
                    <option value="">Select Car Type</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Hatchback</option>
                    <option>Truck</option>
                    <option>Luxury</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Fuel Type</label>
                  <select name="fuel_type" required className="w-full p-2 border rounded-lg">
                    <option value="">Select Fuel Type</option>
                    <option>Gasoline</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                    <option>Plug-in Hybrid</option>
                    <option>Hydrogen</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Transmission</label>
                  <select name="transmission" required className="w-full p-2 border rounded-lg">
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                    <option value="Dual-Clutch">Dual-Clutch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Image URL</label>
                <input name="imageUrl" type="url" placeholder="https://..." className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block mb-1">Or Upload Image</label>
                <input name="imageFile" type="file" accept="image/*" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block mb-1">Details (max {MAX_WORDS} words)</label>
                <textarea
                  name="details"
                  rows={4}
                  value={addDetails}
                  onChange={handleAddDetailsChange}
                  required
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs mt-1">{countWords(addDetails)}/{MAX_WORDS} words</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setAddDetails(''); }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editListing && (
        <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setEditListing(null)}
          />
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditListing(null)}
              className="absolute top-4 right-4 text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6">Edit Listing</h2>
            <form onSubmit={handleEditListing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Title</label>
                  <input
                    name="title"
                    defaultValue={editListing.title}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1">Price</label>
                  <input
                    name="price"
                    defaultValue={editListing.price}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editListing.status}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option>Available</option>
                    <option>Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Car Type</label>
                  <select
                    name="car_type"
                    defaultValue={editListing.car_type || ''}
                    required
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select Car Type</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Hatchback</option>
                    <option>Truck</option>
                    <option>Luxury</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Fuel Type</label>
                  <select
                    name="fuel_type"
                    defaultValue={editListing.fuel_type || ''}
                    required
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select Fuel Type</option>
                    <option>Gasoline</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                    <option>Plug-in Hybrid</option>
                    <option>Hydrogen</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Transmission</label>
                  <select
                    name="transmission"
                    defaultValue={editListing.transmission || ''}
                    required
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                    <option value="Dual-Clutch">Dual-Clutch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Image URL</label>
                <input
                  name="imageUrl"
                  type="url"
                  defaultValue=""
                  placeholder={editListing.image}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1">Or Upload New Image</label>
                <input name="imageFile" type="file" accept="image/*" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block mb-1">Details (max {MAX_WORDS} words)</label>
                <textarea
                  name="details"
                  rows={4}
                  value={editDetails}
                  onChange={handleEditDetailsChange}
                  required
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs mt-1">{countWords(editDetails)}/{MAX_WORDS} words</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditListing(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
