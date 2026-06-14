import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Compass, BarChart3, History, Settings, Plus, LogOut } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewTrip = React.lazy(() => import('./pages/NewTrip'));
const TripDetails = React.lazy(() => import('./pages/TripDetails'));
const HistoryPage = React.lazy(() => import('./pages/History'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const AuthPage = React.lazy(() => import('./pages/Auth'));

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

interface AuthState {
  token: string | null;
  agency: { id: string; name: string; plan: string } | null;
}

const Sidebar = ({ onLogout }: { onLogout: () => void }) => (
  <nav className="fixed bottom-0 left-0 w-full h-16 md:h-full md:w-20 md:left-0 md:top-0 bg-surface border-t md:border-t-0 md:border-r border-white/10 flex md:flex-col items-center py-2 md:py-8 justify-between md:justify-between gap-4 z-50">
    <Link to="/" className="hidden md:flex w-10 h-10 bg-primary text-white rounded-xl items-center justify-center hover:bg-primary/90 transition-colors">
      <Compass className="w-6 h-6" />
    </Link>

    <div className="flex md:flex-col items-center gap-2 md:gap-4 flex-1 md:flex-none justify-center w-full px-4 md:px-0">
      <NavIcon to="/" title="Dashboard" Icon={BarChart3} />
      <NavIcon to="/new" title="New Trip" Icon={Plus} />
      <NavIcon to="/history" title="Archive" Icon={History} />
      <NavIcon to="/settings" title="Settings" Icon={Settings} />
    </div>

    <button onClick={onLogout} title="Logout" className="nav-link-icon text-red-400 hover:text-red-300 hover:bg-red-500/10">
      <LogOut className="w-5 h-5" />
    </button>
  </nav>
);

const Loading = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
    <span className="text-sm font-medium text-slate-500">Loading...</span>
  </div>
);

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, agency: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const agency = localStorage.getItem('agency');
    if (token && agency) {
      setAuth({ token, agency: JSON.parse(agency) });
    }
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agency');
    setAuth({ token: null, agency: null });
  };

  if (!auth.token) {
    return (
      <Router>
        <Routes>
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
      <div className="flex min-h-screen bg-surface font-body text-white selection:bg-primary selection:text-white">
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1 md:ml-20 p-4 md:p-12 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
          <React.Suspense fallback={<Loading />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard token={auth.token!} />} />
                <Route path="/new" element={<NewTrip token={auth.token!} />} />
                <Route path="/trip/:id" element={<TripDetails token={auth.token!} />} />
                <Route path="/history" element={<HistoryPage token={auth.token!} />} />
                <Route path="/settings" element={<SettingsPage agency={auth.agency} />} />
              </Routes>
            </AnimatePresence>
          </React.Suspense>
        </main>
      </div>
    </Router>
  );
}
