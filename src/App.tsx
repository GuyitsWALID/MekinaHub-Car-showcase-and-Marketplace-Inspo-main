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
          <Route path="/dealer-dashboard" element={<DealerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;