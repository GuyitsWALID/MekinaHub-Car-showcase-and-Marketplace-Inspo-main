import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Messages
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x dark:divide-gray-700">
          {/* Contacts List */}
          <div className="md:max-h-[calc(100vh-12rem)] md:overflow-y-auto">
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    AutoMax Dealers
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Is the BMW M4 still available?
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  2m ago
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AutoMax Dealers
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-end">
                <div className="bg-primary-600 text-white rounded-lg py-2 px-4 max-w-md">
                  <p>Hi, I'm interested in the BMW M4 Competition you have listed.</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-2 px-4 max-w-md">
                  <p>Hello! Yes, the BMW M4 is still available. Would you like to schedule a viewing?</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}