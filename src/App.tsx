import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Showroom from './pages/Showroom';
import Compare from './pages/Compare';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import DealerDashboard from './pages/DealerDashboard';
import DealerAnalytics from './pages/DealerAnalytics';


import Confirmation from './pages/confirmation';
import CheckEmail from './pages/check _email';
import AuthCallback from './components/AuthCallback';
import Auth from './pages/Auth';


function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/showroom" element={<Showroom />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/dealerdashboard" element={<DealerDashboard />} />
          <Route path="/dealeranalytics" element={<DealerAnalytics />} />
      </Route>
      <Route path="/auth" element={<Auth />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/checkemail" element={<CheckEmail />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;