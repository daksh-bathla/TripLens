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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <div className="w-16 h-16 border-2 border-primary border-t-transparent animate-spin mb-8" />
       <p className="text-primary font-black text-xs uppercase tracking-[0.6em]">Querying_Deep_Intelligence_Grid...</p>
    </div>
  );
  if (!trip) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
       <h2 className="text-5xl font-display uppercase mb-4">Access_Denied</h2>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">MISSION_LOG_NOT_FOUND_IN_ACTIVE_ARCHIVE</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-12 px-4 space-y-16"
    >
      <Link to="/" className="inline-flex items-center gap-4 text-white/30 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.4em] mb-4 group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> BACK_TO_CONTROL_CENTER
      </Link>

      <header className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 relative">
          <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/20" />
          <div className="flex items-center gap-6 mb-8">
            <span className="bg-primary/10 text-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20 flex items-center gap-3">
              <span className="w-2 h-2 bg-primary animate-pulse" /> MISSION_PROTOCOL_ACTIVE
            </span>
            <span className="text-white/10 font-mono text-[10px] uppercase tracking-widest">ENCRYPTED_ID: {trip._id.slice(-12)}</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-display leading-[0.8] uppercase mb-10 -ml-1">
            {trip.source} <span className="text-primary italic">&rarr;</span><br />
            {trip.destination}
          </h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-card border border-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 group hover:border-primary/40 transition-colors">
              {trip.mode === 'Flight' ? <Plane className="w-4 h-4 text-primary" /> : trip.mode === 'Train' ? <Train className="w-4 h-4 text-primary" /> : <Car className="w-4 h-4 text-primary" />}
              {trip.mode}_TRANSIT
            </div>
            <div className="bg-card border border-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 group hover:border-primary/40 transition-colors">
              <Calendar className="w-4 h-4 text-primary" /> {trip.days}_CYCLE_DURATION
            </div>
            <div className="bg-card border border-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 group hover:border-accent transition-colors text-accent">
              <Leaf className="w-4 h-4" /> {trip.carbon}KG_EMISSIONS
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
          <button className="glass-button w-full shadow-2xl shadow-primary/20 group">
            <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
            <span>BROADCAST_INTEL</span>
          </button>
          <button className="w-full bg-card border border-white/5 p-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-4">
            <Download className="w-5 h-5 opacity-40" /> EXPORT_MISSION_BRIEF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="glass-card p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <MapIcon className="w-96 h-96" />
             </div>
             
             <h2 className="text-4xl font-display uppercase mb-16 flex items-center gap-6">
               <Clock className="w-8 h-8 text-primary" /> EXPEDITION_CHRONOLOGY
             </h2>

             <div className="space-y-16 relative">
               <div className="absolute left-[13px] top-4 bottom-4 w-[1px] bg-primary/20"></div>
               
               {trip.itinerary ? trip.itinerary.split('\n\n').map((day: string, idx: number) => {
                 const [title, ...points] = day.split('\n');
                 return (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     key={idx} 
                     className="relative pl-12 group"
                   >
                     <div className="absolute left-0 top-1.5 w-7 h-7 bg-card border border-primary/40 flex items-center justify-center z-10 transition-all group-hover:bg-primary group-hover:border-primary">
                        <div className="w-2 h-2 bg-primary group-hover:bg-white transition-colors"></div>
                     </div>
                     <h3 className="text-3xl font-display uppercase tracking-tight text-primary mb-8 group-hover:text-white transition-colors">
                        {title.replace(/^Day \d+: /, '') || `EXPEDITION_STAGE_${idx + 1}`}
                     </h3>
                     <div className="space-y-6">
                       {points.map((p: string, pidx: number) => (
                         <div key={pidx} className="bg-white/[0.02] border border-white/5 p-6 relative group/point hover:bg-primary/[0.03] hover:border-primary/20 transition-all">
                           <p className="text-sm font-body leading-relaxed text-white/50 group-hover/point:text-white transition-colors">{p.replace(/^- /, '')}</p>
                           <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover/point:opacity-100 transition-opacity" />
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 );
               }) : (
                 <div className="p-20 text-center border-2 border-dashed border-white/5">
                    <Sparkles className="w-12 h-12 text-white/5 mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">AI_ITINERARY_GENERATION_PENDING...</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="glass-card p-10 bg-accent/5 border-accent/20 relative overflow-hidden">
            <div className="absolute -top-4 -right-4">
               <Leaf className="w-24 h-24 text-accent opacity-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-8 flex items-center gap-3">
              <Leaf className="w-5 h-5" /> ECO_TELEMETRY
            </h3>
            <p className="text-lg font-display uppercase leading-tight text-white mb-10">
              "MISSION_IMPACT: {trip.carbon}KG_CO2. TRANSITION_TO_RAIL_GRID_REDUCES_EMISSIONS_BY_84%."
            </p>
            <div className="w-full h-1 bg-white/5 relative overflow-hidden mb-4">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: '65%' }}
                 transition={{ duration: 1.5, delay: 0.5 }}
                 className="h-full bg-accent shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
               />
            </div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-accent/50">
               <span>IMPACT_STATUS</span>
               <span>MODERATE_RELIANCE</span>
            </div>
          </div>

          <div className="glass-card p-10">
            <h3 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-10">RESOURCE_ALLOCATION</h3>
            <div className="space-y-10">
              <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">TOTAL_CREDITS</p>
                  <p className="text-5xl font-display uppercase tracking-tight text-white">₹{trip.budget?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">CYCLE_CAP</p>
                  <p className="text-2xl font-display uppercase text-primary tracking-tight">₹{(trip.budget / trip.days).toFixed(0)}</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'TRANSIT_LOGISTICS', val: '42%' },
                  { label: 'OPERATIONAL_EXPENSE', val: '33%' },
                  { label: 'CONTINGENCY_RESERVE', val: '25%' },
                ].map(b => (
                  <div key={b.label} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">{b.label}</span>
                      <span className="text-[9px] font-black text-primary">{b.val}</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full">
                       <div className="h-full bg-primary/40" style={{ width: b.val }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
