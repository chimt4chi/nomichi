import { supabase, isSupabaseConfigured } from './supabase';

export interface Trip {
  id: string;
  created_at: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_inr: number;
  total_seats: number;
  status: 'open' | 'closed';
  description: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  trip_id: string;
  group_type: 'solo' | 'friends' | 'couple' | 'family';
  preferred_month: string;
  what_they_hope_trip_feels_like: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'VIBE CHECK SENT' | 'CONFIRMED' | 'NOT A FIT';
  owner_id?: string;
  owner_name?: string; // Fallback for mock mode
  trip?: Trip;
}

export interface CallLog {
  id: string;
  created_at: string;
  lead_id: string;
  note: string;
  author_email: string;
}

// ----------------------------------------------------
// SEED DATA FOR FALLBACK/MOCK MODE
// ----------------------------------------------------
const SEED_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    name: 'Spiti Valley Roadtrip',
    destination: 'Spiti Valley, Himachal Pradesh',
    start_date: '2026-07-10',
    end_date: '2026-07-18',
    price_inr: 34999,
    total_seats: 12,
    status: 'open',
    description: 'A journey through rugged terrains, high mountain passes, ancient monasteries, and beautiful lakes. Experience the cold desert mountain valley in its raw form.'
  },
  {
    id: 'trip-2',
    created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    name: 'Meghalaya Rain-forest Trek',
    destination: 'Cherrapunji & Mawlynnong, Meghalaya',
    start_date: '2026-08-12',
    end_date: '2026-08-18',
    price_inr: 28500,
    total_seats: 10,
    status: 'open',
    description: 'Walk behind waterfalls, cross living root bridges, and trek through lush sacred forests. A slow journey through the wettest place on earth.'
  },
  {
    id: 'trip-3',
    created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    name: 'Ladakh Cultural Trail',
    destination: 'Leh, Nubra & Pangong, Ladakh',
    start_date: '2026-09-05',
    end_date: '2026-09-13',
    price_inr: 42000,
    total_seats: 14,
    status: 'open',
    description: 'Immerse yourself in Ladakhi culture, visit monastic festivals, and sleep under starlit skies in Nubra Valley.'
  },
  {
    id: 'trip-4',
    created_at: new Date(Date.now() - 40 * 24 * 3600000).toISOString(),
    name: 'Gokarna Slow Living Retreat',
    destination: 'Gokarna, Karnataka',
    start_date: '2026-10-20',
    end_date: '2026-10-25',
    price_inr: 18000,
    total_seats: 8,
    status: 'closed',
    description: 'Yoga by the beach, organic meals, coastal walks, and slow sunsets. For those who want to rest, breathe, and unplug.'
  }
];

const SEED_PROFILES: Profile[] = [
  { id: 'user-1', full_name: 'Siddharth Sen', email: 'siddharth@thenomichi.com' },
  { id: 'user-2', full_name: 'Neha Roy', email: 'neha@thenomichi.com' },
  { id: 'user-3', full_name: 'Vikram Singh', email: 'vikram@thenomichi.com' }
];

const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@gmail.com',
    trip_id: 'trip-1',
    group_type: 'solo',
    preferred_month: 'July 2026',
    what_they_hope_trip_feels_like: 'Looking to disconnect from my startup life, read books by the river, and experience the quietude of high altitudes.',
    status: 'NEW',
    owner_id: 'user-1',
    owner_name: 'Siddharth Sen'
  },
  {
    id: 'lead-2',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    name: 'Priya Patel',
    phone: '+91 87654 32109',
    email: 'priya.patel@yahoo.com',
    trip_id: 'trip-2',
    group_type: 'couple',
    preferred_month: 'August 2026',
    what_they_hope_trip_feels_like: 'My partner and I want a trip that is slow and lets us experience local Khasi culture and food, not just checklist sightseeing. We love rains and mist.',
    status: 'QUALIFIED',
    owner_id: 'user-2',
    owner_name: 'Neha Roy'
  },
  {
    id: 'lead-3',
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    name: 'Kabir Mehta',
    phone: '+91 76543 21098',
    email: 'kabir@mehta.org',
    trip_id: 'trip-3',
    group_type: 'friends',
    preferred_month: 'September 2026',
    what_they_hope_trip_feels_like: 'A group of 3 high school friends looking for a peaceful getaway to catch up after years. We want a balance of short hikes and slow evenings.',
    status: 'CONTACTED',
    owner_id: 'user-1',
    owner_name: 'Siddharth Sen'
  },
  {
    id: 'lead-4',
    created_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    name: 'Ananya Sen',
    phone: '+91 95432 10987',
    email: 'ananya.sen@outlook.com',
    trip_id: 'trip-1',
    group_type: 'solo',
    preferred_month: 'July 2026',
    what_they_hope_trip_feels_like: 'Hoping for a challenging but slow-paced adventure. Want to meet like-minded, open travelers and learn about monastery lifestyles.',
    status: 'CONFIRMED',
    owner_id: 'user-2',
    owner_name: 'Neha Roy'
  }
];

