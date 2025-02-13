import React from 'react';
import { MessageCircle, Heart, Bookmark } from 'lucide-react';

export default function Marketplace() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Marketplace
        </h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Become a Dealer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Car listing card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
              alt="Car listing"
              className="w-full h-48 object-cover"
            />
            <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
              Available
            </span>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  BMW M4 Competition
                </h3>
                <p className="text-gray-600 dark:text-gray-400">$85,000</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                2023 • 1,500 miles • Automatic
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Listed by AutoMax Dealers
              </p>
            </div>
            
            <button className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Dealer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}