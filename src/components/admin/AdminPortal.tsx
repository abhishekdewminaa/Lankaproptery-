import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminInquiries from './AdminInquiries';
import AdminMarketing from './AdminMarketing';
import AdminSettings from './AdminSettings';
import AdminListings from './AdminListings';
import AdminListingForm from './AdminListingForm';
import AdminSuccess from './AdminSuccess';
import AdminAnalytics from './AdminAnalytics';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface AdminPortalProps {
  user: any;
  onLogout: () => void;
  onRefresh: () => void;
  onAgentAccessBack: () => void;
}

export default function AdminPortal({ user, onLogout, onRefresh, onAgentAccessBack }: AdminPortalProps) {
  const [activePage, setActivePage] = useState('dashboard');
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [successProperty, setSuccessProperty] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [adminDarkMode, setAdminDarkMode] = useState(() => {
    return localStorage.getItem('admin-dark-mode') === 'true';
  });

  const toggleAdminDark = () => {
    const newValue = !adminDarkMode;
    setAdminDarkMode(newValue);
    localStorage.setItem('admin-dark-mode', String(newValue));
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const activeEmail = currentUser?.email || user?.email;

        if (!activeEmail) {
          onAgentAccessBack();
          return;
        }

        const { data: isAdmin, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', activeEmail)
          .single();

        const allowedEmails = ['abhishekdewminaa@gmail.com', 'ceo.lankaland@gmail.com'];
        const isFallbackAdmin = allowedEmails.includes(activeEmail.toLowerCase());
        
        if (!isAdmin && !isFallbackAdmin) {
          onAgentAccessBack();
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("Admin Portal check err:", err);
        onAgentAccessBack();
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, [user, onAgentAccessBack]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-admin-primary" size={48} />
            <p className="text-admin-text-gray font-black text-sm uppercase tracking-widest">Verifying Admin Access...</p>
         </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  // We should handle the case where we navigate to 'publish' (new) or 'edit'
  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setActivePage('publish');
  };

  const handleNewProperty = () => {
    setEditingProperty(null);
    setActivePage('publish');
  };

  const handlePublishSuccess = (property: any) => {
    setSuccessProperty(property);
    setActivePage('success');
  };

  return (
    <AdminLayout 
      activePage={activePage === 'success' ? 'publish' : activePage} 
      onNavigate={setActivePage} 
      user={user} 
      onLogout={onLogout}
      adminDarkMode={adminDarkMode}
      toggleAdminDark={toggleAdminDark}
    >
      {activePage === 'dashboard' && <AdminDashboard user={user} />}
      {activePage === 'enquiries' && <AdminInquiries user={user} />}
      {activePage === 'marketing' && <AdminMarketing />}
      {activePage === 'settings' && <AdminSettings user={user} />}
      {activePage === 'listings' && (
        <AdminListings 
          user={user} 
          onEdit={handleEdit} 
          onNewProperty={handleNewProperty} 
        />
      )}
      {activePage === 'publish' && (
        <AdminListingForm 
          user={user} 
          initialData={editingProperty} 
          onBack={() => setActivePage('dashboard')} 
          onRefresh={onRefresh}
          onSuccess={handlePublishSuccess}
        />
      )}
      {activePage === 'success' && (
        <AdminSuccess 
          property={successProperty} 
          onBackToPortal={() => setActivePage('dashboard')} 
        />
      )}
      {activePage === 'analytics' && <AdminAnalytics />}
    </AdminLayout>
  );
}
