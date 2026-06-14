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
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">TripLens</span>
        </div>

        <div className="relative">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-6">Agency Workspace</p>
          <h1 className="text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            The modern travel workspace for agencies.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
            Create and manage premium travel experiences in minutes. Less email, more clarity.
          </p>
        </div>

        <div className="flex gap-12 relative">
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">2 min</p>
            <p className="text-slate-500 text-sm mt-1">avg itinerary creation</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">50%</p>
            <p className="text-slate-500 text-sm mt-1">less client back-and-forth</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">∞</p>
            <p className="text-slate-500 text-sm mt-1">trips on Pro plan</p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm relative"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg">TripLens</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'login' ? 'Sign in to your agency workspace.' : 'Set up your agency in under a minute.'}
            </p>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none">
            <div className="flex gap-1.5 mb-6 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Agency Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={form.agencyName}
                      onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                      placeholder="Wanderlust Travel Co."
                      className="dark-input-icon"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="agency@example.com"
                    className="dark-input-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="dark-input-icon"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/15 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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
