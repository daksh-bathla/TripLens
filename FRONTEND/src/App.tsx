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
    <div className="relative z-10">
      <Icon className="w-6 h-6 transition-all duration-500 group-hover:text-primary group-hover:scale-110" />
      <div className="absolute -inset-4 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
       <div className="absolute top-0 right-0 w-1 h-1 bg-primary/40" />
       <div className="absolute bottom-0 left-0 w-1 h-1 bg-primary/40" />
    </div>
  </NavLink>
);

const Sidebar = () => (
  <nav className="fixed bottom-0 left-0 w-full h-20 md:h-full md:w-20 md:left-0 md:top-0 bg-card/80 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center py-4 md:py-10 justify-around md:justify-start gap-4 md:gap-12 z-50">
    <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-primary/10" />
    
    <Link to="/" className="relative group mb-8">
      <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full scale-150" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="w-14 h-14 border border-primary/30 flex items-center justify-center text-primary relative z-10 group-hover:border-primary group-hover:bg-primary group-hover:text-black transition-all duration-700"
      >
        <Compass className="w-8 h-8" />
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </Link>
    
    <div className="flex md:flex-col items-center gap-4 md:gap-10 flex-1 md:flex-initial justify-center">
      <NavIcon to="/" title="Dashboard" Icon={BarChart3} />
      <NavIcon to="/new" title="New Mission" Icon={Plus} />
      <NavIcon to="/history" title="Archive" Icon={History} />
      <NavIcon to="/settings" title="System" Icon={Settings} />
    </div>

    <div className="hidden md:flex mt-auto flex-col items-center gap-6 opacity-20 hover:opacity-100 transition-opacity pb-8">
       <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary to-transparent" />
       <span className="text-[8px] font-black uppercase tracking-[0.5em] [writing-mode:vertical-lr] rotate-180">TRIPLENS_OS_V4.0</span>
    </div>
  </nav>
);

const BootSequence = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 1, delay: 2.5, ease: "easeInOut" }}
    onAnimationComplete={() => document.body.style.overflow = 'auto'}
    className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center pointer-events-none"
  >
    <div className="relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "300px" }}
        transition={{ duration: 2, ease: "circIn" }}
        className="h-px bg-primary relative"
      >
        <div className="absolute -top-8 left-0 text-[10px] font-black uppercase tracking-[0.5em] text-primary">INITIALIZING_MISSION_PROTOCOL</div>
        <div className="absolute -bottom-8 right-0 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">TRIPLENS_QUANTUM_CORE</div>
      </motion.div>
      <motion.div 
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.1, repeat: 20 }}
        className="absolute inset-0 bg-primary/20 blur-3xl"
      />
    </div>
  </motion.div>
);

const Loading = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
    <div className="w-12 h-12 border border-primary/20 flex items-center justify-center relative">
       <div className="w-2 h-2 bg-primary animate-ping" />
       <div className="absolute inset-0 border border-primary animate-pulse" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">SYNCING_DATA_STREAM...</span>
  </div>
);

export default function App() {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-surface gradient-bg relative overflow-hidden font-body selection:bg-primary selection:text-black">
        <BootSequence />
        <div className="absolute inset-0 noise pointer-events-none opacity-[0.03]"></div>
        <Sidebar />
        
        <main className="flex-1 md:ml-20 p-4 md:p-12 pb-32 md:pb-12 relative z-10">
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
