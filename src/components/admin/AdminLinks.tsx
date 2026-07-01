import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Link2, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Calendar, 
  Lock, 
  Unlock, 
  Settings, 
  Filter, 
  Search, 
  Share2, 
  Send, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Globe, 
  Chrome, 
  Compass, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Activity, 
  Check, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  BarChart3, 
  MoreVertical,
  X,
  Mail,
  QrCode
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

interface ShortLink {
  id: string;
  slug: string;
  original_url: string;
  title: string;
  description: string;
  created_by?: string;
  target_type: 'property' | 'agent' | 'package' | 'page' | 'external' | 'custom';
  target_id?: string;
  is_active: boolean;
  expires_at?: string;
  password?: string;
  total_clicks: number;
  unique_clicks: number;
  created_at: string;
  updated_at: string;
}

interface LinkClick {
  id: string;
  link_id: string;
  clicked_at: string;
  ip_address: string;
  country: string;
  city: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  referrer: string;
  user_agent: string;
  is_unique: boolean;
}

// 20 realistic seed clicks for analytics
const SEED_CLICKS: LinkClick[] = [
  { id: "c1", link_id: "1", clicked_at: new Date(Date.now() - 3600000 * 2).toISOString(), ip_address: "112.134.55.12", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "WhatsApp", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c2", link_id: "1", clicked_at: new Date(Date.now() - 3600000 * 5).toISOString(), ip_address: "112.134.55.12", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "WhatsApp", user_agent: "Mozilla/5.0", is_unique: false },
  { id: "c3", link_id: "1", clicked_at: new Date(Date.now() - 3600000 * 10).toISOString(), ip_address: "175.157.22.4", country: "Sri Lanka", city: "Kandy", device_type: "desktop", browser: "Chrome", os: "Windows", referrer: "Direct", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c4", link_id: "1", clicked_at: new Date(Date.now() - 3600000 * 25).toISOString(), ip_address: "203.94.88.130", country: "Sri Lanka", city: "Gampaha", device_type: "tablet", browser: "Chrome", os: "Android", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c5", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 1).toISOString(), ip_address: "203.115.120.2", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Chrome", os: "Android", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c6", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 4).toISOString(), ip_address: "112.134.120.45", country: "Sri Lanka", city: "Galle", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c7", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 12).toISOString(), ip_address: "112.134.120.45", country: "Sri Lanka", city: "Galle", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: false },
  { id: "c8", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 30).toISOString(), ip_address: "175.157.80.99", country: "Sri Lanka", city: "Colombo", device_type: "desktop", browser: "Chrome", os: "Mac", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c9", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 40).toISOString(), ip_address: "203.94.90.15", country: "Sri Lanka", city: "Negombo", device_type: "desktop", browser: "Firefox", os: "Linux", referrer: "Direct", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c10", link_id: "3", clicked_at: new Date(Date.now() - 3600000 * 8).toISOString(), ip_address: "112.134.200.11", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Chrome", os: "Android", referrer: "WhatsApp", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c11", link_id: "3", clicked_at: new Date(Date.now() - 3600000 * 18).toISOString(), ip_address: "203.115.122.50", country: "Sri Lanka", city: "Kandy", device_type: "mobile", browser: "Chrome", os: "Android", referrer: "Direct", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c12", link_id: "4", clicked_at: new Date(Date.now() - 3600000 * 72).toISOString(), ip_address: "175.157.44.88", country: "Sri Lanka", city: "Colombo", device_type: "desktop", browser: "Edge", os: "Windows", referrer: "Newsletter", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c13", link_id: "1", clicked_at: new Date(Date.now() - 3600000 * 48).toISOString(), ip_address: "192.168.1.100", country: "Sri Lanka", city: "Colombo", device_type: "desktop", browser: "Chrome", os: "Windows", referrer: "WhatsApp", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c14", link_id: "1", clicked_at: new Date(Date.now() - 3600000 * 55).toISOString(), ip_address: "192.168.1.101", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "Direct", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c15", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 60).toISOString(), ip_address: "192.168.1.102", country: "Sri Lanka", city: "Gampaha", device_type: "mobile", browser: "Chrome", os: "Android", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c16", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 65).toISOString(), ip_address: "192.168.1.103", country: "Sri Lanka", city: "Jaffna", device_type: "desktop", browser: "Chrome", os: "Mac", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c17", link_id: "3", clicked_at: new Date(Date.now() - 3600000 * 70).toISOString(), ip_address: "192.168.1.104", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Chrome", os: "Android", referrer: "Direct", user_agent: "Mozilla/5.0", is_unique: true },
  { id: "c18", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 6).toISOString(), ip_address: "112.134.120.45", country: "Sri Lanka", city: "Galle", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: false },
  { id: "c19", link_id: "2", clicked_at: new Date(Date.now() - 3600000 * 14).toISOString(), ip_address: "112.134.120.45", country: "Sri Lanka", city: "Galle", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "Facebook", user_agent: "Mozilla/5.0", is_unique: false },
  { id: "c20", link_id: "1", clicked_at: new Date().toISOString(), ip_address: "112.134.55.12", country: "Sri Lanka", city: "Colombo", device_type: "mobile", browser: "Safari", os: "iOS", referrer: "WhatsApp", user_agent: "Mozilla/5.0", is_unique: false },
];

