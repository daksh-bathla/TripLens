import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Map, Globe, Calendar, Target } from 'lucide-react';

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="flex-1 flex flex-col gap-6 text-white/5 group cursor-default">
    <div className="w-full aspect-[2.5/1] bg-card border border-white/5 relative overflow-hidden flex items-end px-12 gap-3 pb-8">
       <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
       {[40, 70, 45, 90, 65, 30, 85, 55, 95, 40].map((h: number, i: number) => (
         <motion.div 
           key={i}
           initial={{ height: 0 }}
           animate={{ height: `${h}%` }}
           transition={{ delay: i * 0.05, duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
           className="flex-1 bg-primary/20 group-hover:bg-primary/40 transition-all border-t border-primary/40 relative"
         >
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(14,122,140,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
         </motion.div>
       ))}
    </div>
    <div className="flex justify-between items-center px-2">
       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{label}</span>
       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10">TELEMETRY_SYNC_OK</span>
    </div>
  </div>
);

export default function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-12 px-4 space-y-16"
    >
      <header className="relative">
        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/20" />
        <span className="text-primary font-black text-xs uppercase tracking-[0.4em] mb-4 block">Central_Intelligence // Data_Stream</span>
        <h1 className="text-7xl font-display uppercase leading-none">Mission_Intelligence</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 glass-card p-12 flex flex-col">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-display uppercase tracking-tight flex items-center gap-6">
              <TrendingUp className="w-8 h-8 text-primary" /> MISSION_VELOCITY
            </h2>
            <div className="flex border border-white/10 bg-card p-1">
              <button className="px-6 py-2 text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">7_DAY_CYCLE</button>
              <button className="bg-primary px-6 py-2 text-[9px] font-black text-white uppercase tracking-widest shadow-xl shadow-primary/20">30_DAY_OVERRIDE</button>
            </div>
          </div>
          <ChartPlaceholder label="Mission_Frequency_Database" />
        </div>

        <div className="lg:col-span-4 glass-card p-12 bg-accent/5 border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
             <Leaf className="w-48 h-48 text-accent" />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-12 flex items-center gap-4">
            <Leaf className="w-5 h-5" /> ECO_STRAT_AUDIT
          </h2>
          <div className="space-y-12">
            <div className="text-center py-6 border-y border-white/5">
               <h3 className="text-8xl font-display uppercase leading-none text-accent">412<span className="text-2xl text-white/10 ml-2">KG</span></h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-4 italic">TOTAL_ATMOSPHERIC_DEBT</p>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em]">
                 <span className="text-white/30">SYSTEM_EFFICIENCY</span>
                 <span className="text-accent">OPTIMIZED_LEVEL_A</span>
              </div>
              <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: '85%' }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-accent shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                 />
              </div>
            </div>
            <button className="w-full bg-accent text-black py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent/80 transition-all shadow-xl shadow-accent/10">
               SETTLE_CARBON_DEBT
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Longest Expedition', val: '14 DAYS', icon: Globe },
          { label: 'Primary Node', val: 'GOA_NORTH', icon: Map },
          { label: 'Pending Ops', val: '02 MISSIONS', icon: Calendar },
          { label: 'Quota Reached', val: '72_PERCENT', icon: Target },
        ].map((stat: { label: string; val: string; icon: React.ElementType }, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-white/5 p-10 hover:border-primary/40 transition-all group relative"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <stat.icon className="w-16 h-16" />
            </div>
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
               <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-4">{stat.label}</p>
            <h4 className="text-4xl font-display uppercase tracking-tight group-hover:text-primary transition-colors">{stat.val}</h4>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
  );
}
