'use client';

import { useState, useEffect } from 'react';
import { db, Lead, Trip } from '@/lib/db';
import { Search, Filter, Calendar, User, Eye, Inbox, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTripId, setSelectedTripId] = useState('all');

  async function loadData() {
    setLoading(true);
    try {
      const fetchedLeads = await db.getLeads({
        status: selectedStatus,
        tripId: selectedTripId,
        search: searchText
      });
      const fetchedTrips = await db.getTrips();
      setLeads(fetchedLeads);
      setTrips(fetchedTrips);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load data on status/trip/search updates
  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedTripId, searchText]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: Lead['status']) => {
    switch (status) {
      case 'NEW': return 'badge-new';
      case 'CONTACTED': return 'badge-contacted';
      case 'QUALIFIED': return 'badge-qualified';
      case 'VIBE CHECK SENT': return 'badge-vibe';
      case 'CONFIRMED': return 'badge-confirmed';
      case 'NOT A FIT': return 'badge-notfit';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[rgba(209,183,136,0.2)]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#1C1B1A]">Leads CRM</h1>
          <p className="text-xs text-[#45471D]">Browse, search, and filter inbound trip enquiries.</p>
        </div>
        <button 
          onClick={loadData}
          className="btn btn-secondary py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw size={12} />
          Reload
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 absolute-y-center text-gray-400" size={16} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="form-input pl-10 py-2 text-xs"
          />
        </div>

        {/* Filter by Status */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="text-gray-400 shrink-0" size={14} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select py-2 text-xs"
          >
            <option value="all">All Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="VIBE CHECK SENT">Vibe Check Sent</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="NOT A FIT">Not A Fit</option>
          </select>
        </div>

        {/* Filter by Trip */}
        <div className="md:col-span-4 flex items-center gap-2">
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="form-select py-2 text-xs"
          >
            <option value="all">All Journeys</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CRM list content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="animate-spin text-[#D55D27]" size={24} />
          <span className="text-xs text-[#45471D] font-medium tracking-wide">REFRESHING CRM SELECTION...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[rgba(209,183,136,0.2)] p-6">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Inbox size={20} />
          </div>
          <h3 className="font-display font-bold text-sm text-[#1C1B1A] mb-1">No Leads Found</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Try adjusting your search query or filters, or submit a new enquiry on the public page.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (Visible on mobile, hidden on desktop) */}
          <div className="block md:hidden space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white p-4 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-gray-900">{lead.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {lead.phone} • {lead.email}
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(lead.status)} text-[9px] font-semibold py-0.5 px-2`}>
                    {lead.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-gray-50 text-[11px] text-gray-600">
                  <div>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase block">Trip Interest</span>
                    <span className="font-semibold text-gray-800 truncate block">{lead.trip?.name || 'General Inquiry'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase block">Owner Host</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User size={10} className="text-[#D1B788]" />
                      <span className="font-medium">{lead.owner_name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-50 text-xs">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar size={10} />
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                  <Link 
                    href={`/admin/leads/${lead.id}`}
                    className="p-1.5 px-2.5 rounded-lg border border-[rgba(209,183,136,0.3)] hover:border-[#D55D27] hover:text-[#D55D27] text-gray-600 flex items-center gap-1 text-[10px] font-semibold bg-white"
                  >
                    <Eye size={10} />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table List (Hidden on mobile, visible on desktop) */}
          <div className="hidden md:block bg-white rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FFFBF5] text-[10px] uppercase font-bold text-[#45471D] tracking-wider">
                    <th className="p-4">Traveller Details</th>
                    <th className="p-4">Trip Interest</th>
                    <th className="p-4">Owner Host</th>
                    <th className="p-4 text-center">Pipeline Stage</th>
                    <th className="p-4">Date Submitted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#FFFBF5] transition-colors group">
                      {/* Traveller Info */}
                      <td className="p-4 pr-2">
                        <div className="font-bold text-gray-900 group-hover:text-[#D55D27] transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {lead.phone} • {lead.email}
                        </div>
                      </td>

                      {/* Trip Interest */}
                      <td className="p-4 pr-2">
                        <div className="font-semibold text-gray-800">{lead.trip?.name || 'General Inquiry'}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <span>Group: {lead.group_type}</span>
                          <span>•</span>
                          <span>Month: {db.formatMonth(lead.preferred_month)}</span>
                        </div>
                      </td>

                      {/* Assigned Host */}
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-[#D1B788]" />
                          <span className="font-medium">{lead.owner_name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 text-center">
                        <span className={`badge ${getStatusBadgeClass(lead.status)} text-[10px] font-semibold`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatDate(lead.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin/leads/${lead.id}`}
                            className="p-2 rounded-lg border border-[rgba(209,183,136,0.3)] hover:border-[#D55D27] hover:text-[#D55D27] hover:bg-white text-gray-600 flex items-center gap-1"
                          >
                            <Eye size={12} />
                            <span className="text-[10px] font-semibold">View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
