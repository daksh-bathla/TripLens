import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Car, MapPin, TrendingUp, Leaf, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ label, value, icon: Icon }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="premium-card p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-lg border border-slate-200 dark:border-white/10">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  </motion.div>
);

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300',
  proposed: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  confirmed: 'bg-emerald-500/20 text-emerald-300',
};

const TripRow = ({ trip }: any) => (
  <Link to={`/trip/${trip._id}`} className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/[0.06] last:border-0">
    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors flex-shrink-0">
      {trip.mode === 'Flight' ? <Plane className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> :
       trip.mode === 'Train' ? <Train className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> :
       <Car className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{trip.source} → {trip.destination}</h4>
      </div>
      <p className="text-sm text-slate-500 truncate">{trip.clientName || 'No client'} · {trip.days}d</p>
    </div>
    <div className="hidden md:flex items-center gap-4 flex-shrink-0">
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[trip.status] || STATUS_COLORS.draft}`}>
        {trip.status || 'draft'}
      </span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{(trip.budget || 0).toLocaleString()}</span>
      <span className="text-xs text-slate-500">{trip.carbon} kg CO₂</span>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Total Trips" value={stats.total} icon={MapPin} />
        <StatCard label="Carbon Footprint" value={`${stats.carbon} kg`} icon={Leaf} />
        <StatCard label="Total Budget" value={`₹${(stats.budget/100000).toFixed(1)}L`} icon={TrendingUp} />
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
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/10">
                <MapPin className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">No trips yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Start exploring the world by planning your first journey.</p>
              <Link to="/new" className="premium-button inline-flex">
                <Plus className="w-4 h-4" /> Plan a Trip
              </Link>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
