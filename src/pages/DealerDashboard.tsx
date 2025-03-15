import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Adjust path as needed

// Define a type for a Listing
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
  // Annotate state so that listings is a Listing array.
  const [listings, setListings] = useState<Listing[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);

  // Function to fetch listings from Supabase
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching listings:', error);
    } else if (data) {
      // Assert that data is an array of Listing objects.
      setListings(data as Listing[]);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Handle adding a new listing with a properly typed event parameter.
  const handleAddListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const status = formData.get('status') as string;
    const image = formData.get('image') as string;
    const details = formData.get('details') as string;

    const { error } = await supabase.from('listings').insert([
      { title, price, status, image, details },
    ]);
    if (error) {
      console.error('Error adding listing:', error);
    } else {
      fetchListings();
      setIsAddModalOpen(false);
      form.reset();
    }
  };

  // Handle editing an existing listing.
  const handleEditListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editListing) return; // Guard clause for null value
    const form = e.currentTarget;
    const formData = new FormData(form);
    const id = editListing.id;
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const status = formData.get('status') as string;
    const image = formData.get('image') as string;
    const details = formData.get('details') as string;

    const { error } = await supabase
      .from('listings')
      .update({ title, price, status, image, details })
      .eq('id', id);
    if (error) {
      console.error('Error updating listing:', error);
    } else {
      fetchListings();
      setEditListing(null);
      form.reset();
    }
  };

  // Annotate the parameter id as a number.
  const handleDeleteListing = async (id: number) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      console.error('Error deleting listing:', error);
    } else {
      fetchListings();
    }
  };

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

      {/* Listings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Listed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={listing.image}
                          alt={listing.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {listing.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.details}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {listing.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        listing.status === 'Available'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          ></div>
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
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Details
                </label>
                <textarea
                  name="details"
                  defaultValue={editListing?.details}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
                ></textarea>

              </div>
              <button
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
          ></div>
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
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editListing.image}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">
                  Details
                </label>
                <textarea
                  name="details"
                  defaultValue={editListing.details}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  rows={3}
                  required
                ></textarea>
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