const SEED_CALL_LOGS: CallLog[] = [
  {
    id: 'log-1',
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    lead_id: 'lead-2',
    note: 'Spoke with Priya. She confirmed they are looking for a slow travel experience. They are fine with heavy rain in Meghalaya and actually prefer it.',
    author_email: 'neha@thenomichi.com'
  },
  {
    id: 'log-2',
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    lead_id: 'lead-3',
    note: 'Left a voicemail for Kabir to schedule a quick vibe check call.',
    author_email: 'siddharth@thenomichi.com'
  },
  {
    id: 'log-3',
    created_at: new Date(Date.now() - 1.5 * 24 * 3600000).toISOString(),
    lead_id: 'lead-3',
    note: 'Kabir called back. Had a great 15-minute vibe check. They seem perfect for Nomichi - very collaborative, outdoorsy, and respectful of local cultures. Moving to Contacted.',
    author_email: 'siddharth@thenomichi.com'
  },
  {
    id: 'log-4',
    created_at: new Date(Date.now() - 0.5 * 24 * 3600000).toISOString(),
    lead_id: 'lead-4',
    note: 'Received booking payment. Seat confirmed for Spiti Valley. Sent confirmation pack via email.',
    author_email: 'neha@thenomichi.com'
  }
];

// Helper to initialize local storage data if not present
const getLocalStorageData = () => {
  if (typeof window === 'undefined') {
    return { trips: SEED_TRIPS, leads: SEED_LEADS, logs: SEED_CALL_LOGS, profiles: SEED_PROFILES };
  }
  
  if (!localStorage.getItem('nomichi_trips')) {
    localStorage.setItem('nomichi_trips', JSON.stringify(SEED_TRIPS));
  }
  if (!localStorage.getItem('nomichi_leads')) {
    localStorage.setItem('nomichi_leads', JSON.stringify(SEED_LEADS));
  }
  if (!localStorage.getItem('nomichi_logs')) {
    localStorage.setItem('nomichi_logs', JSON.stringify(SEED_CALL_LOGS));
  }
  if (!localStorage.getItem('nomichi_profiles')) {
    localStorage.setItem('nomichi_profiles', JSON.stringify(SEED_PROFILES));
  }

  return {
    trips: JSON.parse(localStorage.getItem('nomichi_trips') || '[]') as Trip[],
    leads: JSON.parse(localStorage.getItem('nomichi_leads') || '[]') as Lead[],
    logs: JSON.parse(localStorage.getItem('nomichi_logs') || '[]') as CallLog[],
    profiles: JSON.parse(localStorage.getItem('nomichi_profiles') || '[]') as Profile[]
  };
};

const saveLocalStorageData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const logError = (action: string, error: any) => {
  const msg = error?.message || error?.details || String(error);
  const isTableOrSchemaMissing = 
    msg.includes("schema cache") || 
    msg.includes("does not exist") || 
    msg.includes("Invalid API key") ||
    msg.includes("fetch failed");

  if (isTableOrSchemaMissing) {
    console.warn(
      `[Supabase Local Fallback] Active. Running offline using LocalStorage data: ${msg}`
    );
  } else {
    console.error(
      `[Supabase Database Alert] ${action} failed:`, 
      msg
    );
  }
};

// ----------------------------------------------------
// DATABASE API IMPLEMENTATION
// ----------------------------------------------------

