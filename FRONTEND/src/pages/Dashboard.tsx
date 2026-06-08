import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Car, Calendar, MapPin, TrendingUp, Leaf, Sparkles, ArrowRight, Plus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Globe from '../components/Globe';

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="premium-card p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  </motion.div>
);

const TripRow = ({ trip }: any) => (
  <Link to={`/trip/${trip._id}`} className="group flex items-center gap-6 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 rounded-xl">
    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-slate-300 transition-colors">
      {trip.mode === 'Flight' ? <Plane className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" /> :
       trip.mode === 'Train' ? <Train className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" /> :
       <Car className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-bold text-slate-900 text-lg tracking-tight">{trip.destination}</h4>
        <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full uppercase tracking-widest">
          ID: {trip.userId?.slice(0, 4) || 'GUEST'}
        </span>
      </div>
      <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {trip.source} &rarr; {trip.destination}
      </p>
    </div>
    <div className="text-right hidden md:block px-6">
      <p className="text-lg font-bold text-slate-900">₹{(trip.budget || 0).toLocaleString()}</p>
      <p className="text-xs text-slate-500 font-bold flex items-center justify-end gap-1 mt-0.5">
        <Leaf className="w-3 h-3 text-emerald-500" /> {(trip.carbon || 0)} kg CO₂
      </p>
    </div>
    <div className="p-2 text-slate-300 group-hover:text-primary group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300">
      <ArrowRight className="w-5 h-5" />
    </div>
  </Link>
);

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({ total: 0, year: 0, carbon: 0, budget: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = "daksh_1"; 
        const res = await fetch(`/api/trips?userId=${userId}`);
        const data = await res.json();
        setTrips(data);
        
        const total = data.length;
        const year = data.filter((t: any) => new Date(t.createdAt).getFullYear() === 2026).length;
        const carbon = data.reduce((acc: number, t: any) => acc + (t.carbon || 0), 0);
        const budget = data.reduce((acc: number, t: any) => acc + (t.budget || 0), 0);
        setStats({ total, year, carbon, budget });
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

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
            <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Overview</span>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900 mb-1">
            Welcome back, Traveler
          </h1>
          <p className="text-slate-500 font-medium">Your trips, insights, and global footprint.</p>
        </div>
        <Link to="/new" className="premium-button">
          <Plus className="w-5 h-5" /> 
          <span>Plan New Trip</span>
        </Link>
      </header>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Trips" value={stats.total} icon={MapPin} trend="+12%" />
        <StatCard label="Trips This Year" value={stats.year} icon={Calendar} trend="+24%" />
        <StatCard label="Carbon Footprint" value={`${stats.carbon} kg`} icon={Leaf} trend="-5%" />
        <StatCard label="Total Spent" value={`₹${(stats.budget/1000).toFixed(1)}k`} icon={TrendingUp} trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
               Recent Trips
            </h2>
            <Link to="/history" className="text-sm font-bold text-primary hover:text-slate-800 transition-colors tracking-wide">
              VIEW ALL &rarr;
            </Link>
          </div>
          
          <div className="premium-card p-2">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Syncing Data...</p>
              </div>
            ) : trips.length > 0 ? (
              <div className="flex flex-col gap-1">
                {trips.slice(0, 5).map((trip: any) => <TripRow key={trip._id} trip={trip} />)}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No trips yet</h3>
                <p className="text-slate-500 mb-8 font-medium">Start exploring the world by planning your first journey.</p>
                <Link to="/new" className="premium-button inline-flex">
                  <Plus className="w-4 h-4" /> Plan a Trip
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="premium-card p-6 bg-slate-900 text-white border-0 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-[10px] tracking-[0.2em] uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" /> AI Insight
              </div>
              <p className="text-lg font-medium leading-relaxed mb-6 text-slate-100">
                You frequently travel to high-altitude destinations. Consider reviewing our optimized flight paths for Udaipur.
              </p>
              <button className="flex items-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors group/btn">
                View Recommendations <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-wide uppercase">
              <Activity className="w-4 h-4 text-slate-400" /> System Status
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Data Sync', value: 'Updated just now', progress: '100%' },
                { label: 'Carbon API', value: 'Connected', progress: '100%' },
                { label: 'Cloud Storage', value: '45% used', progress: '45%' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500">{m.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{m.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: m.progress }}
                      transition={{ duration: 1 }}
                      className="h-full bg-slate-300 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12">
        <Globe />
      </div>
    </motion.div>
  );
}
