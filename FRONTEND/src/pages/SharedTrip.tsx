import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plane, Train, Car, Calendar, Leaf, Clock, Cloud, Compass, Phone, MessageSquare } from 'lucide-react';
import axios from 'axios';

const MODE_ICON: Record<string, React.ReactNode> = {
  Flight: <Plane className="w-4 h-4" />,
  Train: <Train className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
};

export default function SharedTrip() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'journey' | 'documents' | 'support'>('journey');
  const [requestingChangeItemId, setRequestingChangeItemId] = useState<string | null>(null);
  const [changeText, setChangeText] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);

  const handleRequestChange = async (itemId: string) => {
    if (!changeText.trim()) return;
    setSubmittingChange(true);
    try {
      const res = await axios.post(`/api/trips/${id}/items/${itemId}/comments`, {
        authorName: trip.clientName || 'Traveler',
        authorType: 'client',
        text: changeText
      });
      setTrip(res.data);
      setChangeText('');
      setRequestingChangeItemId(null);
    } catch {
      alert('Failed to submit change request. Please try again.');
    } finally {
      setSubmittingChange(false);
    }
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trips/${id}`);
        setTrip(res.data);
      } catch (err: any) {
        const errData = err.response?.data?.error;
        if (errData && typeof errData === 'object') {
          setError(errData.message || errData.error_description || JSON.stringify(errData));
        } else {
          setError(errData || 'Trip not found or expired.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (trip) {
      const title = `Itinerary: ${trip.source} to ${trip.destination} | ${trip.agencyName || 'TripLens'}`;
      const description = `Explore the custom travel itinerary from ${trip.source} to ${trip.destination} planned by ${trip.agencyName || 'TripLens'}. Duration: ${trip.days} days.`;
      const imageUrl = trip.agencyLogo || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&h=630&q=80';
      const pageUrl = window.location.href;

      document.title = title;

      // Helper function to update or create meta tags
      const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
        let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attrName, attrVal);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', contentVal);
      };

      // Standard Meta Description
      setMetaTag('name', 'description', description);

      // Robots Tag for indexing
      setMetaTag('name', 'robots', 'index, follow');

      // Canonical Link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', pageUrl);

      // Open Graph Tags
      setMetaTag('property', 'og:title', title);
      setMetaTag('property', 'og:description', description);
      setMetaTag('property', 'og:image', imageUrl);
      setMetaTag('property', 'og:url', pageUrl);
      setMetaTag('property', 'og:type', 'website');

      // Twitter Card Tags
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', title);
      setMetaTag('name', 'twitter:description', description);
      setMetaTag('name', 'twitter:image', imageUrl);

      // Create JSON-LD TouristTrip schema for search engines & AI crawlers
      const schema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": `Itinerary: ${trip.source} to ${trip.destination}`,
        "description": `Custom travel plan from ${trip.source} to ${trip.destination} for ${trip.days} days, styled as a ${trip.style} experience.`,
        "touristType": `${trip.style} tourism`,
        "provider": {
          "@type": "TravelAgency",
          "name": trip.agencyName || "TripLens Partner Agency",
          "logo": trip.agencyLogo || imageUrl,
          "url": pageUrl
        },
        "itinerary": {
          "@type": "ItemList",
          "numberOfItems": trip.itinerary ? trip.itinerary.length : 0,
          "itemListElement": (trip.itinerary || []).map((day: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": day.title || `Day ${day.day}`,
            "item": {
              "@type": "TouristAttraction",
              "name": day.title || `Day ${day.day}`,
              "description": (day.items || []).map((item: any) => `[${item.startTime || ''}] ${item.title} at ${item.location || 'various locations'}: ${item.description || ''}`).join('; ')
            }
          }))
        }
      };

      let scriptTag = document.getElementById('trip-schema');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'trip-schema';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);

      // Cleanup function to remove tags when component unmounts or trip changes
      return () => {
        const script = document.getElementById('trip-schema');
        if (script) script.remove();
        
        document.querySelector('link[rel="canonical"]')?.remove();
        document.querySelector('meta[name="robots"]')?.remove();
        document.querySelector('meta[name="description"]')?.remove();

        ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].forEach(prop => {
          document.querySelector(`meta[property="${prop}"]`)?.remove();
        });
        ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].forEach(name => {
          document.querySelector(`meta[name="${name}"]`)?.remove();
        });
      };
    }
  }, [trip]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-4">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-slate-500 font-semibold">Loading your travel portal...</span>
    </div>
  );

  if (error || !trip) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-4 text-slate-500 text-center px-4">
      <Compass className="w-12 h-12 text-slate-300 dark:text-white/20 animate-pulse" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error || 'This travel link is invalid'}</h2>
      <p className="text-sm text-slate-400 max-w-xs">Please contact your travel agency to get a new shareable link.</p>
    </div>
  );

  const brandingStyles = trip.agencyColor ? {
    '--primary': trip.agencyColor,
  } as React.CSSProperties : {};

  // Check draft status
  if (trip.status === 'draft') {
    return (
      <div 
        className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-500"
        style={brandingStyles}
      >
        <Compass className="w-12 h-12 text-primary animate-spin mb-4" style={{ animationDuration: '3s' }} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Preparing Your Trip</h2>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
          Your travel experience is being carefully prepared by your advisor.
        </p>
      </div>
    );
  }

  const budgetPerDay = Math.round(trip.budget / trip.days);

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-white transition-colors duration-300 pb-24 md:pb-12"
      style={brandingStyles}
    >
      {/* Premium White-labeled Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {trip.agencyLogo ? (
              <img src={trip.agencyLogo} alt={trip.agencyName} className="h-8 max-w-[120px] object-contain" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {trip.agencyName?.slice(0, 2).toUpperCase() || 'TL'}
              </div>
            )}
            <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200">
              {trip.agencyName || 'TripLens Travel'}
            </span>
          </div>
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-650 dark:text-slate-350 border border-slate-200/50 dark:border-white/[0.06] tracking-wider uppercase">
            Travel Command Center
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl p-6 md:p-12 min-h-[300px] flex flex-col justify-end shadow-sm border border-slate-200 dark:border-white/[0.04] bg-slate-950">
            {/* Background Image Layer - High-res Travel Photography */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1800&q=80" 
                alt={trip.destination} 
                className="w-full h-full object-cover opacity-35 dark:opacity-50" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
              <div className="space-y-4">
                <span className="border border-[#c5a880]/30 bg-[#c5a880]/10 text-[#c5a880] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm inline-block">
                  Prepared by {trip.agencyName || 'Wanderlust Travel'}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase leading-none">
                  {trip.source} → {trip.destination}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Last updated: {new Date(trip.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/[0.06] backdrop-blur-md px-4 py-2 rounded-xl border border-white/[0.08]">
                  {MODE_ICON[trip.mode]} {trip.mode}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/[0.06] backdrop-blur-md px-4 py-2 rounded-xl border border-white/[0.08]">
                  <Calendar className="w-4 h-4 text-slate-400" /> {trip.days} Days
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/20">
                  <Leaf className="w-4 h-4" /> {trip.carbon} kg CO₂ Saved
                </span>
              </div>
            </div>
          </section>

          {/* Today View Card */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Today's Schedule
                </h2>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Local Time: 10:24 AM</span>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-slate-250 dark:border-white/10 divide-slate-200 dark:divide-white/10 bg-slate-100/10 dark:bg-transparent">
                  {trip.itinerary[0].items.slice(0, 3).map((item: any, i: number) => (
                    <div key={item._id || i} className={`p-6 transition-all ${i === 0 ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                      <p className="text-primary font-bold text-xs uppercase tracking-wider mb-2">
                        {item.startTime} {item.endTime ? `— ${item.endTime}` : ''}
                      </p>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 truncate">{item.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        {item.location || 'Various locations'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Desktop Layout (Grid) */}
          <div className="hidden md:grid grid-cols-3 gap-8">
            {/* Itinerary Column */}
            <div className="col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-8">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Itinerary</h2>
                </div>

                {trip.itinerary && trip.itinerary.length > 0 ? (
                  <div className="space-y-8">
                    {trip.itinerary.map((day: any, idx: number) => (
                      <div key={day._id || idx} className="border-l-2 border-primary/30 dark:border-white/10 pl-6 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-primary rounded-full" />
                        <h3 className="font-extrabold text-slate-950 dark:text-white text-base mb-4">{day.title || `Day ${day.day}`}</h3>
                        
                        <div className="space-y-4">
                          {day.items && day.items.map((item: any) => (
                            <div key={item._id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 space-y-3">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">{item.category}</span>
                                    <span className="text-xs text-slate-400 capitalize">{item.section}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">{item.description}</p>
                                </div>
                                <div className="flex flex-col md:items-end text-xs text-slate-400 gap-1.5 flex-shrink-0">
                                  {item.startTime && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{item.startTime} {item.endTime && `- ${item.endTime}`}</span>
                                    </span>
                                  )}
                                  {item.location && (
                                    <span className="font-semibold text-primary inline-flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-primary" />
                                      <span>{item.location}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Bar */}
                              <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-white/[0.04]">
                                <button
                                  onClick={() => {
                                    setRequestingChangeItemId(requestingChangeItemId === item._id ? null : item._id);
                                    setChangeText('');
                                  }}
                                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Request Change</span>
                                </button>
                              </div>

                              {/* Comments / Change Requests */}
                              {item.comments && item.comments.length > 0 && (
                                <div className="space-y-2 pt-2">
                                  {item.comments.map((comment: any) => (
                                    <div key={comment._id} className="text-xs p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                                      <div className="flex justify-between items-center mb-1 font-bold text-slate-700 dark:text-slate-200">
                                        <span>{comment.authorName} <span className="text-[10px] font-normal text-slate-400">({comment.authorType === 'agent' ? 'Advisor' : 'You'})</span></span>
                                        <span className="text-[9px] text-slate-400 font-normal">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-slate-650 dark:text-slate-350">{comment.text}</p>
                                      <div className="mt-1.5">
                                        <span className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${comment.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                          {comment.status === 'open' ? 'Change Requested' : 'Resolved'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Request Form */}
                              {requestingChangeItemId === item._id && (
                                <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-white/[0.06]">
                                  <textarea
                                    value={changeText}
                                    onChange={(e) => setChangeText(e.target.value)}
                                    placeholder="Describe the change you'd like to request..."
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary h-16 resize-none text-slate-900 dark:text-white"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setRequestingChangeItemId(null)}
                                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-755 dark:hover:text-white transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleRequestChange(item._id)}
                                      disabled={submittingChange || !changeText.trim()}
                                      className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-all disabled:opacity-50"
                                    >
                                      Submit Request
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No activities listed yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Weather Widget */}
              <div id="widget-weather" className="glass-card p-6 rounded-2xl shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{trip.destination}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">24°C</h3>
                  </div>
                  <Cloud className="w-10 h-10 text-primary opacity-80" />
                </div>
                <div className="flex justify-between items-end text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Partly Cloudy</span>
                  <div className="text-right text-[11px]">
                    <p>Humidity: 45%</p>
                    <p>Wind: 12 km/h</p>
                  </div>
                </div>
              </div>

              {/* PNR / Reference Card */}
              <div id="card-references" className="glass-card p-6 rounded-2xl space-y-4 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Trip References</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5 text-xs font-semibold">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Flight PNR</span>
                    <span className="font-mono text-primary font-bold">{trip.pnr || 'AZ9128X'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5 text-xs font-semibold">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hotel Ref</span>
                    <span className="font-mono text-primary font-bold">HV77201</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5 text-xs font-semibold">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Agent ID</span>
                    <span className="font-mono text-primary font-bold">T-LENS-94</span>
                  </div>
                </div>
                <button id="btn-download-pdf" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100/50 hover:bg-slate-200/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 rounded-xl transition-colors text-xs font-bold text-slate-700 dark:text-white">
                  <Compass className="w-4 h-4" />
                  <span>Download PDF Docs</span>
                </button>
              </div>

              {/* Support Advisor Card */}
              <div id="card-advisor" className="glass-card p-6 rounded-2xl border-primary/20 bg-primary/5 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Your Personal Advisor</h3>
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    alt="Alessandra, Travel Advisor" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPvmkSbIUlaTIzCng3UnhwO3e9DdBZTDZfjAMaEC7e_5pEuCpWz3S_U68iMIDsToCyTfCRP41RasQjlmd7tBj15bQl7TVdq6_lwktsJWJPZ7pi9bjwLJfCz_A_Z92oyRMst2fw_Z1IdpN17Uz_UvCSqQv8jUgjGd-P_eCdHr1nMrO5NcBMRcdf2ltvGKLR_D5logW5yYIN5R7cx0R9H2vRXPsx3xhIc29TgBhzzxrBdLfp5QzrdIbAoeAHsPnZYzTBSXnLAozdp4u6" 
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-base">Alessandra Rossi</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Senior Concierge Specialist</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button id="btn-chat-advisor" className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all text-xs">
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat in Real-time</span>
                  </button>
                  <button id="btn-call-advisor" className="w-full flex items-center justify-center gap-2 py-3 border border-primary/40 text-primary rounded-xl hover:bg-primary/5 transition-all text-xs font-bold">
                    <Phone className="w-4 h-4" />
                    <span>Request Concierge Call</span>
                  </button>
                </div>
              </div>

              {/* Destination Insight / Concierge Tip */}
              <div className="glass-card p-6 rounded-2xl overflow-hidden relative group shadow-sm dark:shadow-none min-h-[160px] flex flex-col justify-end">
                <img 
                  alt="Canals of Venice" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5yR83w0iHqylcH1DCDoYLe0mPXSJsK4qeQaFLCg9Me2gv1-lvjWnLmBdf78tw_cn0_McxiqiUtqaudowJChABKCBlXxO5E-uE89iew0wLALinobhETcv3HYI0IaFrVaQpuKoZ52yW8ry74nP1GjZ5FSkaRRNI1Vw5XpsqD9mwhQ3V901M4-wlOwEvSEB1qlTQVb7y5foDerC4IPTpWUkJBda4JegtCCNCVW7jqBdPJmtUs5k0qwRxvdDckBx3wUFy3KN_IEb7pT4T" 
                />
                <div className="relative z-10 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Concierge Tip</h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    "The best views of Rome are from the Giardino degli Aranci at sunset. Ask your driver to take the scenic route up Aventine Hill."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout (Tabs-driven) */}
          <div className="md:hidden space-y-6">
            {activeTab === 'journey' && (
              <div id="tab-content-journey" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Clock className="w-4.5 h-4.5 text-primary" /> Daily Itinerary</h2>
                {trip.itinerary && trip.itinerary.length > 0 ? (
                  <div className="space-y-6">
                    {trip.itinerary.map((day: any, idx: number) => (
                      <div key={day._id || idx} className="border-l border-primary/30 dark:border-white/10 pl-4 relative">
                        <div className="absolute -left-[3.5px] top-1 w-1.5 h-1.5 bg-primary rounded-full" />
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3">{day.title || `Day ${day.day}`}</h3>
                        
                        <div className="space-y-3">
                          {day.items && day.items.map((item: any) => (
                            <div key={item._id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 space-y-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">{item.category}</span>
                                  <span className="text-[10px] text-slate-400 capitalize">{item.section}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</h4>
                                <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">{item.description}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[10px] text-slate-400">
                                  {item.startTime && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{item.startTime}</span>
                                    </span>
                                  )}
                                  {item.location && (
                                    <span className="font-semibold text-primary inline-flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-primary" />
                                      <span>{item.location}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Bar */}
                              <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-white/[0.04]">
                                <button
                                  id={`btn-request-change-mobile-${item._id}`}
                                  onClick={() => {
                                    setRequestingChangeItemId(requestingChangeItemId === item._id ? null : item._id);
                                    setChangeText('');
                                  }}
                                  className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Request Change</span>
                                </button>
                              </div>

                              {/* Comments / Change Requests */}
                              {item.comments && item.comments.length > 0 && (
                                <div className="space-y-2 pt-2">
                                  {item.comments.map((comment: any) => (
                                    <div key={comment._id} className="text-[11px] p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                                      <div className="flex justify-between items-center mb-0.5 font-bold text-slate-700 dark:text-slate-200">
                                        <span>{comment.authorName} <span className="text-[9px] font-normal text-slate-400">({comment.authorType === 'agent' ? 'Advisor' : 'You'})</span></span>
                                        <span className="text-[8px] text-slate-400 font-normal">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-slate-655 dark:text-slate-355">{comment.text}</p>
                                      <div className="mt-1">
                                        <span className={`inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${comment.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                          {comment.status === 'open' ? 'Change Requested' : 'Resolved'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Request Form */}
                              {requestingChangeItemId === item._id && (
                                <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-white/[0.06]">
                                  <textarea
                                    id={`textarea-change-mobile-${item._id}`}
                                    value={changeText}
                                    onChange={(e) => setChangeText(e.target.value)}
                                    placeholder="Describe the change you'd like to request..."
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary h-14 resize-none text-slate-900 dark:text-white"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      id={`btn-cancel-change-mobile-${item._id}`}
                                      onClick={() => setRequestingChangeItemId(null)}
                                      className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-755 dark:hover:text-white transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      id={`btn-submit-change-mobile-${item._id}`}
                                      onClick={() => handleRequestChange(item._id)}
                                      disabled={submittingChange || !changeText.trim()}
                                      className="px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/95 transition-all disabled:opacity-50"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No activities listed yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div id="tab-content-documents" className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><Cloud className="w-4 h-4" /> Destination Weather</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">24°C</p>
                      <p className="text-xs text-slate-500 mt-0.5">Partly Cloudy in {trip.destination}</p>
                    </div>
                    <Cloud className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Compass className="w-4 h-4" /> Journey References</h3>
                  {trip.pnr ? (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Booking Reference / PNR</span>
                      <span className="text-base font-mono font-bold text-slate-900 dark:text-white block mt-0.5">{trip.pnr}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No ticket references available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div id="tab-content-support" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Phone className="w-4 h-4" /> Advisor Assistance</h3>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-primary leading-relaxed">
                    If you have questions about scheduling, delays, or require emergency travel assistance, contact your travel agent:
                  </p>
                  <div>
                    <p className="text-sm font-bold text-primary">{trip.agencyName || 'TripLens Travel Support'}</p>
                    <p className="text-xs font-mono text-primary/70 mt-1">support@{trip.agencyName?.toLowerCase().replace(/\s+/g, '') || 'triplens'}.com</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Elegant, Floating Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] backdrop-blur-lg py-2.5 px-4 flex justify-around items-center z-50 shadow-lg dark:shadow-black/40 rounded-2xl">
        {[
          { id: 'journey', label: 'Journey', icon: Clock },
          { id: 'documents', label: 'Documents', icon: Compass },
          { id: 'support', label: 'Support', icon: Phone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary dark:text-white bg-primary/5 dark:bg-white/10 font-bold' 
                  : 'text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-bold tracking-wider uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
