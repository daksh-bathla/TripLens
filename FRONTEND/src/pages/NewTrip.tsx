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
      
      // Now generate itinerary
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
    <div className="max-w-4xl mx-auto py-20">
      <header className="mb-20 text-center">
        <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Initialization_Sequence</span>
        <h1 className="text-6xl font-display font-black tracking-tighter uppercase mb-4">PLAN_NEW_MISSION</h1>
        <div className="flex justify-center gap-2">
          {STEPS.map((s: string, i: number) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary w-8' : i < step ? 'bg-primary' : 'bg-white/10'}`} />
            </div>
          ))}
        </div>
      </header>

      <div className="glass-card p-12 rounded-[50px] relative overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Origin_Point</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input 
                      value={formData.source}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, source: e.target.value})}
                      placeholder="ENTER_SOURCE_..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-xl font-bold focus:border-primary outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Target_Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input 
                      value={formData.destination}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, destination: e.target.value})}
                      placeholder="ENTER_DESTINATION_..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-xl font-bold focus:border-primary outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-white/20 group-hover:text-primary transition-colors">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">SCAN_TICKET_FOR_AUTO_ENTRY</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Transport_Mode</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'Flight', icon: Plane },
                    { id: 'Train', icon: Train },
                    { id: 'Car', icon: Car }
                  ].map((m: { id: string; icon: React.ElementType }) => (
                    <button 
                      key={m.id}
                      onClick={() => setFormData({...formData, mode: m.id})}
                      className={`p-8 rounded-3xl border transition-all flex flex-col items-center gap-4 ${formData.mode === m.id ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                      <m.icon className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{m.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4 flex justify-between">
                  <span>BUDGET_ALLOCATION</span>
                  <span className="text-white font-mono">₹{formData.budget.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="5000" 
                  max="200000" 
                  step="5000"
                  value={formData.budget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, budget: parseInt(e.target.value)})}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <span>Economic</span>
                  <span>Premium</span>
                  <span>Elite</span>
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
              className="space-y-8"
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4 block mb-8 text-center">SELECT_TRIP_VIBE</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VIBES.map((v: { id: string; label: string; desc: string }) => (
                  <button 
                    key={v.id}
                    onClick={() => setFormData({...formData, style: v.id})}
                    className={`p-8 rounded-3xl border transition-all text-left relative overflow-hidden group ${formData.style === v.id ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="relative z-10">
                      <h4 className="font-display font-black text-xl uppercase mb-1 tracking-tight">{v.label}</h4>
                      <p className={`text-xs ${formData.style === v.id ? 'text-white/80' : 'text-white/40'}`}>{v.desc}</p>
                    </div>
                    {formData.style === v.id && (
                      <Check className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 text-white/20" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-12 flex justify-between items-center">
          <button 
            onClick={() => setStep((s: number) => Math.max(0, s-1))}
            className={`text-[10px] font-black uppercase tracking-widest py-4 px-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            BACK_STAGE
          </button>
          
          {step < 2 ? (
            <button 
              onClick={() => setStep((s: number) => Math.min(2, s+1))}
              disabled={step === 0 && (!formData.source || !formData.destination)}
              className="glass-button bg-primary text-white border-none py-4 px-10 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
            >
              NEXT_PROTOCOL <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={loading}
              className="glass-button bg-green-500 text-white border-none py-4 px-10 shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              {loading ? 'INITIALIZING_AI...' : 'EXECUTE_MISSION'} <Sparkles className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
