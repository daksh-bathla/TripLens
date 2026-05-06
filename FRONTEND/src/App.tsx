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

const NavIcon = ({ to, Icon, title }: { to: string; Icon: React.FC<any>; title: string }) => (
  <NavLink
    to={to}
    title={title}
    className={({ isActive }) =>
      `nav-link-icon group ${isActive ? 'nav-link-active' : ''}`
    }
  >
    <div className="relative">
      <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
      <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </NavLink>
);

const Sidebar = () => (
  <nav className="fixed bottom-0 left-0 w-full h-20 md:h-full md:w-20 md:left-0 md:top-0 glass-card border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center py-4 md:py-10 justify-around md:justify-start gap-4 md:gap-10 z-50">
    <Link to="/" className="relative group mb-4">
      <div className="absolute inset-0 bg-primary/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 bg-primary flex items-center justify-center text-white relative z-10"
      >
        <Compass className="w-7 h-7" />
      </motion.div>
    </Link>
    
    <div className="flex md:flex-col items-center gap-2 md:gap-4 flex-1 md:flex-initial justify-center">
      <NavIcon to="/" title="Dashboard" Icon={BarChart3} />
      <NavIcon to="/new" title="New Trip" Icon={Plus} />
      <NavIcon to="/history" title="History" Icon={History} />
      <NavIcon to="/settings" title="Settings" Icon={Settings} />
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
