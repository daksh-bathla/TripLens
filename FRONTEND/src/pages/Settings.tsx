import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, Bell, ChevronRight, Check, Save } from 'lucide-react';

interface SettingsProps {
  agency: { id: string; name: string; plan: string; logoUrl?: string; primaryColor?: string } | null;
  onUpdateAgency: (agency: any) => void;
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

export default function Settings({ agency, onUpdateAgency }: SettingsProps) {
  React.useEffect(() => {
    document.title = 'Agency Settings | TripLens';
  }, []);

  const [name, setName] = useState(agency?.name || '');
  const [logoUrl, setLogoUrl] = useState(agency?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(agency?.primaryColor || '#3b82f6');
  const [saved, setSaved] = useState(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency) return;
    onUpdateAgency({
      ...agency,
      name,
      logoUrl,
      primaryColor
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
            {agency?.logoUrl ? (
              <img src={agency.logoUrl} alt="Logo" className="w-14 h-14 object-contain bg-slate-100 rounded-xl" />
            ) : (
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: agency?.primaryColor || '#3b82f6' }}
              >
                {agency?.name?.slice(0, 2).toUpperCase() || 'TL'}
              </div>
            )}
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

          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Agency Branding
            </h3>
            <form onSubmit={handleSaveBranding} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Agency Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                  placeholder="e.g. Luxe Voyages"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Agency Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Primary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer bg-transparent"
                  />
                  <span className="text-sm font-mono text-slate-500">{primaryColor}</span>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved Successfully!' : 'Save Branding'}
              </button>
            </form>
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
