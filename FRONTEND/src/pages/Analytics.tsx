import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Map, Globe, Calendar, Target } from 'lucide-react';

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/10 group cursor-default">
    <div className="w-full aspect-[2/1] bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden flex items-end px-10 gap-2 pb-6">
       {[40, 70, 45, 90, 65, 30, 85].map((h: number, i: number) => (
         <motion.div 
           key={i}
           initial={{ height: 0 }}
           animate={{ height: `${h}%` }}
           transition={{ delay: i * 0.1, duration: 1 }}
           className="flex-1 bg-primary/20 group-hover:bg-primary/40 rounded-t-lg transition-colors border-t border-primary/50"
         />
       ))}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{label}</span>
  </div>
);

export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto py-10 space-y-12">
      <header>
        <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2 block">Deep_Intelligence // Data_Sync</span>
        <h1 className="text-5xl font-display font-black tracking-tighter uppercase">MISSION_ANALYTICS</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-10 rounded-[40px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" /> TRAVEL_VELOCITY
            </h2>
            <div className="flex gap-2">
              <span className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-white/40 uppercase tracking-widest border border-white/10">WEEKLY</span>
              <span className="bg-primary px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">MONTHLY</span>
            </div>
          </div>
          <ChartPlaceholder label="Mission_Frequency_Over_Time" />
        </div>

        <div className="glass-card p-10 rounded-[40px] bg-green-500/5 border-green-500/20">
          <h2 className="text-xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-10">
            <Leaf className="w-5 h-5 text-green-400" /> ECO_FOOTPRINT
          </h2>
          <div className="space-y-8">
            <div className="text-center py-10">
               <h3 className="text-6xl font-display font-black tracking-tighter text-green-400">412<span className="text-xl text-white/20">kg</span></h3>
               <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-2">Lifetime_CO2_Emission</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-white/40">Efficiency_Rating</span>
                 <span className="text-green-400">OPTIMIZED</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-[85%] shadow-[0_0_10px_#22c55e]"></div>
              </div>
            </div>
            <button className="glass-button w-full border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all">
               OFFSET_EMISSIONS_NOW
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Longest Streak', val: '14 Days', icon: Globe },
          { label: 'Most Visited', val: 'Goa', icon: Map },
          { label: 'Upcoming', val: '2 Missions', icon: Calendar },
          { label: 'Goal Progress', val: '72%', icon: Target },
        ].map((stat: { label: string; val: string; icon: React.ElementType }, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[35px] hover:bg-white/10 transition-all group"
          >
            <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
               <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-display font-black tracking-tight">{stat.val}</h4>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
