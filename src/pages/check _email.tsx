import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CheckEmail = () => {
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
          <Mail size={48} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Check Your Email</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-sm">
            We’ve sent a confirmation email to your inbox. Click the link inside to verify your email and continue.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn’t receive the email? Check your spam folder or
          </p>
          <button className="mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Resend Email
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6"
        >
          <Link to="/signin" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Back to Sign In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckEmail;
