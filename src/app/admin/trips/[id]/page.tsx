'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db, Trip } from '@/lib/db';
import { ArrowLeft, Save, AlertCircle, Compass, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TripEditorPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const isCreateMode = id === 'create';

  const [loading, setLoading] = useState(!isCreateMode);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form fields state
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceInr, setPriceInr] = useState('');
  const [totalSeats, setTotalSeats] = useState('10');
  const [status, setStatus] = useState<'open' | 'closed'>('open');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isCreateMode) return;

    async function loadTrip() {
      try {
        const trip = await db.getTripById(id);
        if (!trip) {
          setGeneralError('The requested journey could not be found.');
          setLoading(false);
          return;
        }
        setName(trip.name);
        setDestination(trip.destination);
        setStartDate(trip.start_date);
        setEndDate(trip.end_date);
        setPriceInr(trip.price_inr.toString());
        setTotalSeats(trip.total_seats.toString());
        setStatus(trip.status);
        setDescription(trip.description || '');
      } catch (err) {
        console.error('Failed to load trip details:', err);
        setGeneralError('Failed to load trip details.');
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [id, isCreateMode]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Please enter a name for the journey';
    if (!destination.trim()) errors.destination = 'Please enter a destination';
    if (!startDate) errors.startDate = 'Please select a start date';
    if (!endDate) errors.endDate = 'Please select an end date';
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.endDate = 'End date cannot be earlier than start date';
    }

    const price = Number(priceInr);
    if (!priceInr) {
      errors.priceInr = 'Please enter a price';
    } else if (isNaN(price) || price < 0) {
      errors.priceInr = 'Price must be a positive number';
    }

    const seats = Number(totalSeats);
    if (!totalSeats) {
      errors.totalSeats = 'Please enter total seats';
    } else if (isNaN(seats) || seats <= 0 || !Number.isInteger(seats)) {
      errors.totalSeats = 'Total seats must be a positive whole number';
    }

    if (!description.trim()) {
      errors.description = 'Please write a short description';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const tripData = {
        name: name.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        price_inr: Number(priceInr),
        total_seats: Number(totalSeats),
        status,
        description: description.trim()
      };

      if (isCreateMode) {
        await db.createTrip(tripData);
      } else {
        await db.updateTrip(id, tripData);
      }
      
      router.push('/admin/trips');
    } catch (err: any) {
      console.error(err);
      setGeneralError(err.message || 'We could not save the trip. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#D55D27]" size={28} />
        <span className="text-xs text-[#45471D] font-medium tracking-wider">LOADING DETAILS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Back button */}
      <div className="pb-4 border-b border-[rgba(209,183,136,0.2)]">
        <Link 
          href="/admin/trips" 
          className="flex items-center gap-1.5 text-xs text-[#45471D] hover:text-[#D55D27] font-semibold"
        >
          <ArrowLeft size={14} />
          Back to Trips CMS
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Compass className="text-[#D55D27]" size={20} />
          <h2 className="text-lg font-display font-bold text-[#1C1B1A]">
            {isCreateMode ? 'Publish New Journey' : 'Edit Journey Details'}
          </h2>
        </div>

        {generalError && (
          <div className="p-3 mb-6 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Journey Name */}
          <div className="form-group">
            <label className="form-label">Journey Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spiti Valley Roadtrip"
              className="form-input text-xs"
              disabled={submitting}
            />
            {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
          </div>

          {/* Destination */}
          <div className="form-group">
            <label className="form-label">Destination Region</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Spiti Valley, Himachal Pradesh"
              className="form-input text-xs"
              disabled={submitting}
            />
            {fieldErrors.destination && <span className="form-error">{fieldErrors.destination}</span>}
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input text-xs"
                disabled={submitting}
              />
              {fieldErrors.startDate && <span className="form-error">{fieldErrors.startDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input text-xs"
                disabled={submitting}
              />
              {fieldErrors.endDate && <span className="form-error">{fieldErrors.endDate}</span>}
            </div>
          </div>

          {/* Price, Seats, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Price (INR, GST inc)</label>
              <input
                type="number"
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                placeholder="e.g. 34999"
                className="form-input text-xs"
                disabled={submitting}
              />
              {fieldErrors.priceInr && <span className="form-error">{fieldErrors.priceInr}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Total Group Seats</label>
              <input
                type="number"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                placeholder="e.g. 12"
                className="form-input text-xs"
                disabled={submitting}
              />
              {fieldErrors.totalSeats && <span className="form-error">{fieldErrors.totalSeats}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="form-select text-xs"
                disabled={submitting}
              >
                <option value="open">Open (Show on Form)</option>
                <option value="closed">Closed (Hide on Form)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description & Short Vibe Notes</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What details make this journey special? Mention quiet trails, homestays, walking paces..."
              className="form-textarea text-xs leading-relaxed"
              disabled={submitting}
            />
            {fieldErrors.description && <span className="form-error">{fieldErrors.description}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`btn btn-ink w-full text-xs font-semibold uppercase tracking-wider py-3 mt-4 flex items-center justify-center gap-1.5 ${
              submitting ? 'btn-disabled' : ''
            }`}
          >
            {submitting ? (
              <span>Saving Journey...</span>
            ) : (
              <>
                <Save size={14} />
                <span>Save Journey</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
