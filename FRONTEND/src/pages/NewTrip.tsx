import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Car, MapPin, Sparkles, ArrowRight, Camera, Upload, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['DESTINATION', 'LOGISTICS', 'STYLE'];

const VIBES = [
  { id: 'budget', label: 'Budget', desc: 'Maximum value, minimum cost.' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium comfort & style.' },
  { id: 'adventure', label: 'Adventure', desc: 'Off-grid & adrenaline.' },
  { id: 'balanced', label: 'Balanced', desc: 'Best of both worlds.' }
];

export default function NewTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    mode: 'Flight',
    budget: 20000,
    style: 'balanced',
    userId: 'daksh_1'
  });

  const handleCreate = async () => {
    if (!formData.source || !formData.destination) return;
    setLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create trip record');
      const data = await res.json();
      
      try {
        await fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId: data._id })
        });
      } catch (aiErr) {
        console.warn("AI generation delayed:", aiErr);
      }
      
      navigate(`/trip/${data._id}`);
    } catch (err) {
      console.error("Trip creation failure:", err);
      alert("Error generating trip. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <header className="mb-16">
        <span className="text-primary font-semibold text-sm tracking-wide mb-2 block">Trip Planner</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Plan New Trip</h1>
        
        <div className="flex gap-2 mt-8">
          {STEPS.map((s: string, i: number) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-slate-200'}`} />
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${i === step ? 'text-primary' : 'text-slate-400'}`}>{s}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="premium-card p-8 md:p-12 min-h-[500px] flex flex-col relative overflow-hidden bg-white shadow-sm border border-slate-200 rounded-3xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Origin City</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      value={formData.source}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, source: e.target.value})}
                      placeholder="e.g. New York"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-5 pl-14 pr-6 text-lg font-semibold text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      value={formData.destination}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, destination: e.target.value})}
                      placeholder="e.g. Paris"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-5 pl-14 pr-6 text-lg font-semibold text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-primary group-hover:shadow-md transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">Import Tickets</h4>
                <p className="text-xs font-medium text-slate-500">PDFs or Images supported</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 relative z-10"
            >
              <div className="space-y-6">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Travel Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'Flight', icon: Plane, label: 'Flight' },
                    { id: 'Train', icon: Train, label: 'Train' },
                    { id: 'Car', icon: Car, label: 'Car/Road' }
                  ].map((m: { id: string; icon: any; label: string }) => {
                    const Icon = m.icon;
                    return (
                      <button 
                        key={m.id}
                        onClick={() => setFormData({...formData, mode: m.id})}
                        className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 group ${formData.mode === m.id ? 'bg-blue-50 border-primary text-primary shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                        <Icon className={`w-8 h-8 transition-transform ${formData.mode === m.id ? 'scale-110' : 'group-hover:text-slate-700'}`} />
                        <span className="text-sm font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Budget</label>
                  <span className="text-3xl font-bold text-slate-900">₹{formData.budget.toLocaleString()}</span>
                </div>
                <div className="relative pt-2 pb-6">
                  <input 
                    type="range" 
                    min="5000" 
                    max="200000" 
                    step="5000"
                    value={formData.budget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, budget: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-4 text-xs font-semibold text-slate-400">
                    <span className={formData.budget < 50000 ? 'text-primary' : ''}>Economy</span>
                    <span className={formData.budget >= 50000 && formData.budget < 120000 ? 'text-primary' : ''}>Standard</span>
                    <span className={formData.budget >= 120000 ? 'text-primary' : ''}>Luxury</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Trip Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VIBES.map((v: { id: string; label: string; desc: string }) => (
                  <button 
                    key={v.id}
                    onClick={() => setFormData({...formData, style: v.id})}
                    className={`p-6 rounded-xl border-2 transition-all text-left relative group ${formData.style === v.id ? 'bg-blue-50 border-primary shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="relative z-10">
                      <h4 className={`font-bold text-lg mb-1 transition-colors ${formData.style === v.id ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>{v.label}</h4>
                      <p className={`text-sm font-medium ${formData.style === v.id ? 'text-slate-700' : 'text-slate-500'}`}>{v.desc}</p>
                    </div>
                    {formData.style === v.id && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <Check className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-12 flex justify-between items-center relative z-10">
          <button 
            onClick={() => setStep((s: number) => Math.max(0, s-1))}
            className={`text-sm font-bold text-slate-500 py-3 px-6 rounded-xl hover:bg-slate-50 transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Back
          </button>
          
          {step < 2 ? (
            <button 
              onClick={() => setStep((s: number) => Math.min(2, s+1))}
              disabled={step === 0 && (!formData.source || !formData.destination)}
              className="premium-button bg-primary text-white hover:bg-slate-800 border-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl flex items-center gap-2"
            >
              <span className="font-bold">Next</span> <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={loading}
              className={`premium-button shadow-md transition-all px-8 py-3 rounded-xl flex items-center gap-2 ${loading ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-slate-800'}`}
            >
              <Sparkles className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> 
              <span className="font-bold">{loading ? 'Generating...' : 'Generate Trip'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
