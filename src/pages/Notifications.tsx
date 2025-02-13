import React from 'react';
import { Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Notifications
      </h1>

      <div className="space-y-4">
        {/* System Update */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                System Update
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We've added new features to the car comparison tool!
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                2 hours ago
              </p>
            </div>
          </div>
        </div>

        {/* New Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New Message
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have a new message from AutoMax Dealers
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                5 hours ago
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Price Drop Alert
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A car in your watchlist has dropped in price
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                1 day ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}