'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db, Lead, CallLog, Profile } from '@/lib/db';
import { auth } from '@/lib/auth';
import { 
  ArrowLeft, Calendar, User, Phone, Mail, 
  Sparkles, MessageCircle, ClipboardCheck, Clipboard, FileText, 
  Clock, Plus, Trash2, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [lead, setLead] = useState<Lead | null>(null);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentHostEmail, setCurrentHostEmail] = useState('host@thenomichi.com');
  const [loading, setLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // AI Feature States
  const [vibe, setVibe] = useState('');
  const [loadingVibe, setLoadingVibe] = useState(false);
  
  const [whatsapp, setWhatsapp] = useState('');
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  async function loadData() {
    try {
      const leadData = await db.getLeadById(id);
      if (!leadData) {
        setLead(null);
        setLoading(false);
        return;
      }
      setLead(leadData);

      const logsData = await db.getCallLogs(id);
      setLogs(logsData);

      const profilesData = await db.getProfiles();
      setProfiles(profilesData);

      const user = await auth.getUser();
      if (user) {
        setCurrentHostEmail(user.email);
      }
    } catch (err) {
      console.error('Failed to load lead details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  // Run AI Vibe Check automatically once lead loads
  useEffect(() => {
    if (lead && !vibe && !loadingVibe) {
      triggerVibeCheck(lead);
    }
  }, [lead]);

  const triggerVibeCheck = async (activeLead: Lead) => {
    setLoadingVibe(true);
    try {
      const res = await fetch('/api/ai/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeLead.name,
          group_type: activeLead.group_type,
          what_they_hope_trip_feels_like: activeLead.what_they_hope_trip_feels_like,
          trip_name: activeLead.trip?.name
        })
      });
      const data = await res.json();
      if (data.vibe) {
        setVibe(data.vibe);
      } else {
        setVibe('Could not analyze the vibe. Please try again.');
      }
    } catch (err) {
      console.error('Vibe check error:', err);
      setVibe('Could not read the vibe.');
    } finally {
      setLoadingVibe(false);
    }
  };

  const triggerWhatsAppDraft = async () => {
    if (!lead) return;
    setLoadingWhatsapp(true);
    setCopiedWhatsapp(false);
    try {
      const res = await fetch('/api/ai/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          what_they_hope_trip_feels_like: lead.what_they_hope_trip_feels_like,
          trip_name: lead.trip?.name,
          owner_name: lead.owner_name || 'Siddharth'
        })
      });
      const data = await res.json();
      if (data.message) {
        setWhatsapp(data.message);
      } else {
        setWhatsapp('Could not draft WhatsApp message.');
      }
    } catch (err) {
      console.error('WhatsApp draft error:', err);
      setWhatsapp('Could not draft message.');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const triggerCallLogSummary = async () => {
    if (logs.length === 0) {
      setSummary('No call notes logged yet. Next action is first contact.');
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logs.map(l => ({ note: l.note, author_email: l.author_email }))
        })
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary('Could not summarize touchpoints.');
      }
    } catch (err) {
      console.error('Summary error:', err);
      setSummary('Could not summarize touchpoints.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!lead) return;
    try {
      const updated = await db.updateLeadStatus(lead.id, newStatus);
      setLead(prev => prev ? { ...prev, status: updated.status } : null);
      showToast(`Pipeline stage updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update stage');
    }
  };

  const handleOwnerChange = async (ownerId: string) => {
    if (!lead) return;
    try {
      const val = ownerId === 'unassigned' ? null : ownerId;
      const updated = await db.updateLeadOwner(lead.id, val);
      setLead(prev => prev ? { 
        ...prev, 
        owner_id: updated.owner_id, 
        owner_name: updated.owner_name 
      } : null);
      showToast(`Assigned owner to ${updated.owner_name}`);
    } catch (err) {
      showToast('Failed to update owner');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !lead) return;

    setAddingNote(true);
    try {
      const newLog = await db.addCallLog(lead.id, noteText, currentHostEmail);
      setLogs(prev => [newLog, ...prev]);
      setNoteText('');
      setSummary('');
      showToast('Touchpoint note logged');
    } catch (err) {
      showToast('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    if (confirm(`Are you sure you want to delete ${lead.name}'s enquiry? This action is permanent.`)) {
      const ok = await db.deleteLead(lead.id);
      if (ok) {
        router.push('/admin/leads');
      } else {
        alert('Could not delete lead.');
      }
    }
  };

  const copyToClipboard = () => {
    if (!whatsapp) return;
    navigator.clipboard.writeText(whatsapp);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#D55D27]" size={28} />
        <span className="text-xs text-[#45471D] font-medium tracking-wider">RETRIEVING PROFILE...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-[rgba(209,183,136,0.2)] p-6">
        <AlertCircle className="text-red-500 mx-auto mb-3" size={32} />
        <h3 className="font-display font-bold text-sm text-[#1C1B1A] mb-1">Lead Not Found</h3>
        <p className="text-xs text-gray-500 mb-6">The requested enquiry id does not exist in our system.</p>
        <Link href="/admin/leads" className="btn btn-secondary text-xs uppercase tracking-wider font-semibold">
          Back to CRM list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button & Delete */}
      <div className="flex justify-between items-center pb-4 border-b border-[rgba(209,183,136,0.2)]">
        <Link 
          href="/admin/leads" 
          className="flex items-center gap-1.5 text-xs text-[#45471D] hover:text-[#D55D27] font-semibold"
        >
          <ArrowLeft size={14} />
          Back to CRM List
        </Link>
        <button 
          onClick={handleDeleteLead}
          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 px-3 py-1.5 border border-dashed border-red-200 hover:border-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} />
          Remove Enquiry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Traveller details + controls + touchpoints */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D55D27]">
                Enquiry details
              </span>
              <h2 className="text-xl font-display font-bold text-[#1C1B1A] mt-0.5">{lead.name}</h2>
              <span className="text-[10px] text-gray-400 font-mono">Enquired on {formatDate(lead.created_at)}</span>
            </div>

            {/* Contact info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FFFBF5] rounded-lg border border-[rgba(209,183,136,0.2)] text-xs">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#D1B788]" />
                <div>
                  <span className="text-[10px] text-gray-500 block">WhatsApp Number</span>
                  <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="font-semibold hover:underline">
                    {lead.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#D1B788]" />
                <div>
                  <span className="text-[10px] text-gray-500 block">Email Address</span>
                  <a href={`mailto:${lead.email}`} className="font-semibold hover:underline truncate block max-w-[150px]">
                    {lead.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#D1B788]" />
                <div>
                  <span className="text-[10px] text-gray-500 block">Target Journey</span>
                  <span className="font-semibold block">{lead.trip?.name || 'General Inquiry'}</span>
                </div>
              </div>
            </div>

            {/* Traveler inputs details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">Group Structure</span>
                <span className="font-medium text-gray-800 capitalize">{lead.group_type} traveler</span>
              </div>
              
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">Preferred Departure</span>
                <span className="font-medium text-gray-800">{db.formatMonth(lead.preferred_month)}</span>
              </div>
            </div>

            {/* Statement of hopes */}
            {lead.what_they_hope_trip_feels_like && (
              <div className="space-y-1.5 pt-4 border-t border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">What they hope this trip feels like</span>
                <p className="text-xs text-gray-700 leading-relaxed italic p-3 bg-gray-50 rounded-lg border border-gray-100">
                  &ldquo;{lead.what_they_hope_trip_feels_like}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* CRM Controls: Status & Owner */}
          <div className="bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm space-y-5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D55D27]">
                Visual Pipeline Stepper
              </span>
              <h3 className="text-sm font-display font-bold text-[#1C1B1A] uppercase tracking-wider">Host & Pipeline Management</h3>
            </div>

            {/* Clickable Pipeline Stepper */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-5">
              {(['NEW', 'CONTACTED', 'QUALIFIED', 'VIBE CHECK SENT', 'CONFIRMED', 'NOT A FIT'] as Lead['status'][]).map((stage) => {
                const isCurrent = lead.status === stage;
                const isNotFit = stage === 'NOT A FIT';
                
                let activeStyle = '';
                if (isCurrent) {
                  if (stage === 'NEW') activeStyle = 'bg-yellow-400 text-black border-yellow-400';
                  else if (stage === 'CONFIRMED') activeStyle = 'bg-[#D55D27] text-white border-[#D55D27]';
                  else if (isNotFit) activeStyle = 'bg-black text-white border-black';
                  else activeStyle = 'bg-[#D1B788] text-[#1C1B1A] border-[#D1B788]';
                } else {
                  activeStyle = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400';
                }

                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleStatusChange(stage)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${activeStyle}`}
                  >
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />}
                    <span>{stage}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Host Selector */}
              <div className="form-group mb-0">
                <label className="form-label">Assigned Host</label>
                <select
                  value={lead.owner_id || 'unassigned'}
                  onChange={(e) => handleOwnerChange(e.target.value)}
                  className="form-select text-xs py-2.5"
                >
                  <option value="unassigned">Unassigned</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Status Selector Dropdown */}
              <div className="form-group mb-0">
                <label className="form-label">Dropdown Stage Sync</label>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
                  className="form-select text-xs py-2.5"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="VIBE CHECK SENT">Vibe Check Sent</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="NOT A FIT">Not A Fit</option>
                </select>
              </div>

            </div>
          </div>

          {/* Touchpoints Call Log */}
          <div className="bg-white p-6 rounded-xl border border-[rgba(209,183,136,0.2)] shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-display font-bold text-[#1C1B1A] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={16} className="text-[#D1B788]" />
                Touchpoint Log
              </h3>
              <span className="text-[10px] text-gray-500 font-medium">{logs.length} notes logged</span>
            </div>

            {/* Note form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log a call note or outline the next scheduled touchpoint. Keep details concrete..."
                rows={3}
                className="form-textarea text-xs leading-relaxed"
                disabled={addingNote}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className={`btn btn-ink text-xs font-semibold py-2 px-4 flex items-center gap-1.5 ${
                    addingNote || !noteText.trim() ? 'btn-disabled' : ''
                  }`}
                >
                  <Plus size={12} />
                  Log Touchpoint
                </button>
              </div>
            </form>

            {/* Note feed */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  No touchpoints logged yet.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                  {logs.map((log) => (
                    <div key={log.id} className="relative pl-7 text-xs">
                      {/* Timeline dot */}
                      <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-[#D1B788] border-2 border-white ring-2 ring-gray-100" />
                      
                      <div className="bg-[#FFFBF5] p-3 rounded-lg border border-[rgba(209,183,136,0.15)] space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span className="font-semibold text-gray-700">{log.author_email}</span>
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-light">{log.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Co-Host Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[rgba(213,93,39,0.25)] shadow-md space-y-6 sticky top-28 bg-gradient-to-b from-white to-[#FFFBF5]">
            <div className="flex items-center gap-1.5 pb-3 border-b border-[rgba(213,93,39,0.15)]">
              <Sparkles className="text-[#D55D27]" size={18} />
              <h2 className="text-sm font-display font-extrabold text-[#1C1B1A] uppercase tracking-wider">AI Host Assistant</h2>
            </div>

            {/* AI Vibe check */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#45471D] block">1. Vibe Evaluation</span>
              {loadingVibe ? (
                <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 font-light">
                  <Loader2 className="animate-spin text-[#D55D27]" size={14} />
                  Analyzing traveler profile...
                </div>
              ) : vibe ? (
                <div className="p-3.5 bg-[rgba(69,71,29,0.04)] border border-[rgba(69,71,29,0.15)] rounded-lg text-xs leading-relaxed font-light text-gray-700 space-y-1">
                  <span className="font-semibold text-xs text-[#45471D] block">Vibe Check Summary:</span>
                  <p>{vibe}</p>
                </div>
              ) : (
                <button
                  onClick={() => triggerVibeCheck(lead)}
                  className="btn btn-secondary text-[11px] font-semibold w-full py-2 hover:bg-white"
                >
                  Trigger Vibe Check
                </button>
              )}
            </div>

            {/* AI WhatsApp Message */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#45471D] block">2. First Message Composer</span>
              
              {loadingWhatsapp ? (
                <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 font-light">
                  <Loader2 className="animate-spin text-[#D55D27]" size={14} />
                  Composing WhatsApp draft...
                </div>
              ) : whatsapp ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 bg-white border border-[rgba(209,183,136,0.3)] rounded-lg text-xs font-light text-gray-700 select-all leading-relaxed relative">
                    {whatsapp}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={`btn w-full text-xs font-semibold py-2 flex items-center justify-center gap-1.5 ${
                      copiedWhatsapp 
                        ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' 
                        : 'btn-secondary hover:bg-white'
                    }`}
                  >
                    {copiedWhatsapp ? (
                      <>
                        <ClipboardCheck size={12} />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Clipboard size={12} />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={triggerWhatsAppDraft}
                  className="btn btn-secondary text-[11px] font-semibold w-full py-2 flex items-center justify-center gap-1.5 hover:bg-white"
                >
                  <MessageCircle size={13} className="text-[#D55D27]" />
                  Draft WhatsApp Message
                </button>
              )}
            </div>

            {/* AI Logs Summary */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#45471D] block">3. Touchpoint Summarizer</span>
              
              {loadingSummary ? (
                <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 font-light">
                  <Loader2 className="animate-spin text-[#D55D27]" size={14} />
                  Summarizing call notes...
                </div>
              ) : summary ? (
                <div className="p-3.5 bg-orange-50/30 border border-orange-200/50 rounded-lg text-xs leading-relaxed font-light text-gray-700 space-y-1">
                  <span className="font-semibold text-xs text-[#D55D27] block">Status & Next Action:</span>
                  <p>{summary}</p>
                </div>
              ) : (
                <button
                  onClick={triggerCallLogSummary}
                  className="btn btn-secondary text-[11px] font-semibold w-full py-2 flex items-center justify-center gap-1.5 hover:bg-white"
                  disabled={logs.length === 0}
                >
                  <FileText size={13} className="text-[#D55D27]" />
                  Summarize Call Log
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
      
      {/* Toast notification overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1C1B1A] text-white px-4 py-3 rounded-lg shadow-xl z-50 text-xs font-semibold flex items-center gap-2 border border-gray-800 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#D55D27] animate-ping shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
