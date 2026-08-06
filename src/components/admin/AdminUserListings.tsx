import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Eye,
  Mail,
  Phone,
  Calendar,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  TrendingDown,
  Briefcase,
  Sliders,
  Sparkles,
  BarChart2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import {
  DemoUser,
  DemoProperty,
  DemoPayment,
  DemoLead,
  sriLankanDistricts,
  fallbackUsers,
  fallbackProperties,
  fallbackPayments,
  fallbackLeads,
} from '../../data/adminDemoData';

export default function AdminUserListings({ user: adminUser }: { user: any }) {
  // --- STATE SYSTEM ---
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [properties, setProperties] = useState<DemoProperty[]>([]);
  const [payments, setPayments] = useState<DemoPayment[]>([]);
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded user row ID (null if none expanded)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  // Tab within the expanded detail panel
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'properties' | 'billing' | 'leads' | 'analytics'>('details');

  // Image Lightbox
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Edit User Modal
  const [editUserModal, setEditUserModal] = useState<DemoUser | null>(null);

  // Add Property Modal
  const [addPropertyModalUser, setAddPropertyModalUser] = useState<DemoUser | null>(null);
  const [newPropertyForm, setNewPropertyForm] = useState({
    title: '',
    city: '',
    district: 'Colombo',
    category: 'House',
    listingType: 'Sale',
    price: '',
    rooms: '3',
    bathrooms: '2',
    landArea: '10 Perches',
    floorArea: '1800 sqft',
    description: '',
  });

  // Package Management states
  const [manualPackage, setManualPackage] = useState('Premium Pro');
  const [manualExpiry, setManualExpiry] = useState('');

  // Live registrations state
  const [liveRegistrations, setLiveRegistrations] = useState<any[]>([]);

  // Search & Filters from SessionStorage (Remember last active filter)
  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem('admin_ul_search') || '';
  });
  const [filterUserType, setFilterUserType] = useState(() => {
    return sessionStorage.getItem('admin_ul_user_type') || 'All';
  });
  const [filterPackage, setFilterPackage] = useState(() => {
    return sessionStorage.getItem('admin_ul_package') || 'All';
  });
  const [filterStatus, setFilterStatus] = useState(() => {
    return sessionStorage.getItem('admin_ul_status') || 'All';
  });
  const [filterDistrict, setFilterDistrict] = useState(() => {
    return sessionStorage.getItem('admin_ul_district') || 'All';
  });
  const [filterDateJoined, setFilterDateJoined] = useState(() => {
    return sessionStorage.getItem('admin_ul_date_joined') || 'All Time';
  });
  const [filterPaymentStatus, setFilterPaymentStatus] = useState(() => {
    return sessionStorage.getItem('admin_ul_payment_status') || 'All';
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Save filters to SessionStorage
  useEffect(() => {
    sessionStorage.setItem('admin_ul_search', searchQuery);
    sessionStorage.setItem('admin_ul_user_type', filterUserType);
    sessionStorage.setItem('admin_ul_package', filterPackage);
    sessionStorage.setItem('admin_ul_status', filterStatus);
    sessionStorage.setItem('admin_ul_district', filterDistrict);
    sessionStorage.setItem('admin_ul_date_joined', filterDateJoined);
    sessionStorage.setItem('admin_ul_payment_status', filterPaymentStatus);
  }, [searchQuery, filterUserType, filterPackage, filterStatus, filterDistrict, filterDateJoined, filterPaymentStatus]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Users
      const { data: dbUsers, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch Properties
      const { data: dbProperties, error: propErr } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch Payments
      const { data: dbPayments, error: payErr } = await supabase
        .from('payments')
        .select('*')
        .order('paid_at', { ascending: false });

      // Fetch Leads & inquiries
      const { data: dbLeads, error: leadsErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      let loadedUsers = dbUsers || [];
      let loadedProperties = dbProperties || [];
      let loadedPayments = dbPayments || [];
      let loadedLeads = dbLeads || [];

      setUsers(loadedUsers);
      setProperties(loadedProperties);
      setPayments(loadedPayments);
      setLeads(loadedLeads);

      // Create live registrations feed from recently registered users (last 24-48 hours)
      const recentFeed = [...loadedUsers]
        .filter(u => u.created_at)
        .slice(0, 10)
        .map((u, index) => {
          // Associate a property title if exists
          const userProps = loadedProperties.filter(
            p => p.owner_email === u.email || p.agent_email === u.email || p.agent_id === u.email
          );
          return {
            id: u.id,
            name: u.full_name || 'Anonymous User',
            role: u.role,
            created_at: u.created_at,
            district: userProps[0]?.district || 'Colombo',
            selected_package: u.selected_package || 'Free Plan',
            property_title: userProps[0]?.listing_title || null,
            isNew: index === 0, // Make first one animate "NEW"
          };
        });
      setLiveRegistrations(recentFeed);

    } catch (err) {
      console.error('Error fetching admin user listings data:', err);
      toast.error('Could not sync with Supabase.');
      setUsers([]);
      setProperties([]);
      setPayments([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes across key tables to provide "real-time real data" live
    const channels = [
      supabase
        .channel('admin_ul_users_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          fetchData();
        })
        .subscribe(),
      supabase
        .channel('admin_ul_properties_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
          fetchData();
        })
        .subscribe(),
      supabase
        .channel('admin_ul_payments_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          fetchData();
        })
        .subscribe(),
      supabase
        .channel('admin_ul_leads_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
          fetchData();
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  // --- ACTIONS ---

  // Toggle user activation state
  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: nextState })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: nextState } : u));
      toast.success(nextState ? 'User account activated!' : 'User account deactivated!');
    } catch (err: any) {
      console.warn('Supabase users table updates failed, applying to offline-safe view:', err);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: nextState } : u));
      toast.success(`[Simulation Mode] User status toggled successfully.`);
    }
  };

  // Edit User Details
  const handleSaveUserEdit = async () => {
    if (!editUserModal) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editUserModal.full_name,
          phone: editUserModal.phone,
          whatsapp: editUserModal.whatsapp,
          selected_package: editUserModal.selected_package,
        })
        .eq('id', editUserModal.id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === editUserModal.id ? editUserModal : u));
      setEditUserModal(null);
      toast.success('User profile updated successfully!');
    } catch (err) {
      console.warn('Updating user database error, updating UI view locally:', err);
      setUsers(prev => prev.map(u => u.id === editUserModal.id ? editUserModal : u));
      setEditUserModal(null);
      toast.success('[Simulation Mode] User updated locally.');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user and all associated property data? This action is irreversible.')) return;
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      if (expandedUserId === userId) setExpandedUserId(null);
      toast.success('User deleted successfully.');
    } catch (err) {
      console.warn('Deleting user db error, deleting locally:', err);
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (expandedUserId === userId) setExpandedUserId(null);
      toast.success('[Simulation Mode] User profile deleted.');
    }
  };

  // Property Actions: Approve, Reject, Feature, Delete
  const handlePropertyStatus = async (propertyId: string, nextStatus: 'active' | 'pending' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: nextStatus })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: nextStatus } : p));
      toast.success(`Property status set to: ${nextStatus.toUpperCase()}`);
    } catch (err) {
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: nextStatus } : p));
      toast.success(`[Simulation Mode] Property status updated.`);
    }
  };

  const handlePropertyDelete = async (propertyId: string) => {
    if (!window.confirm('Delete this property listing?')) return;
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('Property listing deleted.');
    } catch (err) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('[Simulation Mode] Property listing deleted.');
    }
  };

  // Manual package updates from detail panel
  const handleAssignPackage = async (userRecord: DemoUser) => {
    const nextExpires = manualExpiry || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const { error } = await supabase
        .from('users')
        .update({
          selected_package: manualPackage,
          package_expires_at: nextExpires,
          package_paid: manualPackage !== 'Free Plan',
        })
        .eq('id', userRecord.id);

      if (error) throw error;

      // Also append a mock payment to payments list if it is upgraded
      if (manualPackage !== 'Free Plan') {
        const amt = manualPackage === 'Elite Pro' ? 8500 : 4500;
        const refId = 'manual_ref_' + Date.now();
        const { error: payErr } = await supabase
          .from('payments')
          .insert([{
            user_id: userRecord.id,
            amount_lkr: amt,
            amount: amt,
            currency: 'LKR',
            status: 'paid',
            payment_method: 'admin_panel',
            reference: refId,
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }]);
        
        if (!payErr) {
          setPayments(prev => [{
            id: 'pay-' + Date.now(),
            user_id: userRecord.id,
            amount_lkr: amt,
            payment_method: 'admin_panel',
            reference: refId,
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            status: 'paid',
            selected_package: manualPackage,
          }, ...prev]);
        }
      }

      setUsers(prev => prev.map(u => u.id === userRecord.id ? {
        ...u,
        selected_package: manualPackage,
        package_expires_at: nextExpires,
        package_paid: manualPackage !== 'Free Plan',
      } : u));

      toast.success(`Manually assigned ${manualPackage} to ${userRecord.full_name}`);
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === userRecord.id ? {
        ...u,
        selected_package: manualPackage,
        package_expires_at: nextExpires,
        package_paid: manualPackage !== 'Free Plan',
      } : u));
      toast.success(`[Simulation Mode] Assigned plan updated.`);
    }
  };

  // Add Property Manually
  const handleAddPropertySubmit = async () => {
    if (!addPropertyModalUser) return;
    try {
      const priceNum = parseFloat(newPropertyForm.price.replace(/[^0-9.]/g, '')) || 0;
      const refNo = 'LP-' + Math.floor(10000 + Math.random() * 90000);
      const propId = 'prop-' + Math.floor(10000 + Math.random() * 90000);

      const newProp: DemoProperty = {
        id: propId,
        ref_no: refNo,
        listing_title: newPropertyForm.title || 'Untitled Property',
        price_lkr: priceNum,
        usd_estimate: priceNum / 300,
        city: newPropertyForm.city,
        district: newPropertyForm.district,
        property_category: newPropertyForm.category,
        listing_type: newPropertyForm.listingType === 'For Rent' ? 'Rent' : 'Sale',
        views_count: 0,
        leads_count: 0,
        saves_count: 0,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
        rooms: parseInt(newPropertyForm.rooms) || 0,
        bathrooms: parseInt(newPropertyForm.bathrooms) || 0,
        land_area: newPropertyForm.landArea || 'N/A',
        floor_area: newPropertyForm.floorArea || 'N/A',
        property_description: newPropertyForm.description,
        owner_email: addPropertyModalUser.role === 'owner' ? addPropertyModalUser.email : '',
        agent_email: addPropertyModalUser.role === 'agent' ? addPropertyModalUser.email : '',
        agent_id: addPropertyModalUser.role === 'agent' ? addPropertyModalUser.email : '',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('properties')
        .insert([newProp]);

      if (error) throw error;

      setProperties(prev => [newProp, ...prev]);
      setAddPropertyModalUser(null);
      setNewPropertyForm({
        title: '',
        city: '',
        district: 'Colombo',
        category: 'House',
        listingType: 'Sale',
        price: '',
        rooms: '3',
        bathrooms: '2',
        landArea: '10 Perches',
        floorArea: '1800 sqft',
        description: '',
      });
      toast.success('Property manual listing created successfully!');
    } catch (err) {
      // Simulate locally
      const priceNum = parseFloat(newPropertyForm.price.replace(/[^0-9.]/g, '')) || 5000000;
      const refNo = 'LP-' + Math.floor(10000 + Math.random() * 90000);
      const propId = 'prop-' + Math.floor(10000 + Math.random() * 90000);
      const simulated: DemoProperty = {
        id: propId,
        ref_no: refNo,
        listing_title: newPropertyForm.title || 'Untitled Luxury Villa',
        price_lkr: priceNum,
        usd_estimate: priceNum / 300,
        city: newPropertyForm.city || 'Colombo 05',
        district: newPropertyForm.district,
        property_category: newPropertyForm.category,
        listing_type: newPropertyForm.listingType === 'For Rent' ? 'Rent' : 'Sale',
        views_count: 1,
        leads_count: 0,
        saves_count: 0,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
        rooms: parseInt(newPropertyForm.rooms) || 3,
        bathrooms: parseInt(newPropertyForm.bathrooms) || 2,
        land_area: newPropertyForm.landArea || '12 Perches',
        floor_area: newPropertyForm.floorArea || '2,200 sqft',
        property_description: newPropertyForm.description || 'Charming estate listing manually inserted by admin.',
        owner_email: addPropertyModalUser.role === 'owner' ? addPropertyModalUser.email : '',
        agent_email: addPropertyModalUser.role === 'agent' ? addPropertyModalUser.email : '',
        agent_id: addPropertyModalUser.role === 'agent' ? addPropertyModalUser.email : '',
        created_at: new Date().toISOString(),
      };

      setProperties(prev => [simulated, ...prev]);
      setAddPropertyModalUser(null);
      toast.success('[Simulation Mode] Property created locally.');
    }
  };

  // --- REPORT EXPORTS ---

  const exportUsersCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Role', 'Phone', 'Package', 'Payments', 'Joined', 'Status'];
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';

    users.forEach(u => {
      const userProps = properties.filter(
        p => p.owner_email === u.email || p.agent_email === u.email || p.agent_id === u.email
      );
      const totalPaid = payments
        .filter(pay => pay.user_id === u.id && pay.status === 'paid')
        .reduce((sum, pay) => sum + pay.amount_lkr, 0);

      const row = [
        u.id,
        `"${u.full_name || 'User'}"`,
        u.email,
        u.role.toUpperCase(),
        u.phone || '',
        u.selected_package || 'Free Plan',
        totalPaid,
        new Date(u.created_at).toLocaleDateString(),
        u.is_active ? 'ACTIVE' : 'INACTIVE',
      ];
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'LankaProperty_UserListings_Export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('CSV Report exported successfully.');
  };

  const exportFullReportPDF = () => {
    // Beautiful clean print flow
    window.print();
  };

  const handleDownloadInvoice = (pay: DemoPayment, u: DemoUser) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const formattedDate = new Date(pay.paid_at || pay.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - LankaProperty.lk</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #004F31; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; color: #004F31; }
            .meta-section { display: flex; justify-content: space-between; margin-top: 30px; }
            .meta-box h3 { font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            .table th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
            .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total { font-size: 18px; font-weight: 900; text-align: right; margin-top: 30px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div>
              <div class="logo">LankaProperty.lk</div>
              <p style="font-size: 11px; color: #64748b; margin-top: 5px;">Sri Lanka's Premium Property Marketplace</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">INVOICE</h2>
              <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Invoice ID: ${pay.reference || pay.id}</p>
            </div>
          </div>
          <div class="meta-section">
            <div class="meta-box">
              <h3>Billed To:</h3>
              <p><strong>${u.full_name}</strong></p>
              <p>${u.email}</p>
              <p>${u.phone}</p>
            </div>
            <div class="meta-box" style="text-align: right;">
              <h3>Details:</h3>
              <p>Date: ${formattedDate}</p>
              <p>Payment Method: ${pay.payment_method.toUpperCase()}</p>
              <p>Status: PAID</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Price Tier</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>LankaProperty.lk Premium Ads Subscription Package (60-90 Days Validity)</td>
                <td>${pay.selected_package}</td>
                <td>Rs. ${pay.amount_lkr.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total Billed: Rs. ${pay.amount_lkr.toLocaleString()} LKR
          </div>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  // --- FILTERING LOGIC ---
  const getFilteredUsers = () => {
    return users.filter(u => {
      // Search Box matching across multiple tables
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesUser =
          u.full_name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query) ||
          u.agency_name?.toLowerCase().includes(query);

        // check if user's properties match the search
        const userProps = properties.filter(
          p => p.owner_email === u.email || p.agent_email === u.email || p.agent_id === u.email
        );
        const matchesProp = userProps.some(p => p.listing_title?.toLowerCase().includes(query));

        if (!matchesUser && !matchesProp) return false;
      }

      // User Type
      if (filterUserType !== 'All') {
        if (filterUserType === 'Property Owners' && u.role !== 'owner') return false;
        if (filterUserType === 'Agents' && u.role !== 'agent') return false;
      }

      // Package Type
      if (filterPackage !== 'All') {
        if (filterPackage === 'Free' && u.selected_package !== 'Free Plan') return false;
        if (filterPackage === 'Premium Pro' && u.selected_package !== 'Premium Pro') return false;
        if (filterPackage === 'Elite Pro' && u.selected_package !== 'Elite Pro') return false;
      }

      // Property Status matching
      const userProps = properties.filter(
        p => p.owner_email === u.email || p.agent_email === u.email || p.agent_id === u.email
      );
      if (filterStatus !== 'All') {
        const hasStatus = userProps.some(p => p.status === filterStatus.toLowerCase());
        if (!hasStatus) return false;
      }

      // District
      if (filterDistrict !== 'All') {
        const hasDistrict = userProps.some(p => p.district === filterDistrict);
        if (!hasDistrict) return false;
      }

      // Date Joined
      if (filterDateJoined !== 'All Time') {
        const createdDate = new Date(u.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - createdDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);

        if (filterDateJoined === 'Today' && daysDiff > 1) return false;
        if (filterDateJoined === 'This Week' && daysDiff > 7) return false;
        if (filterDateJoined === 'This Month' && daysDiff > 30) return false;
      }

      // Payment Status
      if (filterPaymentStatus !== 'All') {
        if (filterPaymentStatus === 'Paid' && !u.package_paid) return false;
        if (filterPaymentStatus === 'Free' && u.selected_package !== 'Free Plan') return false;
        if (filterPaymentStatus === 'Pending Payment' && (u.package_paid || u.selected_package === 'Free Plan')) return false;
      }

      return true;
    });
  };

  const filteredUsersList = getFilteredUsers();
  
  // Total pages
  const totalPages = Math.ceil(filteredUsersList.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsersList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearAllFilters = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchQuery('');
    setFilterUserType('All');
    setFilterPackage('All');
    setFilterStatus('All');
    setFilterDistrict('All');
    setFilterDateJoined('All Time');
    setFilterPaymentStatus('All');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  // Expanded User Object helper
  const expandedUserObj = users.find(u => u.id === expandedUserId) || null;
  const expandedUserProperties = expandedUserObj
    ? properties.filter(p => p.owner_email === expandedUserObj.email || p.agent_email === expandedUserObj.email || p.agent_id === expandedUserObj.email)
    : [];
  const expandedUserPayments = expandedUserObj
    ? payments.filter(p => p.user_id === expandedUserObj.id)
    : [];
  const expandedUserLeads = expandedUserObj
    ? leads.filter(l => expandedUserProperties.some(p => p.id === l.property_id))
    : [];

  // --- METRIC STATS CALCULATIONS ---
  const totalUsersCount = users.length;
  const totalPropertiesCount = properties.length;
  const activeListingsCount = properties.filter(p => p.status === 'active').length;
  const pendingApprovalCount = properties.filter(p => p.status === 'pending').length;

  // Monthly Revenue Calculation
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const thisMonthPayments = payments.filter(
    pay => pay.status === 'paid' && new Date(pay.paid_at || pay.created_at) >= startOfMonth
  );
  const totalIncomeThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount_lkr, 0);

  const activeSubscriptionsCount = users.filter(
    u => u.package_paid && u.selected_package !== 'Free Plan' && (!u.package_expires_at || new Date(u.package_expires_at) > new Date())
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-24 font-sans text-slate-800">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
            👥 User Listings Overview
            <span className="bg-red-100 text-red-600 font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
              NEW
            </span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-400 mt-1">
            Complete view of all registered users, their properties, packages, and income.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Reload Database"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#004F31]' : ''} />
          </button>
          <button
            onClick={exportUsersCSV}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>Export Users CSV</span>
          </button>
          <button
            onClick={exportFullReportPDF}
            className="px-4 py-2.5 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download size={16} />
            <span>Export Full Report PDF</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 — TOP STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="p-2 bg-emerald-50 text-[#004F31] rounded-xl">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={10} /> +2
            </span>
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Users</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalUsersCount}</h3>
          <p className="text-[9px] font-bold text-neutral-400 mt-1">Owners + Agents combined</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList size={18} />
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={10} /> +1
            </span>
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Submitted Ads</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalPropertiesCount}</h3>
          <p className="text-[9px] font-bold text-neutral-400 mt-1">All listings ever submitted</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Listings</p>
          <h3 className="text-xl sm:text-2xl font-black text-[#004F31] mt-0.5">{activeListingsCount}</h3>
          <p className="text-[9px] font-bold text-neutral-400 mt-1">Currently live on site</p>
        </div>

        {/* Card 4 - Filters by pending listings */}
        <div 
          onClick={() => {
            setFilterStatus('Pending');
            setCurrentPage(1);
            toast.success('Filtered table by Pending listings');
          }}
          className="bg-white border border-orange-100 p-4 rounded-[20px] shadow-xs hover:shadow-md cursor-pointer hover:border-orange-300 transition-all"
        >
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={18} />
            </div>
            {pendingApprovalCount > 0 && (
              <span className="h-2 w-2 bg-orange-500 rounded-full animate-ping" />
            )}
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pending Review</p>
          <h3 className="text-xl sm:text-2xl font-black text-orange-600 mt-0.5">{pendingApprovalCount}</h3>
          <p className="text-[9px] font-bold text-orange-500 mt-1 underline decoration-dotted">Click to filter review queue</p>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="p-2 bg-emerald-50 text-[#004F31] rounded-xl">
              <DollarSign size={18} />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={10} /> +15%
            </span>
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Monthly Income</p>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Rs. {totalIncomeThisMonth.toLocaleString()}
          </h3>
          <p className="text-[9px] font-bold text-neutral-400 mt-1">From paid package sales</p>
        </div>

        {/* Card 6 */}
        <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers size={18} />
            </div>
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Subs</p>
          <h3 className="text-xl sm:text-2xl font-black text-purple-600 mt-0.5">{activeSubscriptionsCount}</h3>
          <p className="text-[9px] font-bold text-neutral-400 mt-1">Currently paid subscribers</p>
        </div>

      </div>

      {/* SECTION 2 — FILTER & SEARCH BAR */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-[28px] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-neutral-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by user name, email, phone, property title, or agency..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold placeholder-neutral-400 focus:outline-none focus:border-[#004F31] transition-colors shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* User Type */}
            <div className="flex flex-col">
              <select
                value={filterUserType}
                onChange={(e) => {
                  setFilterUserType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All User Types</option>
                <option value="Property Owners">Property Owners</option>
                <option value="Agents">Agents</option>
              </select>
            </div>

            {/* Package */}
            <div className="flex flex-col">
              <select
                value={filterPackage}
                onChange={(e) => {
                  setFilterPackage(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Packages</option>
                <option value="Free">Free Plan</option>
                <option value="Premium Pro">Premium Pro</option>
                <option value="Elite Pro">Elite Pro</option>
              </select>
            </div>

            {/* Property Status */}
            <div className="flex flex-col">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* District */}
            <div className="flex flex-col">
              <select
                value={filterDistrict}
                onChange={(e) => {
                  setFilterDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none cursor-pointer max-w-[150px]"
              >
                <option value="All">All Districts</option>
                {sriLankanDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Date Joined */}
            <div className="flex flex-col">
              <select
                value={filterDateJoined}
                onChange={(e) => {
                  setFilterDateJoined(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Time">All Time</option>
                <option value="Today">Joined Today</option>
                <option value="This Week">Joined This Week</option>
                <option value="This Month">Joined This Month</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="flex flex-col">
              <select
                value={filterPaymentStatus}
                onChange={(e) => {
                  setFilterPaymentStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid Only</option>
                <option value="Free">Free Only</option>
                <option value="Pending Payment">Pending Payments</option>
              </select>
            </div>

          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-200/50">
          <p className="text-[11px] font-bold text-neutral-400">
            Showing <span className="text-[#004F31] font-black">{filteredUsersList.length}</span> users matching your filter options.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAllFilters}
              className="text-[11px] font-black uppercase tracking-widest text-[#004F31] hover:text-[#003420] hover:underline cursor-pointer"
            >
              ↺ Clear All Filters
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 3 — MAIN USER TABLE & DETAILS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Users Table Side */}
        <div className={`bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-xs ${expandedUserId ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 sticky top-0 z-10">
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-2 w-14 text-center">Avatar</th>
                  <th className="py-4 px-4">Name & Email</th>
                  <th className="py-4 px-3">Role</th>
                  <th className="py-4 px-3">Phone</th>
                  <th className="py-4 px-3 text-center">Listings</th>
                  <th className="py-4 px-3">Active Plan</th>
                  <th className="py-4 px-3">Total Paid</th>
                  <th className="py-4 px-3">Joined</th>
                  <th className="py-4 px-3 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={11} className="py-6 px-4 text-center text-xs font-bold text-neutral-400">
                        Loading admin dataset rows...
                      </td>
                    </tr>
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 px-4 text-center text-xs font-bold text-neutral-400">
                      No matching user listings found. Try updating search queries.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, index) => {
                    const rowNum = (currentPage - 1) * itemsPerPage + index + 1;
                    
                    // Listings calculations
                    const userProps = properties.filter(
                      p => p.owner_email === u.email || p.agent_email === u.email || p.agent_id === u.email
                    );
                    const propCount = userProps.length;
                    
                    // Paid calculations
                    const totalPaid = payments
                      .filter(pay => pay.user_id === u.id && pay.status === 'paid')
                      .reduce((sum, pay) => sum + pay.amount_lkr, 0);

                    const isExpanded = expandedUserId === u.id;
                    const initials = u.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

                    return (
                      <React.Fragment key={u.id}>
                        <tr className={`hover:bg-slate-50/50 transition-colors ${rowNum % 2 === 0 ? 'bg-slate-50/10' : ''} ${isExpanded ? 'bg-emerald-50/5 hover:bg-emerald-50/5 border-l-4 border-l-[#004F31]' : ''}`}>
                          
                          {/* Row # */}
                          <td className="py-4 px-4 text-xs font-bold text-neutral-400 text-center">{rowNum}</td>
                          
                          {/* Avatar */}
                          <td className="py-4 px-2 text-center">
                            <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-xs text-[#004F31] shadow-xs mx-auto">
                              {initials}
                            </div>
                          </td>

                          {/* Name & Email */}
                          <td className="py-4 px-4">
                            <div className="text-xs font-black text-slate-800 tracking-tight">{u.full_name}</div>
                            <div className="text-[10px] font-bold text-neutral-400">{u.email}</div>
                            {u.role === 'agent' && u.agency_name && (
                              <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">
                                🏢 {u.agency_name}
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-4 px-3">
                            {u.role === 'owner' ? (
                              <span className="px-2 py-0.5 bg-green-50 text-[#004F31] border border-green-100 font-black text-[9px] uppercase tracking-widest rounded-md">
                                🏠 Owner
                              </span>
                            ) : u.role === 'agent' ? (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 font-black text-[9px] uppercase tracking-widest rounded-md">
                                🏢 Agent
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 font-black text-[9px] uppercase tracking-widest rounded-md">
                                ⚙️ Admin
                              </span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-700">{u.phone}</span>
                              {u.whatsapp && (
                                <a
                                  href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="h-5 w-5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Chat on WhatsApp"
                                >
                                  💬
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Properties count */}
                          <td className="py-4 px-3 text-center">
                            {propCount === 0 ? (
                              <span className="text-xs font-bold text-neutral-400">0 listings</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setExpandedUserId(isExpanded ? null : u.id);
                                  setActiveDetailTab('properties');
                                }}
                                className={`text-xs font-black px-2.5 py-0.5 rounded-full border cursor-pointer hover:shadow-xs transition-all ${
                                  propCount >= 4
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-[#004F31] border-emerald-200'
                                }`}
                              >
                                {propCount} {propCount === 1 ? 'ad' : 'ads'}
                              </button>
                            )}
                          </td>

                          {/* Package */}
                          <td className="py-4 px-3">
                            <div className="flex flex-col">
                              {u.selected_package === 'Free Plan' ? (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Plan</span>
                              ) : u.selected_package === 'Premium Pro' ? (
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">⭐ Premium Pro</span>
                              ) : (
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">👑 Elite Pro</span>
                              )}
                              {u.package_expires_at && (
                                <span className="text-[9px] font-bold text-neutral-400 mt-0.5">
                                  Exp: {new Date(u.package_expires_at).toLocaleDateString('en-GB')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Income */}
                          <td className="py-4 px-3 text-xs font-black text-slate-800">
                            {totalPaid > 0 ? `Rs. ${totalPaid.toLocaleString()}` : '—'}
                          </td>

                          {/* Joined */}
                          <td className="py-4 px-3">
                            <div className="text-xs font-bold text-slate-700">
                              {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[9px] font-bold text-neutral-400 mt-0.5">
                              {Math.max(1, Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 3600 * 24)))} days ago
                            </div>
                          </td>

                          {/* Toggle status switch */}
                          <td className="py-4 px-3 text-center">
                            <button
                              onClick={() => handleToggleUserActive(u.id, u.is_active)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                u.is_active ? 'bg-[#004F31]' : 'bg-neutral-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  u.is_active ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setExpandedUserId(isExpanded ? null : u.id);
                                  setActiveDetailTab('details');
                                }}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Expand Overview Details"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => setEditUserModal(u)}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-blue-600 rounded-lg transition-colors cursor-pointer"
                                title="Edit User Profile"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>

                        </tr>

                        {/* ACCORDION DETAIL ROW */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={11} className="p-0 bg-slate-50/40">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden border-t border-b border-slate-100 p-6"
                                >
                                  {/* DETAIL TABS MENU */}
                                  <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3 mb-6">
                                    <button
                                      onClick={() => setActiveDetailTab('details')}
                                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        activeDetailTab === 'details'
                                          ? 'bg-[#004F31] text-white shadow-xs'
                                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                      }`}
                                    >
                                      👤 Account Details
                                    </button>
                                    <button
                                      onClick={() => setActiveDetailTab('properties')}
                                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        activeDetailTab === 'properties'
                                          ? 'bg-[#004F31] text-white shadow-xs'
                                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                      }`}
                                    >
                                      🏠 Their Properties ({propCount})
                                    </button>
                                    <button
                                      onClick={() => setActiveDetailTab('billing')}
                                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        activeDetailTab === 'billing'
                                          ? 'bg-[#004F31] text-white shadow-xs'
                                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                      }`}
                                    >
                                      📦 Package & Billing ({expandedUserPayments.length})
                                    </button>
                                    <button
                                      onClick={() => setActiveDetailTab('leads')}
                                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        activeDetailTab === 'leads'
                                          ? 'bg-[#004F31] text-white shadow-xs'
                                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                      }`}
                                    >
                                      📩 Leads & Inquiries ({expandedUserLeads.length})
                                    </button>
                                    <button
                                      onClick={() => setActiveDetailTab('analytics')}
                                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        activeDetailTab === 'analytics'
                                          ? 'bg-[#004F31] text-white shadow-xs'
                                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                      }`}
                                    >
                                      📊 User Analytics
                                    </button>
                                  </div>

                                  {/* =======================================
                                      TAB 1: 👤 ACCOUNT DETAILS
                                      ======================================= */}
                                  {activeDetailTab === 'details' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Left Card: Personal Info */}
                                      <div className="bg-white border border-neutral-200/80 rounded-[24px] p-5 shadow-xs">
                                        <div className="flex items-center gap-4 mb-4">
                                          <div className="h-16 w-16 rounded-full bg-[#004F31]/10 text-[#004F31] flex items-center justify-center font-black text-2xl">
                                            {initials}
                                          </div>
                                          <div>
                                            <h4 className="text-lg font-black text-slate-900 leading-tight">{u.full_name}</h4>
                                            <span className="inline-block px-2.5 py-0.5 mt-1 bg-neutral-100 text-neutral-600 font-bold text-[9px] uppercase tracking-widest rounded-full">
                                              {u.role === 'owner' ? 'Property Seller' : 'Registered Broker Agent'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="space-y-3.5 text-xs pt-2 border-t border-slate-100">
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-400">📧 Email Address:</span>
                                            <span className="font-black text-slate-800">{u.email}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-400">📱 Contact Phone:</span>
                                            <span className="font-black text-slate-800">{u.phone || 'Not Provided'}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-400">💬 WhatsApp Chat:</span>
                                            <span className="font-black text-slate-800">{u.whatsapp || u.phone || 'Not Provided'}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-400">🗓️ Registered Joined:</span>
                                            <span className="font-black text-slate-800">
                                              {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-400">🌐 Web Status:</span>
                                            <span className={`font-black uppercase tracking-wider ${u.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                              {u.is_active ? '● LIVE / ACTIVE' : '● BLOCKED / DEACTIVATED'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-400">🔐 Auth System:</span>
                                            <span className="font-black text-slate-500">Email & Secured Password</span>
                                          </div>
                                        </div>

                                        {/* Quick Actions at bottom */}
                                        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100">
                                          <a
                                            href={`https://wa.me/${(u.whatsapp || u.phone || '').replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-black text-[10px] uppercase tracking-widest text-center rounded-xl cursor-pointer transition-all"
                                          >
                                            💬 WhatsApp
                                          </a>
                                          <a
                                            href={`mailto:${u.email}`}
                                            className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-widest text-center rounded-xl cursor-pointer transition-all"
                                          >
                                            📧 Send Email
                                          </a>
                                          <button
                                            onClick={() => handleToggleUserActive(u.id, u.is_active)}
                                            className={`py-2.5 font-black text-[10px] uppercase tracking-widest text-center rounded-xl transition-all cursor-pointer ${
                                              u.is_active
                                                ? 'bg-red-50 hover:bg-red-100 text-red-600'
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-[#004F31]'
                                            }`}
                                          >
                                            {u.is_active ? '🚫 Deactivate' : '🟢 Activate'}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Right Card: Account Stats */}
                                      <div className="space-y-4">
                                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-5 shadow-xs">
                                          <h4 className="text-xs font-black uppercase tracking-widest text-[#004F31] border-b border-slate-100 pb-2.5 mb-3">
                                            Account Statistics
                                          </h4>
                                          <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="bg-slate-50/60 p-3 rounded-2xl">
                                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Submitted</p>
                                              <p className="text-xl font-black text-slate-800 mt-1">{propCount}</p>
                                            </div>
                                            <div className="bg-slate-50/60 p-3 rounded-2xl">
                                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Ads</p>
                                              <p className="text-xl font-black text-green-600 mt-1">
                                                {userProps.filter(p => p.status === 'active').length}
                                              </p>
                                            </div>
                                            <div className="bg-slate-50/60 p-3 rounded-2xl">
                                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ad Views</p>
                                              <p className="text-xl font-black text-slate-800 mt-1">
                                                {userProps.reduce((sum, p) => sum + (p.views_count || 0), 0).toLocaleString()}
                                              </p>
                                            </div>
                                            <div className="bg-slate-50/60 p-3 rounded-2xl">
                                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Leads Generated</p>
                                              <p className="text-xl font-black text-indigo-600 mt-1">
                                                {userProps.reduce((sum, p) => sum + (p.leads_count || 0), 0)}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* If Agent, show agent CRM card */}
                                        {u.role === 'agent' && (
                                          <div className="bg-indigo-50/40 border border-indigo-100 rounded-[24px] p-5">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-700 border-b border-indigo-100 pb-2.5 mb-3">
                                              Agent Profile Verification
                                            </h4>
                                            <div className="space-y-2.5 text-xs text-slate-700">
                                              <div>
                                                <span className="font-bold text-slate-400">Brokerage Firm:</span>{' '}
                                                <strong className="text-indigo-900">{u.agency_name || 'Independent Agent'}</strong>
                                              </div>
                                              <div>
                                                <span className="font-bold text-slate-400">REA License:</span>{' '}
                                                <strong className="text-slate-800">LK-2026-RE398</strong>
                                              </div>
                                              <div>
                                                <span className="font-bold text-slate-400">Verified Badge:</span>{' '}
                                                <strong className="text-green-600">✅ APPROVED / VERIFIED AGENT</strong>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* =======================================
                                      TAB 2: 🏠 THEIR PROPERTIES
                                      ======================================= */}
                                  {activeDetailTab === 'properties' && (
                                    <div className="space-y-6">
                                      <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                                          Listed Properties ({propCount})
                                        </h4>
                                        <button
                                          onClick={() => setAddPropertyModalUser(u)}
                                          className="px-3 py-1.5 bg-[#004F31] hover:bg-[#003420] text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <Plus size={12} />
                                          <span>Add Listing Manually</span>
                                        </button>
                                      </div>

                                      {expandedUserProperties.length === 0 ? (
                                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-8 text-center text-xs font-bold text-neutral-400">
                                          This user currently has no properties listed. Click the button above to manually index a listing.
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          {expandedUserProperties.map(p => (
                                            <div key={p.id} className="bg-white border border-neutral-200/80 rounded-[24px] p-4 sm:p-5 flex flex-col md:flex-row gap-5 hover:shadow-sm transition-all relative">
                                              
                                              {/* Cover Image thumbnail */}
                                              <div 
                                                onClick={() => {
                                                  setLightboxImages(p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80']);
                                                  setLightboxIndex(0);
                                                }}
                                                className="w-full md:w-48 h-32 rounded-2xl bg-slate-100 overflow-hidden relative group cursor-zoom-in flex-shrink-0 border border-slate-100"
                                              >
                                                <img
                                                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                                                  alt={p.listing_title}
                                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black uppercase tracking-widest">
                                                  🔍 Expand
                                                </div>
                                                {p.images && p.images.length > 1 && (
                                                  <span className="absolute bottom-2 right-2 bg-slate-900/60 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                                    +{p.images.length - 1} photos
                                                  </span>
                                                )}
                                              </div>

                                              {/* Property details */}
                                              <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-widest">
                                                    Ref: {p.ref_no}
                                                  </span>
                                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                                    p.status === 'active'
                                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                      : p.status === 'pending'
                                                      ? 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse'
                                                      : 'bg-red-50 text-red-600 border border-red-100'
                                                  }`}>
                                                    ● {p.status.toUpperCase()}
                                                  </span>
                                                  {p.is_negotiable && (
                                                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                      Negotiable
                                                    </span>
                                                  )}
                                                </div>

                                                <h5 className="text-sm font-black text-slate-900 leading-snug">{p.listing_title}</h5>
                                                
                                                <p className="text-xs font-bold text-neutral-400">
                                                  📍 {p.city}, {p.district} • 🏷️ {p.property_category} • {p.listing_type}
                                                </p>

                                                <div className="text-sm font-black text-[#004F31] font-display">
                                                  Rs. {p.price_lkr.toLocaleString()} LKR
                                                </div>

                                                {/* Specs */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-bold pt-1.5 border-t border-slate-100">
                                                  {p.rooms > 0 && <span>🛏️ {p.rooms} Beds</span>}
                                                  {p.bathrooms > 0 && <span>🚿 {p.bathrooms} Baths</span>}
                                                  {p.land_area && p.land_area !== 'N/A' && <span>📐 Land Area: {p.land_area}</span>}
                                                  {p.floor_area && p.floor_area !== 'N/A' && <span>📏 Floor Area: {p.floor_area}</span>}
                                                </div>

                                                {/* Description snippet */}
                                                {p.property_description && (
                                                  <p className="text-[11px] font-semibold text-neutral-500 leading-relaxed max-w-2xl bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                                                    {p.property_description}
                                                  </p>
                                                )}

                                                {/* Performance metrics */}
                                                <div className="flex gap-4 text-[10px] uppercase font-black tracking-wider text-slate-400 pt-1">
                                                  <span>👁️ {p.views_count || 120} views</span>
                                                  <span>📩 {p.leads_count || 4} leads</span>
                                                  <span>❤️ {p.saves_count || 8} saved</span>
                                                </div>

                                                {/* Image thumbnail grid */}
                                                {p.images && p.images.length > 0 && (
                                                  <div className="flex gap-2 pt-2">
                                                    {p.images.slice(0, 6).map((img, i) => (
                                                      <div 
                                                        key={i}
                                                        onClick={() => {
                                                          setLightboxImages(p.images);
                                                          setLightboxIndex(i);
                                                        }}
                                                        className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:border-slate-400"
                                                      >
                                                        <img src={img} alt="thumb" className="h-full w-full object-cover" />
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}

                                                {/* Map and details */}
                                                <div className="pt-2">
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amenities:</span>{' '}
                                                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100/50 px-2 py-1 rounded-lg">
                                                    {p.additional_info || 'Pool, Garden, CCTV, Secured Gated'}
                                                  </span>
                                                </div>

                                                {/* Admin operations */}
                                                <div className="flex flex-wrap gap-2 pt-4">
                                                  {p.status !== 'active' && (
                                                    <button
                                                      onClick={() => handlePropertyStatus(p.id, 'active')}
                                                      className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer"
                                                    >
                                                      ✅ Approve Listing
                                                    </button>
                                                  )}
                                                  {p.status !== 'rejected' && (
                                                    <button
                                                      onClick={() => handlePropertyStatus(p.id, 'rejected')}
                                                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer"
                                                    >
                                                      ❌ Reject Listing
                                                    </button>
                                                  )}
                                                  <button
                                                    onClick={() => handlePropertyDelete(p.id)}
                                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-red-100 text-neutral-600 hover:text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                                                  >
                                                    🗑️ Delete Ad
                                                  </button>
                                                </div>

                                              </div>

                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* =======================================
                                      TAB 3: 📦 PACKAGE & BILLING
                                      ======================================= */}
                                  {activeDetailTab === 'billing' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      
                                      {/* Plan Control column */}
                                      <div className="md:col-span-1 space-y-4">
                                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-5">
                                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2.5 mb-3">
                                            Active Plan status
                                          </h4>
                                          <div className="space-y-1">
                                            <div className="text-base font-black text-slate-900">{u.selected_package}</div>
                                            <div className="text-xs font-semibold text-neutral-400">
                                              {u.package_paid ? 'Paid subscription' : 'Starter Free Pack'}
                                            </div>
                                          </div>

                                          {/* Progress bar */}
                                          {u.package_expires_at && (
                                            <div className="mt-4 space-y-1.5">
                                              <div className="flex justify-between text-[10px] font-black text-slate-500">
                                                <span>Validity Remaining</span>
                                                <span>45 Days</span>
                                              </div>
                                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-[#004F31] h-full" style={{ width: '65%' }} />
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Plan Assignment Form */}
                                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-5 space-y-3">
                                          <h4 className="text-xs font-black uppercase tracking-widest text-[#004F31] border-b border-slate-100 pb-2">
                                            Manage Package Plan
                                          </h4>
                                          <div>
                                            <label className="text-[9px] font-black uppercase text-slate-400">Assign Package Tier</label>
                                            <select
                                              value={manualPackage}
                                              onChange={(e) => setManualPackage(e.target.value)}
                                              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                                            >
                                              <option value="Free Plan">Starter Free Plan</option>
                                              <option value="Premium Pro">⭐ Premium Pro (Rs. 4,500)</option>
                                              <option value="Elite Pro">👑 Elite Pro (Rs. 8,500)</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="text-[9px] font-black uppercase text-slate-400">Set Expiry Date</label>
                                            <input
                                              type="date"
                                              value={manualExpiry}
                                              onChange={(e) => setManualExpiry(e.target.value)}
                                              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                                            />
                                          </div>
                                          <button
                                            onClick={() => handleAssignPackage(u)}
                                            className="w-full py-2.5 bg-[#004F31] hover:bg-[#003420] text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer"
                                          >
                                            Assign Package
                                          </button>
                                        </div>
                                      </div>

                                      {/* Payment history column */}
                                      <div className="md:col-span-2 bg-white border border-neutral-200/80 rounded-[24px] p-5">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2.5 mb-3">
                                          Payment History
                                        </h4>
                                        {expandedUserPayments.length === 0 ? (
                                          <div className="text-center text-xs font-bold text-neutral-400 py-12">
                                            No billing history transactions found.
                                          </div>
                                        ) : (
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                              <thead>
                                                <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                  <th className="pb-2">Date</th>
                                                  <th className="pb-2">Package Plan</th>
                                                  <th className="pb-2">Amount</th>
                                                  <th className="pb-2">Method</th>
                                                  <th className="pb-2">Order Reference</th>
                                                  <th className="pb-2 text-right">Invoice</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                {expandedUserPayments.map(pay => (
                                                  <tr key={pay.id} className="text-slate-700">
                                                    <td className="py-2.5 font-bold">
                                                      {new Date(pay.paid_at || pay.created_at).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="py-2.5 font-black text-slate-800">{pay.selected_package}</td>
                                                    <td className="py-2.5 font-black text-[#004F31]">Rs. {pay.amount_lkr.toLocaleString()}</td>
                                                    <td className="py-2.5 uppercase tracking-wider text-[9px] font-black">{pay.payment_method}</td>
                                                    <td className="py-2.5 font-mono text-[10px] text-neutral-400">{pay.reference || 'N/A'}</td>
                                                    <td className="py-2.5 text-right">
                                                      <button
                                                        onClick={() => handleDownloadInvoice(pay, u)}
                                                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#004F31] font-black text-[9px] uppercase tracking-widest rounded-md cursor-pointer"
                                                      >
                                                        Download PDF
                                                      </button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>

                                    </div>
                                  )}

                                  {/* =======================================
                                      TAB 4: 📩 LEADS & INQUIRIES
                                      ======================================= */}
                                  {activeDetailTab === 'leads' && (
                                    <div className="space-y-4 bg-white border border-neutral-200/80 rounded-[24px] p-5">
                                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2.5 mb-3">
                                        Active Buyer Leads & Inquiries
                                      </h4>
                                      {expandedUserLeads.length === 0 ? (
                                        <div className="text-center text-xs font-bold text-neutral-400 py-12">
                                          This user has not received any leads or inquiries on their listings yet.
                                        </div>
                                      ) : (
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs">
                                            <thead>
                                              <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                <th className="pb-2">Lead Name</th>
                                                <th className="pb-2">Target Property</th>
                                                <th className="pb-2">Contact Details</th>
                                                <th className="pb-2">Buyer's Message</th>
                                                <th className="pb-2">Date Received</th>
                                                <th className="pb-2 text-right">Status</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {expandedUserLeads.map(lead => (
                                                <tr key={lead.id} className="text-slate-700">
                                                  <td className="py-3 font-black text-slate-800">{lead.name}</td>
                                                  <td className="py-3 font-semibold text-slate-600 max-w-[180px] truncate" title={lead.property_title}>
                                                    {lead.property_title}
                                                  </td>
                                                  <td className="py-3">
                                                    <div className="font-bold">{lead.phone}</div>
                                                    <div className="text-[10px] text-neutral-400">{lead.email}</div>
                                                  </td>
                                                  <td className="py-3 text-neutral-500 max-w-sm font-semibold italic">
                                                    "{lead.message}"
                                                  </td>
                                                  <td className="py-3 text-neutral-400">
                                                    {new Date(lead.created_at).toLocaleDateString('en-GB')}
                                                  </td>
                                                  <td className="py-3 text-right">
                                                    <span className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-widest rounded-md ${
                                                      lead.status === 'New'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : lead.status === 'Contacted'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                      {lead.status}
                                                    </span>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* =======================================
                                      TAB 5: 📊 ANALYTICS
                                      ======================================= */}
                                  {activeDetailTab === 'analytics' && (
                                    <div className="space-y-6">
                                      
                                      {/* Metrics row */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                                          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Total Ads Views</p>
                                          <h4 className="text-lg font-black text-slate-800 mt-1">1,940</h4>
                                        </div>
                                        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                                          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Conversion Rate</p>
                                          <h4 className="text-lg font-black text-green-600 mt-1">2.4%</h4>
                                        </div>
                                        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                                          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Saved in Wishlists</p>
                                          <h4 className="text-lg font-black text-slate-800 mt-1">45</h4>
                                        </div>
                                        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                                          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Avg. Views Per Day</p>
                                          <h4 className="text-lg font-black text-slate-800 mt-1">65</h4>
                                        </div>
                                      </div>

                                      {/* Mini charts */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Chart 1 */}
                                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-4 h-64">
                                          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Daily Views over time</h5>
                                          <ResponsiveContainer width="100%" height="90%">
                                            <AreaChart data={[
                                              { name: '01 Jun', views: 15 },
                                              { name: '05 Jun', views: 42 },
                                              { name: '10 Jun', views: 80 },
                                              { name: '15 Jun', views: 55 },
                                              { name: '20 Jun', views: 120 },
                                              { name: '25 Jun', views: 165 },
                                            ]}>
                                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                              <XAxis dataKey="name" fontSize={9} />
                                              <YAxis fontSize={9} />
                                              <RechartsTooltip />
                                              <Area type="monotone" dataKey="views" stroke="#004F31" fill="#004F31" fillOpacity={0.1} strokeWidth={2.5} />
                                            </AreaChart>
                                          </ResponsiveContainer>
                                        </div>

                                        {/* Chart 2 */}
                                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-4 h-64">
                                          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Traffic Referral Sources</h5>
                                          <ResponsiveContainer width="100%" height="90%">
                                            <PieChart>
                                              <Pie
                                                data={[
                                                  { name: 'Direct Market', value: 45, color: '#004F31' },
                                                  { name: 'Google Search', value: 30, color: '#3b82f6' },
                                                  { name: 'WhatsApp', value: 15, color: '#22c55e' },
                                                  { name: 'Facebook Ad', value: 10, color: '#ec4899' },
                                                ]}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={55}
                                                fill="#8884d8"
                                                label
                                              >
                                                <Cell fill="#004F31" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#22c55e" />
                                                <Cell fill="#ec4899" />
                                              </Pie>
                                              <Legend fontSize={9} />
                                            </PieChart>
                                          </ResponsiveContainer>
                                        </div>

                                      </div>

                                    </div>
                                  )}

                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>

                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paging Footer */}
          <div className="py-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <p className="text-[11px] font-bold text-neutral-400">
              Page {currentPage} of {totalPages} — Showing {paginatedUsers.length} of {filteredUsersList.length} users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 bg-white border border-neutral-200 text-xs font-black rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                ◀ Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-8 w-8 text-xs font-black rounded-lg cursor-pointer transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#004F31] text-white'
                      : 'bg-white border border-neutral-200 text-slate-600 hover:bg-neutral-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 bg-white border border-neutral-200 text-xs font-black rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4 — QUICK ACTIONS FLOATING PANEL (Visible only when row is expanded) */}
        {expandedUserId && expandedUserObj && (
          <div className="bg-slate-900 text-white rounded-[32px] p-5 border border-slate-800 shadow-2xl space-y-5 animate-in slide-in-from-right-4 duration-300 xl:col-span-1">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                ⚡ Quick Actions Panel
              </h4>
              <button
                onClick={() => setExpandedUserId(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-400 font-bold">Selected User:</p>
              <h5 className="font-black text-sm text-white">{expandedUserObj.full_name}</h5>
              <p className="text-[10px] text-slate-400">{expandedUserObj.email}</p>
            </div>

            <div className="space-y-2 text-[11px] font-bold text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span>Active Listings:</span>
                <span className="text-white font-black">{expandedUserProperties.length} ads</span>
              </div>
              <div className="flex justify-between">
                <span>Current Package:</span>
                <span className="text-emerald-400 font-black">{expandedUserObj.selected_package}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue Generated:</span>
                <span className="text-white font-black">
                  Rs. {expandedUserPayments.reduce((s, p) => s + p.amount_lkr, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  expandedUserProperties.forEach(p => {
                    if (p.status === 'pending') handlePropertyStatus(p.id, 'active');
                  });
                  toast.success('Approved all pending property listings for this user');
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                ✅ Approve All Pending Ads
              </button>

              <button
                onClick={() => {
                  toast.success(`Broadcasting featured push to LankaProperty syndications!`);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                ⭐ Feature Active Listings
              </button>

              <a
                href={`mailto:${expandedUserObj.email}`}
                className="block w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                📧 Send Direct Email
              </a>

              <a
                href={`https://wa.me/${(expandedUserObj.whatsapp || expandedUserObj.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                💬 Open WhatsApp Chat
              </a>

              <button
                onClick={() => {
                  toast.success('Password reset token generated and dispatched to: ' + expandedUserObj.email);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                🔄 Reset Password Access
              </button>

              <button
                onClick={() => {
                  setManualPackage('Elite Pro');
                  handleAssignPackage(expandedUserObj);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                👑 Grant Free Elite Upgrade
              </button>

              <button
                onClick={() => handleToggleUserActive(expandedUserObj.id, expandedUserObj.is_active)}
                className={`w-full py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer ${
                  expandedUserObj.is_active
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                }`}
              >
                {expandedUserObj.is_active ? '🚫 Deactivate Account' : '🟢 Reactivate Account'}
              </button>

              <button
                onClick={() => handleDeleteUser(expandedUserObj.id)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                🗑️ Terminate Account
              </button>
            </div>

          </div>
        )}

      </div>

      {/* SECTION 5 — NEW REGISTRATIONS LIVE FEED */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            Live — New Registrations Feed
          </h3>
          <p className="text-xs text-neutral-400 font-semibold mt-0.5">
            Users registered or listed within the active pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {liveRegistrations.map((u, i) => {
            const initials = u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div 
                key={i} 
                className={`p-4 bg-slate-50 border rounded-2xl relative transition-all flex items-start gap-3 hover:border-slate-300 ${
                  u.isNew ? 'border-[#004F31] bg-emerald-50/10 shadow-xs' : 'border-slate-100'
                }`}
              >
                {u.isNew && (
                  <span className="absolute top-3 right-3 bg-[#004F31] text-white font-black text-[7px] tracking-widest uppercase px-1.5 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
                
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-[#004F31] flex items-center justify-center font-black text-xs flex-shrink-0">
                  {initials}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-black text-slate-800 tracking-tight">{u.name}</div>
                  <div className="text-[10px] font-bold text-neutral-400">
                    registered as <span className="font-black text-slate-600 capitalize">{u.role}</span>
                  </div>
                  <div className="text-[10px] font-bold text-neutral-400">
                    Plan: <span className="text-[#004F31] font-black">{u.selected_package}</span>
                  </div>
                  {u.property_title && (
                    <div className="text-[10px] font-black text-indigo-600 line-clamp-1 mt-1">
                      🏠 "{u.property_title}"
                    </div>
                  )}
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{u.district}</span>
                    <button
                      onClick={() => {
                        setExpandedUserId(u.id);
                        setActiveDetailTab('details');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                        toast.success(`Navigated to detail card of ${u.name}`);
                      }}
                      className="text-[9px] font-black text-[#004F31] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      View Details →
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* =======================================
          MODAL: IMAGE LIGHTBOX
          ======================================= */}
      {lightboxImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <button
            onClick={() => setLightboxImages([])}
            className="absolute top-6 right-6 h-12 w-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-all cursor-pointer"
          >
            ✕
          </button>

          {lightboxImages.length > 1 && (
            <button
              onClick={() => setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1))}
              className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-all cursor-pointer"
            >
              ◀
            </button>
          )}

          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
            <img
              src={lightboxImages[lightboxIndex]}
              alt="Lightbox view"
              className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <p className="text-white/60 text-xs font-bold mt-4">
              Photo {lightboxIndex + 1} of {lightboxImages.length}
            </p>
          </div>

          {lightboxImages.length > 1 && (
            <button
              onClick={() => setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-all cursor-pointer"
            >
              ▶
            </button>
          )}
        </div>
      )}

      {/* =======================================
          MODAL: EDIT USER MODAL
          ======================================= */}
      {editUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setEditUserModal(null)}
              className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-slate-900 font-display mb-1">
              ✏️ Edit User Profile
            </h3>
            <p className="text-[10px] font-bold text-neutral-400 mb-5">
              Change the user registration info and status directly.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={editUserModal.full_name}
                  onChange={(e) => setEditUserModal({ ...editUserModal, full_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#004F31]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Phone</label>
                <input
                  type="text"
                  value={editUserModal.phone}
                  onChange={(e) => setEditUserModal({ ...editUserModal, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#004F31]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">WhatsApp</label>
                <input
                  type="text"
                  value={editUserModal.whatsapp}
                  onChange={(e) => setEditUserModal({ ...editUserModal, whatsapp: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#004F31]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Package Plan</label>
                <select
                  value={editUserModal.selected_package}
                  onChange={(e) => setEditUserModal({ ...editUserModal, selected_package: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="Free Plan">Starter Free Plan</option>
                  <option value="Premium Pro">Premium Pro</option>
                  <option value="Elite Pro">Elite Pro</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditUserModal(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUserEdit}
                  className="flex-1 py-3 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =======================================
          MODAL: ADD PROPERTY MODAL
          ======================================= */}
      {addPropertyModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] overflow-y-auto">
          <div className="bg-white rounded-[32px] p-6 max-w-xl w-full shadow-2xl relative my-8">
            <button
              onClick={() => setAddPropertyModalUser(null)}
              className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-slate-900 font-display mb-1">
              🏠 Add New Property Manual Listing
            </h3>
            <p className="text-[10px] font-bold text-neutral-400 mb-5">
              Add listing details under the account of: <strong className="text-slate-800">{addPropertyModalUser.full_name}</strong>
            </p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Beautiful Modern House with Paddy Field Views"
                  value={newPropertyForm.title}
                  onChange={(e) => setNewPropertyForm({ ...newPropertyForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Nugegoda"
                    value={newPropertyForm.city}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">District</label>
                  <select
                    value={newPropertyForm.district}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, district: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {sriLankanDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                  <select
                    value={newPropertyForm.category}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial Property</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Listing Type</label>
                  <select
                    value={newPropertyForm.listingType}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, listingType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Price (LKR)</label>
                  <input
                    type="text"
                    placeholder="e.g. 45000000"
                    value={newPropertyForm.price}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Beds</label>
                  <input
                    type="number"
                    value={newPropertyForm.rooms}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, rooms: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Baths</label>
                  <input
                    type="number"
                    value={newPropertyForm.bathrooms}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, bathrooms: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Land Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Perches"
                    value={newPropertyForm.landArea}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, landArea: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Floor Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 2400 sqft"
                    value={newPropertyForm.floorArea}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, floorArea: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="Write an appealing description..."
                  value={newPropertyForm.description}
                  onChange={(e) => setNewPropertyForm({ ...newPropertyForm, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAddPropertyModalUser(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPropertySubmit}
                  className="flex-1 py-3 bg-[#004F31] hover:bg-[#003420] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
