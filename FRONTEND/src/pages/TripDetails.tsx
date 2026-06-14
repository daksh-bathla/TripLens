import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plane, Train, Car, Calendar, Leaf, ChevronLeft, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';

interface TripDetailsProps {
  token: string;
}

const MODE_ICON: Record<string, React.ReactNode> = {
  Flight: <Plane className="w-4 h-4 text-slate-400" />,
  Train: <Train className="w-4 h-4 text-slate-400" />,
  Car: <Car className="w-4 h-4 text-slate-400" />,
};

const STATUS_OPTIONS = ['draft', 'proposed', 'confirmed'] as const;

export default function TripDetails({ token }: TripDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrip(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, token]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    try {
      const res = await axios.patch(`/api/trips/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(res.data);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <div className="w-6 h-6 border-2 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-slate-500">Loading trip...</span>
    </div>
  );

  if (error || !trip) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
      <MapPin className="w-10 h-10 text-slate-300 dark:text-white/20" />
      <p className="font-medium">{error || 'Trip not found'}</p>
      <Link to="/" className="text-sm text-primary font-semibold hover:text-primary/80">Back to Dashboard</Link>
    </div>
  );

  const budgetPerDay = Math.round(trip.budget / trip.days);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Dashboard
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete Trip'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-400 mb-1 font-medium">
                  {trip.clientName || 'Unknown Client'}
                </p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {trip.source} → {trip.destination}
                </h1>
              </div>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={saving}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                      trip.status === s
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg">
                {MODE_ICON[trip.mode]} {trip.mode}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-400" /> {trip.days} days
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-lg">
                <Leaf className="w-4 h-4" /> {trip.carbon} kg CO₂
              </span>
              <span className="text-xs text-slate-500 self-center ml-auto">
                Created {new Date(trip.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Itinerary</h2>
            </div>

            {trip.itinerary ? (
              <div className="space-y-6">
                {trip.itinerary.split('\n\n').filter(Boolean).map((day: string, idx: number) => {
                  const [title, ...points] = day.split('\n');
                  return (
                    <div key={idx} className="border-l-2 border-slate-200 dark:border-white/15 pl-4">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title || `Day ${idx + 1}`}</h3>
                      <div className="space-y-1.5">
                        {points.filter(Boolean).map((p, pidx) => (
                          <p key={pidx} className="text-sm text-slate-600 dark:text-slate-300">{p.replace(/^[-•] ?/, '')}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No itinerary yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">Budget</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">₹{trip.budget.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mb-6">₹{budgetPerDay.toLocaleString()} / day</p>
            <div className="space-y-3">
              {[
                { label: 'Transport', pct: 40 },
                { label: 'Accommodation', pct: 35 },
                { label: 'Food & Activities', pct: 25 },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>{b.label}</span>
                    <span>{b.pct}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Carbon Impact
            </h3>
            <p className="text-2xl font-bold text-emerald-300 mb-1">{trip.carbon} kg</p>
            <p className="text-sm text-emerald-400 mb-4">CO₂ estimated for this trip</p>
            {trip.mode === 'Flight' && (
              <p className="text-xs text-emerald-400 bg-emerald-500/15 rounded-lg p-3">
                Switching to train would reduce emissions by ~70%
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
