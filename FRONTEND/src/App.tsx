import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { Compass, BarChart3, History, Settings, Plus, LogOut, Sun, Moon, Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewTrip = React.lazy(() => import('./pages/NewTrip'));
const TripDetails = React.lazy(() => import('./pages/TripDetails'));
const HistoryPage = React.lazy(() => import('./pages/History'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const AuthPage = React.lazy(() => import('./pages/Auth'));
const SharedTripPage = React.lazy(() => import('./pages/SharedTrip'));
const ClientsPage = React.lazy(() => import('./pages/Clients'));

const RouteMetadataTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let description = "Plan itineraries, track carbon footprint, and analyze your travel habits with AI.";
    
    if (path === '/' || path === '') {
      description = "Advisor workspace for TripLens. Manage client travel, itineraries, streaks, and carbon footprint metrics.";
    } else if (path === '/new') {
      description = "Plan a new client travel itinerary. Configure styles, transport modes, and generate routes with AI.";
    } else if (path === '/clients') {
      description = "Manage traveler preferences, loyalty accounts, and passport credentials in your agency database.";
    } else if (path === '/history') {
      description = "Access past and archived travel itineraries planned on TripLens.";
    } else if (path === '/settings') {
      description = "Manage your agency workspace branding, colors, logo uploads, and plan billing.";
    } else if (path.startsWith('/trip/')) {
      description = "Customize itineraries, add activities, reorder days, and manage client feedback.";
    }
    
    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update Open Graph Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);
  }, [location]);

  return null;
};

const NavIcon = ({ to, Icon, title, exact = false }: { to: string; Icon: React.FC<any>; title: string; exact?: boolean }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }: { isActive: boolean }) =>
      `nav-link-icon group relative ${isActive ? 'nav-link-active' : ''}`
    }
  >
    {({ isActive }: { isActive: boolean }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full hidden md:block" />
        )}
        <Icon className="w-5 h-5" />
        <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 hidden md:block shadow-lg -translate-x-1 group-hover:translate-x-0">
          {title}
        </span>
      </>
    )}
  </NavLink>
);

interface AuthState {
  token: string | null;
  agency: { id: string; name: string; plan: string; logoUrl?: string; primaryColor?: string } | null;
}

const Sidebar = ({ onLogout, toggleTheme, isDark }: { onLogout: () => void, toggleTheme: () => void, isDark: boolean }) => (
  <nav className="fixed bottom-0 left-0 w-full h-16 md:h-full md:w-[68px] md:left-0 md:top-0 bg-card dark:bg-[#0a0f1a] border-t md:border-t-0 md:border-r border-slate-200 dark:border-white/[0.05] flex md:flex-col items-center py-2 md:py-6 justify-between gap-4 z-50">
    <Link
      to="/"
      className="hidden md:flex w-10 h-10 bg-primary text-white rounded-xl items-center justify-center hover:brightness-110 active:scale-95 transition-all duration-150 shadow-md shadow-primary/30 flex-shrink-0"
    >
      <Compass className="w-5 h-5" />
    </Link>

    <div className="flex md:flex-col items-center gap-1 md:gap-1.5 flex-1 md:flex-none justify-center w-full px-3 md:px-0">
      <NavIcon to="/" title="Dashboard" Icon={BarChart3} exact />
      <NavIcon to="/new" title="New Trip" Icon={Plus} />
      <NavIcon to="/clients" title="Clients" Icon={Users} />
      <NavIcon to="/history" title="Archive" Icon={History} />
      <NavIcon to="/settings" title="Settings" Icon={Settings} />
    </div>

    <div className="flex md:flex-col items-center gap-2 md:pb-2">
      <button
        onClick={toggleTheme}
        title={isDark ? 'Light Mode' : 'Dark Mode'}
        className="nav-link-icon group relative"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 hidden md:block shadow-lg -translate-x-1 group-hover:translate-x-0">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      </button>
      <button
        onClick={onLogout}
        title="Logout"
        className="nav-link-icon text-slate-400 hover:text-red-400 hover:bg-red-500/10 group relative"
      >
        <LogOut className="w-5 h-5" />
        <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 hidden md:block shadow-lg -translate-x-1 group-hover:translate-x-0">
          Logout
        </span>
      </button>
    </div>
  </nav>
);

const Loading = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin" />
    <span className="text-sm font-medium text-slate-500">Loading...</span>
  </div>
);

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, agency: null });
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const token = localStorage.getItem('token');
    const agency = localStorage.getItem('agency');
    if (token && agency) {
      setAuth({ token, agency: JSON.parse(agency) });
    }
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (loading) return <Loading />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agency');
    setAuth({ token: null, agency: null });
  };

  const handleUpdateAgency = (newAgency: any) => {
    setAuth(prev => ({ ...prev, agency: newAgency }));
    localStorage.setItem('agency', JSON.stringify(newAgency));
  };

  if (!auth.token) {
    return (
      <Router>
        <RouteMetadataTracker />
        <Routes>
          <Route path="/shared/:id" element={<React.Suspense fallback={<Loading />}><SharedTripPage /></React.Suspense>} />
          <Route path="*" element={<AuthPage onSuccess={(token, agency) => {
            setAuth({ token, agency });
            localStorage.setItem('token', token);
            localStorage.setItem('agency', JSON.stringify(agency));
          }} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <RouteMetadataTracker />
      <div className="flex min-h-screen bg-surface font-body text-slate-900 dark:text-white selection:bg-primary selection:text-white transition-colors duration-300">
        <Sidebar onLogout={handleLogout} toggleTheme={toggleTheme} isDark={isDark} />

        <main className="flex-1 md:ml-[68px] p-4 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
          <React.Suspense fallback={<Loading />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard token={auth.token!} />} />
                <Route path="/new" element={<NewTrip token={auth.token!} agency={auth.agency} />} />
                <Route path="/trip/:id" element={<TripDetails token={auth.token!} />} />
                <Route path="/shared/:id" element={<SharedTripPage />} />
                <Route path="/clients" element={<ClientsPage token={auth.token!} agency={auth.agency} />} />
                <Route path="/history" element={<HistoryPage token={auth.token!} />} />
                <Route path="/settings" element={<SettingsPage agency={auth.agency} onUpdateAgency={handleUpdateAgency} />} />
              </Routes>
            </AnimatePresence>
          </React.Suspense>
        </main>
      </div>
    </Router>
  );
}
