'use client';

import { useState, useEffect } from 'react';
import { db, Trip } from '@/lib/db';
import { Compass, Users, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PublicEnquiryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  
  // Interactive features states
  const [confirmedCounts, setConfirmedCounts] = useState<Record<string, number>>({});
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [groupType, setGroupType] = useState<'solo' | 'friends' | 'couple' | 'family'>('solo');
  const [preferredMonth, setPreferredMonth] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [hopes, setHopes] = useState('');
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Tagline word cycling state
  const taglines = ['feel personal', 'slow down', 'connect deeply', 'feel offbeat'];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [taglineClass, setTaglineClass] = useState('rotating-word-active');

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineClass('rotating-word-hidden-up');
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
        setTaglineClass('rotating-word-hidden-down');
        setTimeout(() => {
          setTaglineClass('rotating-word-active');
        }, 50);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadTrips() {
      try {
        const openTrips = await db.getTrips({ openOnly: true });
        setTrips(openTrips);
        if (openTrips.length > 0) {
          setSelectedTripId(openTrips[0].id);
        }

        // Fetch leads to calculate seat vacancies
        const allLeads = await db.getLeads();
        const counts: Record<string, number> = {};
        allLeads.forEach(lead => {
          if (lead.status === 'CONFIRMED') {
            counts[lead.trip_id] = (counts[lead.trip_id] || 0) + 1;
          }
        });
        setConfirmedCounts(counts);

      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoadingTrips(false);
      }
    }
    loadTrips();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Please provide your name';
    
    // Validate phone: Allow +, spaces, dashes, and requires at least 10 digits
    const cleanPhone = phone.replace(/[-+\s()]/g, '');
    if (!phone.trim()) {
      errors.phone = 'Please provide your phone number';
    } else if (cleanPhone.length < 10 || isNaN(Number(cleanPhone))) {
      errors.phone = 'Please enter a valid phone number with area code';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Please provide your email address';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!selectedTripId) {
      errors.trip = 'Please select a trip you are interested in';
    }

    if (!preferredMonth.trim()) {
      errors.preferredMonth = 'Please state your preferred month';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await db.createLead({
        name,
        phone,
        email,
        trip_id: selectedTripId,
        group_type: groupType,
        preferred_month: preferredMonth,
        what_they_hope_trip_feels_like: hopes
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setGeneralError(err.message || 'We could not submit your enquiry. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTripCardSelect = (id: string) => {
    setSelectedTripId(id);
    // Smooth scroll to form on mobile devices
    if (window.innerWidth < 768) {
      document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#FFFBF5]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-[rgba(209,183,136,0.4)] shadow-lg animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(213,93,39,0.1)] flex items-center justify-center text-[#D55D27]">
              <CheckCircle2 size={36} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 font-display text-[#1C1B1A]">We have received your enquiry</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Thank you for sharing your thoughts with us. We read every word. A Nomichi host will review your request, read your vibe, and message you on WhatsApp to schedule a brief call.
          </p>
          <div className="p-4 bg-[#FFFBF5] rounded-lg border border-[rgba(209,183,136,0.2)] mb-6 text-left">
            <span className="text-xs font-semibold text-[#D55D27] uppercase tracking-wider block mb-1">What happens next</span>
            <p className="text-xs text-[#45471D]">
              We run our group journeys with small numbers. This ensures a slow, cohesive group pace. We will be in touch within twenty four hours.
            </p>
          </div>
          <p className="text-sm font-semibold italic text-[#45471D] mb-8 font-display">Travel that finds you.</p>
          <button 
            onClick={() => setSuccess(false)} 
            className="btn btn-primary w-full text-xs font-semibold uppercase tracking-wider"
          >
            Browse Other Journeys
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#1C1B1A]">
      {/* Brand Header */}
      <header className="border-b border-[rgba(209,183,136,0.3)] py-6 bg-[#FFFBF5] sticky top-0 z-20 backdrop-blur-md bg-opacity-90 animate-fadeInUp opacity-0">
        <div className="container flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-2xl tracking-tight text-[#1C1B1A] flex items-center gap-1">
              NOM<span className="text-[#D55D27]">I</span>CH<span className="text-[#D55D27]">I</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#45471D] font-semibold">Travel that finds you</span>
          </div>
          <a 
            href="/admin" 
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-[#D1B788] text-[#45471D] hover:border-[#D55D27] hover:text-[#D55D27]"
          >
            Team Dashboard
          </a>
        </div>
      </header>

      {/* Main Hero & Description */}
      <section className="py-16 md:py-20 border-b border-[rgba(209,183,136,0.2)] relative overflow-hidden flex items-center justify-center">
        {/* Background Image with Ken Burns zoom animation */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="/hero_bg.png" 
            alt="Misty mountain backdrop" 
            className="w-full h-full object-cover animate-ken-burns"
            style={{ opacity: 0.85, filter: 'contrast(0.95) brightness(0.98)' }}
          />
          {/* Subtle gradient overlay to match our warm cream theme */}
          <div 
            className="absolute inset-0" 
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 251, 245, 0.25) 0%, rgba(255, 251, 245, 0.5) 100%)'
            }}
          />
        </div>

        {/* Background Ambient Glowing Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div 
            className="absolute animate-float-slow"
            style={{
              top: '-15%',
              left: '8%',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(213,93,39,0.07) 0%, rgba(213,93,39,0) 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div 
            className="absolute animate-float-reverse"
            style={{
              bottom: '-20%',
              right: '8%',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(209,183,136,0.1) 0%, rgba(209,183,136,0) 70%)',
              filter: 'blur(45px)',
            }}
          />
        </div>

        {/* Translucent Frosted Glass Card Wrapper */}
        <div className="container max-w-4xl text-center relative z-10 mx-auto px-4">
          <div className="bg-opacity-65 backdrop-blur-md rounded-2xl p-8 md:p-12 animate-fadeInUp opacity-0 delay-100">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-[#1C1B1A] mb-4 tracking-tight leading-tight">
              Small group journeys <br/>
              for people who want a trip to{' '}
              <span className="text-[#D55D27] inline-flex justify-center border-b border-dashed border-[rgba(213,93,39,0.35)] px-1">
                <span className={`rotating-word ${taglineClass}`}>
                  {taglines[currentTaglineIndex]}
                </span>
              </span>.
            </h1>
            <p className="text-[#45471D] text-base max-w-2xl mx-auto font-light leading-relaxed mt-4">
              We design slow, offbeat experiences. Every journey is curated and led by our own guides. We do not tick checkboxes. We seek shared meals, long forest walks, and quiet mountain evenings.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog & Form Section */}
      <main className="container py-12 animate-fadeInUp opacity-0 delay-300">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Trip Selector Cards */}
          <div className="md:col-span-7 space-y-6">
            <div className="flex flex-col gap-4 mb-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-display font-bold text-[#1C1B1A] flex items-center gap-2">
                  <Compass className="text-[#D55D27]" size={20} />
                  Open Journeys
                </h2>
                <span className="text-xs text-[#45471D]">Select a card to enquire</span>
              </div>

              {/* Interactive Region Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['All', 'Himachal Pradesh', 'Meghalaya', 'Ladakh'].map((region) => {
                  const isActive = selectedRegion === region;
                  const count = region === 'All' 
                    ? trips.length 
                    : trips.filter(t => t.destination.includes(region)).length;

                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setSelectedRegion(region)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#D55D27] text-white border-[#D55D27] shadow-sm'
                          : 'bg-white text-[#45471D] border-[rgba(209,183,136,0.3)] hover:border-[#D1B788]'
                      }`}
                    >
                      {region === 'All' ? 'All Regions' : region.split(',')[0]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {loadingTrips ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-40" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[rgba(209,183,136,0.2)] p-6">
                <p className="text-[#45471D] text-sm">No open journeys currently available. Please check back later.</p>
              </div>
            ) : trips.filter(t => selectedRegion === 'All' || t.destination.includes(selectedRegion)).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[rgba(209,183,136,0.2)] p-6">
                <p className="text-[#45471D] text-sm">No open journeys found in {selectedRegion}. Try checking another region.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips
                  .filter(t => selectedRegion === 'All' || t.destination.includes(selectedRegion))
                  .map((trip) => {
                    const isSelected = trip.id === selectedTripId;
                    const confirmedCount = confirmedCounts[trip.id] || 0;
                    const seatsLeft = trip.total_seats - confirmedCount;

                    return (
                      <div
                        key={trip.id}
                        onClick={() => handleTripCardSelect(trip.id)}
                        className={`cursor-pointer text-left premium-card transition-all p-6 rounded-xl border ${
                          isSelected 
                            ? 'border-[#D55D27] bg-[#FFFBF5] ring-2 ring-[rgba(213,93,39,0.15)] shadow-md' 
                            : 'border-[rgba(209,183,136,0.2)] hover:border-[#D1B788] bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-display font-bold text-lg text-[#1C1B1A]">{trip.name}</h3>
                            <p className="text-xs text-[#45471D] font-medium">{trip.destination}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-[#D55D27] block">
                              ₹{Number(trip.price_inr).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-gray-500 block">includes GST</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-3 border-t border-[rgba(209,183,136,0.15)] text-xs text-[#45471D]">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#D1B788]" />
                            <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-[#D1B788]" />
                            {seatsLeft <= 0 ? (
                              <span className="font-semibold text-red-600">Fully Booked (Waitlist Open)</span>
                            ) : seatsLeft <= 3 ? (
                              <span className="font-semibold text-orange-600">Only {seatsLeft} seats left!</span>
                            ) : (
                              <span>{seatsLeft} / {trip.total_seats} seats left</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Form Side */}
          <div className="md:col-span-5" id="enquiry-form">
            <div className="bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.3)] shadow-md sticky top-28">
              <h2 className="text-lg font-display font-bold text-[#1C1B1A] mb-1 flex items-center gap-2">
                <Sparkles className="text-[#D55D27]" size={18} />
                Send an Enquiry
              </h2>
              <p className="text-xs text-[#45471D] mb-6 leading-relaxed">
                Tell us about yourself and what you are looking for in this journey.
              </p>

              {generalError && (
                <div className="p-3 mb-4 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Trip Dropdown */}
                <div className="form-group">
                  <label className="form-label">Journey of Interest</label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="form-select text-sm"
                  >
                    <option value="" disabled>Select a journey</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (₹{Number(t.price_inr).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                  {formErrors.trip && <span className="form-error">{formErrors.trip}</span>}
                </div>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="form-input text-sm"
                  />
                  {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                </div>

                {/* Contact grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="form-input text-sm"
                    />
                    {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="form-input text-sm"
                    />
                    {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                  </div>
                </div>

                {/* Group and Month Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Group Type */}
                  <div className="form-group">
                    <label className="form-label">How are you traveling?</label>
                    <select
                      value={groupType}
                      onChange={(e) => setGroupType(e.target.value as any)}
                      className="form-select text-sm"
                    >
                      <option value="solo">Solo</option>
                      <option value="friends">With Friends</option>
                      <option value="couple">As a Couple</option>
                      <option value="family">With Family</option>
                    </select>
                  </div>

                  {/* Preferred Month */}
                  <div className="form-group">
                    <label className="form-label">Preferred Month</label>
                    <input
                      type="month"
                      value={preferredMonth}
                      onChange={(e) => setPreferredMonth(e.target.value)}
                      className="form-input text-sm"
                      min="2026-06"
                    />
                    {formErrors.preferredMonth && (
                      <span className="form-error">{formErrors.preferredMonth}</span>
                    )}
                  </div>
                </div>

                {/* Hopes description */}
                <div className="form-group">
                  <label className="form-label">What are you hoping this trip feels like?</label>
                  <textarea
                    rows={4}
                    value={hopes}
                    onChange={(e) => setHopes(e.target.value)}
                    placeholder="We like quiet details. Tell us if you are looking to read, paint, or walk silently. What helps you reset?"
                    className="form-textarea text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn btn-primary w-full text-xs font-semibold uppercase tracking-wider mt-2 py-3 ${
                    submitting ? 'btn-disabled' : ''
                  }`}
                >
                  {submitting ? 'Sending Enquiry...' : 'Submit Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(209,183,136,0.2)] bg-[#F5EFE6] py-12 mt-16 text-center text-xs text-[#45471D]">
        <div className="container max-w-md">
          <p className="font-display font-semibold mb-2">NOMICHI EXPLORERS</p>
          <p className="mb-4">community-led travel. slow. personal.</p>
          <p className="text-[10px] text-gray-400">&copy; 2026 Nomichi. Confidential build assignment.</p>
        </div>
      </footer>
    </div>
  );
}
