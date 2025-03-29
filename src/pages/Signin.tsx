import React, { useState } from 'react';
import { Github, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signin logic here
    console.log('Signin attempt with:', { email, password, rememberMe });
  };

  return (
    <div className="flex min-h-screen w-full justify-center items-center bg-gradient-to-br from-blue-50 to-blue-200 relative overflow-hidden p-4">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 -top-12 -left-24 opacity-40 animate-float"></div>
        <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 -bottom-12 -right-12 opacity-40 animate-float-reverse"></div>
        <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 bottom-1/3 left-1/12 opacity-40 animate-float-slow"></div>
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-sky-300 to-sky-400 top-1/5 right-1/10 opacity-40 animate-float-slow-reverse"></div>
      </div>

      <motion.div 
        className="z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to your AutoMarket account</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white hover:bg-gray-800 transition-all shadow-md">
            <Github size={20} />
            <span className="font-medium">GitHub</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-md">
            <Mail size={20} />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-gray-800">Google</span>
          </button>
        </motion.div>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Sign In
            <ArrowRight size={18} />
          </motion.button>
        </motion.form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signin;
