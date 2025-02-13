import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function Showroom() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Car Showroom
      </h1>

      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search for a car..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Car cards will be rendered here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
            alt="Car"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            BMW M4 Competition
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Experience the perfect blend of luxury and performance
          </p>
        </div>
      </div>
    </div>
  );
}