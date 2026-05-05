import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plane, Train, Car, Calendar, Leaf, Share2, Download, ChevronLeft, Sparkles, Clock, Map as MapIcon } from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/trips?userId=daksh_1`); // Simplified for demo
        const data = await res.json();
        const found = data.find((t: any) => t._id === id);
        setTrip(found);
      } catch (err) {
        console.error("Failed to fetch trip details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-black uppercase tracking-[0.5em]">SYNCING_DEEP_DATA...</div>;
  if (!trip) return <div className="p-20 text-center text-red-500 font-bold uppercase">MISSION_LOG_NOT_FOUND</div>;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-10 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK_TO_DASHBOARD
      </Link>

      <header className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> MISSION_ACTIVE
            </span>
            <span className="text-white/20 font-mono text-[10px] uppercase">ID: {trip._id.slice(-8)}</span>
          </div>
          <h1 className="text-6xl font-display font-black tracking-tighter uppercase mb-6 leading-[0.85]">
            {trip.source} <span className="text-white/20">&rarr;</span> {trip.destination}
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              {trip.mode === 'Flight' ? <Plane className="w-4 h-4" /> : trip.mode === 'Train' ? <Train className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              {trip.mode}
            </div>
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Calendar className="w-4 h-4" /> {trip.days} DAYS
            </div>
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-green-400">
              <Leaf className="w-4 h-4" /> {trip.carbon}kg CO2
            </div>
          </div>
        </div>
        <div className="md:col-span-4 flex flex-col gap-4">
          <button className="glass-button bg-primary text-white border-none w-full shadow-lg shadow-primary/20">
            <Share2 className="w-4 h-4" /> SHARE_ITINERARY
          </button>
          <button className="glass-button bg-white/5 text-white border-white/10 w-full">
            <Download className="w-4 h-4" /> EXPORT_MISSION_PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="glass-card p-10 rounded-[40px] space-y-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <MapIcon className="w-64 h-64" />
             </div>
             
             <h2 className="text-2xl font-display font-black tracking-tight uppercase flex items-center gap-4">
               <Clock className="w-6 h-6 text-primary" /> MISSION_TIMELINE
             </h2>

             <div className="space-y-10 relative">
               <div className="absolute left-[11px] top-4 bottom-4 w-px bg-white/10"></div>
               
               {trip.itinerary ? trip.itinerary.split('\n\n').map((day: string, idx: number) => {
                 const [title, ...points] = day.split('\n');
                 return (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     key={idx} 
                     className="relative pl-10"
                   >
                     <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                     </div>
                     <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-4">{title}</h3>
                     <div className="space-y-4">
                       {points.map((p, pidx) => (
                         <div key={pidx} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                           <p className="text-sm font-medium leading-relaxed text-white/80">{p.replace(/^- /, '')}</p>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 );
               }) : (
                 <div className="p-10 text-center text-white/20 italic">AI itinerary not generated yet.</div>
               )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card p-8 rounded-[40px] bg-green-500/5 border-green-500/20">
            <h3 className="text-sm font-black uppercase tracking-widest text-green-400 mb-6 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> ECO_INTELLIGENCE
            </h3>
            <p className="text-sm leading-relaxed text-white/60 mb-6">
              "This mission generates {trip.carbon}kg of CO2. By choosing {trip.mode === 'Flight' ? 'Train next time' : 'Carbon Offsets'}, you can neutralize this impact."
            </p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 w-[60%] shadow-[0_0_10px_#22c55e]"></div>
            </div>
            <p className="text-[10px] font-bold text-green-400/50 uppercase tracking-widest mt-3">Impact_Rating: MODERATE</p>
          </div>

          <div className="glass-card p-8 rounded-[40px]">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">BUDGET_LOGISTICS</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Total_Allowance</p>
                  <p className="text-2xl font-display font-black tracking-tight">₹{trip.budget?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Daily_Cap</p>
                  <p className="text-lg font-display font-black tracking-tight">₹{(trip.budget / trip.days).toFixed(0)}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                {[
                  { label: 'Transport (Est.)', val: '40%' },
                  { label: 'Activities (Est.)', val: '35%' },
                  { label: 'Unallocated', val: '25%' },
                ].map(b => (
                  <div key={b.label} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">{b.label}</span>
                    <span className="text-white">{b.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
