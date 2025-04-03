
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuth = async () => {
      // Supabase automatically handles the URL parameters (including access_token) in the callback URL
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('OAuth error:', error.message);
        navigate('/signin'); // Redirect back to sign in if there's an error
      } else if (data.session) {
        // Redirect to your desired route (for example, showroom or dashboard)
        navigate('/showroom');
      } else {
        // If no session, redirect back to sign in
        navigate('/signin');
      }
    };
    processOAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Processing your sign-in...</p>
    </div>
  );
};

export default AuthCallback;
