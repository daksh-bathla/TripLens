import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface AuthPageProps {
  onSuccess: (token: string, agency: { id: string; name: string; plan: string }) => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  React.useEffect(() => {
    document.title = mode === 'login' ? 'Login | TripLens' : 'Create Agency Workspace | TripLens';
  }, [mode]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    agencyName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, agencyName: form.agencyName };

      const res = await axios.post(endpoint, payload);
      onSuccess(res.data.token, res.data.agency);
    } catch (err: any) {
      const errData = err.response?.data?.error;
      if (errData && typeof errData === 'object') {
        setError(errData.message || errData.error_description || JSON.stringify(errData));
      } else {
        setError(errData || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-[#070b13] flex">
      {/* Left Panel: Brand Canvas */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-16 relative overflow-hidden border-r border-slate-200 dark:border-white/[0.04]">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-500/[0.12] dark:bg-blue-500/[0.10] rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400/[0.10] dark:bg-indigo-400/[0.08] rounded-full blur-3xl animate-float-slower" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-sky-400/[0.07] dark:bg-sky-300/[0.05] rounded-full blur-2xl" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.035]"
            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">TripLens</span>
        </div>

        <div className="relative z-10 max-w-xl my-auto">
          <div className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-primary/8 dark:bg-primary/10 border border-primary/15 dark:border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-primary font-bold text-[10px] tracking-widest uppercase">Agency Workspace</p>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.12] tracking-tight mb-6">
            The workspace for professional travel planners.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-md">
            Draft, share, and refine itineraries in a calm, collaborative environment. Built for speed and clarity.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['AI Itineraries', 'Client Sharing', 'Carbon Tracking', 'Multi-Agency'].map(f => (
              <span key={f} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 border-t border-slate-200 dark:border-white/[0.05] pt-10 relative z-10">
          {[
            { val: '2 min', label: 'itinerary draft time' },
            { val: '50%', label: 'less email overhead' },
            { val: 'Unlimited', label: 'trips on Pro plan' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{val}</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Calm Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">TripLens</span>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
              {mode === 'login' ? 'Sign in to workspace' : 'Create agency workspace'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {mode === 'login' ? 'Enter details to access your dashboard.' : 'Set up your operational dashboard.'}
            </p>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/[0.06] rounded-2xl p-8 shadow-sm dark:shadow-none">
            {/* Mode Switcher */}
            <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.02] rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#1f2937] text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-[#1f2937] text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Agency Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={form.agencyName}
                      onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                      placeholder="Wanderlust Travel Co."
                      className="dark-input-icon"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="agency@example.com"
                    className="dark-input-icon"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="dark-input-icon"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/10 text-red-500 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 text-sm shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Workspace'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
