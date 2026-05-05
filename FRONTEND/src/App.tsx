import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Compass, BarChart3, History, Settings, Plus, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load pages for performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewTrip = React.lazy(() => import('./pages/NewTrip'));
const TripDetails = React.lazy(() => import('./pages/TripDetails'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

const Sidebar = () => (
  <nav className="fixed left-0 top-0 h-full w-20 glass-card border-l-0 flex flex-col items-center py-10 gap-10 z-50">
    <Link to="/" className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
      <Compass className="w-6 h-6" />
    </Link>
    
    <div className="flex-1 flex flex-col gap-6">
      <Link to="/" title="Dashboard" className="nav-link-icon"><BarChart3 className="w-5 h-5" /></Link>
      <Link to="/new" title="New Trip" className="nav-link-icon bg-primary/20 text-primary p-3 rounded-xl"><Plus className="w-5 h-5" /></Link>
      <Link to="/history" title="History" className="nav-link-icon"><History className="w-5 h-5" /></Link>
      <Link to="/settings" title="Settings" className="nav-link-icon"><Settings className="w-5 h-5" /></Link>
    </div>
  </nav>
);

const Loading = () => (
  <div className="flex items-center justify-center h-screen bg-surface">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-surface gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none"></div>
        <Sidebar />
        
        <main className="flex-1 ml-20 p-8 relative z-10">
          <React.Suspense fallback={<Loading />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new" element={<NewTrip />} />
                <Route path="/trip/:id" element={<TripDetails />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </AnimatePresence>
          </React.Suspense>
        </main>
      </div>
    </Router>
  );
}
