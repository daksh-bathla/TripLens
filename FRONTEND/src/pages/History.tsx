import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Filter, Plane, Train, Car, MapPin, ChevronRight } from 'lucide-react';
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
      className="max-w-6xl mx-auto py-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">Trip Archive</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">All Past Trips</h1>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               placeholder="Search destinations..." 
               className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
             />
          </div>
          <button className="bg-white border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-900 shadow-sm flex items-center justify-center">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="premium-card">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 grid grid-cols-12 gap-6 text-xs font-bold uppercase tracking-wider text-slate-500">
           <div className="col-span-1 hidden sm:block">Type</div>
           <div className="col-span-11 sm:col-span-5">Trip Details</div>
           <div className="col-span-2 hidden sm:block">Budget</div>
           <div className="col-span-2 hidden md:block text-center">Emissions</div>
           <div className="col-span-2 hidden md:block text-right">Date</div>
        </div>

        <div className="divide-y divide-slate-100 bg-white">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-500">Loading your trips...</p>
            </div>
          ) : trips.length > 0 ? (
            trips.map((trip: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={trip._id}
              >
                <Link to={`/trip/${trip._id}`} className="px-6 py-5 grid grid-cols-12 gap-6 items-center hover:bg-slate-50 transition-all group relative">
                   <div className="col-span-1 hidden sm:block">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:border-slate-300 transition-colors">
                        {trip.mode === 'Flight' ? <Plane className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" /> : 
                         trip.mode === 'Train' ? <Train className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" /> : 
                         <Car className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                      </div>
                   </div>
                   <div className="col-span-10 sm:col-span-5 flex flex-col gap-1">
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{trip.destination}</h4>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {trip.source} &rarr; {trip.destination}
                      </p>
                   </div>
                   <div className="col-span-2 hidden sm:flex items-center">
                      <span className="text-lg font-semibold text-slate-900">₹{trip.budget?.toLocaleString()}</span>
                   </div>
                   <div className="col-span-2 hidden md:block text-center">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{trip.carbon} kg CO₂</span>
                   </div>
                   <div className="col-span-2 hidden md:flex items-center justify-end gap-4">
                      <span className="text-sm font-medium text-slate-500">{new Date(trip.createdAt).toLocaleDateString()}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                   </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="p-24 text-center bg-slate-50 m-4 rounded-2xl border border-slate-100 border-dashed">
               <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto mb-4" />
               <p className="text-sm font-medium text-slate-500">No trips found in your archive.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