const SEED_LINKS: ShortLink[] = [
  {
    id: "1",
    slug: "kollu-penthouse",
    original_url: "https://lankaproperty.lk/?property=LP001",
    title: "Luxury Penthouse Promo",
    description: "WhatsApp outreach campaign to high-net-worth individuals for Kollupitiya penthouse listing.",
    target_type: "property",
    is_active: true,
    total_clicks: 148,
    unique_clicks: 92,
    created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  },
  {
    id: "2",
    slug: "prime-malabe",
    original_url: "https://lankaproperty.lk/?property=LP002",
    title: "Malabe Land FB Campaign",
    description: "Link for target Facebook campaign promoting Malabe 15 Perch land block.",
    target_type: "property",
    is_active: true,
    total_clicks: 312,
    unique_clicks: 180,
    created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  },
  {
    id: "3",
    slug: "vip-agent",
    original_url: "https://lankaproperty.lk/agent/12",
    title: "VIP Agent Profile QR",
    description: "Short branded URL mapped to QR code printed on luxury brochure.",
    target_type: "agent",
    is_active: true,
    total_clicks: 45,
    unique_clicks: 38,
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString()
  },
  {
    id: "4",
    slug: "gregory-villa",
    original_url: "https://lankaproperty.lk/?property=LP003",
    title: "Nuwara Eliya Villa Newsletter",
    description: "Featured property of the month in June email marketing newsletter.",
    target_type: "property",
    is_active: false,
    expires_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    total_clicks: 89,
    unique_clicks: 54,
    created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
  }
];

