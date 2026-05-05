import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Cpu, Moon, Globe, ChevronRight } from 'lucide-react';

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  desc: string;
  action?: React.ReactNode;
}

const SettingItem = ({ icon: Icon, label, desc, action }: SettingItemProps) => (
  <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group">
    <div className="flex items-center gap-6">
      <div className="p-3 bg-white/5 rounded-2xl text-white/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold uppercase tracking-tight">{label}</h4>
        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mt-1">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
       {action && action}
       <ChevronRight className="w-4 h-4 text-white/10 group-hover:translate-x-1 transition-all" />
    </div>
  </div>
);

export default function Settings() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-10 space-y-12"
    >
      <header>
        <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2 block">System_Config // Preferences</span>
        <h1 className="text-5xl font-display font-black tracking-tighter uppercase">CORE_SETTINGS</h1>
      </header>

      <section className="glass-card rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/10 bg-white/5 flex items-center gap-6">
           <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-primary/30">DB</div>
           <div>
              <h2 className="text-xl font-display font-black tracking-tight uppercase">Daksh_Bathla</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Level: Master Explorer // Since: 2026</p>
           </div>
        </div>

        <div className="divide-y divide-white/5">
          <SettingItem icon={User} label="Profile Control" desc="Update identity and visual presence." />
          <SettingItem icon={Shield} label="Mission Security" desc="Manage encryption and access protocols." />
          <SettingItem icon={Bell} label="Comms Center" desc="Notification and alert synchronization." action={
            <button onClick={() => setNotifications(!notifications)} className={`w-10 h-5 rounded-full p-1 border transition-all ${notifications ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}`}>
               <div className={`w-3 h-3 rounded-full transition-all ${notifications ? 'bg-primary ml-auto' : 'bg-white/20'}`}></div>
            </button>
          } />
          <SettingItem icon={Cpu} label="AI Processing" desc="Model selection: Mistral-7B-Instruct (v0.2)" action={
            <span className="text-[8px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 uppercase tracking-widest">LOCAL_LLM</span>
          } />
          <SettingItem icon={Globe} label="Language / Region" desc="System localization and time-sync." />
          <SettingItem icon={Moon} label="Visual Interface" desc="Dark mode is currently locked." action={
            <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-5 rounded-full p-1 border transition-all ${darkMode ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}`}>
               <div className={`w-3 h-3 rounded-full transition-all ${darkMode ? 'bg-primary ml-auto' : 'bg-white/20'}`}></div>
            </button>
          } />
        </div>
      </section>

      <footer className="p-8 border-2 border-dashed border-white/5 rounded-[40px] text-center">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Build_Version: TRIPLENS_REVAMP_2.0.0_PRODUCTION</p>
      </footer>
    </div>
  );
}
