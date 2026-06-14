import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Map, Globe, Calendar, Target } from 'lucide-react';

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="flex-1 flex flex-col gap-6 text-slate-300 group cursor-default">
    <div className="w-full aspect-[2.5/1] bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 relative overflow-hidden flex items-end px-6 gap-2 pb-6">
       {[40, 70, 45, 90, 65, 30, 85, 55, 95, 40].map((h: number, i: number) => (
         <motion.div 
           key={i}
           initial={{ height: 0 }}
           animate={{ height: `${h}%` }}
           transition={{ delay: i * 0.05, duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
           className="flex-1 bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-t-sm relative"
         >
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity" />
         </motion.div>
       ))}
    </div>
    <div className="flex justify-between items-center px-2">
       <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
       <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Sync Active</span>
    </div>
  </div>
);

export default function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-8"
    >
      <header className="mb-12">
        <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">Data & Insights</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Trip Analytics</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 premium-card p-8 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" /> Travel Frequency
            </h2>
            <div className="flex bg-slate-100 dark:bg-white/10 p-1 rounded-lg">
              <button className="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-md">7 Days</button>
              <button className="bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-900 dark:text-white rounded-md shadow-sm">30 Days</button>
            </div>
          </div>
          <ChartPlaceholder label="Trips per month" />
        </div>

        <div className="lg:col-span-1 premium-card p-8 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-8 flex items-center gap-2">
            <Leaf className="w-4 h-4" /> Eco Impact Overview
          </h2>
          <div className="space-y-10">
            <div className="text-center py-6 border-y border-emerald-100 dark:border-emerald-900/30">
               <h3 className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">412<span className="text-xl text-emerald-400 ml-1">kg</span></h3>
               <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Total Carbon Emissions</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                 <span className="text-emerald-700/60 dark:text-emerald-400/60">Efficiency Score</span>
                 <span className="text-emerald-700 dark:text-emerald-400">Level A</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: '85%' }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-emerald-500 rounded-full" 
                 />
              </div>
            </div>
            <button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors py-3 rounded-xl text-sm font-semibold shadow-sm">
               Offset Carbon Debt
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Longest Trip', val: '14 Days', icon: Globe },
          { label: 'Top Destination', val: 'Goa', icon: Map },
          { label: 'Upcoming Trips', val: '2 Planned', icon: Calendar },
          { label: 'Travel Goal', val: '72% Reached', icon: Target },
        ].map(({ label, val, icon: Icon }: { label: string; val: string; icon: any }, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card p-6 group"
          >
            <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-400 mb-6 group-hover:text-primary group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors">
               <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{val}</h4>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
