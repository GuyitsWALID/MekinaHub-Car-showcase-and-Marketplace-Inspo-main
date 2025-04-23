import React, { useState, useEffect } from 'react';
import { Github, Eye, EyeOff, ArrowRight, Car } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  // Compute password strength
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  // Add auth state change listener
  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    // Check if we're coming back from an OAuth redirect
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Session found on page load:', session.user.id);
        // If we have a session, navigate to showroom
        navigate('/showroom');
      }
    };
    
    // Check for existing session on component mount
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        // When a user signs in (including after OAuth redirect)
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.id);
          
          try {
            // Check if user already exists in the users table
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('id, role')
              .eq('id', session.user.id)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error('Error checking existing user:', fetchError);
              return;
            }

            // If user doesn't exist in the users table, insert them
            if (!existingUser) {
              const userData = {
                id: session.user.id,
                full_name: session.user.user_metadata.full_name || 
                           session.user.user_metadata.name || 
                           'User',
                email: session.user.email,
                role: 'buyer', // Default role
                created_at: new Date().toISOString()
              };

              const { error: insertError } = await supabase
                .from('users')
                .insert([userData]);

              if (insertError) {
                console.error('Error inserting OAuth user:', insertError);
              }
            }

            // Navigate to showroom after successful sign-in
            navigate('/showroom');
          } catch (err) {
            console.error('Error in auth state change:', err);
          }
        }
      }
    );

    // Clean up the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleMode = () => {
    setErrorMessage(null);
    setPassword('');
    setIsSignUp(prev => !prev);
  };
  
  // Fixed OAuth handler
  // OAuth handler
  const handleOAuth = async (provider: 'github' | 'google') => {
    try {
      // Simplify the OAuth flow - don't specify redirectTo
      const { error } = await supabase.auth.signInWithOAuth({
        provider
      });

      if (error) {
        console.error('OAuth error:', error);
        setErrorMessage(error.message);
      }
    } catch (err) {
      console.error('OAuth exception:', err);
      setErrorMessage('An error occurred during authentication');
    }
  };

  // Fixed SignUp handler
  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Assuming 'name' is the variable holding the user's full name
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name, role: 'buyer' }, // Use 'name' variable for full_name
            emailRedirectTo: `${window.location.origin}/`
        }
    });

    if (signUpError) {
        setErrorMessage(signUpError.message);
        return;
    }

    // Insert full_name and email into the users table
    if (user) {
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ full_name: name, email: user.email }]); // Use 'name' variable for full_name

        if (insertError) {
            setErrorMessage(insertError.message);
        } else {
            navigate('/checkemail'); // Redirect after successful insertion
        }
    }
};

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
    else navigate('/showroom');
  };

  // Colors & labels for strength levels
  const strengthColors = [
    'bg-red-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-400',
    'bg-green-500',
    'bg-green-500'
  ];
  const strengthLabels = [
    'Too weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very strong'
  ];

  return (
    <div className="
        flex min-h-screen w-full justify-center items-center
        bg-gradient-to-br from-blue-500 to-blue-200
        dark:from-gray-800 dark:to-gray-900
        relative overflow-hidden p-4
      ">
      {/* Background shapes */}
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
        {/* Logo/Home */}
        <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
          <Link to="/" className="flex items-center gap-1 text-3xl font-bold text-primary-600 dark:text-primary-400">
            <Car size={40} />
            <span>MekinaHub</span>
          </Link>
        </div>

        {/* Header */}
        <AnimatePresence mode="wait">
          {isSignUp ? (
            <motion.div
              key="signup-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
                Create an account
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
                Join the biggest car community with 3D showroom and marketplace
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="signin-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
                Welcome back
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
                Sign in to your AutoMarket account
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && <p className="text-red-500 mt-2 text-center">{errorMessage}</p>}

        {/* OAuth Buttons */}
        <motion.div
          className="grid grid-cols-2 gap-4 my-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white hover:bg-gray-800 shadow-md transition"
          >
            <Github size={20} />
            GitHub
          </button>
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-md transition"
          >
            {/* Google SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-800">Google</span>
          </button>
        </motion.div>

        {/* Divider */}
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or continue with</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {isSignUp ? (
            <motion.form
              key="form-signup"
              onSubmit={handleSubmitSignUp}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email-signup" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email-signup"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password + Strength */}
              <div className="space-y-2">
                <label htmlFor="password-signup" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Strength Bar */}
                <div className="h-2 w-full rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`${strengthColors[strength]} h-full`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {strengthLabels[strength]}
                </p>
              </div>

              <motion.button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Create Account <ArrowRight size={18} />
              </motion.button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={toggleMode} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="form-signin"
              onSubmit={handleSubmitSignIn}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email-signin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email-signin"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password-signin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password-signin"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <motion.button
                onClick={handleSubmitSignIn}
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In <ArrowRight size={18} />
              </motion.button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don’t have an account?{' '}
                <button onClick={toggleMode} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Sign Up
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;
