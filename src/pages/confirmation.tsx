import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Confirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full justify-center items-center bg-gradient-to-br from-blue-50 to-blue-200 relative overflow-hidden p-4">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 -top-12 -left-24 opacity-40 animate-float"></div>
        <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 -bottom-12 -right-12 opacity-40 animate-float-reverse"></div>
      </div>

      <motion.div 
        className="z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Verified!</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Your email has been successfully confirmed.</p>
        </motion.div>

        <motion.button
          onClick={() => navigate('/showroom')}
          className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-all"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Confirmation;