export const db = {
  // Check if we are running in mock fallback mode
  isMockMode(): boolean {
    return !isSupabaseConfigured;
  },

  // --- TRIPS ---
  async getTrips(options?: { openOnly?: boolean }): Promise<Trip[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('trips').select('*').order('created_at', { ascending: false });
      if (options?.openOnly) {
        query = query.eq('status', 'open');
      }
      const { data, error } = await query;
      if (error) {
        logError('getTrips (falling back to LocalStorage)', error);
      } else {
        return data as Trip[];
      }
    }

    const { trips } = getLocalStorageData();
    if (options?.openOnly) {
      return trips.filter(t => t.status === 'open');
    }
    return trips;
  },

  async getTripById(id: string): Promise<Trip | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trips').select('*').eq('id', id).single();
      if (!error && data) return data as Trip;
      logError('getTripById', error);
    }
    const { trips } = getLocalStorageData();
    return trips.find(t => t.id === id) || null;
  },

  async createTrip(tripData: Omit<Trip, 'id' | 'created_at'>): Promise<Trip> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trips').insert([tripData]).select().single();
      if (!error && data) return data as Trip;
      logError('createTrip', error);
      throw error || new Error('Failed to create trip');
    }

    const { trips } = getLocalStorageData();
    const newTrip: Trip = {
      ...tripData,
      id: 'trip-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    trips.unshift(newTrip);
    saveLocalStorageData('nomichi_trips', trips);
    return newTrip;
  },

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trips').update(tripData).eq('id', id).select().single();
      if (!error && data) return data as Trip;
      logError('updateTrip', error);
      throw error || new Error('Failed to update trip');
    }

    const { trips } = getLocalStorageData();
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Trip not found');
    trips[idx] = { ...trips[idx], ...tripData };
    saveLocalStorageData('nomichi_trips', trips);
    return trips[idx];
  },

  // --- PROFILES / USERS ---
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) return data as Profile[];
      logError('getProfiles', error);
    }
    const { profiles } = getLocalStorageData();
    return profiles;
  },

  // --- LEADS ---
  async getLeads(filters?: { status?: string; tripId?: string; search?: string }): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('leads').select('*, trip:trips(*)').order('created_at', { ascending: false });
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.tripId && filters.tripId !== 'all') {
        query = query.eq('trip_id', filters.tripId);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (!error && data) {
        // Resolve owner names if needed (could do another join or profile map)
        const leads = data as (Lead & { trip: Trip })[];
        return leads;
      }
      logError('getLeads (falling back to LocalStorage)', error);
    }

    const { leads, trips, profiles } = getLocalStorageData();
    let result = leads.map(lead => ({
      ...lead,
      trip: trips.find(t => t.id === lead.trip_id),
      owner_name: lead.owner_name || profiles.find(p => p.id === lead.owner_id)?.full_name || 'Unassigned'
    }));

    if (filters?.status && filters.status !== 'all') {
      result = result.filter(l => l.status === filters.status);
    }
    if (filters?.tripId && filters.tripId !== 'all') {
      result = result.filter(l => l.trip_id === filters.tripId);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(s) || 
        l.email.toLowerCase().includes(s) || 
        l.phone.includes(s)
      );
    }

    return result;
  },

  async getLeadById(id: string): Promise<Lead | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').select('*, trip:trips(*)').eq('id', id).single();
      if (!error && data) return data as Lead;
      logError('getLeadById', error);
    }

    const { leads, trips, profiles } = getLocalStorageData();
    const lead = leads.find(l => l.id === id);
    if (!lead) return null;

    return {
      ...lead,
      trip: trips.find(t => t.id === lead.trip_id),
      owner_name: lead.owner_name || profiles.find(p => p.id === lead.owner_id)?.full_name || 'Unassigned'
    };
  },

  async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').insert([{
        ...leadData,
        status: 'NEW'
      }]).select().single();
      if (!error && data) return data as Lead;
      logError('createLead', error);
      throw error || new Error('Failed to submit enquiry');
    }

    const { leads } = getLocalStorageData();
    const newLead: Lead = {
      ...leadData,
      status: 'NEW',
      id: 'lead-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    leads.unshift(newLead);
    saveLocalStorageData('nomichi_leads', leads);
    return newLead;
  },

  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select().single();
      if (!error && data) return data as Lead;
      logError('updateLeadStatus', error);
      throw error || new Error('Failed to update status');
    }

    const { leads } = getLocalStorageData();
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lead not found');
    leads[idx].status = status;
    saveLocalStorageData('nomichi_leads', leads);
    return leads[idx];
  },

  async updateLeadOwner(id: string, ownerId: string | null): Promise<Lead> {
    const { profiles } = getLocalStorageData();
    const ownerProfile = profiles.find(p => p.id === ownerId);
    const ownerName = ownerProfile ? ownerProfile.full_name : 'Unassigned';

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').update({ owner_id: ownerId }).eq('id', id).select().single();
      if (!error && data) return { ...data, owner_name: ownerName } as Lead;
      logError('updateLeadOwner', error);
      throw error || new Error('Failed to update owner');
    }

    const { leads } = getLocalStorageData();
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lead not found');
    leads[idx].owner_id = ownerId || undefined;
    leads[idx].owner_name = ownerName;
    saveLocalStorageData('nomichi_leads', leads);
    return leads[idx];
  },

  async deleteLead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) return true;
      logError('deleteLead', error);
      return false;
    }

    const { leads } = getLocalStorageData();
    const filtered = leads.filter(l => l.id !== id);
    saveLocalStorageData('nomichi_leads', filtered);
    return true;
  },

  // --- CALL LOGS ---
  async getCallLogs(leadId: string): Promise<CallLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('call_logs').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
      if (!error && data) return data as CallLog[];
      logError('getCallLogs', error);
    }

    const { logs } = getLocalStorageData();
    return logs
      .filter(l => l.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addCallLog(leadId: string, note: string, authorEmail: string): Promise<CallLog> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('call_logs').insert([{
        lead_id: leadId,
        note,
        author_email: authorEmail
      }]).select().single();
      if (!error && data) return data as CallLog;
      logError('addCallLog', error);
      throw error || new Error('Failed to add call log');
    }

    const { logs } = getLocalStorageData();
    const newLog: CallLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      lead_id: leadId,
      note,
      author_email: authorEmail
    };
    logs.unshift(newLog);
    saveLocalStorageData('nomichi_logs', logs);
    return newLog;
  },

  formatMonth(monthStr: string): string {
    if (!monthStr) return 'Unspecified';
    if (!monthStr.includes('-')) return monthStr;
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }
};
