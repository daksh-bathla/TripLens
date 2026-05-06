import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Car, Calendar, MapPin, TrendingUp, Leaf, Sparkles, ArrowRight, Plus, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass-card p-8 group hover:border-primary/40 transition-all cursor-default"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1 uppercase tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <h3 className="text-4xl font-display leading-none">{value}</h3>
    </div>
  </motion.div>
);

const TripRow = ({ trip }: any) => (
  <Link to={`/trip/${trip._id}`} className="group flex items-center gap-8 p-6 hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
    <div className="relative w-16 h-16 bg-card flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      {trip.mode === 'Flight' ? <Plane className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors z-10" /> :
       trip.mode === 'Train' ? <Train className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors z-10" /> :
       <Car className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors z-10" />}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="font-display text-2xl uppercase tracking-tight">{trip.destination}</h4>
        <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-primary/20 transition-colors" />
        <span className="text-[10px] text-accent/60 font-black uppercase tracking-widest italic">
          #{trip.userId?.slice(0, 4) || 'GUEST'}
        </span>
      </div>
      <p className="text-white/30 text-xs font-medium flex items-center gap-2 uppercase tracking-[0.15em] font-body">
        <MapPin className="w-3 h-3 text-primary" /> {trip.source} <span className="text-primary/40">&mdash;</span> {trip.destination}
      </p>
    </div>
    <div className="text-right hidden md:block px-8 border-l border-white/5">
      <p className="text-white font-display text-2xl uppercase">₹{(trip.budget || 0).toLocaleString()}</p>
      <p className="text-accent text-[10px] font-black uppercase tracking-widest mt-1">
        {(trip.carbon || 0)}KG_EMISSIONS
      </p>
    </div>
    <div className="p-3 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto py-12 px-4"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/20" />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-primary font-black text-xs uppercase tracking-[0.4em]">
              Operational_Interface // V4.0
            </span>
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-display leading-[0.85] uppercase -ml-1">
            Trip_Lens<br />
            <span className="text-primary italic">Intelligence</span>
          </h1>
        </div>
        <Link to="/new" className="glass-button group">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> 
          <span>PLAN_NEW_EXPEDITION</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        <StatCard label="Completed_Expeditions" value={stats.total} icon={MapPin} trend="+12.4%" />
        <StatCard label="Current_Year_Velocity" value={stats.year} icon={Calendar} trend="+24.8%" />
        <StatCard label="Carbon_Environmental_Impact" value={`${stats.carbon}KG`} icon={Leaf} trend="-5.2%" />
        <StatCard label="Total_Resource_Allocation" value={`₹${(stats.budget/1000).toFixed(1)}K`} icon={TrendingUp} trend="+8.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-8">
          <div className="flex justify-between items-end mb-10 pb-4 border-b border-white/10">
            <h2 className="text-3xl font-display uppercase flex items-center gap-4">
              <History className="w-7 h-7 text-primary" /> MISSION_HISTORY
            </h2>
            <Link to="/history" className="text-accent text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors pb-1">
              ARCHIVE_DATABASE &rarr;
            </Link>
          </div>
          
          <div className="glass-card divide-y divide-white/5">
            {loading ? (
              <div className="p-24 text-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent animate-spin mx-auto mb-6" />
                <p className="text-primary font-black text-xs uppercase tracking-[0.3em]">Querying_Neural_Grid...</p>
              </div>
            ) : trips.length > 0 ? (
              trips.slice(0, 5).map((trip: any) => <TripRow key={trip._id} trip={trip} />)
            ) : (
              <div className="p-32 text-center">
                <Sparkles className="w-16 h-16 text-white/5 mx-auto mb-8" />
                <p className="text-white/20 font-black text-xs uppercase tracking-[0.4em]">Grid_is_Empty. Initialize_Mission_Ready.</p>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-4 space-y-10">
          <div className="glass-card p-10 bg-primary/5 border-primary/20 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-8">AI_LENS_INSIGHT</div>
              <p className="text-2xl font-display uppercase leading-tight mb-8">
                "HABIT_ANALYSIS: HIGH_ALTITUDE_PREFERENCE DETECTED. OPTIMIZING_UDAIPUR_FLIGHT_LOGS."
              </p>
              <div className="h-[1px] w-full bg-primary/20 mb-8" />
              <button className="flex items-center gap-3 text-accent font-black text-[10px] uppercase tracking-widest group/btn">
                EXECUTE_DEEP_SYNC <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          <div className="glass-card p-10 border-white/5">
            <h3 className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-10">SYS_TELEMETRY</h3>
            <div className="space-y-8">
              {[
                { label: 'Core_Processing', value: '98.2%', status: 'OPTIMAL' },
                { label: 'Sat_Link_Stability', value: 'NOMINAL', status: 'STABLE' },
                { label: 'Crypt_Security', value: 'ACTIVE', status: 'SECURE' },
              ].map((m: { label: string; value: string; status: string }) => (
                <div key={m.label} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{m.label}</span>
                    <span className="text-primary font-black text-[10px] uppercase">{m.value}</span>
                  </div>
                  <div className="h-1 bg-white/5 w-full relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="absolute inset-0 bg-primary/40"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
