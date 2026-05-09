import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminInquiries from './AdminInquiries';
import AdminListings from './AdminListings';
import AdminListingForm from './AdminListingForm';
import AdminSuccess from './AdminSuccess';
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
    >
      {activePage === 'dashboard' && <AdminDashboard user={user} />}
      {activePage === 'enquiries' && <AdminInquiries user={user} />}
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
      {activePage === 'analytics' && (
        <div className="py-20 text-center bg-white rounded-[40px] border border-admin-border shadow-sm">
           <h2 className="text-2xl font-black text-admin-text-dark">Detailed Analytics</h2>
           <p className="text-admin-text-gray font-bold mt-2">Coming soon to your manager portal.</p>
        </div>
      )}
      {activePage === 'settings' && (
        // Reusing the existing profile edit logic if possible, or a minimal version
        <div className="max-w-3xl mx-auto">
           <h2 className="text-3xl font-black text-admin-text-dark mb-8">System Settings</h2>
           <div className="bg-white p-8 rounded-[40px] border border-admin-border shadow-sm opacity-50 pointer-events-none">
              <p className="text-admin-text-gray font-bold">Manager profile settings are currently locked.</p>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}
