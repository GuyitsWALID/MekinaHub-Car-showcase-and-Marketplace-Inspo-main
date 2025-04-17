import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path as needed
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  price: string;
  status: string;
  image: string;
  details: string;
  created_at: string;
}

export default function DealerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);

  // Controlled state for details with word limit
  const [addDetails, setAddDetails] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const MAX_WORDS = 100;

  // Update editDetails state when editListing changes
  useEffect(() => {
    if (editListing) {
      setEditDetails(editListing.details);
    }
  }, [editListing]);

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
  }, []);

  // Handler for details change (Add)
  const handleAddDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/).filter(word => word !== "");
    if (words.length <= MAX_WORDS) {
      setAddDetails(value);
    }
  };

  // Handler for details change (Edit)
  const handleEditDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/).filter(word => word !== "");
    if (words.length <= MAX_WORDS) {
      setEditDetails(value);
    }
  };

  // Add a new listing
  const handleAddListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const status = formData.get('status') as string;

    // Get image inputs
    const fileInput = formData.get('imageFile') as File;
    const imageUrlInput = formData.get('imageUrl') as string;

    let finalImage = imageUrlInput; // Default to URL provided

    // If file input exists, upload file
    if (fileInput && fileInput.size > 0) {
      const { error: uploadError } = await supabase.storage
        .from('images') // Ensure you have a bucket named "images"
        .upload(`public/${fileInput.name}`, fileInput);
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(`public/${fileInput.name}`);
        finalImage = publicUrlData?.publicUrl || finalImage;
      }
    }

    // Use controlled description value (addDetails)
    const details = addDetails;

    // Second check on word limit
    const words = details.trim().split(/\s+/).filter(word => word !== "");
    if (words.length > MAX_WORDS) {
      alert(`Details must not exceed ${MAX_WORDS} words.`);
      return;
    }

    const { error } = await supabase
      .from('listings')
      .insert([{ title, price, status, image: finalImage, details }]);

    if (error) {
      console.error('Error adding listing:', error);
    } else {
      setIsAddModalOpen(false);
      e.currentTarget.reset();
      setAddDetails('');
      fetchListings();
    }
  };

  // Edit an existing listing
  const handleEditListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editListing) return;

    const formData = new FormData(e.currentTarget);

    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const status = formData.get('status') as string;

    // Get image inputs
    const fileInput = formData.get('imageFile') as File;
    const imageUrlInput = formData.get('imageUrl') as string;

    let finalImage = imageUrlInput;
    if (fileInput && fileInput.size > 0) {
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(`public/${fileInput.name}`, fileInput);
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(`public/${fileInput.name}`);
        finalImage = publicUrlData?.publicUrl || finalImage;
      }
    }

    const details = editDetails;
    const words = details.trim().split(/\s+/).filter(word => word !== "");
    if (words.length > MAX_WORDS) {
      alert(`Details must not exceed ${MAX_WORDS} words.`);
      return;
    }

    const { error } = await supabase
      .from('listings')
      .update({ title, price, status, image: finalImage, details })
      .eq('id', editListing.id);

    if (error) {
      console.error('Error updating listing:', error);
    } else {
      setEditListing(null);
      e.currentTarget.reset();
      setEditDetails('');
      fetchListings();
    }
  };

  // Delete a listing
  const handleDeleteListing = async (id: number) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      console.error('Error deleting listing:', error);
    } else {
      fetchListings();
    }
  };

  // Mark as sold
  const handleMarkAsSold = async (id: number) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'Sold' })
      .eq('id', id);

    if (error) {
      console.error('Error marking listing as sold:', error);
    } else {
      fetchListings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dealer Dashboard
        </h1>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Listing
        </button>
      </div>

      {/* Card Layout for All Screen Sizes */}
      <div className="space-y-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:space-x-4"
          >
            <img
              className="h-24 w-24 rounded object-cover mb-4 sm:mb-0"
              src={listing.image}
              alt={listing.title}
            />
            <div className="flex-1">
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {listing.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {listing.details}
              </div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Price: <span className="font-medium">{listing.price}</span>
              </div>
              <div className="text-sm mt-1">
                Status:{' '}
                <span
                  className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    listing.status === 'Available'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {listing.status}
                </span>
              </div>
              {/* Actions (Edit, Delete, Mark as Sold) */}
              <div className="mt-3 flex space-x-2">
                <button
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-900"
                  onClick={() => setEditListing(listing)}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  className="text-red-600 dark:text-red-400 hover:text-red-900"
                  onClick={() => handleDeleteListing(listing.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {listing.status === 'Available' && (
                  <button
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900"
                    onClick={() => handleMarkAsSold(listing.id)}
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Listing Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
            <button
              aria-label="Close modal"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsAddModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Add New Listing</h2>
            <form onSubmit={handleAddListing}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              {/* Image File Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Upload Image
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* OR Image URL */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Or Image URL
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  placeholder="http://example.com/myimage.jpg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Details (max {MAX_WORDS} words)
                </label>
                <textarea
                  name="details"
                  rows={3}
                  value={addDetails}
                  onChange={handleAddDetailsChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <button
                onClick= {() => setAddDetails('')}
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editListing && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setEditListing(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
            <button
              aria-label="Close modal"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setEditListing(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Edit Listing</h2>
            <form onSubmit={handleEditListing}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editListing.title}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  defaultValue={editListing.price}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editListing.status}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              {/* Image File Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Upload Image
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* OR Image URL */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Or Image URL
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={editListing.image}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  placeholder="http://example.com/myimage.jpg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Details (max {MAX_WORDS} words)
                </label>
                <textarea
                  name="details"
                  rows={3}
                  value={editDetails}
                  onChange={handleEditDetailsChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                Update Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

