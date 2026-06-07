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
  <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-6">
      <div className="p-3 bg-white border border-slate-200 text-slate-400 group-hover:text-primary rounded-xl transition-all shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{label}</h4>
        <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
       {action && action}
       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
    </div>
  </div>
);

export default function Settings() {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-8"
    >
      <header className="mb-10">
        <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">System Configuration</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
      </header>

      <section className="premium-card mb-8">
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center gap-6">
           <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md">
              TL
           </div>
           <div>
              <h2 className="text-2xl font-bold text-slate-900">Traveler</h2>
              <p className="text-blue-600 font-semibold text-xs uppercase tracking-wider mt-2 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">Free Plan</p>
           </div>
        </div>

        <div className="bg-white">
          <SettingItem icon={User} label="Account Details" desc="Manage your personal information and preferences." />
          <SettingItem icon={Shield} label="Security" desc="Password, 2FA, and active sessions." />
          <SettingItem icon={Bell} label="Notifications" desc="Email and push notification settings." action={
            <button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-primary' : 'bg-slate-200'}`}>
               <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${notifications ? 'left-[22px]' : 'left-0.5'}`}></div>
            </button>
          } />
          <SettingItem icon={Cpu} label="AI Features" desc="Customize TripLens AI behavior." action={
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Standard</span>
          } />
          <SettingItem icon={Globe} label="Localization" desc="Language, region, and currency." />
        </div>
      </section>

    </motion.div>
  );
}
