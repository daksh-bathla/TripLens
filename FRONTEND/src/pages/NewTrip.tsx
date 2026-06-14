import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Car, MapPin, User, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STEPS = ['CLIENT', 'LOGISTICS', 'STYLE'];

const VIBES = [
  { id: 'budget', label: 'Budget', desc: 'Maximum value, minimum cost.' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium comfort & style.' },
  { id: 'adventure', label: 'Adventure', desc: 'Off-grid & adrenaline.' },
  { id: 'balanced', label: 'Balanced', desc: 'Best of both worlds.' }
];

interface NewTripProps {
  token: string;
  agency: { id: string; name: string; logoUrl?: string; primaryColor?: string } | null;
}

export default function NewTrip({ token, agency }: NewTripProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    source: '',
    destination: '',
    mode: 'Flight',
    budget: 20000,
    days: 5,
    style: 'balanced',
    itinerary: undefined as any
  });
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  React.useEffect(() => {
    document.title = 'Plan New Trip | TripLens';
  }, []);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      if (!agency?.id) return;
      try {
        const res = await axios.get(`/api/templates?userId=${agency.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplates(res.data);
      } catch {
        // silently fail
      }
    };
    const fetchClients = async () => {
      if (!agency?.id) return;
      try {
        const res = await axios.get(`/api/clients?userId=${agency.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
      } catch {
        // silently fail
      }
    };
    fetchTemplates();
    fetchClients();
  }, [agency?.id, token]);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  React.useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const canProceed = [
    formData.clientName.trim() && formData.source.trim() && formData.destination.trim(),
    formData.budget > 0 && formData.days > 0,
    true,
  ][step];

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        agencyName: agency?.name || '',
        agencyLogo: agency?.logoUrl || '',
        agencyColor: agency?.primaryColor || '',
      };
      const res = await axios.post('/api/trips', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/trip/${res.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto py-8"
    >
      <header className="mb-10">
        <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">New Trip</span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Plan Client Trip</h1>

        <div className="flex gap-2 mt-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-slate-200 dark:bg-white/15'}`} />
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${i === step ? 'text-primary' : 'text-slate-500'}`}>{s}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-6"
            >
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Client Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={clientSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setClientSearch(val);
                      set('clientName', val);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowClientDropdown(false), 200);
                    }}
                    placeholder="Search traveler or enter name..."
                    className="dark-input-icon w-full"
                  />
                </div>

                {showClientDropdown && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-card border border-slate-200 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {clients.filter(c => 
                      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
                    ).map(c => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setClientSearch(c.name);
                          set('clientName', c.name);
                          setShowClientDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-white/5 text-sm transition-colors border-b last:border-0 border-slate-100 dark:border-white/[0.05]"
                      >
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        {c.email && <div className="text-xs text-slate-400 mt-0.5">{c.email}</div>}
                      </button>
                    ))}
                    {clients.filter(c => 
                      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
                    ).length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-500 italic">
                        {clientSearch ? `No matching client. Creating new client: "${clientSearch}"` : 'Type to search clients...'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {templates.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Start from Template (Optional)</label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => {
                      const templateId = e.target.value;
                      setSelectedTemplateId(templateId);
                      if (!templateId) {
                        setFormData(prev => ({ ...prev, days: 5, style: 'balanced', itinerary: undefined }));
                        return;
                      }
                      const template = templates.find(t => t._id === templateId);
                      if (template) {
                        setFormData(prev => ({
                          ...prev,
                          days: template.days,
                          style: template.style,
                          itinerary: template.itinerary
                        }));
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">Start from Scratch</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.title} ({t.days} Days)</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Origin</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.source}
                      onChange={e => set('source', e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="dark-input-icon"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.destination}
                      onChange={e => set('destination', e.target.value)}
                      placeholder="e.g. Paris"
                      className="dark-input-icon"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-8"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Travel Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Flight', icon: Plane, label: 'Flight' },
                    { id: 'Train', icon: Train, label: 'Train' },
                    { id: 'Car', icon: Car, label: 'Car' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => set('mode', m.id)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        formData.mode === m.id
                          ? 'bg-primary/5 dark:bg-primary/10 border-primary text-primary dark:text-white'
                          : 'border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-slate-500 hover:border-slate-350 dark:hover:border-white/[0.15] hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <m.icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.days}
                    onChange={e => set('days', parseInt(e.target.value) || 1)}
                    className="dark-input font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.budget}
                    onChange={e => set('budget', parseInt(e.target.value) || 0)}
                    className="dark-input font-bold text-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4"
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Trip Style</label>
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => set('style', v.id)}
                    className={`p-5 rounded-xl border transition-all text-left relative ${
                      formData.style === v.id
                        ? 'bg-primary/5 dark:bg-primary/10 border-primary'
                        : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15]'
                    }`}
                  >
                    <h4 className={`text-sm font-bold mb-1 ${formData.style === v.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{v.label}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{v.desc}</p>
                    {formData.style === v.id && (
                      <Check className="absolute right-4 top-4 w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-4 bg-red-500/15 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className={`text-sm font-bold text-slate-500 dark:text-slate-400 py-2.5 px-5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all ${step === 0 ? 'invisible' : ''}`}
          >
            Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070b13]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-8 h-8 border-2 border-slate-700 border-t-primary rounded-full animate-spin mb-4" />
            <AnimatePresence mode="wait">
              <motion.h3 
                key={loadingStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold text-slate-300 tracking-wide uppercase"
              >
                {[
                  "Building your itinerary...",
                  "Organizing transfers and activities...",
                  "Finalizing travel timeline..."
                ][loadingStep]}
              </motion.h3>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
