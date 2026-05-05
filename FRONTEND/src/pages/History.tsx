import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Filter, Plane, Train, Car, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(`/api/trips?userId=daksh_1`);
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2 block">Mission_Logs // Archives</span>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase">JOURNEY_HISTORY</h1>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
             <input 
               placeholder="SEARCH_LOGS_..." 
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
             />
          </div>
          <button className="glass-card p-3 rounded-xl border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="glass-card rounded-[40px] overflow-hidden">
        <div className="bg-white/5 p-6 border-b border-white/10 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
           <div className="col-span-1">ICON</div>
           <div className="col-span-5">DESTINATION</div>
           <div className="col-span-2">BUDGET</div>
           <div className="col-span-2 text-center">CARBON</div>
           <div className="col-span-2 text-right">DATE</div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-20 text-center text-white/20 uppercase font-black tracking-widest animate-pulse">Syncing_Records...</div>
          ) : trips.length > 0 ? (
            trips.map((trip: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={trip._id}
              >
                <Link to={`/trip/${trip._id}`} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-all group">
                   <div className="col-span-1">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                        {trip.mode === 'Flight' ? <Plane className="w-4 h-4 text-white/40 group-hover:text-primary" /> : 
                         trip.mode === 'Train' ? <Train className="w-4 h-4 text-white/40 group-hover:text-primary" /> : 
                         <Car className="w-4 h-4 text-white/40 group-hover:text-primary" />}
                      </div>
                   </div>
                   <div className="col-span-5 flex flex-col gap-1">
                      <h4 className="text-sm font-bold uppercase tracking-tight">{trip.destination}</h4>
                      <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest flex items-center gap-2 italic">
                        <MapPin className="w-2.5 h-2.5" /> {trip.source}
                      </p>
                   </div>
                   <div className="col-span-2">
                      <span className="text-xs font-bold font-mono">₹{trip.budget?.toLocaleString()}</span>
                   </div>
                   <div className="col-span-2 text-center">
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full uppercase tracking-tighter">{trip.carbon}kg</span>
                   </div>
                   <div className="col-span-2 text-right">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{new Date(trip.createdAt).toLocaleDateString()}</span>
                   </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="p-40 text-center">
               <HistoryIcon className="w-12 h-12 text-white/5 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Empty_Archive // Start_New_Journey</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
