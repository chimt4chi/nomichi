'use client';

import { useState, useEffect } from 'react';
import { db, Lead, Trip } from '@/lib/db';
import { Users, CheckCircle, Flame, Star, MapPin, Inbox, RefreshCw, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const fetchedLeads = await db.getLeads();
      const fetchedTrips = await db.getTrips();
      setLeads(fetchedLeads);
      setTrips(fetchedTrips);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <RefreshCw className="animate-spin text-[#D55D27]" size={28} />
        <span className="text-xs text-[#45471D] font-medium tracking-wider">AGGREGATING METRICS...</span>
      </div>
    );
  }

  // Calculate Metrics
  const totalLeads = leads.length;
  
  const stageCounts = {
    NEW: leads.filter(l => l.status === 'NEW').length,
    CONTACTED: leads.filter(l => l.status === 'CONTACTED').length,
    QUALIFIED: leads.filter(l => l.status === 'QUALIFIED').length,
    'VIBE CHECK SENT': leads.filter(l => l.status === 'VIBE CHECK SENT').length,
    CONFIRMED: leads.filter(l => l.status === 'CONFIRMED').length,
    'NOT A FIT': leads.filter(l => l.status === 'NOT A FIT').length,
  };

  const activeLeadsCount = totalLeads - stageCounts['NOT A FIT'];

  // Leads per trip mapping
  const tripLeadCounts = trips.map(trip => {
    const count = leads.filter(l => l.trip_id === trip.id).length;
    const confirmedCount = leads.filter(l => l.trip_id === trip.id && l.status === 'CONFIRMED').length;
    return {
      ...trip,
      leadCount: count,
      confirmedCount
    };
  }).sort((a, b) => b.leadCount - a.leadCount);

  // Quick stat cards
  const stats = [
    { label: 'Total Enquiries', value: totalLeads, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Leads', value: activeLeadsCount, icon: Users, color: 'text-[#D1B788]', bg: 'bg-[rgba(209,183,136,0.1)]' },
    { label: 'Confirmed Seats', value: stageCounts.CONFIRMED, icon: CheckCircle, color: 'text-[#D55D27]', bg: 'bg-[rgba(213,93,39,0.08)]' },
    { label: 'New Enquiries', value: stageCounts.NEW, icon: Flame, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[rgba(209,183,136,0.2)]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#1C1B1A]">Morning Pulse</h1>
          <p className="text-xs text-[#45471D]">Key metrics and enquiry trends for your coffee check-in.</p>
        </div>
        <button 
          onClick={loadData}
          className="btn btn-secondary py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 font-medium leading-tight">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.bg} ${s.color}`}>
                <s.icon size={16} />
              </div>
            </div>
            <span className="text-3xl font-display font-extrabold text-[#1C1B1A]">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Pipeline & Trips Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pipeline stage stats card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-[#D55D27]" size={18} />
            <h2 className="text-sm font-display font-bold text-[#1C1B1A] uppercase tracking-wider">Pipeline Stage Breakdown</h2>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {Object.entries(stageCounts).map(([stage, count]) => {
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              let barColor = 'bg-[#D1B788]'; // default
              if (stage === 'NEW') barColor = 'bg-yellow-400';
              if (stage === 'CONFIRMED') barColor = 'bg-[#D55D27]';
              if (stage === 'NOT A FIT') barColor = 'bg-gray-400';

              return (
                <div key={stage} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">{stage}</span>
                    <span className="text-gray-900 font-bold">{count} <span className="text-[10px] text-gray-400 font-normal">({Math.round(percentage)}%)</span></span>
                  </div>
                  <div className="w-full bg-[#FFFBF5] rounded-full h-2.5 border border-gray-100">
                    <div 
                      className={`h-2 rounded-full ${barColor}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leads per trip table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Star className="text-[#D55D27]" size={18} />
            <h2 className="text-sm font-display font-bold text-[#1C1B1A] uppercase tracking-wider">Interest by Journey</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-[#45471D] tracking-wider">
                  <th className="pb-3">Journey Name</th>
                  <th className="pb-3 text-center">Enquiries</th>
                  <th className="pb-3 text-center">Confirmed</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {tripLeadCounts.map((trip) => (
                  <tr key={trip.id} className="hover:bg-[#FFFBF5] transition-colors">
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-gray-900">{trip.name}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-0.5">
                        <MapPin size={10} />
                        {trip.destination}
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">{trip.leadCount}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        trip.confirmedCount > 0 
                          ? 'bg-[rgba(213,93,39,0.08)] text-[#D55D27]' 
                          : 'text-gray-400'
                      }`}>
                        {trip.confirmedCount} / {trip.total_seats}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`badge ${
                        trip.status === 'open' ? 'badge-trip-open' : 'badge-trip-closed'
                      } text-[10px] py-0.5 px-2`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Quick Action banner */}
      <div className="bg-[#45471D] text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-white text-base font-display font-bold">Ready to make calls?</h3>
          <p className="text-xs text-[#D1B788] mt-0.5">Check out your new leads and draft personalized WhatsApp opening messages.</p>
        </div>
        <Link href="/admin/leads" className="btn btn-primary bg-[#D55D27] text-white font-semibold text-xs uppercase tracking-wider px-4 py-2 hover:bg-white hover:text-[#1C1B1A]">
          Open Leads CRM
        </Link>
      </div>

    </div>
  );
}
