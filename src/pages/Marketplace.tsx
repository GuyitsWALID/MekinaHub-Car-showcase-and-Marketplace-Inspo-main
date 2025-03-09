import React, { useState } from 'react';
import { MessageCircle, Heart, Bookmark, X } from 'lucide-react';
import BlurText from '@/components/BlurText';

export default function Marketplace() {
  // Sample data (replace with real backend data as needed)
  const [listings, setListings] = useState([
    {
      id: 1,
      title: 'BMW M4 Competition',
      price: '$85,000',
      details: '2023 • 1,500 miles • Automatic',
      dealer: 'AutoMax Dealers',
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
      status: 'Available',
    },
    // More listings can be added dynamically
  ]);

  // State for the "Become a Dealer" modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle the form submission (e.g., send data to your backend)
    console.log('Form submitted');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <BlurText 
          text="Marketplace"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-3xl font-bold text-gray-900 dark:text-white"
        />
        <div 
          className="text-primary-600 font-semibold cursor-pointer hover:underline" 
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
                  <button
                    aria-label="Like"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="Bookmark"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600 dark:text-gray-400">{car.details}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Listed by {car.dealer}
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
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>
          {/* Modal Content */}
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
