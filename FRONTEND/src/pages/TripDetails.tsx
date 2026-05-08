import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plane, Train, Car, Calendar, Leaf, Share2, Download, ChevronLeft, Sparkles, Clock, Map as MapIcon, Info } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
      <span className="text-sm font-medium text-slate-500">Loading trip details...</span>
    </div>
  );
  if (!trip) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
       <Info className="w-12 h-12 mb-4 text-slate-400" />
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Trip Not Found</h2>
       <p className="text-sm">We couldn't find the details for this trip.</p>
       <Link to="/" className="premium-button mt-6 inline-flex">Return to Dashboard</Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-8"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Trip
            </span>
            <span className="text-slate-400 font-mono text-xs uppercase">ID: {trip._id.slice(-8)}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            {trip.source} <span className="text-slate-300">&rarr;</span><br />
            {trip.destination}
          </h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
              {trip.mode === 'Flight' ? <Plane className="w-4 h-4 text-slate-400" /> : trip.mode === 'Train' ? <Train className="w-4 h-4 text-slate-400" /> : <Car className="w-4 h-4 text-slate-400" />}
              {trip.mode} Travel
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> {trip.days} Days
            </div>
            <div className="bg-emerald-50 border border-emerald-100 shadow-sm rounded-lg px-4 py-2 text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> {trip.carbon} kg CO₂
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3">
          <button className="premium-button w-full shadow-md">
            <Share2 className="w-5 h-5" /> 
            <span>Share Trip Plan</span>
          </button>
          <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm">
            <Download className="w-4 h-4 text-slate-400" /> Download Itinerary
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="premium-card p-8">
             <div className="flex items-center gap-3 mb-8">
               <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                 <Clock className="w-5 h-5" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">
                 Daily Itinerary
               </h2>
             </div>

             <div className="space-y-12 relative">
               <div className="absolute left-3 top-4 bottom-4 w-px bg-slate-100"></div>
               
               {trip.itinerary ? trip.itinerary.split('\n\n').map((day: string, idx: number) => {
                 const [title, ...points] = day.split('\n');
                 return (
                   <div key={idx} className="relative pl-10">
                     <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-4">
                        {title.replace(/^Day \d+: /, '') || `Day ${idx + 1}`}
                     </h3>
                     <div className="space-y-3">
                       {points.map((p: string, pidx: number) => (
                         <div key={pidx} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                           <p className="text-sm font-medium text-slate-600 leading-relaxed">{p.replace(/^- /, '')}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               }) : (
                 <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-500">AI is generating your itinerary...</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-card p-6 bg-emerald-50 border-emerald-100 text-emerald-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-6 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Eco Impact
            </h3>
            <p className="text-sm font-medium leading-relaxed mb-6">
              Your flight to {trip.destination} emits {trip.carbon} kg CO₂. Taking a train would reduce this by up to 84%.
            </p>
            <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden mb-3">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: '65%' }}
                 transition={{ duration: 1, delay: 0.2 }}
                 className="h-full bg-emerald-500 rounded-full" 
               />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-emerald-700">
               <span>Impact Level</span>
               <span>Moderate</span>
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
               Budget Overview
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Total Budget</p>
                  <p className="text-3xl font-bold text-slate-900">₹{trip.budget?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Per Day</p>
                  <p className="text-lg font-bold text-slate-700">₹{(trip.budget / trip.days).toFixed(0)}</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Travel & Transport', val: '42%' },
                  { label: 'Accommodation', val: '33%' },
                  { label: 'Food & Activities', val: '25%' },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-slate-500">{b.label}</span>
                      <span className="text-xs font-bold text-slate-900">{b.val}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: b.val }} />
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
