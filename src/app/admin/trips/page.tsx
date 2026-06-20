'use client';

import { useState, useEffect } from 'react';
import { db, Trip } from '@/lib/db';
import { Compass, Calendar, Users, Plus, RefreshCw, Pencil } from 'lucide-react';
import Link from 'next/link';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTrips() {
    setLoading(true);
    try {
      const data = await db.getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[rgba(209,183,136,0.2)]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#1C1B1A]">Trips CMS</h1>
          <p className="text-xs text-[#45471D]">Create, view, and edit Journeys published on the public enquiry page.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadTrips}
            className="btn btn-secondary py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            Reload
          </button>
          
          <Link 
            href="/admin/trips/create"
            className="btn btn-primary py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus size={14} />
            Create Journey
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="animate-spin text-[#D55D27]" size={24} />
          <span className="text-xs text-[#45471D] font-medium tracking-wide">LOADING JOURNEYS CATALOG...</span>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[rgba(209,183,136,0.2)] p-6">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Compass size={20} />
          </div>
          <h3 className="font-display font-bold text-sm text-[#1C1B1A] mb-1">No Journeys Published</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
            Click the button below to add your first slow travel experience.
          </p>
          <Link href="/admin/trips/create" className="btn btn-primary text-xs font-semibold uppercase tracking-wider">
            Create First Journey
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const isOpen = trip.status === 'open';
            return (
              <div 
                key={trip.id} 
                className="bg-white rounded-xl border border-[rgba(209,183,136,0.25)] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-display font-bold text-base text-gray-900">{trip.name}</h3>
                      <p className="text-[10px] uppercase tracking-wider text-[#45471D] font-semibold">{trip.destination}</p>
                    </div>
                    
                    <span className={`badge ${
                      isOpen ? 'badge-trip-open' : 'badge-trip-closed'
                    } text-[9px] font-semibold py-0.5 px-2`}>
                      {trip.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-6 line-clamp-3 leading-relaxed font-light">
                    {trip.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[rgba(209,183,136,0.15)]">
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600 font-light">
                    <div>
                      <span className="text-[9px] uppercase text-gray-400 font-semibold block">Price (GST inc)</span>
                      <span className="font-semibold text-gray-900">₹{Number(trip.price_inr).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-gray-400 font-semibold block">Total Seats</span>
                      <span className="font-semibold text-gray-900">{trip.total_seats} seats</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-gray-400 font-semibold block">Dates</span>
                      <span className="font-semibold text-gray-900 truncate block">
                        {new Date(trip.start_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-gray-400">
                      Created on {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    
                    <Link 
                      href={`/admin/trips/${trip.id}`}
                      className="text-xs font-semibold text-[#45471D] hover:text-[#D55D27] flex items-center gap-1 border border-[rgba(209,183,136,0.3)] hover:border-[#D55D27] rounded px-2.5 py-1 bg-white"
                    >
                      <Pencil size={11} />
                      Edit Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
