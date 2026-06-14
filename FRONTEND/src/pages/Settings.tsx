import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, Bell, ChevronRight, Check } from 'lucide-react';

interface SettingsProps {
  agency: { id: string; name: string; plan: string } | null;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0/mo',
    features: ['5 trips/month', '1 agent seat', 'AI itinerary (limited)'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹2,999/mo',
    features: ['Unlimited trips', '5 agent seats', 'AI itinerary + carbon reports', 'PDF export', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited everything', 'Unlimited seats', 'White-label option', 'API access', 'Dedicated support'],
  },
];

export default function Settings({ agency }: SettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-8"
    >
      <header className="mb-10">
        <span className="text-primary font-semibold text-sm tracking-wide mb-1 block">Configuration</span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
      </header>

      <div className="space-y-8">
        <section className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center gap-5">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {agency?.name?.slice(0, 2).toUpperCase() || 'TL'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{agency?.name || 'Your Agency'}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full mt-1 inline-block border ${
                agency?.plan === 'pro' ? 'bg-blue-500/15 text-blue-300 border-blue-500/20' :
                agency?.plan === 'enterprise' ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' :
                'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10'
              }`}>
                {agency?.plan?.toUpperCase() || 'FREE'} PLAN
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 group-hover:text-primary transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Agency Details</p>
                  <p className="text-xs text-slate-500 mt-0.5">Name, address, branding</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 group-hover:text-primary transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Security</p>
                  <p className="text-xs text-slate-500 mt-0.5">Password, 2FA, active sessions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 group-hover:text-primary transition-colors">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                  <p className="text-xs text-slate-500 mt-0.5">Email alerts for trip status changes</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Plan & Billing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isCurrent = agency?.plan === plan.id || (!agency?.plan && plan.id === 'free');
              return (
                <div
                  key={plan.id}
                  className={`bg-card border rounded-2xl p-6 relative ${
                    isCurrent ? 'border-primary/60 ring-1 ring-primary/30 shadow-sm dark:shadow-none' : 'border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-4 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{plan.price}</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
                      Upgrade
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