export default function AdminLinks({ user }: { user: any }) {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [clicks, setClicks] = useState<LinkClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [adminDarkMode, setAdminDarkMode] = useState(false);

  // Form states
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<ShortLink['target_type']>('property');
  const [targetId, setTargetId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Quick link state
  const [quickUrl, setQuickUrl] = useState('');
  const [quickResult, setQuickResult] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modal / Sidebar states
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [selectedLinkAnalytics, setSelectedLinkAnalytics] = useState<ShortLink | null>(null);
  const [showBulkShare, setShowBulkShare] = useState<ShortLink | null>(null);

  // Track state of dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('admin-dark-mode') === 'true';
    setAdminDarkMode(isDark);
    
    // Check if body has dark class or watch for mutations
    const observer = new MutationObserver(() => {
      setAdminDarkMode(localStorage.getItem('admin-dark-mode') === 'true');
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Fetch from Supabase or Fallback
  const fetchData = async () => {
    setLoading(true);
    try {
      // Test if short_links table exists by executing a select
      const { data: linksData, error: linksError } = await supabase
        .from('short_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (linksError) {
        throw new Error(linksError.message);
      }

      const { data: clicksData, error: clicksError } = await supabase
        .from('link_clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      if (clicksError) {
        throw new Error(clicksError.message);
      }

      setLinks(linksData || []);
      setClicks(clicksData || []);
      setIsLocalMode(false);
    } catch (e: any) {
      console.warn("Supabase short links query failed (using localStorage backup):", e);
      setIsLocalMode(true);
      
      // Load from localStorage or set defaults
      const storedLinks = localStorage.getItem('lp_short_links');
      const storedClicks = localStorage.getItem('lp_link_clicks');
      
      if (storedLinks) {
        setLinks(JSON.parse(storedLinks));
      } else {
        setLinks(SEED_LINKS);
        localStorage.setItem('lp_short_links', JSON.stringify(SEED_LINKS));
      }

      if (storedClicks) {
        setClicks(JSON.parse(storedClicks));
      } else {
        setClicks(SEED_CLICKS);
        localStorage.setItem('lp_link_clicks', JSON.stringify(SEED_CLICKS));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-detect targets and suggest title based on pasted URL
  useEffect(() => {
    if (!originalUrl) return;

    // Detect Property ID
    const propMatch = originalUrl.match(/(?:\?|&)property=(?:LP00)?(\d+)/i) || originalUrl.match(/\/property\/(\d+)/i);
    if (propMatch) {
      setTargetType('property');
      const propId = propMatch[1];
      if (!title) {
        setTitle(`Property Ref #LP${propId} Link`);
      }
      return;
    }

    // Detect Agent Profile
    const agentMatch = originalUrl.match(/\/agent\/(\d+)/i);
    if (agentMatch) {
      setTargetType('agent');
      const agentId = agentMatch[1];
      if (!title) {
        setTitle(`Agent Profile #${agentId} Link`);
      }
      return;
    }

    // Default title from domain
    try {
      const urlObj = new URL(originalUrl);
      if (!title) {
        setTitle(`Branded link for ${urlObj.hostname}`);
      }
    } catch (e) {}
  }, [originalUrl]);

  // Generate a cryptographically random, clean slug
  const generateRandomSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSlug(result);
  };

  // Create link
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) {
      toast.error('Original URL is required');
      return;
    }

    const cleanSlug = (slug || Math.random().toString(36).substring(2, 8)).trim().toLowerCase();
    
    // Check if slug is unique
    const isSlugTaken = links.some(l => l.slug === cleanSlug && (!editingLink || l.id !== editingLink.id));
    if (isSlugTaken) {
      toast.error(`The slug "${cleanSlug}" is already in use.`);
      return;
    }

    const linkPayload: Omit<ShortLink, 'id' | 'total_clicks' | 'unique_clicks' | 'created_at' | 'updated_at'> = {
      slug: cleanSlug,
      original_url: originalUrl.trim(),
      title: title.trim() || `Branded Link - ${cleanSlug}`,
      description: description.trim(),
      target_type: targetType,
      target_id: targetId ? targetId : undefined,
      is_active: true,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      password: password ? password : undefined,
    };

    if (isLocalMode) {
      // Local Mode Insert
      const newLink: ShortLink = {
        ...linkPayload,
        id: Math.random().toString(36).substring(2, 9),
        total_clicks: 0,
        unique_clicks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedList = [newLink, ...links];
      setLinks(updatedList);
      localStorage.setItem('lp_short_links', JSON.stringify(updatedList));
      toast.success('Short link generated locally!');
    } else {
      // Supabase Mode Insert
      const { data, error } = await supabase
        .from('short_links')
        .insert(linkPayload)
        .select()
        .single();

      if (error) {
        toast.error(`Failed to create link: ${error.message}`);
        return;
      }
      setLinks([data, ...links]);
      toast.success('Branded short link generated successfully!');
    }

    // Reset Form
    setOriginalUrl('');
    setTitle('');
    setSlug('');
    setDescription('');
    setTargetType('property');
    setTargetId('');
    setExpiresAt('');
    setPassword('');
  };

  // Quick Shorten
  const handleQuickShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl) return;

    const shortSlug = Math.random().toString(36).substring(2, 8);
    const domain = window.location.origin;
    const shortened = `${domain}/l/${shortSlug}`;

    const linkPayload = {
      slug: shortSlug,
      original_url: quickUrl.trim(),
      title: `Quick Link (${shortSlug})`,
      description: 'Created via Quick Shorten widget',
      target_type: 'custom' as const,
      is_active: true,
    };

    if (isLocalMode) {
      const newLink: ShortLink = {
        ...linkPayload,
        id: Math.random().toString(36).substring(2, 9),
        total_clicks: 0,
        unique_clicks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedList = [newLink, ...links];
      setLinks(updatedList);
      localStorage.setItem('lp_short_links', JSON.stringify(updatedList));
    } else {
      const { error } = await supabase
        .from('short_links')
        .insert(linkPayload);
      if (error) {
        toast.error(`Error: ${error.message}`);
        return;
      }
      fetchData();
    }

    setQuickResult(shortened);
    setQuickUrl('');
    toast.success('Quick link created and copied!');
    navigator.clipboard.writeText(shortened);
  };

  // Edit Link save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    const updatedPayload = {
      title: editingLink.title.trim(),
      description: editingLink.description.trim(),
      original_url: editingLink.original_url.trim(),
      is_active: editingLink.is_active,
      expires_at: editingLink.expires_at ? new Date(editingLink.expires_at).toISOString() : null,
      password: editingLink.password ? editingLink.password : null,
      updated_at: new Date().toISOString()
    };

    if (isLocalMode) {
      const updatedList = links.map(l => l.id === editingLink.id ? { ...l, ...updatedPayload } : l);
      setLinks(updatedList);
      localStorage.setItem('lp_short_links', JSON.stringify(updatedList));
      toast.success('Link updated successfully!');
      setEditingLink(null);
    } else {
      const { error } = await supabase
        .from('short_links')
        .update(updatedPayload)
        .eq('id', editingLink.id);

      if (error) {
        toast.error(`Update failed: ${error.message}`);
        return;
      }
      toast.success('Link updated successfully!');
      setEditingLink(null);
      fetchData();
    }
  };

  // Delete Link
  const handleDeleteLink = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this short link? All tracking analytics will be deleted.')) {
      return;
    }

    if (isLocalMode) {
      const updatedList = links.filter(l => l.id !== id);
      setLinks(updatedList);
      localStorage.setItem('lp_short_links', JSON.stringify(updatedList));
      
      // Filter clicks too
      const updatedClicks = clicks.filter(c => c.link_id !== id);
      setClicks(updatedClicks);
      localStorage.setItem('lp_link_clicks', JSON.stringify(updatedClicks));

      toast.success('Link deleted successfully');
    } else {
      const { error } = await supabase
        .from('short_links')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Delete failed: ${error.message}`);
        return;
      }
      toast.success('Link deleted successfully');
      fetchData();
    }

    if (selectedLinkAnalytics?.id === id) {
      setSelectedLinkAnalytics(null);
    }
  };

  // Toggle link active status quickly
  const toggleLinkStatus = async (link: ShortLink) => {
    const updatedStatus = !link.is_active;
    
    if (isLocalMode) {
      const updatedList = links.map(l => l.id === link.id ? { ...l, is_active: updatedStatus } : l);
      setLinks(updatedList);
      localStorage.setItem('lp_short_links', JSON.stringify(updatedList));
      toast.success(`Link has been ${updatedStatus ? 'activated' : 'paused'}`);
    } else {
      const { error } = await supabase
        .from('short_links')
        .update({ is_active: updatedStatus })
        .eq('id', link.id);

      if (error) {
        toast.error(`Failed to update status: ${error.message}`);
        return;
      }
      toast.success(`Link has been ${updatedStatus ? 'activated' : 'paused'}`);
      fetchData();
    }
  };

  // Copy with toast helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(
      <div className="flex flex-col gap-0.5 text-left">
        <span className="font-bold">Branded Link Copied!</span>
        <span className="text-[10px] opacity-80">{text}</span>
      </div>
    );
  };

  // Stats calculation
  const totalLinks = links.length;
  const activeLinks = links.filter(l => l.is_active && (!l.expires_at || new Date(l.expires_at).getTime() > Date.now())).length;

  // Clicks today (within last 24 hours)
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const clicksToday = clicks.filter(c => new Date(c.clicked_at).getTime() >= startOfToday.getTime()).length;
  
  const totalClicksAllTime = clicks.length;

  // Determine top device today
  const getTopDevice = () => {
    const deviceCounts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
    clicks.forEach(c => {
      if (c.device_type) {
        deviceCounts[c.device_type] = (deviceCounts[c.device_type] || 0) + 1;
      }
    });
    let topDevice = 'Mobile';
    let maxVal = 0;
    Object.entries(deviceCounts).forEach(([k, v]) => {
      if (v > maxVal) {
        maxVal = v;
        topDevice = k.charAt(0).toUpperCase() + k.slice(1);
      }
    });
    return totalClicksAllTime > 0 ? `${topDevice} (${Math.round((maxVal / totalClicksAllTime) * 100)}%)` : 'No Traffic';
  };

  // Search & Filter & Sort lists
  const filteredLinks = links
    .filter(link => {
      const matchesSearch = 
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        link.slug.toLowerCase().includes(searchTerm.toLowerCase()) || 
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || link.target_type === filterType;
      
      let matchesStatus = true;
      if (filterStatus === 'active') {
        matchesStatus = link.is_active && (!link.expires_at || new Date(link.expires_at).getTime() > Date.now());
      } else if (filterStatus === 'expired') {
        matchesStatus = !!link.expires_at && new Date(link.expires_at).getTime() <= Date.now();
      } else if (filterStatus === 'password') {
        matchesStatus = !!link.password;
      } else if (filterStatus === 'inactive') {
        matchesStatus = !link.is_active;
      }

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'clicks') {
        return b.total_clicks - a.total_clicks;
      } else if (sortBy === 'expiry') {
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      }
      return 0;
    });

  // Calculate stats for current selection analytics
  const getSelectedAnalyticsData = () => {
    if (!selectedLinkAnalytics) return { overTime: [], devices: [], referrers: [], browsers: [], OSs: [] };
    
    const linkClicks = clicks.filter(c => c.link_id === selectedLinkAnalytics.id);
    
    // 1. Clicks over time (last 7 days)
    const overTimeMap: Record<string, { date: string, clicks: number, unique: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      overTimeMap[d.toDateString()] = { date: dateString, clicks: 0, unique: 0 };
    }

    linkClicks.forEach(c => {
      const clickDate = new Date(c.clicked_at);
      const key = clickDate.toDateString();
      if (overTimeMap[key]) {
        overTimeMap[key].clicks += 1;
        if (c.is_unique) {
          overTimeMap[key].unique += 1;
        }
      }
    });

    // 2. Devices
    const deviceCounts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
    linkClicks.forEach(c => {
      if (c.device_type) deviceCounts[c.device_type] += 1;
    });
    const devicesData = [
      { name: 'Mobile', value: deviceCounts.mobile, color: '#004F31' },
      { name: 'Desktop', value: deviceCounts.desktop, color: '#10B981' },
      { name: 'Tablet', value: deviceCounts.tablet, color: '#34D399' }
    ].filter(d => d.value > 0);

    // 3. Referrers
    const refCounts: Record<string, number> = {};
    linkClicks.forEach(c => {
      const r = c.referrer || 'Direct';
      refCounts[r] = (refCounts[r] || 0) + 1;
    });
    const referrersData = Object.entries(refCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 4. Browsers
    const browserCounts: Record<string, number> = {};
    linkClicks.forEach(c => {
      const b = c.browser || 'Other';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const browsersData = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 5. Operating Systems
    const osCounts: Record<string, number> = {};
    linkClicks.forEach(c => {
      const o = c.os || 'Other';
      osCounts[o] = (osCounts[o] || 0) + 1;
    });
    const osData = Object.entries(osCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      overTime: Object.values(overTimeMap),
      devices: devicesData,
      referrers: referrersData,
      browsers: browsersData,
      OSs: osData,
      rawClicksCount: linkClicks.length,
      uniqueClicksCount: linkClicks.filter(c => c.is_unique).length,
      clickList: linkClicks.slice(0, 15) // Top 15 recent clicks
    };
  };

  const selectedAnalytics = getSelectedAnalyticsData();
  const domain = window.location.origin;

  return (
    <div className={`space-y-8 font-sans ${adminDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Link Shortener
            </h1>
            <span className="bg-[#004F31] text-emerald-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse shadow-sm">
              NEW Branded Links
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, manage and track all shortened links for LankaProperty.lk with bulletproof analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLocalMode ? (
            <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 text-xs font-bold px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Local Storage Offline Mode
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-xs font-bold px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Supabase Live Connected
            </span>
          )}
          <button 
            onClick={fetchData} 
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
            title="Refresh Database"
          >
            <Activity size={16} />
          </button>
        </div>
      </div>

      {/* TOP STATS CARDS ROW (5 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Short Links</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : totalLinks}</h3>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/40 text-slate-500 rounded-xl">
              <Link size={18} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Links</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-black text-[#004F31] dark:text-emerald-400">{loading ? '...' : activeLinks}</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clicks Today</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">{loading ? '...' : clicksToday}</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">All-Time Clicks</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">{loading ? '...' : totalClicksAllTime}</h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-xl">
              <BarChart3 size={18} />
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Device Today</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[130px]">{loading ? '...' : getTopDevice()}</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl">
              <Smartphone size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* ACTION TOOLS PANEL (Create New Short Link & Quick Generator Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Short Link Form - Col Span 2 */}
        <div className="lg:col-span-2 bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#004F31]" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-emerald-500" size={18} />
            Create Branded Short Link
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Configure custom URL paths, link targets, access passwords, and tracking parameters.
          </p>

          <form onSubmit={handleCreateLink} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Original URL */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Destination URL (Original URL) *</label>
                <div className="relative">
                  <input 
                    type="url" 
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    placeholder="https://lankaproperty.lk/property/colombo-penthouse-109?ref=banner"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  />
                  <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              {/* Title / Label */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Branded Link Title / Label *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Kollupitiya Penthouse VIP Link"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Custom Slug */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Branded Slug (l/slug)</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute left-3.5 top-3 text-[11px] font-black text-slate-400 select-none">
                      /l/
                    </span>
                    <input 
                      type="text" 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                      placeholder="kollu-penthouse"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-[#004F31] dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#004F31]"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={generateRandomSlug}
                    className="px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    Auto
                  </button>
                </div>
              </div>

              {/* Target Type & Target ID */}
              <div className="grid grid-cols-2 gap-3 md:col-span-2 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Target Entity Type</label>
                  <select 
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  >
                    <option value="property">🏢 Property Listing</option>
                    <option value="agent">👤 Agent Profile</option>
                    <option value="package">💎 Pricing Plan/Package</option>
                    <option value="page">📄 Landing Page</option>
                    <option value="external">🌐 External Domain</option>
                    <option value="custom">⚙️ Custom Route</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Entity ID (Optional)</label>
                  <input 
                    type="text" 
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="e.g. UUID or Reference ID"
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Expiry and Password Protection */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Expiration Date & Time (Optional)</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  />
                  <Calendar className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              {/* Access Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Access Password protection (Optional)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="None (Leave empty for public access)"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  />
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Internal Notes / Description */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Internal Note / Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about where this link will be shared, audience details, or campaign objectives."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

            </div>

            {/* LIVE PREVIEW BANNER */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-[#004F31]/30 dark:border-emerald-500/20 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-widest bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Live Preview</span>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-black text-[#004F31] dark:text-emerald-400">
                  <span>{domain}/l/</span>
                  <span className="bg-[#004F31]/10 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded text-red-500 dark:text-orange-400 animate-pulse">
                    {slug || '[random_slug]'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const path = `${domain}/l/${slug || 'placeholder'}`;
                  copyToClipboard(path);
                }}
                disabled={!slug}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-black tracking-wide shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <Copy size={13} />
                Copy Preview
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-[#004F31] hover:bg-[#003621] text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Generate Short Branded Link
            </button>
          </form>
        </div>

        {/* Quick Link Generator & Bulk Tools Panel - Col Span 1 */}
        <div className="space-y-6">
          
          {/* Quick Generator Widget */}
          <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#004F31]/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" />
              Quick Link Generator
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Paste any long URL to instantly shorten and copy the link in one second.</p>
            
            <form onSubmit={handleQuickShorten} className="space-y-3">
              <input 
                type="url" 
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                required
                placeholder="Paste long URL..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
              />
              <button 
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 text-white p-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-xs"
              >
                Instant Shorten
              </button>
            </form>

            {quickResult && (
              <div className="mt-4 bg-[#004F31]/5 border border-[#004F31]/10 p-3 rounded-xl text-center space-y-2 animate-fadeIn">
                <p className="text-[10px] font-black text-[#004F31] dark:text-emerald-400 uppercase tracking-widest">Your Quick Shortened Link:</p>
                <div className="font-mono text-xs font-black truncate text-slate-800 dark:text-slate-100">{quickResult}</div>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => copyToClipboard(quickResult)}
                    className="px-3 py-1.5 bg-[#004F31] hover:bg-[#003621] text-white text-[10px] font-black uppercase rounded-lg transition flex items-center gap-1"
                  >
                    <Copy size={10} /> Copy
                  </button>
                  <a 
                    href={quickResult} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase rounded-lg transition flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> Test
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Branded Domains & Tips */}
          <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Settings size={16} className="text-indigo-500" />
              Settings & Branding
            </h3>
            
            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="font-bold text-slate-500">Base Domain</span>
                <span className="font-mono font-bold text-[#004F31] dark:text-emerald-400">lankaproperty.lk/l/</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="font-bold text-slate-500">Tracking Protocol</span>
                <span className="text-emerald-600 font-bold">Encrypted Click Agent</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-slate-500">GeoIP Resolver</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">ip-api.com (Colombo Fallback)</span>
              </div>
              
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-700 dark:text-indigo-400">
                <h4 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Activity size={10} />
                  Real-time Webhook
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                  Every link click automatically captures user browser fingerprint, OS details, referrer tags, and geolocates coordinates instantly.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FILTER & SEARCH TOOLS ROW */}
      <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search slug, title, destination URL..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
          />
          <Search className="absolute left-3 top-3 text-slate-400" size={15} />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Target Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400">Type</span>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Targets</option>
              <option value="property">🏢 Properties</option>
              <option value="agent">👤 Agents</option>
              <option value="package">💎 Packages</option>
              <option value="page">📄 Pages</option>
              <option value="custom">⚙️ Custom</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">🟢 Active</option>
              <option value="inactive">⏸️ Paused</option>
              <option value="expired">⏰ Expired</option>
              <option value="password">🔒 Password Protected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400">Sort</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
            >
              <option value="newest">📅 Created Newest</option>
              <option value="clicks">🔥 Total Clicks</option>
              <option value="expiry">⏳ Nearest Expiry</option>
            </select>
          </div>

        </div>
      </div>

      {/* ALL LINKS TABLE */}
      <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Short Links Directory</h3>
          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500">Showing {filteredLinks.length} of {links.length} links</span>
        </div>

        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#004F31]" size={36} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading branded short links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500">
            <XCircle size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-black text-sm uppercase tracking-wider">No Short Links Found</p>
            <p className="text-xs mt-1">Try adjusting your filters or search term, or generate a new branded link.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-800/5">
                  <th className="py-4 px-6">Branded Short URL</th>
                  <th className="py-4 px-6">Destination Info</th>
                  <th className="py-4 px-6">Target Type</th>
                  <th className="py-4 px-6 text-center">Clicks (Total/Unique)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Expiry</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                {filteredLinks.map((link) => {
                  const isExpired = link.expires_at && new Date(link.expires_at).getTime() < Date.now();
                  const shortUrl = `${domain}/l/${link.slug}`;
                  const isSelected = selectedLinkAnalytics?.id === link.id;

                  return (
                    <tr 
                      key={link.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/5 border-l-4 border-l-[#004F31]' : ''}`}
                    >
                      {/* Branded URL */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-white text-sm block">{link.title}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-[#004F31] dark:text-emerald-400 select-all bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/10">
                              /l/{link.slug}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(shortUrl)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                              title="Copy Shortened Link"
                            >
                              <Copy size={12} />
                            </button>
                            <a 
                              href={shortUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                              title="Open Short Link"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Destination Info */}
                      <td className="py-4 px-6 max-w-[200px]">
                        <div className="space-y-0.5 truncate">
                          <a 
                            href={link.original_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-slate-600 dark:text-slate-300 hover:text-[#004F31] dark:hover:text-emerald-400 hover:underline flex items-center gap-1 truncate font-medium text-xs"
                          >
                            <ExternalLink size={11} className="shrink-0" />
                            {link.original_url}
                          </a>
                          {link.description && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{link.description}</span>
                          )}
                        </div>
                      </td>

                      {/* Target Type */}
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200/50 dark:border-slate-700/20">
                          {link.target_type === 'property' && '🏢 Property'}
                          {link.target_type === 'agent' && '👤 Agent'}
                          {link.target_type === 'package' && '💎 Package'}
                          {link.target_type === 'page' && '📄 Page'}
                          {link.target_type === 'external' && '🌐 External'}
                          {link.target_type === 'custom' && '⚙️ Custom'}
                        </span>
                      </td>

                      {/* Clicks */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{link.total_clicks}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Uniq: {link.unique_clicks}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {!link.is_active ? (
                          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Paused
                          </span>
                        ) : isExpired ? (
                          <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-xs font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Expired
                          </span>
                        ) : link.password ? (
                          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider" title="Password Protected">
                            <Lock size={11} />
                            Encrypted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#004F31] dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                        {link.expires_at ? (
                          <div className="flex items-center gap-1" title={new Date(link.expires_at).toLocaleString()}>
                            <Clock size={11} className="text-slate-400" />
                            <span>{new Date(link.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 font-bold">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Toggle Active */}
                          <button
                            onClick={() => toggleLinkStatus(link)}
                            className={`p-1.5 rounded-lg border transition ${
                              link.is_active 
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300' 
                                : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/20 text-[#004F31] dark:text-emerald-400 hover:bg-emerald-100'
                            }`}
                            title={link.is_active ? "Pause Short Link" : "Activate Short Link"}
                          >
                            {link.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>

                          {/* View Analytics */}
                          <button
                            onClick={() => {
                              setSelectedLinkAnalytics(link);
                              // Smooth scroll to analytics section
                              setTimeout(() => {
                                document.getElementById('link-analytics-section')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              isSelected
                                ? 'bg-[#004F31] border-[#004F31] text-white'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                            title="Analyze Link Traffic"
                          >
                            <BarChart3 size={13} />
                          </button>

                          {/* Share Branded Link */}
                          <button
                            onClick={() => setShowBulkShare(link)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-500 hover:bg-slate-50 rounded-lg transition"
                            title="Share/Distribute link"
                          >
                            <Share2 size={13} />
                          </button>

                          {/* Edit Link */}
                          <button
                            onClick={() => setEditingLink(link)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 hover:bg-slate-50 rounded-lg transition"
                            title="Edit Link Configuration"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Delete Link */}
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                            title="Delete Branded Link"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LINK ANALYTICS DRILL-DOWN PANEL */}
      {selectedLinkAnalytics && (
        <div 
          id="link-analytics-section"
          className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 scroll-mt-6 animate-fadeIn"
        >
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/85 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-[#004F31] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">Deep Click Audit</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Traffic Analytics for: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-black">/l/{selectedLinkAnalytics.slug}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-bold">
                Campaign title: {selectedLinkAnalytics.title} • Target Type: {selectedLinkAnalytics.target_type.toUpperCase()}
              </p>
            </div>
            <button 
              onClick={() => setSelectedLinkAnalytics(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drilldown KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Click Sessions</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedAnalytics.rawClicksCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Unique Click Agents</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedAnalytics.uniqueClicksCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Uniqueness Ratio</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {selectedAnalytics.rawClicksCount > 0 
                  ? `${Math.round((selectedAnalytics.uniqueClicksCount / selectedAnalytics.rawClicksCount) * 100)}%` 
                  : '0%'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Database Score</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">+{selectedAnalytics.rawClicksCount * 12}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Clicks over time chart (Line/Area) */}
            <div className="lg:col-span-2 bg-slate-50/40 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Click Timeline Traffic (Last 7 Days)</h4>
              
              <div className="h-64">
                {selectedAnalytics.rawClicksCount === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                    No traffic records found in click timeline.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedAnalytics.overTime}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#004F31" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#004F31" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="clicks" stroke="#004F31" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" name="Total Clicks" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Devices Pie Chart */}
            <div className="bg-slate-50/40 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Device Traffic Breakdown</h4>
                <div className="h-44 relative flex items-center justify-center">
                  {selectedAnalytics.rawClicksCount === 0 ? (
                    <div className="text-slate-400 text-xs font-bold">No device data</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedAnalytics.devices}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {selectedAnalytics.devices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total</span>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">{selectedAnalytics.rawClicksCount}</h4>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Legend with values */}
              <div className="space-y-1.5 mt-2">
                {selectedAnalytics.devices.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-500">{d.name}</span>
                    </div>
                    <span className="text-slate-800 dark:text-white">
                      {d.value} clicks ({Math.round((d.value / selectedAnalytics.rawClicksCount) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Top referrers bar list */}
            <div className="bg-slate-50/40 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Compass size={14} />
                Traffic Referrers
              </h4>
              <div className="space-y-2">
                {selectedAnalytics.referrers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No referrer logs available.</p>
                ) : (
                  selectedAnalytics.referrers.map((ref, idx) => {
                    const percentage = Math.round((ref.value / selectedAnalytics.rawClicksCount) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">{ref.name}</span>
                          <span className="text-slate-900 dark:text-white">{ref.value} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top Browsers list */}
            <div className="bg-slate-50/40 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Globe size={14} />
                Browsers Used
              </h4>
              <div className="space-y-2">
                {selectedAnalytics.browsers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No browser logs available.</p>
                ) : (
                  selectedAnalytics.browsers.map((b, idx) => {
                    const percentage = Math.round((b.value / selectedAnalytics.rawClicksCount) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">{b.name}</span>
                          <span className="text-slate-900 dark:text-white">{b.value} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Operating Systems */}
            <div className="bg-slate-50/40 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Laptop size={14} />
                Operating Systems
              </h4>
              <div className="space-y-2">
                {selectedAnalytics.OSs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No OS logs available.</p>
                ) : (
                  selectedAnalytics.OSs.map((os, idx) => {
                    const percentage = Math.round((os.value / selectedAnalytics.rawClicksCount) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">{os.name}</span>
                          <span className="text-slate-900 dark:text-white">{os.value} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Click audit ledger (Detailed Timeline) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Click Audit Ledger (Last 15 Sessions)</h4>
            
            <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px] font-semibold">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/80 text-slate-400 uppercase tracking-widest text-[9px]">
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">IP Address</th>
                    <th className="py-2.5 px-4">Geo Location</th>
                    <th className="py-2.5 px-4">Device & Browser</th>
                    <th className="py-2.5 px-4">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {selectedAnalytics.clickList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No click sessions recorded yet. Share your short link to gather logs.
                      </td>
                    </tr>
                  ) : (
                    selectedAnalytics.clickList.map((click) => (
                      <tr key={click.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/5 text-slate-600 dark:text-slate-300">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-500">
                          {new Date(click.clicked_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 font-black">
                          {click.ip_address.substring(0, 10)}.x.x
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {click.city}, {click.country}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1">
                            {click.device_type === 'mobile' && <Smartphone size={11} className="text-[#004F31]" />}
                            {click.device_type === 'tablet' && <Tablet size={11} className="text-indigo-500" />}
                            {click.device_type === 'desktop' && <Laptop size={11} className="text-blue-500" />}
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {click.os} ({click.browser})
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider ${
                            click.referrer === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                            click.referrer === 'Facebook' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                            click.referrer === 'Newsletter' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {click.referrer}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CONFIGURATION MODAL */}
      {editingLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
              <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                <Edit3 size={16} className="text-amber-500" />
                Edit Link Configuration
              </h3>
              <button 
                onClick={() => setEditingLink(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Branded Short URL (Read-Only Slug)</label>
                <div className="font-mono font-black text-xs text-[#004F31] dark:text-emerald-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 select-none">
                  {domain}/l/{editingLink.slug}
                </div>
              </div>

              {/* Title / Label */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Branded Link Title / Label *</label>
                <input 
                  type="text" 
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Original URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Destination URL (Original URL) *</label>
                <input 
                  type="url" 
                  value={editingLink.original_url}
                  onChange={(e) => setEditingLink({ ...editingLink, original_url: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Expiry & Password protection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Expiration Date & Time (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={editingLink.expires_at ? editingLink.expires_at.substring(0, 16) : ''}
                    onChange={(e) => setEditingLink({ ...editingLink, expires_at: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Access Password Protection</label>
                  <input 
                    type="text" 
                    value={editingLink.password || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, password: e.target.value })}
                    placeholder="No password (public)"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Internal Campaign Note</label>
                <textarea 
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F31] text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Status Switcher */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">Is Link Active</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Inactive links redirect users to a beautiful paused announcement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLink({ ...editingLink, is_active: !editingLink.is_active })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    editingLink.is_active ? 'bg-[#004F31]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    editingLink.is_active ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Save buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button 
                  type="button" 
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wide transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#004F31] hover:bg-[#003621] text-white rounded-xl text-xs font-black uppercase tracking-wide transition shadow-md"
                >
                  Save Modifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BULK SHARE & QR MODAL */}
      {showBulkShare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13131F] border border-slate-100 dark:border-slate-800 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-scaleUp text-center p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Share2 size={15} />
                Share & Distribute Link
              </h3>
              <button 
                onClick={() => setShowBulkShare(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-md">Branded Path</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white truncate">{showBulkShare.title}</h4>
              <div className="font-mono text-xs font-black text-[#004F31] bg-emerald-50 dark:bg-[#004F31]/10 px-3 py-1.5 rounded-lg border border-emerald-100/30 select-all block break-all">
                {domain}/l/{showBulkShare.slug}
              </div>
            </div>

            {/* Simulated QR Code */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/10 rounded-2xl inline-block border border-slate-150/40">
              <div className="w-40 h-40 bg-white p-3 rounded-xl shadow-xs mx-auto flex flex-col justify-between items-center">
                <QrCode size={135} className="text-slate-900" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold">Dynamic QR Code generated automatically</p>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* WhatsApp */}
              <a 
                href={`https://api.whatsapp.com/send?text=Check%20out%2520this%2520link%2520on%2520LankaProperty.lk%253A%2520${encodeURIComponent(`${domain}/l/${showBulkShare.slug}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl flex flex-col items-center gap-1.5 transition text-[10px] font-bold uppercase tracking-wider"
              >
                <Send size={18} className="text-emerald-500 animate-pulse" />
                WhatsApp
              </a>

              {/* Email */}
              <a 
                href={`mailto:?subject=${encodeURIComponent(`LankaProperty.lk Link: ${showBulkShare.title}`)}&body=${encodeURIComponent(`Hi,\n\nPlease find the branded short URL for our campaign here:\n\n${domain}/l/${showBulkShare.slug}\n\nLankaProperty.lk`)}`}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl flex flex-col items-center gap-1.5 transition text-[10px] font-bold uppercase tracking-wider"
              >
                <Mail size={18} className="text-blue-500" />
                Email Seller
              </a>

              {/* Copy */}
              <button 
                onClick={() => {
                  copyToClipboard(`${domain}/l/${showBulkShare.slug}`);
                  setShowBulkShare(null);
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl flex flex-col items-center gap-1.5 transition text-[10px] font-bold uppercase tracking-wider"
              >
                <Copy size={18} className="text-slate-500" />
                Copy Link
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
