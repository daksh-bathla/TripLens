import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Car, Calendar, MapPin, TrendingUp, Leaf, Sparkles, ArrowRight, Plus, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 rounded-3xl flex flex-col gap-4 group hover:bg-white/10 transition-all cursor-default"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-display font-black">{value}</h3>
    </div>
  </motion.div>
);

const TripRow = ({ trip }: any) => (
  <Link to={`/trip/${trip._id}`} className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
      {trip.mode === 'Flight' ? <Plane className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" /> :
       trip.mode === 'Train' ? <Train className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" /> :
       <Car className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-bold text-lg">{trip.destination}</h4>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 font-mono uppercase tracking-tighter">
          {trip.userId?.slice(0, 4) || 'GUEST'}
        </span>
      </div>
      <p className="text-white/40 text-xs font-medium flex items-center gap-2 italic uppercase tracking-wider">
        <MapPin className="w-3 h-3" /> {trip.source} &rarr; {trip.destination}
      </p>
    </div>
    <div className="text-right hidden md:block">
      <p className="text-white font-bold text-sm">₹{(trip.budget || 0).toLocaleString()}</p>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
        <Leaf className="w-3 h-3 text-green-500" /> {(trip.carbon || 0)}kg CO2
      </p>
    </div>
    <div className="p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
      <ArrowRight className="w-5 h-5 text-primary" />
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
        const userId = "daksh_1"; // Mock userId for now
        const res = await fetch(`/api/trips?userId=${userId}`);
        const data = await res.json();
        setTrips(data);
        
        // Compute stats
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto py-10"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2 block"
          >
            System_Initialized // TripLens_v2.0
          </motion.span>
          <h1 className="text-5xl font-display font-black tracking-tighter leading-none uppercase">
            Travel_Intelligence
          </h1>
        </div>
        <Link to="/new" className="glass-button bg-primary/20 text-primary border-primary/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Plus className="w-5 h-5" /> START_NEW_PLAN
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Trips" value={stats.total} icon={MapPin} trend="+12%" />
        <StatCard label="2026 Activity" value={stats.year} icon={Calendar} trend="+25%" />
        <StatCard label="Carbon Footprint" value={`${stats.carbon}kg`} icon={Leaf} trend="-5%" />
        <StatCard label="Travel Spending" value={`₹${(stats.budget/1000).toFixed(1)}k`} icon={TrendingUp} trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 glass-card p-8 rounded-[40px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold font-display uppercase tracking-tight flex items-center gap-3">
              <History className="w-5 h-5 text-primary" /> RECENT_JOURNEYS
            </h2>
            <Link to="/history" className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              VIEW_ALL_LOGS &rarr;
            </Link>
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <div className="p-20 text-center text-white/20 font-bold uppercase tracking-widest animate-pulse">Syncing_Records...</div>
            ) : trips.length > 0 ? (
              trips.slice(0, 5).map((trip: any) => <TripRow key={trip._id} trip={trip} />)
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <Sparkles className="w-10 h-10 text-white/10 mx-auto mb-4" />
                <p className="text-white/20 font-bold uppercase tracking-widest">No active mission logs. Start your first journey.</p>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8 rounded-[40px] bg-primary/5 border-primary/20 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/40 transition-all"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight mb-3 uppercase">AI_INTEL_REPORT</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 italic">
                "Your travel habits suggest a preference for luxury domestic flights. Next suggested mission: Udaipur for cultural depth."
              </p>
              <button className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                REQUEST_DEEP_ANALYSIS <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[40px]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-40">System_Metrics</h3>
            <div className="space-y-6">
              {[
                { label: 'AI Stability', value: '98.2%', color: 'bg-green-400' },
                { label: 'Sync Status', value: 'NOMINAL', color: 'bg-primary' },
                { label: 'DB Integrity', value: 'SECURED', color: 'bg-primary' },
              ].map((m: { label: string; value: string; color: string }) => (
                <div key={m.label} className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{m.label}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${m.color.replace('bg-', 'text-')}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
