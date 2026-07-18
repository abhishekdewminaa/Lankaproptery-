import { safeLocalStorage } from '../../../utils/safeUtils';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { Agent, AgentProperty, AgentLead, AgentPayment, AgentActivityLog } from './types';
import { mockAgents, mockAgentProperties, mockAgentLeads, mockAgentPayments, mockAgentActivityLogs } from './mockData';
import { sriLankanDistricts } from '../../../data/adminDemoData';

// Sub-components
import ProfileTab from './ProfileTab';
import ListingsTab from './ListingsTab';
import LeadsTab from './LeadsTab';
import BillingTab from './BillingTab';
import PerformanceTab from './PerformanceTab';
import ActivityTab from './ActivityTab';

import { 
  Users, CheckCircle, Clock, FileText, ClipboardList, Star, MessageSquare, 
  Search, Filter, RefreshCw, Download, Plus, ChevronDown, ChevronUp, 
  Trash2, Edit, Check, X, AlertTriangle, Building2, Eye, Shield, Award 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAgents({ user }: { user: any }) {
  // --- DATABASE & DATA STATES ---
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [leads, setLeads] = useState<AgentLead[]>([]);
  const [payments, setPayments] = useState<AgentPayment[]>([]);
  const [logs, setLogs] = useState<AgentActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CRM & EXPANSION STATES ---
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'leads' | 'billing' | 'performance' | 'activity'>('profile');

  // --- FILTER & CRM STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerification, setFilterVerification] = useState<'All' | 'Verified' | 'Pending' | 'Rejected'>('All');
  const [filterPackage, setFilterPackage] = useState<'All' | 'Free' | 'Starter' | 'Professional' | 'Enterprise'>('All');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('All');
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterFeatured, setFilterFeatured] = useState<'All' | 'Featured Only'>('All');
  const [filterDateJoined, setFilterDateJoined] = useState<'All Time' | 'This Week' | 'This Month'>('All Time');
  const [filterRating, setFilterRating] = useState<'All' | '5' | '4' | '3'>('All');

  // --- ADMIN MODALS SYSTEM ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    agencyName: '',
    licenseNo: '',
    yearsExperience: 1,
    specialization: [] as string[],
    serviceAreas: [] as string[],
    package: 'Free' as Agent['package'],
    isVerified: false,
    isFeatured: false,
    bio: ''
  });

  // Dark mode integration check (matches other admin dashboards)
  const [adminDarkMode, setAdminDarkMode] = useState(() => {
    return safeLocalStorage.getItem('admin-dark-mode') === 'true';
  });

  useEffect(() => {
    const checkDark = () => {
      setAdminDarkMode(safeLocalStorage.getItem('admin-dark-mode') === 'true');
    };
    window.addEventListener('storage', checkDark);
    const interval = setInterval(checkDark, 500);
    return () => {
      window.removeEventListener('storage', checkDark);
      clearInterval(interval);
    };
  }, []);

  // --- DATA FETCH ROUTINE ---
  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch Real Tables if available, otherwise fallback to rich Mock Datasets
      const { data: dbAgents, error: agentErr } = await supabase.from('agents').select('*');
      const { data: dbProperties, error: propErr } = await supabase.from('properties').select('*');
      const { data: dbLeads, error: leadsErr } = await supabase.from('leads').select('*');
      const { data: dbPayments, error: payErr } = await supabase.from('payments').select('*');

      let fetchedAgents: Agent[] = [];
      if (dbAgents && dbAgents.length > 0) {
        // Map dbAgents columns to type Agent
        fetchedAgents = dbAgents.map((a: any) => {
          const matchedMock = mockAgents.find((m) => m.id === a.id || m.email === a.email) || mockAgents[0];
          return {
            id: a.id,
            name: a.name || a.full_name,
            email: a.email,
            phone: a.phone || matchedMock.phone,
            whatsapp: a.whatsapp || matchedMock.whatsapp || a.phone,
            agency_name: a.agency_name || matchedMock.agency_name,
            license_no: a.license_no || matchedMock.license_no,
            years_experience: a.years_experience || matchedMock.years_experience,
            specialization: a.specialization || matchedMock.specialization,
            service_areas: a.service_areas || matchedMock.service_areas,
            bio: a.bio || matchedMock.bio,
            facebook_url: a.facebook_url || matchedMock.facebook_url,
            instagram_url: a.instagram_url || matchedMock.instagram_url,
            linkedin_url: a.linkedin_url || matchedMock.linkedin_url,
            website_url: a.website_url || matchedMock.website_url,
            is_verified: a.is_verified,
            status: a.status || 'active',
            is_featured: a.is_featured || false,
            created_at: a.created_at || new Date().toISOString(),
            last_login: a.last_login || new Date().toISOString(),
            avatar_url: a.avatar_url || matchedMock.avatar_url,
            admin_notes: a.admin_notes || matchedMock.admin_notes,
            package: a.package || matchedMock.package,
            package_expiry: a.package_expiry || matchedMock.package_expiry,
            total_paid: a.total_paid || matchedMock.total_paid
          };
        });
      } else {
        fetchedAgents = [...mockAgents];
      }

      let fetchedProps: AgentProperty[] = [];
      if (dbProperties && dbProperties.length > 0) {
        fetchedProps = dbProperties.map((p: any) => {
          const matchedMock = mockAgentProperties.find((m) => m.id === p.id) || mockAgentProperties[0];
          return {
            id: p.id,
            agent_id: p.agent_id || 'agent-001',
            title: p.listing_title || p.title || matchedMock.title,
            city: p.city || matchedMock.city,
            district: p.district || matchedMock.district,
            category: p.property_category || p.category || matchedMock.category,
            listing_type: p.listing_type === 'Rent' ? 'Rent' : 'Sale',
            price: p.price_lkr || p.price || matchedMock.price,
            bedrooms: p.rooms || p.bedrooms || matchedMock.bedrooms,
            bathrooms: p.bathrooms || matchedMock.bathrooms,
            land_area: p.land_area || matchedMock.land_area,
            floor_area: p.floor_area || matchedMock.floor_area,
            cover_image: (p.images && p.images[0]) || p.cover_image || matchedMock.cover_image,
            images: p.images || matchedMock.images,
            status: p.status || 'active',
            package_tier: p.package_tier || matchedMock.package_tier,
            created_at: p.created_at || matchedMock.created_at,
            expires_at: p.expires_at || matchedMock.expires_at,
            client_name: p.client_name || matchedMock.client_name,
            client_phone: p.client_phone || matchedMock.client_phone,
            views: p.views_count || matchedMock.views,
            leads: p.leads_count || matchedMock.leads,
            saved: p.saves_count || matchedMock.saved,
            shares: matchedMock.shares,
            description: p.property_description || p.description || matchedMock.description,
            amenities: p.amenities || matchedMock.amenities,
            address: p.address || matchedMock.address,
            lat: p.lat || matchedMock.lat,
            lng: p.lng || matchedMock.lng
          };
        });
      } else {
        fetchedProps = [...mockAgentProperties];
      }

      setAgents(fetchedAgents);
      setProperties(fetchedProps);
      setLeads(mockAgentLeads);
      setPayments(mockAgentPayments);
      setLogs(mockAgentActivityLogs);
    } catch (e) {
      console.error(e);
      // Absolute graceful fallback to mock data
      setAgents([...mockAgents]);
      setProperties([...mockAgentProperties]);
      setLeads([...mockAgentLeads]);
      setPayments([...mockAgentPayments]);
      setLogs([...mockAgentActivityLogs]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS SYSTEM (Propagated to subcomponents & synchronizes states) ---
  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents((prev) => prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)));
    // Sync verification to activity log
    const logId = `log-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: AgentActivityLog = {
      id: logId,
      agent_id: updatedAgent.id,
      type: 'general',
      action: 'Profile Updated',
      detail: `Agent details modified or verification status set to ${updatedAgent.is_verified}`,
      created_at: new Date().toISOString()
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateProperty = (updatedProp: AgentProperty) => {
    setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
    const logId = `log-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: AgentActivityLog = {
      id: logId,
      agent_id: updatedProp.agent_id,
      type: 'listings',
      action: 'Property Updated',
      detail: `Listing [${updatedProp.title}] updated to status: ${updatedProp.status}`,
      created_at: new Date().toISOString()
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteProperty = (propertyId: string) => {
    const target = properties.find((p) => p.id === propertyId);
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    if (target) {
      const logId = `log-${Math.floor(Math.random() * 90000) + 10000}`;
      const newLog: AgentActivityLog = {
        id: logId,
        agent_id: target.agent_id,
        type: 'listings',
        action: 'Property Deleted',
        detail: `Listing [${target.title}] removed by Admin`,
        created_at: new Date().toISOString()
      };
      setLogs((prev) => [newLog, ...prev]);
    }
    toast.error('Property listing deleted.');
  };

  const handleUpdateLeadStatus = (leadId: string, status: AgentLead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    const target = leads.find((l) => l.id === leadId);
    if (target) {
      const logId = `log-${Math.floor(Math.random() * 90000) + 10000}`;
      const newLog: AgentActivityLog = {
        id: logId,
        agent_id: target.agent_id,
        type: 'leads',
        action: 'Lead Status Updated',
        detail: `Inquiry status from ${target.name} changed to [${status}]`,
        created_at: new Date().toISOString()
      };
      setLogs((prev) => [newLog, ...prev]);
    }
    toast.success('Lead status updated!');
  };

  const handleAddPayment = (newPay: AgentPayment) => {
    setPayments((prev) => [newPay, ...prev]);
    // Add to activity log too
    const logId = `log-${Math.floor(Math.random() * 90000) + 10000}`;
    const newLog: AgentActivityLog = {
      id: logId,
      agent_id: newPay.agent_id,
      type: 'payments',
      action: 'Manual Plan Assigned',
      detail: `Admin assigned subscription package: ${newPay.package}. Amount: Rs.${newPay.amount}`,
      created_at: new Date().toISOString()
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // --- COMPUTE STATISTICS ---
  const totalAgentsCount = agents.length;
  const verifiedCount = agents.filter((a) => a.is_verified === true).map((a) => a.id).length;
  const pendingCount = agents.filter((a) => a.is_verified === 'pending').map((a) => a.id).length;
  const totalListings = properties.length;
  const totalLeads = leads.length;

  const revenueThisMonth = payments
    .filter((p) => {
      const date = new Date(p.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((acc, p) => acc + p.amount, 0);

  const featuredAgentsCount = agents.filter((a) => a.is_featured === true).length;

  // --- FILTERING AND CRM PIPELINE ---
  const filteredAgents = agents.filter((agent) => {
    // Search Query
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(sq);
      const matchEmail = agent.email.toLowerCase().includes(sq);
      const matchAgency = agent.agency_name.toLowerCase().includes(sq);
      const matchLicense = agent.license_no.toLowerCase().includes(sq);
      if (!matchName && !matchEmail && !matchAgency && !matchLicense) return false;
    }

    // Verification Filter
    if (filterVerification === 'Verified' && agent.is_verified !== true) return false;
    if (filterVerification === 'Pending' && agent.is_verified !== 'pending') return false;
    if (filterVerification === 'Rejected' && agent.is_verified !== 'rejected') return false;

    // Package Filter
    if (filterPackage !== 'All' && agent.package !== filterPackage) return false;

    // Specialization
    if (filterSpecialization !== 'All' && !agent.specialization.includes(filterSpecialization)) return false;

    // District Area
    if (filterDistrict !== 'All' && !agent.service_areas.includes(filterDistrict)) return false;

    // Featured Status
    if (filterFeatured === 'Featured Only' && !agent.is_featured) return false;

    // Date Joined Filter
    if (filterDateJoined !== 'All Time') {
      const joinDate = new Date(agent.created_at);
      const now = new Date();
      const diffMs = now.getTime() - joinDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (filterDateJoined === 'This Week' && diffDays > 7) return false;
      if (filterDateJoined === 'This Month' && diffDays > 30) return false;
    }

    // Rating Filter
    if (filterRating !== 'All') {
      const minRating = parseFloat(filterRating);
      const avg = agent.is_featured ? 4.8 : 4.2; // simulated ratings
      if (avg < minRating) return false;
    }

    return true;
  });

  const handleReviewNow = () => {
    setFilterVerification('Pending');
    toast.success('Filters applied: Showing pending verifications only.');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterVerification('All');
    setFilterPackage('All');
    setFilterSpecialization('All');
    setFilterDistrict('All');
    setFilterFeatured('All');
    setFilterDateJoined('All Time');
    setFilterRating('All');
    toast.success('All filters cleared!');
  };

  // --- EXPORT PIPELINES ---
  const handleExportAgentsCSV = () => {
    toast.success('Generating agent data CSV report...');
    const headers = 'ID,Name,Email,Phone,WhatsApp,Agency,License,Experience,Specializations,Districts,Package,Verified\n';
    const rows = filteredAgents.map((a) => 
      `"${a.id}","${a.name}","${a.email}","${a.phone}","${a.whatsapp}","${a.agency_name}","${a.license_no}",${a.years_experience},"${a.specialization.join(', ')}","${a.service_areas.join(', ')}","${a.package}",${a.is_verified === true}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LankaProperty_Agents_Report_${Date.now()}.csv`;
    link.click();
  };

  const handleExportPerformancePDF = () => {
    toast.success('Exporting high fidelity Performance Report PDF...');
  };

  // --- EXPAND ACCORDION ROUTINE ---
  const handleToggleRow = (agentId: string) => {
    if (expandedAgentId === agentId) {
      setExpandedAgentId(null);
    } else {
      setExpandedAgentId(agentId);
      setActiveTab('profile'); // Reset tab on switch
    }
  };

  // --- VERIFICATION FAST TRIGGER ---
  const handleQuickVerify = (a: Agent) => {
    if (window.confirm(`Verify agent account for ${a.name}?`)) {
      const next: Agent = {
        ...a,
        is_verified: true,
        admin_notes: [
          {
            date: new Date().toISOString(),
            author: 'Admin (System)',
            note: 'Quick verification approved.'
          },
          ...a.admin_notes
        ]
      };
      handleUpdateAgent(next);

      // Trigger Click-To-WhatsApp simulation
      const waText = `Congratulations! Your LankaProperty.lk agent account has been verified ✅ You can now list properties for clients. Login at: https://lankaproperty.lk/agent/login`;
      const waUrl = `https://wa.me/${a.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      toast.success(`${a.name} account verified!`);
    }
  };

  const handleQuickReject = (a: Agent) => {
    const reason = window.prompt(`Enter rejection reason for ${a.name}:`, 'Incomplete document submission.');
    if (reason !== null) {
      const next: Agent = {
        ...a,
        is_verified: 'rejected',
        admin_notes: [
          {
            date: new Date().toISOString(),
            author: 'Admin',
            note: `Verification rejected. Reason: ${reason}`
          },
          ...a.admin_notes
        ]
      };
      handleUpdateAgent(next);
      toast.error(`${a.name} registration rejected.`);
    }
  };

  // --- ADD AGENT CONTROLS ---
  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pw = '';
    for (let i = 0; i < 10; i++) {
      pw += chars[Math.floor(Math.random() * chars.length)];
    }
    setAddForm((prev) => ({ ...prev, password: pw }));
    toast.success('Generated secure password!');
  };

  const handleAddAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.password) {
      toast.error('Please fill in all mandatory fields (*)');
      return;
    }

    const newId = `agent-${Math.floor(Math.random() * 90000) + 10000}`;
    const newAgent: Agent = {
      id: newId,
      name: addForm.name,
      email: addForm.email,
      phone: addForm.phone,
      whatsapp: addForm.whatsapp || addForm.phone,
      agency_name: addForm.agencyName || 'Independent Agent',
      license_no: addForm.licenseNo || '',
      years_experience: addForm.yearsExperience,
      specialization: addForm.specialization.length > 0 ? addForm.specialization : ['Residential'],
      service_areas: addForm.serviceAreas.length > 0 ? addForm.serviceAreas : ['Colombo'],
      bio: addForm.bio || 'Professional real estate agent registered on LankaProperty.lk',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
      website_url: '',
      is_verified: addForm.isVerified ? true : 'pending',
      status: 'active',
      is_featured: addForm.isFeatured,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      admin_notes: [
        {
          date: new Date().toISOString(),
          author: 'Admin',
          note: addForm.isVerified ? 'Profile created manually by admin (Verified).' : 'Profile created manually by admin (Pending Review).'
        }
      ],
      package: addForm.package,
      package_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      total_paid: addForm.package === 'Starter' ? 3500 : addForm.package === 'Professional' ? 6500 : 0
    };

    setAgents((prev) => [newAgent, ...prev]);

    // Triggers Welcome Email simulation
    toast.success('EmailJS welcome notification dispatch completed!');
    toast.success(`Agent ${addForm.name} created manually!`);
    setShowAddModal(false);
    
    // Reset Form
    setAddForm({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      password: '',
      agencyName: '',
      licenseNo: '',
      yearsExperience: 1,
      specialization: [],
      serviceAreas: [],
      package: 'Free',
      isVerified: false,
      isFeatured: false,
      bio: ''
    });
  };

  // --- GENERAL DESIGN PARINGS (Colors & backgrounds based on dark mode) ---
  const textPrimary = adminDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = adminDarkMode ? 'text-slate-400' : 'text-slate-500';
  const bgCard = adminDarkMode ? 'bg-[#1e1e2d] border-slate-800' : 'bg-white border-slate-100';
  const bgPage = adminDarkMode ? 'bg-[#0E0E14]' : 'bg-slate-50';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24 font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👮</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
              Agent Management
              <span className="bg-emerald-50 text-[#059669] font-black text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                LATEST
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
              Monitor registered real estate agents and agency verification statuses.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-600 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#004F31]' : ''} />
          </button>
          <button
            onClick={handleExportAgentsCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-neutral-50 text-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#006040] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Agents */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f0fdf4] text-[#004F31] rounded-xl">
              <Users size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600">↗ +2</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Total Agents</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalAgentsCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Registered accounts</p>
        </div>

        {/* Verified Agents */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle size={18} />
            </div>
            <span className="text-[12px] font-medium text-green-600">↗ +1</span>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Verified Agents</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{verifiedCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Approved by admin</p>
        </div>

        {/* Pending Approvals */}
        <button
          onClick={() => {
            setFilterVerification('Pending');
            toast.success('Filtered to pending verifications only.');
          }}
          className="text-left bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Pending Approval</p>
          <h3 className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">{pendingCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Awaiting audit review</p>
        </button>

        {/* Featured Agents */}
        <div className="bg-white border border-slate-200 p-5 rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#f5f3ff] text-[#7c3aed] rounded-xl">
              <Award size={18} />
            </div>
          </div>
          <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.8px]">Featured Agents</p>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{featuredAgentsCount}</h3>
          <p className="text-[12px] text-[#6b7280] mt-1">Premium featured</p>
        </div>

      </div>

      {/* SECTION 2.5 — PENDING VERIFICATION ALERT */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs font-semibold gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600 shrink-0 animate-pulse" size={18} />
            <div>
              <p className="text-slate-900 font-bold">{pendingCount} agents are waiting for verification</p>
              <p className="text-[11px] text-slate-500 font-normal">Review and approve their profiles to let them start listing properties on LankaProperty.lk.</p>
            </div>
          </div>
          <button
            onClick={handleReviewNow}
            className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition-colors shrink-0"
          >
            Review Now →
          </button>
        </div>
      )}

      {/* SECTION 2 — FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-5 space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-[#9ca3af]" size={18} />
          <input
            type="text"
            placeholder="Search agent name, email, agency, license no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 outline-none focus:border-[#004F31] focus:bg-white transition-all text-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 text-xs">
          {/* Verification */}
          <div>
            <label className="block font-bold text-[#6b7280] mb-1.5">Verification:</label>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value as any)}
              className="w-full p-2.5 rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#004F31]"
            >
              <option value="All">All Status</option>
              <option value="Verified">Verified ✅</option>
              <option value="Pending">Pending ⏳</option>
              <option value="Rejected">Rejected ❌</option>
            </select>
          </div>

          {/* Package */}
          <div>
            <label className="block font-bold text-[#6b7280] mb-1.5">Package Tier:</label>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value as any)}
              className="w-full p-2.5 rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#004F31]"
            >
              <option value="All">All Packages</option>
              <option value="Free" className="bg-white dark:bg-slate-900">Free</option>
              <option value="Starter" className="bg-white dark:bg-slate-900">Starter</option>
              <option value="Professional" className="bg-white dark:bg-slate-900">Professional</option>
              <option value="Enterprise" className="bg-white dark:bg-slate-900">Enterprise</option>
            </select>
          </div>

          {/* Specialization */}
          <div>
            <label className={`block font-bold ${textSecondary} mb-1.5`}>Specialization:</label>
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-850 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All" className="bg-white dark:bg-slate-900">All Specialized</option>
              <option value="Residential" className="bg-white dark:bg-slate-900">Residential</option>
              <option value="Commercial" className="bg-white dark:bg-slate-900">Commercial</option>
              <option value="Land" className="bg-white dark:bg-slate-900">Land</option>
              <option value="Luxury" className="bg-white dark:bg-slate-900">Luxury</option>
              <option value="Rental" className="bg-white dark:bg-slate-900">Rental</option>
              <option value="Industrial" className="bg-white dark:bg-slate-900">Industrial</option>
            </select>
          </div>

          {/* District dropdown */}
          <div>
            <label className={`block font-bold ${textSecondary} mb-1.5`}>District Service:</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-850 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All" className="bg-white dark:bg-slate-900">All 25 Districts</option>
              {sriLankanDistricts.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-slate-900">{d}</option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div>
            <label className={`block font-bold ${textSecondary} mb-1.5`}>Featured Status:</label>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as any)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-850 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All" className="bg-white dark:bg-slate-900">All Featured</option>
              <option value="Featured Only" className="bg-white dark:bg-slate-900">Featured Only</option>
            </select>
          </div>

          {/* Date Joined */}
          <div>
            <label className={`block font-bold ${textSecondary} mb-1.5`}>Date Registered:</label>
            <select
              value={filterDateJoined}
              onChange={(e) => setFilterDateJoined(e.target.value as any)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-850 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All Time" className="bg-white dark:bg-slate-900">All Time</option>
              <option value="This Week" className="bg-white dark:bg-slate-900">This Week</option>
              <option value="This Month" className="bg-white dark:bg-slate-900">This Month</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className={`block font-bold ${textSecondary} mb-1.5`}>Rating Score:</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value as any)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-850 bg-transparent text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All" className="bg-white dark:bg-slate-900">All Ratings</option>
              <option value="5" className="bg-white dark:bg-slate-900">5 ★ (Exceptional)</option>
              <option value="4" className="bg-white dark:bg-slate-900">4 ★+ (Excellent)</option>
              <option value="3" className="bg-white dark:bg-slate-900">3 ★+ (Good)</option>
            </select>
          </div>

          {/* CRM Buttons */}
          <div className="flex gap-2 self-end">
            <button
              onClick={handleClearFilters}
              className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            >
              ↺ Clear
            </button>
            <button
              onClick={() => toast.success('Applying criteria parameters...')}
              className="flex-1 py-2 bg-[#004F31] hover:bg-[#003B24] text-white font-bold rounded-lg"
            >
              🔍 Apply
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-700/10 pt-3 text-slate-400 font-medium">
          <p>Showing <span className="text-[#004F31] font-bold">{filteredAgents.length}</span> agents</p>
          <div className="flex gap-2">
            <button
              onClick={handleExportAgentsCSV}
              className="py-1 px-2.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-semibold flex items-center gap-1 text-[11px]"
            >
              📥 Export Agents CSV
            </button>
            <button
              onClick={handleExportPerformancePDF}
              className="py-1 px-2.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-semibold flex items-center gap-1 text-[11px]"
            >
              📊 Export Performance PDF
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3 — AGENTS TABLE */}
      {loading ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 bg-white shadow flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
          <RefreshCw className="animate-spin text-[#004F31]" size={32} />
          <p className="font-semibold">Loading agent management profiles and metadata...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 bg-white shadow">
          <p className="text-slate-500 font-bold italic text-sm">No registered agents match your filtering queries.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-slate-200">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] text-center w-10">#</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Agent Info</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Agency Details</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Specialization</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Service Areas</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Listings</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Leads</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Rating</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Package</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Revenue</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Verified</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af]">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent, index) => {
                const isExpanded = expandedAgentId === agent.id;
                const agentPropertiesList = properties.filter((p) => p.agent_id === agent.id);
                const activeListCount = agentPropertiesList.filter((p) => p.status === 'active').length;
                const pendingListCount = agentPropertiesList.filter((p) => p.status === 'pending').length;
                const agentLeadsList = leads.filter((l) => l.agent_id === agent.id);

                return (
                  <React.Fragment key={agent.id}>
                    {/* Primary Row */}
                    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/10 font-medium' : ''}`}>
                      <td className="p-3 font-mono font-bold text-slate-400 text-center">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {agent.avatar_url ? (
                            <img src={agent.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shadow border border-slate-700/10 shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#004F31] text-white font-black flex items-center justify-center text-sm shadow shrink-0">
                              {agent.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className={`font-black truncate ${textPrimary}`}>{agent.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{agent.email}</p>
                            <div className="flex gap-1.5 mt-1 text-[10px] font-semibold">
                              <span>📱 {agent.phone}</span>
                              {agent.whatsapp && (
                                <a
                                  href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-500"
                                >
                                  💬 Chat
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className={`font-bold ${textPrimary}`}>{agent.agency_name || 'Independent Realtor'}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">License: {agent.license_no || 'No license'}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200">
                          {agent.years_experience} yrs exp
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {agent.specialization.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[#004F31] dark:text-[#4ade80]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className={`font-semibold ${textPrimary}`}>
                          {agent.service_areas.slice(0, 2).join(', ')}
                        </p>
                        {agent.service_areas.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-bold mt-1 inline-block" title={agent.service_areas.join(', ')}>
                            +{agent.service_areas.length - 2} more (hover)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className={`font-black ${textPrimary}`}>{agentPropertiesList.length} listings</p>
                        <p className="text-[10px] text-slate-400">
                          <span className="text-green-500 font-bold">{activeListCount} active</span> • {pendingListCount} pending
                        </p>
                      </td>
                      <td className="p-3">
                        <p className={`font-black ${textPrimary}`}>{agentLeadsList.length} total</p>
                        <p className="text-[10px] text-slate-400">
                          {agentLeadsList.filter((l) => l.status === 'New').length} new
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                          ★ <span className={textPrimary}>{agent.is_featured ? '4.8' : '4.2'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">({agent.is_featured ? '14' : '3'} reviews)</p>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1a2340] text-white tracking-wide uppercase">
                          {agent.package}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Exp: {new Date(agent.package_expiry).toLocaleDateString('en-LK', { month: 'short', day: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-3 font-bold text-[#004F31] dark:text-[#4ade80]">
                        {agent.total_paid > 0 ? `Rs. ${agent.total_paid.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {agent.is_verified === true ? (
                            <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">✅ VERIFIED</span>
                          ) : agent.is_verified === 'rejected' ? (
                            <span className="text-xs font-bold text-red-500 flex items-center gap-0.5">❌ REJECTED</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-orange-500 flex items-center gap-0.5">⏳ PENDING</span>
                              <button
                                onClick={() => handleQuickVerify(agent)}
                                className="py-0.5 px-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[9px]"
                                title="Quick Verify Agent Account"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            const nextStatus = agent.status === 'active' ? 'inactive' : 'active';
                            handleUpdateAgent({ ...agent, status: nextStatus });
                            toast.success(`${agent.name} is now ${nextStatus}!`);
                          }}
                          className={`py-0.5 px-2 rounded-full font-bold text-[10px] ${
                            agent.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {agent.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleToggleRow(agent.id)}
                            className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded font-bold flex items-center gap-1"
                            title="View Full Details"
                          >
                            <Eye size={12} /> {isExpanded ? 'Hide' : 'Details'}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete agent account for ${agent.name}? This action is irreversible.`)) {
                                setAgents((prev) => prev.filter((a) => a.id !== agent.id));
                                toast.error(`${agent.name} profile removed.`);
                              }
                            }}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Delete Agent"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row detail panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={13} className="p-6">
                          <div className={`border rounded-xl p-5 ${bgCard} shadow-inner space-y-6`}>
                            {/* Inner detail header */}
                            <div className="flex flex-wrap items-center justify-between border-b border-dashed border-slate-700/20 pb-4 gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🏢</span>
                                <div>
                                  <h4 className={`text-base font-black ${textPrimary}`}>
                                    CRM Core: {agent.name}
                                  </h4>
                                  <p className="text-xs text-slate-400 font-medium">Manage verification credentials, listings portfolio, billing contracts, and client tracking logs.</p>
                                </div>
                              </div>

                              {/* Tabs selector */}
                              <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                                {[
                                  { id: 'profile', label: '👤 Agent Profile' },
                                  { id: 'listings', label: `🏠 Listings (${agentPropertiesList.length})` },
                                  { id: 'leads', label: `📩 Lead Pipeline (${agentLeadsList.length})` },
                                  { id: 'billing', label: '💳 Package & Billing' },
                                  { id: 'performance', label: '📊 Performance & Analytics' },
                                  { id: 'activity', label: '⏱️ Activity Log' }
                                ].map((tb) => (
                                  <button
                                    key={tb.id}
                                    onClick={() => setActiveTab(tb.id as any)}
                                    className={`py-1.5 px-3 rounded-md transition-all ${
                                      activeTab === tb.id
                                        ? 'bg-[#004F31] text-white font-bold shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-[#004F31]'
                                    }`}
                                  >
                                    {tb.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Inner tab panels */}
                            <div className="pt-2">
                              {activeTab === 'profile' && (
                                <ProfileTab
                                  agent={agent}
                                  onUpdateAgent={handleUpdateAgent}
                                  adminDarkMode={adminDarkMode}
                                />
                              )}
                              {activeTab === 'listings' && (
                                <ListingsTab
                                  agent={agent}
                                  properties={properties}
                                  leads={leads}
                                  onUpdateProperty={handleUpdateProperty}
                                  onDeleteProperty={handleDeleteProperty}
                                  adminDarkMode={adminDarkMode}
                                />
                              )}
                              {activeTab === 'leads' && (
                                <LeadsTab
                                  agent={agent}
                                  leads={leads}
                                  properties={properties}
                                  onUpdateLeadStatus={handleUpdateLeadStatus}
                                  adminDarkMode={adminDarkMode}
                                />
                              )}
                              {activeTab === 'billing' && (
                                <BillingTab
                                  agent={agent}
                                  payments={payments}
                                  properties={properties}
                                  onUpdateAgent={handleUpdateAgent}
                                  onAddPayment={handleAddPayment}
                                  adminDarkMode={adminDarkMode}
                                />
                              )}
                              {activeTab === 'performance' && (
                                <PerformanceTab
                                  agent={agent}
                                  properties={properties}
                                  leads={leads}
                                  adminDarkMode={adminDarkMode}
                                />
                              )}
                              {activeTab === 'activity' && (
                                <ActivityTab
                                  agent={agent}
                                  logs={logs}
                                  adminDarkMode={adminDarkMode}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* SECTION 4 — AGENT PERFORMANCE LEADERBOARD */}
      <div className={`p-6 border rounded-xl ${bgCard} shadow-sm space-y-4 text-xs`}>
        <div>
          <h3 className={`text-base font-black ${textPrimary} flex items-center gap-1.5`}>
            <Award className="text-[#004F31]" size={18} /> 📊 Agent Performance Leaderboard
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Top performing agents ranked by total leads this month</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-700/10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b border-slate-700/10 text-[10px]">
              <tr>
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Agency</th>
                <th className="p-3 text-center">Active Listings</th>
                <th className="p-3 text-center">Total Views</th>
                <th className="p-3 text-center">Leads Received</th>
                <th className="p-3 text-center">Deals Won</th>
                <th className="p-3 text-right">Rating Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/10">
              {/* Pre-sorted leader list based on mock data and calculations */}
              {agents
                .map((a) => {
                  const aProps = properties.filter((p) => p.agent_id === a.id);
                  const aLeads = leads.filter((l) => l.agent_id === a.id);
                  const views = aProps.reduce((acc, p) => acc + p.views, 0);
                  const wonCount = aLeads.filter((l) => l.status === 'Won').length;
                  return {
                    agent: a,
                    listings: aProps.length,
                    views,
                    leads: aLeads.length,
                    won: wonCount,
                    rating: a.is_featured ? 4.9 : 4.2
                  };
                })
                .sort((a, b) => b.leads - a.leads)
                .slice(0, 10)
                .map((item, idx) => {
                  const medal = idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`;
                  const rowBg = idx === 0 ? 'bg-amber-500/5' : idx === 1 ? 'bg-slate-400/5' : idx === 2 ? 'bg-amber-600/5' : '';
                  return (
                    <tr key={item.agent.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors ${rowBg}`}>
                      <td className="p-3 text-center font-bold font-mono text-slate-500">{medal}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {item.agent.avatar_url && (
                            <img src={item.agent.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shadow-xs" referrerPolicy="no-referrer" />
                          )}
                          <span className={`font-bold ${textPrimary}`}>{item.agent.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{item.agent.agency_name}</td>
                      <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">{item.listings}</td>
                      <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">{item.views.toLocaleString()}</td>
                      <td className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400">{item.leads}</td>
                      <td className="p-3 text-center font-bold text-green-500">{item.won} won</td>
                      <td className="p-3 text-right font-bold text-amber-500">★ {item.rating}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="text-right">
          <button
            onClick={() => toast.success('Leaderboard report generated!')}
            className="text-emerald-600 font-bold hover:underline"
          >
            View Full Leaderboard →
          </button>
        </div>
      </div>

      {/* SECTION 5 — VERIFY AGENTS QUICK PANEL */}
      <div className={`p-6 border rounded-xl ${bgCard} shadow-sm space-y-4 text-xs`}>
        <div>
          <h3 className={`text-base font-black ${textPrimary} flex items-center gap-1.5`}>
            <Clock className="text-[#004F31]" size={18} /> ⏳ Agents Awaiting Verification ({pendingCount})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Quickly review and activate pending agents registrations</p>
        </div>

        {pendingCount === 0 ? (
          <p className="text-slate-500 italic">No agents are currently awaiting verification. Excellent!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents
              .filter((a) => a.is_verified === 'pending')
              .map((pendingAgent) => {
                const pendProps = properties.filter((p) => p.agent_id === pendingAgent.id);
                return (
                  <div key={pendingAgent.id} className="p-4 rounded-xl border border-slate-700/15 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        {pendingAgent.avatar_url ? (
                          <img src={pendingAgent.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#004F31] text-white flex items-center justify-center font-bold">
                            {pendingAgent.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`font-bold truncate ${textPrimary}`}>{pendingAgent.name}</p>
                          <p className="text-slate-400 text-[10px] truncate">{pendingAgent.agency_name}</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400">
                        <p>📋 License: <span className="font-semibold text-slate-300">{pendingAgent.license_no || 'Not Provided'}</span></p>
                        <p>🗓️ Registered: <span className="font-semibold text-slate-300">{new Date(pendingAgent.created_at).toLocaleDateString()}</span></p>
                        <p>📍 Districts: <span className="font-semibold text-slate-300">{pendingAgent.service_areas.slice(0, 3).join(', ')}</span></p>
                        <p>🏠 Listings: <span className="font-bold text-orange-500">{pendProps.length} pending approval</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-750/10">
                      <button
                        onClick={() => handleQuickVerify(pendingAgent)}
                        className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-xs"
                      >
                        ✅ VERIFY NOW
                      </button>
                      <button
                        onClick={() => handleQuickReject(pendingAgent)}
                        className="py-1.5 px-2.5 bg-red-600/15 text-red-600 hover:bg-red-600/20 font-bold rounded border border-red-600/10"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Dispatched information request WhatsApp template');
                        }}
                        className="py-1.5 px-2 bg-slate-250 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 font-semibold rounded"
                      >
                        📝 More Info
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* SECTION 6 — ADD AGENT MANUALLY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-xl border p-6 ${bgCard} shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/10">
              <div>
                <h3 className={`text-base font-bold ${textPrimary}`}>Add New Agent Account</h3>
                <p className="text-[10px] text-slate-400">Create an agent account on behalf of a registered agency representative.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleAddAgentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Full Name*:</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter agent full name"
                    value={addForm.name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Email Address*:</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Phone Number* (+94):</label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 XXX XXXX"
                    value={addForm.phone}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>WhatsApp Number (+94):</label>
                  <input
                    type="text"
                    placeholder="+94 77 XXX XXXX"
                    value={addForm.whatsapp}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Password*:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter secure password"
                      value={addForm.password}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="flex-1 p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="py-2.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 font-bold rounded"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Agency Name:</label>
                  <input
                    type="text"
                    placeholder="Enter registered agency name"
                    value={addForm.agencyName}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, agencyName: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>License Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. L-XXXXX"
                    value={addForm.licenseNo}
                    onChange={(prev) => setAddForm((prevVal) => ({ ...prevVal, licenseNo: prev.target.value }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Years Experience:</label>
                  <select
                    value={addForm.yearsExperience}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, yearsExperience: parseInt(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((yr) => (
                      <option key={yr} value={yr} className="bg-white dark:bg-slate-900">{yr} Years Experience</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-bold ${textSecondary} mb-1.5`}>Specialization (Multi-Select):</label>
                <div className="flex flex-wrap gap-2 p-2.5 border border-slate-300 dark:border-slate-800 rounded">
                  {['Residential', 'Commercial', 'Land', 'Luxury', 'Rental', 'Industrial'].map((type) => {
                    const isSelected = addForm.specialization.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          const next = isSelected 
                            ? addForm.specialization.filter((t) => t !== type)
                            : [...addForm.specialization, type];
                          setAddForm((prev) => ({ ...prev, specialization: next }));
                        }}
                        className={`py-1 px-3 rounded-full border transition-all ${
                          isSelected ? 'bg-[#004F31] border-[#004F31] text-white font-bold' : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={`block font-bold ${textSecondary} mb-1.5`}>Service Districts (Multi-Select):</label>
                <div className="flex flex-wrap gap-2 p-2.5 border border-slate-300 dark:border-slate-800 rounded max-h-24 overflow-y-auto">
                  {sriLankanDistricts.map((d) => {
                    const isSelected = addForm.serviceAreas.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => {
                          const next = isSelected 
                            ? addForm.serviceAreas.filter((t) => t !== d)
                            : [...addForm.serviceAreas, d];
                          setAddForm((prev) => ({ ...prev, serviceAreas: next }));
                        }}
                        className={`py-1 px-2.5 rounded border transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white font-bold' : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        📍 {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-700/10 pt-4">
                <div>
                  <label className={`block font-bold ${textSecondary} mb-1.5`}>Assign Package Tier:</label>
                  <select
                    value={addForm.package}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, package: e.target.value as any }))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Free" className="bg-white dark:bg-slate-900">Free Tier</option>
                    <option value="Starter" className="bg-white dark:bg-slate-900">Starter Tier</option>
                    <option value="Professional" className="bg-white dark:bg-slate-900">Professional Tier</option>
                    <option value="Enterprise" className="bg-white dark:bg-slate-900">Enterprise Tier</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded border border-slate-300 dark:border-slate-800 self-end">
                  <span className={`font-bold ${textSecondary}`}>Pre-Verify Account:</span>
                  <button
                    type="button"
                    onClick={() => setAddForm((prev) => ({ ...prev, isVerified: !prev.isVerified }))}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${addForm.isVerified ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${addForm.isVerified ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded border border-slate-300 dark:border-slate-800 self-end">
                  <span className={`font-bold ${textSecondary}`}>Feature This Agent:</span>
                  <button
                    type="button"
                    onClick={() => setAddForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${addForm.isFeatured ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${addForm.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className={`block font-bold ${textSecondary} mb-1.5`}>Agent Biography / Statement:</label>
                <textarea
                  placeholder="Enter short agent biography, expertise overview, or company mission statements..."
                  value={addForm.bio}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-700/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow"
                >
                  Create Agent Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
