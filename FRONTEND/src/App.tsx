import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Compass, BarChart3, History, Settings, Plus, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load pages for performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewTrip = React.lazy(() => import('./pages/NewTrip'));
const TripDetails = React.lazy(() => import('./pages/TripDetails'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const HistoryPage = React.lazy(() => import('./pages/History'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));

const Sidebar = () => (
  <nav className="fixed bottom-0 left-0 w-full h-20 md:h-full md:w-20 md:left-0 md:top-0 glass-card border-t md:border-t-0 md:border-l-0 flex md:flex-col items-center py-4 md:py-10 justify-around md:justify-start gap-4 md:gap-10 z-50">
    <Link to="/" className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
      <Compass className="w-5 h-5 md:w-6 md:h-6" />
    </Link>
    
    <div className="flex md:flex-col items-center gap-6 md:gap-6 flex-1 md:flex-initial justify-center">
      <NavLink to="/" title="Dashboard" className={({ isActive }: { isActive: boolean }) => `nav-link-icon ${isActive ? 'text-primary bg-primary/10 border-primary/20' : ''}`}><BarChart3 className="w-5 h-5" /></NavLink>
      <NavLink to="/new" title="New Trip" className={({ isActive }: { isActive: boolean }) => `nav-link-icon ${isActive ? 'text-primary bg-primary/10 border-primary/20' : 'bg-primary/20 text-primary p-3 rounded-xl'}`}><Plus className="w-5 h-5" /></NavLink>
      <NavLink to="/history" title="History" className={({ isActive }: { isActive: boolean }) => `nav-link-icon ${isActive ? 'text-primary bg-primary/10 border-primary/20' : ''}`}><History className="w-5 h-5" /></NavLink>
      <NavLink to="/settings" title="Settings" className={({ isActive }: { isActive: boolean }) => `nav-link-icon ${isActive ? 'text-primary bg-primary/10 border-primary/20' : ''}`}><Settings className="w-5 h-5" /></NavLink>
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
        
        <main className="flex-1 md:ml-20 p-4 md:p-8 pb-32 md:pb-8 relative z-10">
          <React.Suspense fallback={<Loading />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new" element={<NewTrip />} />
                <Route path="/trip/:id" element={<TripDetails />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AnimatePresence>
          </React.Suspense>
        </main>
      </div>
    </Router>
  );
}
