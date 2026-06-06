import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Compass, BarChart3, History, Settings, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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
    className={({ isActive }: { isActive: boolean }) =>
      `nav-link-icon ${isActive ? 'nav-link-active' : ''}`
    }
  >
    <Icon className="w-5 h-5" />
  </NavLink>
);

const Sidebar = () => (
  <nav className="fixed bottom-0 left-0 w-full h-16 md:h-full md:w-20 md:left-0 md:top-0 bg-white border-t md:border-t-0 md:border-r border-slate-200 flex md:flex-col items-center py-2 md:py-8 justify-around md:justify-start gap-4 z-50 shadow-sm">
    <Link to="/" className="hidden md:flex mb-8 w-10 h-10 bg-primary text-white rounded-xl items-center justify-center hover:bg-slate-800 transition-colors">
      <Compass className="w-6 h-6" />
    </Link>
    
    <div className="flex md:flex-col items-center gap-2 md:gap-4 flex-1 md:flex-initial justify-center w-full px-4 md:px-0">
      <NavIcon to="/" title="Dashboard" Icon={BarChart3} />
      <NavIcon to="/new" title="New Trip" Icon={Plus} />
      <NavIcon to="/history" title="Archive" Icon={History} />
      <NavIcon to="/settings" title="Settings" Icon={Settings} />
    </div>
  </nav>
);

const Loading = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
    <span className="text-sm font-medium text-slate-500">Loading...</span>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-surface font-body text-slate-800 selection:bg-accent selection:text-white">
        <Sidebar />
        
        <main className="flex-1 md:ml-20 p-4 md:p-12 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
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
