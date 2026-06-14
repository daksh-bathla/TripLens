import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plane, Train, Car, Calendar, Leaf, Compass, ChevronLeft, Clock, Trash2, Sparkles, Share2, Copy, Save, GripVertical } from 'lucide-react';
import axios from 'axios';

interface TripDetailsProps {
  token: string;
}

const MODE_ICON: Record<string, React.ReactNode> = {
  Flight: <Plane className="w-4 h-4 text-slate-400" />,
  Train: <Train className="w-4 h-4 text-slate-400" />,
  Car: <Car className="w-4 h-4 text-slate-400" />,
};

const STATUS_OPTIONS = ['draft', 'published', 'archived'] as const;

export default function TripDetails({ token }: TripDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Drag and Drop States
  const [draggedItem, setDraggedItem] = useState<{ dayIdx: number; itemIdx: number } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ dayIdx: number; itemIdx: number } | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrip(res.data);
      } catch (err: any) {
        const errData = err.response?.data?.error;
        if (errData && typeof errData === 'object') {
          setError(errData.message || errData.error_description || JSON.stringify(errData));
        } else {
          setError(errData || 'Failed to load trip');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, token]);

  useEffect(() => {
    if (trip) {
      document.title = `Itinerary: ${trip.source} to ${trip.destination} | TripLens`;
    }
  }, [trip]);

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

  const generateItinerary = async () => {
    setGeneratingItinerary(true);
    try {
      const res = await axios.post('/api/generate-itinerary', { tripId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip((prev: any) => ({ ...prev, itinerary: res.data.itinerary }));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate itinerary');
    } finally {
      setGeneratingItinerary(false);
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/shared/${id}`;
    navigator.clipboard.writeText(link);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const triggerAutosave = async (updatedItinerary: any) => {
    setSaveStatus('saving');
    try {
      await axios.patch(`/api/trips/${id}/itinerary`, { itinerary: updatedItinerary }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch {
      setSaveStatus('idle');
    }
  };

  const handleItineraryItemChange = (dayIdx: number, itemIdx: number, field: string, value: string) => {
    const newItinerary = [...trip.itinerary];
    newItinerary[dayIdx].items[itemIdx][field] = value;
    setTrip((prev: any) => ({ ...prev, itinerary: newItinerary }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      triggerAutosave(newItinerary);
    }, 1000);
  };

  const handleDragStart = (e: React.DragEvent, dayIdx: number, itemIdx: number) => {
    setDraggedItem({ dayIdx, itemIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e: React.DragEvent, dayIdx: number, itemIdx: number) => {
    e.preventDefault();
    if (dragOverItem?.dayIdx !== dayIdx || dragOverItem?.itemIdx !== itemIdx) {
      setDragOverItem({ dayIdx, itemIdx });
    }
  };

  const handleDropItem = (e: React.DragEvent, targetDayIdx: number, targetItemIdx: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { dayIdx: sourceDayIdx, itemIdx: sourceItemIdx } = draggedItem;

    if (sourceDayIdx === targetDayIdx && sourceItemIdx === targetItemIdx) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newItinerary = JSON.parse(JSON.stringify(trip.itinerary));
    const [movedItem] = newItinerary[sourceDayIdx].items.splice(sourceItemIdx, 1);
    newItinerary[targetDayIdx].items.splice(targetItemIdx, 0, movedItem);

    setTrip((prev: any) => ({ ...prev, itinerary: newItinerary }));
    triggerAutosave(newItinerary);
    
    setDraggedItem(null);
    setDragOverItem(null);
    setDragOverDay(null);
  };

  const handleDragOverDay = (e: React.DragEvent, dayIdx: number) => {
    e.preventDefault();
    if (dragOverDay !== dayIdx) {
      setDragOverDay(dayIdx);
    }
  };

  const handleDropDay = (e: React.DragEvent, targetDayIdx: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { dayIdx: sourceDayIdx, itemIdx: sourceItemIdx } = draggedItem;

    if (sourceDayIdx === targetDayIdx) {
      setDraggedItem(null);
      setDragOverDay(null);
      return;
    }

    const newItinerary = JSON.parse(JSON.stringify(trip.itinerary));
    const [movedItem] = newItinerary[sourceDayIdx].items.splice(sourceItemIdx, 1);
    
    if (!newItinerary[targetDayIdx].items) {
      newItinerary[targetDayIdx].items = [];
    }
    newItinerary[targetDayIdx].items.push(movedItem);

    setTrip((prev: any) => ({ ...prev, itinerary: newItinerary }));
    triggerAutosave(newItinerary);
    
    setDraggedItem(null);
    setDragOverItem(null);
    setDragOverDay(null);
  };

  const handleCreateSnapshot = async () => {
    const label = prompt('Enter a label for this snapshot:', `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    if (label === null) return;
    try {
      const res = await axios.post(`/api/trips/${id}/snapshots`, { label }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create snapshot');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? Your current itinerary will be replaced.')) return;
    try {
      const res = await axios.post(`/api/trips/${id}/restore-version`, { versionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(res.data);
      alert('Version restored successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to restore version');
    }
  };

  const handleAddComment = async (dayIdx: number, itemIdx: number, text: string) => {
    if (!text.trim()) return;
    const item = trip.itinerary[dayIdx].items[itemIdx];
    try {
      const res = await axios.post(`/api/trips/${id}/items/${item._id}/comments`, {
        authorName: trip.agencyName || 'Advisor',
        authorType: 'agent',
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleResolveComment = async (dayIdx: number, itemIdx: number, commentId: string) => {
    const item = trip.itinerary[dayIdx].items[itemIdx];
    try {
      const res = await axios.patch(`/api/trips/${id}/items/${item._id}/comments/${commentId}`, {
        status: 'resolved'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resolve comment');
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await axios.post(`/api/trips/${id}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/trip/${res.data._id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to duplicate trip');
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      await axios.post('/api/templates', {
        userId: trip.userId,
        title: `${trip.source} to ${trip.destination} - ${trip.days} Days`,
        days: trip.days,
        style: trip.style,
        itinerary: trip.itinerary
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Itinerary saved as template!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save template');
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
      className="max-w-5xl mx-auto py-8 relative"
    >
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -10, x: '-50%', scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-800 dark:border-white/10 flex items-center gap-2"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span>{saveStatus === 'saving' ? 'Saving changes' : 'All changes saved'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to={`/shared/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Compass className="w-4 h-4" /> Preview Portal
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Share2 className="w-4 h-4" /> {shared ? 'Link Copied!' : 'Share with Client'}
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" /> Duplicate Trip
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete Trip'}
          </button>
        </div>
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
              <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.02] rounded-xl p-1">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      trip.status === s
                        ? 'bg-white dark:bg-[#1f2937] text-slate-950 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Itinerary</h2>
              </div>
              
              <div className="flex items-center gap-3">
                {trip.itinerary && trip.itinerary.length > 0 && (
                  <button
                    onClick={handleSaveAsTemplate}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-all font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" /> Save as Template
                  </button>
                )}
              </div>
            </div>

            {trip.itinerary && trip.itinerary.length > 0 ? (
              <div className="space-y-6">
                {trip.itinerary.map((day: any, dIdx: number) => {
                  const isDayDraggedOver = dragOverDay === dIdx;
                  return (
                    <div
                      key={day._id || dIdx}
                      onDragOver={(e) => handleDragOverDay(e, dIdx)}
                      onDragLeave={() => setDragOverDay(null)}
                      onDrop={(e) => handleDropDay(e, dIdx)}
                      className={`border-l pl-6 space-y-4 transition-all duration-205 relative border-slate-200 dark:border-white/[0.06] ${
                        isDayDraggedOver ? 'border-primary bg-primary/5 py-2 rounded-xl' : ''
                      }`}
                    >
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{day.title || `Day ${day.day}`}</h3>
                      
                      <div className="space-y-3">
                        {day.items && day.items.map((item: any, itemIdx: number) => {
                          const isEditing = editingItemId === item._id;
                          const openCommentsCount = item.comments?.filter((c: any) => c.status === 'open').length || 0;
                          const isDraggedOver = dragOverItem?.dayIdx === dIdx && dragOverItem?.itemIdx === itemIdx;
                          
                          return (
                            <div
                              key={item._id || itemIdx}
                              draggable={!isEditing}
                              onDragStart={(e) => handleDragStart(e, dIdx, itemIdx)}
                              onDragOver={(e) => handleDragOverItem(e, dIdx, itemIdx)}
                              onDragLeave={() => setDragOverItem(null)}
                              onDrop={(e) => handleDropItem(e, dIdx, itemIdx)}
                              className={`transition-all duration-300 rounded-2xl ${
                                isDraggedOver ? 'bg-primary/5 ring-1 ring-primary/20 scale-[1.01] shadow-sm' : ''
                              }`}
                            >
                              {isEditing ? (
                                <div className="bg-slate-100 dark:bg-white/10 rounded-2xl p-4 border border-primary/30 space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                                      <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'title', e.target.value)}
                                        className="bg-white dark:bg-slate-950 text-xs font-bold rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-white/10 w-full focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                        placeholder="Activity title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                                      <input
                                        type="text"
                                        value={item.location}
                                        onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'location', e.target.value)}
                                        className="bg-white dark:bg-slate-950 text-xs font-bold rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-white/10 w-full focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                        placeholder="Location"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Time</label>
                                      <input
                                        type="text"
                                        value={item.startTime}
                                        onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'startTime', e.target.value)}
                                        className="bg-white dark:bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-white/10 w-full focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                        placeholder="e.g. 09:00 AM"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Time</label>
                                      <input
                                        type="text"
                                        value={item.endTime}
                                        onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'endTime', e.target.value)}
                                        className="bg-white dark:bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-white/10 w-full focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                        placeholder="e.g. 11:30 AM"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                                    <textarea
                                      value={item.description}
                                      onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'description', e.target.value)}
                                      className="bg-white dark:bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-white/10 w-full focus:outline-none focus:ring-1 focus:ring-primary h-16 resize-none text-slate-900 dark:text-white"
                                      placeholder="Add details..."
                                    />
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                      <select 
                                        value={item.category}
                                        onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'category', e.target.value)}
                                        className="bg-white dark:bg-slate-950 text-[10px] rounded px-2 py-1 text-slate-500 border border-slate-200 dark:border-white/10"
                                      >
                                        <option value="activity">Activity</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="flight">Flight</option>
                                        <option value="transfer">Transfer</option>
                                      </select>
                                      <select 
                                        value={item.section}
                                        onChange={e => handleItineraryItemChange(dIdx, itemIdx, 'section', e.target.value)}
                                        className="bg-white dark:bg-slate-950 text-[10px] rounded px-2 py-1 text-slate-500 border border-slate-200 dark:border-white/10"
                                      >
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                      </select>
                                    </div>
                                    <button
                                      onClick={() => setEditingItemId(null)}
                                      className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-all"
                                    >
                                      Close Editor
                                    </button>
                                  </div>

                                  {/* Change Requests Section */}
                                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Change Requests & Discussion</h5>
                                    
                                    {item.comments && item.comments.length > 0 ? (
                                      <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
                                        {item.comments.map((comment: any) => (
                                          <div key={comment._id} className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                                            <div className="flex justify-between items-start mb-1">
                                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                                {comment.authorName} <span className="text-[10px] text-slate-400 font-normal">({comment.authorType === 'agent' ? 'Advisor' : 'Client'})</span>
                                              </span>
                                              <span className="text-[9px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-slate-650 dark:text-slate-350">{comment.text}</p>
                                            
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.03]">
                                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${comment.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {comment.status}
                                              </span>
                                              {comment.status === 'open' && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResolveComment(dIdx, itemIdx, comment._id);
                                                  }}
                                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-350 transition-colors animate-pulse"
                                                >
                                                  Resolve Request
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic">No change requests or comments on this activity.</p>
                                    )}

                                    {/* Add a comment from Advisor */}
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Add message/update..."
                                        id={`new-comment-input-${item._id}`}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            handleAddComment(dIdx, itemIdx, input.value);
                                            input.value = '';
                                          }
                                        }}
                                        className="flex-1 bg-white dark:bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(`new-comment-input-${item._id}`) as HTMLInputElement;
                                          if (input && input.value.trim()) {
                                            handleAddComment(dIdx, itemIdx, input.value);
                                            input.value = '';
                                          }
                                        }}
                                        className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => setEditingItemId(item._id)}
                                  className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] hover:border-primary/20 dark:hover:border-primary/20 rounded-2xl p-4 flex gap-3.5 items-start transition-all cursor-pointer group"
                                >
                                  <div className="text-slate-350 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 p-0.5 cursor-grab active:cursor-grabbing self-center">
                                    <GripVertical className="w-3.5 h-3.5 flex-shrink-0" />
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-primary/5 text-primary dark:text-primary border border-primary/10">{item.category}</span>
                                      <span className="text-xs text-slate-400 capitalize">{item.section}</span>
                                      {openCommentsCount > 0 && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-500/10 dark:bg-red-500/20 px-2 py-0.5 rounded-full">
                                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {openCommentsCount} {openCommentsCount === 1 ? 'request' : 'requests'}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title || 'Untitled Activity'}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate">{item.description || 'No description added yet.'}</p>
                                    <div className="flex items-center gap-3 pt-1">
                                      {item.startTime && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                          <Clock className="w-3 h-3" />
                                          <span>{item.startTime} {item.endTime && `- ${item.endTime}`}</span>
                                        </span>
                                      )}
                                      {item.location && (
                                        <span className="font-semibold text-primary text-[10px] inline-flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span>{item.location}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm mb-4 font-semibold">No itinerary yet</p>
                <button
                  onClick={generateItinerary}
                  disabled={generatingItinerary}
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/95 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Sparkles className={`w-4 h-4 ${generatingItinerary ? 'animate-spin' : ''}`} />
                  {generatingItinerary ? 'Generating Itinerary...' : 'Generate with AI'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Version History */}
          <div className="bg-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Version History</h3>
              <button
                onClick={handleCreateSnapshot}
                className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
              >
                Create Snapshot
              </button>
            </div>
            {trip.versions && trip.versions.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {[...trip.versions].reverse().map((v: any) => (
                  <div 
                    key={v._id} 
                    className="flex justify-between items-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 transition-all text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block truncate" title={v.label}>
                        {v.label}
                      </span>
                      <span className="text-[10px] text-slate-450 block mt-0.5">
                        {new Date(v.timestamp || v.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(v._id)}
                      className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-all flex-shrink-0"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No snapshots created yet.
              </div>
            )}
          </div>

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

          <div className="bg-emerald-555/10 border border-emerald-500/20 rounded-2xl p-6 bg-emerald-50 dark:bg-emerald-900/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Carbon Impact
            </h3>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{trip.carbon} kg</p>
            <p className="text-sm text-emerald-500 dark:text-emerald-400 mb-4">CO₂ estimated for this trip</p>
            {trip.mode === 'Flight' && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-lg p-3">
                Switching to train would reduce emissions by ~70%
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
