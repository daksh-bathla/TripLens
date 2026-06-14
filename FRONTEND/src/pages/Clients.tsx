import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Globe, Calendar, Tag, Search, Plus, Trash2, Edit3, X, UserCheck } from 'lucide-react';
import axios from 'axios';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  preferences: string;
  loyaltyPrograms: string;
  nationality: string;
  passportExpiry: string;
}

interface ClientsProps {
  token: string;
  agency: { id: string; name: string } | null;
}

export default function Clients({ token, agency }: ClientsProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loyaltyPrograms, setLoyaltyPrograms] = useState('');
  const [nationality, setNationality] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = async () => {
    if (!agency?.id) return;
    try {
      const res = await axios.get(`/api/clients?userId=${agency.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Clients & Travelers | TripLens';
  }, []);

  useEffect(() => {
    fetchClients();
  }, [agency?.id]);

  const openAddPanel = () => {
    setEditingClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setPreferences('');
    setLoyaltyPrograms('');
    setNationality('');
    setPassportExpiry('');
    setError('');
    setIsPanelOpen(true);
  };

  const openEditPanel = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setPreferences(client.preferences);
    setLoyaltyPrograms(client.loyaltyPrograms);
    setNationality(client.nationality);
    setPassportExpiry(client.passportExpiry);
    setError('');
    setIsPanelOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this traveler profile?')) return;
    try {
      await axios.delete(`/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(prev => prev.filter(c => c._id !== clientId));
    } catch {
      alert('Failed to delete profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    setError('');

    const payload = {
      userId: agency?.id,
      name,
      email,
      phone,
      preferences,
      loyaltyPrograms,
      nationality,
      passportExpiry
    };

    try {
      if (editingClient) {
        const res = await axios.patch(`/api/clients/${editingClient._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(prev => prev.map(c => c._id === editingClient._id ? res.data : c));
      } else {
        const res = await axios.post('/api/clients', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(prev => [...prev, res.data]);
      }
      setIsPanelOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save traveler profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 relative">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <span className="text-primary font-semibold text-sm tracking-wide mb-1 block">Profiles Directory</span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Clients & Travelers</h1>
        </div>
        <button
          onClick={openAddPanel}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Traveler
        </button>
      </header>

      {/* Search Input */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search travelers by name or email..."
          className="w-full bg-card border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] gap-3">
          <div className="w-6 h-6 border-2 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading directory...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-16 text-center max-w-sm mx-auto">
          <div className="w-12 h-12 bg-slate-50 dark:bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 dark:border-white/[0.08]">
            <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No traveler profiles</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Create client profiles to capture loyalty programs, dietary requests, and custom hotel room preferences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <motion.div
              layout
              key={client._id}
              className="bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/15 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{client.name}</h4>
                      {client.email && <span className="text-xs text-slate-400 block mt-0.5">{client.email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditPanel(client)}
                      className="p-1.5 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.nationality && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{client.nationality}</span>
                    </div>
                  )}
                  {client.passportExpiry && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Expires {new Date(client.passportExpiry).toLocaleDateString()}</span>
                    </div>
                  )}
                  {client.loyaltyPrograms && (
                    <div className="flex items-start gap-2 pt-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[10px] uppercase block tracking-wider opacity-60">Loyalty Programs</span>
                        <span className="block mt-0.5 leading-normal">{client.loyaltyPrograms}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {client.preferences && (
                <div className="mt-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 text-xs text-slate-650 dark:text-slate-350">
                  <span className="font-bold text-[10px] uppercase block tracking-wider text-slate-400 mb-1">Traveler Preferences</span>
                  {client.preferences}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Sliding Edit/Add Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-slate-200 dark:border-white/10 p-8 z-50 overflow-y-auto shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingClient ? 'Edit Traveler Profile' : 'Add New Traveler'}
                </h3>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/15 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                    placeholder="rahul@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                    placeholder="+91 99999 99999"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nationality</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={e => setNationality(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                      placeholder="e.g. Indian"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Passport Expiry</label>
                    <input
                      type="date"
                      value={passportExpiry}
                      onChange={e => setPassportExpiry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Loyalty Programs</label>
                  <textarea
                    value={loyaltyPrograms}
                    onChange={e => setLoyaltyPrograms(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none text-slate-900 dark:text-white"
                    placeholder="e.g. Air India: 1234567, Marriott Bonvoy: 9876543"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Travel Preferences</label>
                  <textarea
                    value={preferences}
                    onChange={e => setPreferences(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none text-slate-900 dark:text-white"
                    placeholder="e.g. Vegetarian diet, prefers window seats, requests hotels with gym access."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 mt-4 inline-flex justify-center items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Traveler'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
