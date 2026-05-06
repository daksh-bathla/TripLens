import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Cpu, Moon, Globe, ChevronRight } from 'lucide-react';

interface SettingItemProps {
  icon: any;
  label: string;
  desc: string;
  action?: React.ReactNode;
}

const SettingItem = ({ icon: Icon, label, desc, action }: SettingItemProps) => (
  <div className="flex items-center justify-between p-8 hover:bg-white/5 transition-all group border-b border-white/5 last:border-0">
    <div className="flex items-center gap-8">
      <div className="p-4 bg-card border border-white/10 text-white/20 group-hover:text-primary group-hover:border-primary/50 transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-lg font-display uppercase tracking-tight">{label}</h4>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-2">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
       {action && action}
       <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </div>
  </div>
);

export default function Settings() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-12 px-4 space-y-16"
    >
      <header className="relative">
        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/20" />
        <span className="text-primary font-black text-xs uppercase tracking-[0.4em] mb-4 block">System_Config // Operational_Preferences</span>
        <h1 className="text-7xl font-display uppercase leading-none">Settings_Core</h1>
      </header>

      <section className="glass-card overflow-hidden">
        <div className="p-10 border-b border-white/10 bg-primary/5 flex items-center gap-10">
           <div className="w-24 h-24 bg-primary flex items-center justify-center text-4xl font-display text-white relative">
              <div className="absolute inset-0 border-2 border-white/20 m-2" />
              DB
           </div>
           <div>
              <h2 className="text-4xl font-display uppercase tracking-tight">Daksh_Bathla</h2>
              <p className="text-accent font-black text-[10px] uppercase tracking-[0.3em] mt-3">Level: Master_Explorer // Rank: Alpha_01</p>
           </div>
        </div>

        <div className="bg-card/30">
          <SettingItem icon={User} label="Identity_Control" desc="Manage biometric and visual presence protocols." />
          <SettingItem icon={Shield} label="Security_Matrix" desc="Encryption layers and authorization keys." />
          <SettingItem icon={Bell} label="Telemetry_Alerts" desc="Real-time mission synchronization." action={
            <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 p-1 border transition-all relative ${notifications ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'}`}>
               <div className={`w-4 h-4 transition-all ${notifications ? 'bg-primary translate-x-6' : 'bg-white/20 translate-x-0'}`}></div>
            </button>
          } />
          <SettingItem icon={Cpu} label="AI_Engine_Optimization" desc="Current model: Mistral-7B_Experimental_v2" action={
            <span className="text-[9px] font-black bg-primary/20 text-primary px-3 py-1 border border-primary/30 uppercase tracking-[0.2em]">LOCAL_GRID_COMPUTE</span>
          } />
          <SettingItem icon={Globe} label="Geo_Localization" desc="System clock and spatial positioning." />
          <SettingItem icon={Moon} label="Interface_Luminosity" desc="Dark_Mode protocol is locked." action={
            <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 p-1 border transition-all relative ${darkMode ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'}`}>
               <div className={`w-4 h-4 transition-all ${darkMode ? 'bg-primary translate-x-6' : 'bg-white/20 translate-x-0'}`}></div>
            </button>
          } />
        </div>
      </section>

      <footer className="p-12 border-2 border-dashed border-white/5 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10">TRIPLENS_OS_V4.0_BETA_SECURED</p>
      </footer>
    </motion.div>
  );
}
