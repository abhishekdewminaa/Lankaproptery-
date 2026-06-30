import React, { useState } from 'react';
import { Agent, AgentNote } from './types';
import { Mail, Phone, ExternalLink, Facebook, Instagram, Linkedin, FileText, Check, X, Calendar, Clock, Plus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileTabProps {
  agent: Agent;
  onUpdateAgent: (updated: Agent) => void;
  adminDarkMode: boolean;
}

export default function ProfileTab({ agent, onUpdateAgent, adminDarkMode }: ProfileTabProps) {
  const [newNote, setNewNote] = useState('');

  const handleVerify = () => {
    onUpdateAgent({
      ...agent,
      is_verified: true,
      admin_notes: [
        {
          date: new Date().toISOString(),
          author: 'Admin',
          note: 'Verification approved by Admin.'
        },
        ...agent.admin_notes
      ]
    });
    toast.success(`${agent.name} verified successfully!`);
  };

  const handleReject = () => {
    onUpdateAgent({
      ...agent,
      is_verified: 'rejected',
      admin_notes: [
        {
          date: new Date().toISOString(),
          author: 'Admin',
          note: 'Verification rejected.'
        },
        ...agent.admin_notes
      ]
    });
    toast.error(`${agent.name} verification rejected.`);
  };

  const handleRevoke = () => {
    onUpdateAgent({
      ...agent,
      is_verified: 'pending',
      admin_notes: [
        {
          date: new Date().toISOString(),
          author: 'Admin',
          note: 'Verification revoked by Admin.'
        },
        ...agent.admin_notes
      ]
    });
    toast.success(`${agent.name} verification revoked.`);
  };

  const handleToggleFeatured = () => {
    const nextFeatured = !agent.is_featured;
    onUpdateAgent({
      ...agent,
      is_featured: nextFeatured
    });
    toast.success(nextFeatured ? `${agent.name} is now a featured agent!` : `${agent.name} is no longer featured.`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj: AgentNote = {
      date: new Date().toISOString(),
      author: 'Admin',
      note: newNote.trim()
    };

    onUpdateAgent({
      ...agent,
      admin_notes: [noteObj, ...agent.admin_notes]
    });

    setNewNote('');
    toast.success('Admin note added!');
  };

  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Profile Card */}
        <div className={`border rounded-xl p-6 ${bgCard} shadow-sm`}>
          <div className="flex flex-col items-center text-center pb-6 border-b border-dashed border-slate-700/30">
            <div className="relative mb-4">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#004F31]/20 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#004F31] text-white flex items-center justify-center font-bold text-3xl border-4 border-[#004F31]/20 shadow-md">
                  {agent.name.split(' ').map((n) => n[0]).join('')}
                </div>
              )}
              {agent.is_verified === true && (
                <span className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full shadow border-2 border-white">
                  <Check size={14} className="stroke-[3]" />
                </span>
              )}
            </div>
            <h3 className={`text-xl font-bold ${textPrimary}`}>{agent.name}</h3>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {agent.agency_name || 'Independent Real Estate Agent'}
            </p>
            <span className="mt-2 text-xs font-semibold px-2.5 py-1 rounded bg-[#1a2340] text-white tracking-wider uppercase">
              Real Estate Agent
            </span>
          </div>

          <div className="py-6 space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
              Contact Information
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#004F31] shrink-0" />
                <span className={textPrimary}>{agent.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#004F31] shrink-0" />
                <span className={textPrimary}>{agent.phone}</span>
              </div>
              {agent.whatsapp && (
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 text-base font-bold select-none shrink-0">💬</span>
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    {agent.whatsapp} <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {agent.website_url && (
                <div className="flex items-center gap-3">
                  <ExternalLink size={16} className="text-[#004F31] shrink-0" />
                  <a
                    href={`https://${agent.website_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {agent.website_url}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(agent.facebook_url || agent.instagram_url || agent.linkedin_url) && (
              <div className="pt-4 space-y-3 border-t border-slate-700/10">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                  Social Profiles
                </h4>
                <div className="flex gap-4">
                  {agent.facebook_url && (
                    <a href={`https://${agent.facebook_url}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Facebook size={18} />
                    </a>
                  )}
                  {agent.instagram_url && (
                    <a href={`https://instagram.com/${agent.instagram_url.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                      <Instagram size={18} />
                    </a>
                  )}
                  {agent.linkedin_url && (
                    <a href={`https://${agent.linkedin_url}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-700 transition-colors">
                      <Linkedin size={18} />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3 border-t border-slate-700/10">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                Professional Metadata
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className={textSecondary}>Experience:</span>
                  <p className={`font-semibold ${textPrimary} mt-0.5`}>{agent.years_experience} Years</p>
                </div>
                <div>
                  <span className={textSecondary}>License No:</span>
                  <p className={`font-semibold ${textPrimary} mt-0.5`}>{agent.license_no || 'Not Provided'}</p>
                </div>
                <div>
                  <span className={textSecondary}>Registered:</span>
                  <p className={`font-semibold ${textPrimary} mt-0.5`}>
                    {new Date(agent.created_at).toLocaleDateString('en-LK', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div>
                  <span className={textSecondary}>Last Login:</span>
                  <p className={`font-semibold ${textPrimary} mt-0.5`}>
                    {new Date(agent.last_login).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })} (Today)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <a
                href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>💬</span> WhatsApp
              </a>
              <a
                href={`mailto:${agent.email}`}
                className="flex-1 py-2 px-3 text-center bg-[#004F31] hover:bg-[#003B24] text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail size={14} /> Email
              </a>
              <button
                onClick={() => toast.success('Redirecting to public profile...')}
                className="py-2 px-3 text-center border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center text-slate-400"
                title="View Public Profile"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Professional Details */}
        <div className={`border rounded-xl p-6 ${bgCard} shadow-sm flex flex-col justify-between`}>
          <div className="space-y-6">
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-3`}>
                Specializations
              </h4>
              <div className="flex flex-wrap gap-2">
                {agent.specialization.map((spec) => (
                  <span
                    key={spec}
                    className="text-xs font-medium px-2.5 py-1 rounded bg-[#004F31]/10 text-[#004F31] dark:text-[#4ade80]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-3`}>
                Service Areas (Districts)
              </h4>
              <div className="flex flex-wrap gap-2">
                {agent.service_areas.map((dist) => (
                  <span
                    key={dist}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    📍 {dist}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
                Bio
              </h4>
              <p className={`text-sm leading-relaxed ${textPrimary}`}>
                {agent.bio || 'This agent has not written a bio yet.'}
              </p>
            </div>

            {/* Verification & Featured Controls */}
            <div className="border-t border-slate-700/10 pt-4 space-y-4">
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
                  Verification Status
                </h4>
                {agent.is_verified === true ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                      <Check size={18} className="stroke-[3]" />
                      <span>✅ VERIFIED AGENT</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Approved and verified. This agent has full permission to publish and manage real estate properties.
                    </p>
                    <button
                      onClick={handleRevoke}
                      className="py-1.5 px-3 bg-red-600/15 text-red-600 hover:bg-red-600/20 text-xs font-bold rounded-md transition-colors border border-red-600/30"
                    >
                      ❌ Revoke Verification
                    </button>
                  </div>
                ) : agent.is_verified === 'rejected' ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                      <X size={18} className="stroke-[3]" />
                      <span>❌ REJECTED AGENT</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      This agent registration has been rejected. They will not be visible on public agent boards.
                    </p>
                    <button
                      onClick={handleVerify}
                      className="py-1.5 px-3 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-md transition-colors"
                    >
                      ✅ Re-Verify Agent
                    </button>
                  </div>
                ) : (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-sm">
                      <Clock size={18} className="stroke-[2]" />
                      <span>⏳ PENDING VERIFICATION</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Awaiting admin review. Approve to let them list properties under client or developer portfolios.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={handleVerify}
                        className="py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors shadow-sm"
                      >
                        ✅ VERIFY AGENT
                      </button>
                      <button
                        onClick={handleReject}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors shadow-sm"
                      >
                        ❌ REJECT
                      </button>
                      <button
                        onClick={() => toast.success('Information requested from agent')}
                        className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-md transition-colors text-slate-600 dark:text-slate-300"
                      >
                        📝 Request More
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
                  Featured Status
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                  <div>
                    <p className={`text-xs font-bold ${textPrimary}`}>Feature this Agent</p>
                    <p className="text-[10px] text-slate-400">Featured agents rank higher and show up in search recommendations.</p>
                  </div>
                  <button
                    onClick={handleToggleFeatured}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${agent.is_featured ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${agent.is_featured ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notes Section */}
      <div className={`border rounded-xl p-6 ${bgCard} shadow-sm`}>
        <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary} mb-4 flex items-center gap-2`}>
          <span>📝</span> Admin Notes (Internal Only)
        </h4>

        <form onSubmit={handleAddNote} className="space-y-3 mb-6">
          <textarea
            placeholder="Add internal notes about this agent's performance, physical check details, or general log..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className="w-full text-sm p-3 border border-slate-300 dark:border-slate-800 rounded-lg bg-transparent focus:ring-1 focus:ring-[#004F31] focus:border-[#004F31] text-slate-800 dark:text-slate-100 outline-none"
          />
          <button
            type="submit"
            className="py-2 px-4 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm ml-auto"
          >
            <Plus size={14} /> Save Note
          </button>
        </form>

        <div className="space-y-4">
          <h5 className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
            Notes History
          </h5>
          {agent.admin_notes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No notes created yet for this agent.</p>
          ) : (
            <div className="relative border-l-2 border-[#004F31]/30 pl-4 ml-2 space-y-4">
              {agent.admin_notes.map((note, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#004F31] border-2 border-white dark:border-slate-900" />
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{note.author}</span>
                    <span>•</span>
                    <span>{new Date(note.date).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</span>
                    <span>{new Date(note.date).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className={`${textPrimary} bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800/60`}>
                    {note.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
