import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function Compare() {
  const [car1Search, setCar1Search] = useState('');
  const [car2Search, setCar2Search] = useState('');

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-700 dark:text-white mb-8">
        Car Comparison
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Car 1 */}
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search first car..."
              value={car1Search}
              onChange={(e) => setCar1Search(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <img
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
              alt="Car 1"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              BMW M4 Competition
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Engine:</span>
                <span className="text-gray-900 dark:text-white">3.0L Twin-Turbo</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Power:</span>
                <span className="text-gray-900 dark:text-white">503 hp</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">0-60 mph:</span>
                <span className="text-gray-900 dark:text-white">3.8s</span>
              </p>
            </div>
          </div>
        </div>

        {/* Car 2 */}
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search second car..."
              value={car2Search}
              onChange={(e) => setCar2Search(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"
              alt="Car 2"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Mercedes-AMG C63
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Engine:</span>
                <span className="text-gray-900 dark:text-white">4.0L V8 Twin-Turbo</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Power:</span>
                <span className="text-gray-900 dark:text-white">503 hp</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">0-60 mph:</span>
                <span className="text-gray-900 dark:text-white">3.7s</span>
              </p>
              
            </div>
          </div>
          
        </div>
        <div className=''>
              <button className='pr-96 p-4 text-white bg-primary-600 rounded-xl text-center'>
                Compare
              </button>
            </div>
      </div>
    </div>
  );
}