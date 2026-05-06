import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Car, MapPin, Sparkles, ArrowRight, Camera, Upload, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['DESTINATION', 'LOGISTICS', 'VIBE'];

const VIBES = [
  { id: 'budget', label: 'BUDGET', desc: 'Max value, minimum cost.' },
  { id: 'luxury', label: 'LUXURY', desc: 'Premium comfort & style.' },
  { id: 'adventure', label: 'ADVENTURE', desc: 'Off-grid & adrenaline.' },
  { id: 'balanced', label: 'BALANCED', desc: 'Best of both worlds.' }
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
      console.error("Critical mission failure:", err);
      alert("System error during mission initialization. Please check logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-16 px-4"
    >
      <header className="mb-24 relative">
        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/20" />
        <span className="text-primary font-black text-xs uppercase tracking-[0.4em] mb-4 block">Deployment_Sequence // Initializing...</span>
        <h1 className="text-7xl font-display uppercase leading-none">Plan_Expedition</h1>
        
        <div className="flex gap-1 mt-12">
          {STEPS.map((s: string, i: number) => (
            <div key={s} className="flex-1">
              <div className={`h-1 transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-white/5'}`} />
              <p className={`text-[9px] font-black uppercase tracking-widest mt-3 ${i === step ? 'text-primary' : 'text-white/20'}`}>{s}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="glass-card p-12 min-h-[600px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Sparkles className="w-32 h-32 text-primary" />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-16 relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">01_ORIGIN_NODE</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
                    <input 
                      value={formData.source}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, source: e.target.value})}
                      placeholder="SCAN_LOCATION_..."
                      className="w-full bg-card border border-white/10 py-8 pl-16 pr-8 text-2xl font-display uppercase tracking-wider focus:border-primary outline-none transition-all placeholder:text-white/5"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">02_TARGET_DESTINATION</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
                    <input 
                      value={formData.destination}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, destination: e.target.value})}
                      placeholder="SET_COORDINATES_..."
                      className="w-full bg-card border border-white/10 py-8 pl-16 pr-8 text-2xl font-display uppercase tracking-wider focus:border-primary outline-none transition-all placeholder:text-white/5"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-12 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center group hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer">
                <div className="w-20 h-20 bg-card border border-white/5 flex items-center justify-center mb-6 text-white/10 group-hover:text-primary group-hover:border-primary transition-all">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-display uppercase mb-2 tracking-tight group-hover:text-white">SCAN_MISSION_TICKET</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">AUTOMATED_INTEL_EXTRACTION_ENABLED</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-16 relative z-10"
            >
              <div className="space-y-10">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">03_LOGISTICS_MODE</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'Flight', icon: Plane, label: 'AERIAL_DEEP_LINK' },
                    { id: 'Train', icon: Train, label: 'TERRESTRIAL_GRID' },
                    { id: 'Car', icon: Car, label: 'URBAN_MANEUVER' }
                  ].map((m: { id: string; icon: React.ElementType; label: string }) => (
                    <button 
                      key={m.id}
                      onClick={() => setFormData({...formData, mode: m.id})}
                      className={`p-10 border transition-all flex flex-col items-center gap-6 group ${formData.mode === m.id ? 'bg-primary/20 border-primary shadow-2xl shadow-primary/20' : 'bg-card border-white/5 text-white/20 hover:bg-white/5'}`}
                    >
                      <m.icon className={`w-10 h-10 transition-transform ${formData.mode === m.id ? 'text-primary scale-110' : 'group-hover:text-white'}`} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">04_RESOURCE_CREDITS</label>
                  <span className="text-4xl font-display uppercase tracking-tight text-white">₹{formData.budget.toLocaleString()}</span>
                </div>
                <div className="relative pt-4 pb-8">
                  <input 
                    type="range" 
                    min="5000" 
                    max="200000" 
                    step="5000"
                    value={formData.budget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, budget: parseInt(e.target.value)})}
                    className="w-full h-[2px] bg-white/10 appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                    <span className={formData.budget < 50000 ? 'text-primary' : ''}>ECON_NOMINAL</span>
                    <span className={formData.budget >= 50000 && formData.budget < 120000 ? 'text-primary' : ''}>PREMIUM_STABLE</span>
                    <span className={formData.budget >= 120000 ? 'text-primary' : ''}>ELITE_OVERRIDE</span>
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
              className="space-y-12 relative z-10"
            >
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-12">05_OPERATIONAL_VIBE</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VIBES.map((v: { id: string; label: string; desc: string }) => (
                  <button 
                    key={v.id}
                    onClick={() => setFormData({...formData, style: v.id})}
                    className={`p-10 border transition-all text-left relative group ${formData.style === v.id ? 'bg-primary/20 border-primary shadow-2xl shadow-primary/20' : 'bg-card border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="relative z-10">
                      <h4 className="font-display text-3xl uppercase mb-3 tracking-tight group-hover:text-primary transition-colors">{v.label}</h4>
                      <p className={`text-[10px] font-black uppercase tracking-widest leading-loose ${formData.style === v.id ? 'text-white' : 'text-white/20'}`}>{v.desc}</p>
                    </div>
                    {formData.style === v.id && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <Check className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-20 flex justify-between items-center relative z-10">
          <button 
            onClick={() => setStep((s: number) => Math.max(0, s-1))}
            className={`text-[10px] font-black uppercase tracking-[0.4em] py-5 px-10 border border-white/10 hover:border-white/30 transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            &larr; ABORT_PREVIOUS
          </button>
          
          {step < 2 ? (
            <button 
              onClick={() => setStep((s: number) => Math.min(2, s+1))}
              disabled={step === 0 && (!formData.source || !formData.destination)}
              className="glass-button bg-primary border-none shadow-2xl shadow-primary/20 disabled:opacity-30 disabled:grayscale"
            >
              <span>COMMIT_PROTOCOL</span> <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={loading}
              className={`glass-button border-none shadow-2xl transition-all ${loading ? 'bg-primary/50' : 'bg-accent text-black hover:bg-accent/80 shadow-accent/20'}`}
            >
              <Sparkles className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /> 
              <span>{loading ? 'CALCULATING_TRAJECTORY...' : 'EXECUTE_DEPLOYMENT'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
  );
}
