import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Car, MapPin, TrendingUp, Leaf, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ label, value, icon: Icon, colorClass, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, ease: 'easeOut', delay }}
    className="premium-card p-6 group"
  >
    <div className="flex justify-between items-start mb-5">
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-2">{label}</p>
    </div>
  </motion.div>
);

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.05]',
  proposed: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10',
  confirmed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-500/10',
};

const TripRow = ({ trip }: any) => (
  <Link to={`/trip/${trip._id}`} className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/[0.04] last:border-0">
    <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center border border-slate-150 dark:border-white/[0.05] group-hover:border-primary/20 dark:group-hover:border-primary/20 transition-colors flex-shrink-0">
      {trip.mode === 'Flight' ? <Plane className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> :
       trip.mode === 'Train' ? <Train className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> :
       <Car className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{trip.source} → {trip.destination}</h4>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{trip.clientName || 'No client'} · {trip.days}d</p>
    </div>
    <div className="hidden md:flex items-center gap-4 flex-shrink-0">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${STATUS_COLORS[trip.status] || STATUS_COLORS.draft}`}>
        {trip.status || 'draft'}
      </span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-350 w-24 text-right">₹{(trip.budget || 0).toLocaleString()}</span>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-20 text-right">{trip.carbon} kg CO₂</span>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
  </Link>
);

interface DashboardProps {
  token: string;
}

export default function Dashboard({ token }: DashboardProps) {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({ total: 0, carbon: 0, budget: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Advisor Workspace | TripLens';
    const fetchTrips = async () => {
      try {
        const res = await axios.get('/api/trips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setTrips(data);

        const total = data.length;
        const carbon = data.reduce((acc: number, t: any) => acc + (t.carbon || 0), 0);
        const budget = data.reduce((acc: number, t: any) => acc + (t.budget || 0), 0);
        setStats({ total, carbon, budget });
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [token]);

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('hideOnboardingBanner');
    if (!hidden) {
      setShowBanner(true);
    }
  }, []);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('hideOnboardingBanner', 'true');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-6xl mx-auto py-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Dashboard</span>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Trip Management
          </h1>
          <p className="text-slate-400 font-medium">Manage client trips and carbon tracking.</p>
        </div>
        <Link to="/new" className="premium-button">
          <Plus className="w-5 h-5" />
          <span>Plan New Trip</span>
        </Link>
      </header>

      {showBanner && (
        <div className="mb-10 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white rounded-2xl p-6 border border-slate-200 dark:border-white/[0.05] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-2 z-10 flex-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-[#c5a880]/20 bg-[#c5a880]/5 text-[#c5a880] inline-block">
              Advisor Guide
            </span>
            <h2 className="text-lg font-bold tracking-tight">Explore how modern agencies use TripLens</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-2xl leading-relaxed">
              Welcome to your workspace. We’ve seeded a premium Amalfi Coast showcase trip complete with client change requests, pre-saved templates, and traveler profiles. Use this seeded content as your demo sandbox.
            </p>
          </div>
          <div className="flex items-center gap-2.5 z-10 flex-shrink-0">
            {trips.some((t: any) => t.destination?.toLowerCase().includes('amalfi')) ? (
              <Link
                to={`/trip/${(trips.find((t: any) => t.destination?.toLowerCase().includes('amalfi')) as any)?._id}`}
                className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1"
              >
                <span>Launch Demo Tour</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : null}
            <button
              onClick={handleDismissBanner}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold transition-all px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.03]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Total Trips" value={stats.total} icon={MapPin} colorClass="stat-card-blue" delay={0} />
        <StatCard label="Carbon Footprint" value={`${stats.carbon} kg`} icon={Leaf} colorClass="stat-card-green" delay={0.05} />
        <StatCard label="Total Budget" value={`₹${(stats.budget/100000).toFixed(1)}L`} icon={TrendingUp} colorClass="stat-card-amber" delay={0.1} />
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Recent Trips
          </h2>
          <Link to="/history" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors tracking-wide">
            VIEW ALL &rarr;
          </Link>
        </div>

        <div className="premium-card p-2">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Syncing Data...</p>
            </div>
          ) : trips.length > 0 ? (
            <div className="flex flex-col gap-1">
              {trips.slice(0, 5).map((trip: any) => <TripRow key={trip._id} trip={trip} />)}
            </div>
          ) : (
            <div className="p-16 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-slate-50 dark:bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 dark:border-white/[0.08]">
                <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No active itineraries</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Start crafting tailored, high-end travel experiences by creating your first client trip.</p>
              <Link to="/new" className="premium-button inline-flex text-xs font-semibold py-2.5 px-5">
                <Plus className="w-4 h-4" /> Plan a Trip
              </Link>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
