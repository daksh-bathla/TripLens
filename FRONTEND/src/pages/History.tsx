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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-12 px-4 space-y-16"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/20" />
          <span className="text-primary font-black text-xs uppercase tracking-[0.4em] mb-4 block">Archive_Management // Historical_Logs</span>
          <h1 className="text-7xl font-display uppercase leading-none">Mission_Archive</h1>
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
             <input 
               placeholder="QUERY_HISTORY_DATABASE..." 
               className="w-full bg-card border border-white/10 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all text-white placeholder:text-white/10"
             />
          </div>
          <button className="bg-card border border-white/10 p-4 hover:border-primary transition-all text-white/40 hover:text-primary">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="glass-card overflow-hidden">
        <div className="bg-primary/5 p-8 border-b border-white/10 grid grid-cols-12 gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary">
           <div className="col-span-1">TAG</div>
           <div className="col-span-5">DESTINATION_OBJECTIVE</div>
           <div className="col-span-2">RESOURCE_VALUE</div>
           <div className="col-span-2 text-center">EMISSIONS_KG</div>
           <div className="col-span-2 text-right">TIMESTAMP</div>
        </div>

        <div className="divide-y divide-white/5 bg-card/20">
          {loading ? (
            <div className="p-32 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin mx-auto mb-6" />
              <p className="text-primary font-black text-xs uppercase tracking-[0.3em]">Querying_Database...</p>
            </div>
          ) : trips.length > 0 ? (
            trips.map((trip: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={trip._id}
              >
                <Link to={`/trip/${trip._id}`} className="p-8 grid grid-cols-12 gap-8 items-center hover:bg-white/5 transition-all group relative">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="col-span-1">
                      <div className="w-12 h-12 bg-card border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        {trip.mode === 'Flight' ? <Plane className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" /> : 
                         trip.mode === 'Train' ? <Train className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" /> : 
                         <Car className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />}
                      </div>
                   </div>
                   <div className="col-span-5 flex flex-col gap-2">
                      <h4 className="text-2xl font-display uppercase tracking-tight group-hover:text-primary transition-colors">{trip.destination}</h4>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 italic">
                        <MapPin className="w-3 h-3 text-primary/40" /> {trip.source} &rarr; {trip.destination}
                      </p>
                   </div>
                   <div className="col-span-2">
                      <span className="text-xl font-display uppercase">₹{trip.budget?.toLocaleString()}</span>
                   </div>
                   <div className="col-span-2 text-center">
                      <span className="text-[10px] font-black text-accent bg-accent/5 border border-accent/20 px-3 py-1 uppercase tracking-tighter italic">{trip.carbon}KG_CO2</span>
                   </div>
                   <div className="col-span-2 text-right">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{new Date(trip.createdAt).toLocaleDateString()}</span>
                   </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="p-40 text-center">
               <HistoryIcon className="w-16 h-16 text-white/5 mx-auto mb-8" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">GRID_EMPTY // READY_FOR_INITIAL_MISSION</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
