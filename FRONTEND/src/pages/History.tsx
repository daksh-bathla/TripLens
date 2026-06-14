import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plane, Train, Car, MapPin, ChevronRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface HistoryProps {
  token: string;
}

const MODE_ICON: Record<string, React.ReactNode> = {
  Flight: <Plane className="w-4 h-4" />,
  Train: <Train className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300',
  proposed: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  confirmed: 'bg-emerald-500/20 text-emerald-300',
};

export default function History({ token }: HistoryProps) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Trip Archive | TripLens';
    const fetchTrips = async () => {
      try {
        const res = await axios.get('/api/trips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrips(res.data);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [token]);

  const filtered = trips.filter(t => {
    const q = query.toLowerCase();
    return !q ||
      t.destination?.toLowerCase().includes(q) ||
      t.source?.toLowerCase().includes(q) ||
      t.clientName?.toLowerCase().includes(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <span className="text-primary font-semibold text-sm tracking-wide mb-1 block">Archive</span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">All Trips</h1>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search destination or client..."
            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </header>

      <div className="bg-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="bg-slate-50 dark:bg-white/5 px-6 py-3 border-b border-slate-200 dark:border-white/10 grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-1">Mode</div>
          <div className="col-span-4">Trip</div>
          <div className="col-span-3">Client</div>
          <div className="col-span-1 text-right">Budget</div>
          <div className="col-span-1 text-center">CO₂</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Date</div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-6 h-6 border-2 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading trips...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {filtered.map((trip, i) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/trip/${trip._id}`}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="col-span-1 text-slate-500">
                    {MODE_ICON[trip.mode] || <Plane className="w-4 h-4" />}
                  </div>
                  <div className="col-span-4">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">
                      {trip.source} → {trip.destination}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{trip.days} days</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{trip.clientName || '—'}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{(trip.budget / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-xs text-emerald-400 flex items-center justify-center gap-1">
                      <Leaf className="w-3 h-3" />{trip.carbon}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[trip.status] || STATUS_COLORS.draft}`}>
                      {trip.status || 'draft'}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <span className="text-xs text-slate-500">
                      {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <MapPin className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {query ? `No trips matching "${query}"` : 'No trips yet'}
            </p>
          </div>
        )}
      </div>

      {!loading && trips.length > 0 && (
        <p className="text-xs text-slate-500 text-right mt-3">
          {filtered.length} of {trips.length} trips
        </p>
      )}
    </motion.div>
  );
}
