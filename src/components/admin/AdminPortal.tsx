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
import AdminMaps from './AdminMaps';
import AdminRevenue from './AdminRevenue';
import AdminAIWriter from './AdminAIWriter';
import AdminPipeline from './AdminPipeline';
import AdminNewsletter from './AdminNewsletter';
import AdminBlog from './AdminBlog';
import AdminLandsManager from './AdminLandsManager';
import AdminUserListings from './AdminUserListings';
import AdminAgents from './agents/AdminAgents';
import AdminLinks from './AdminLinks';
import AdminPhotoEditor from './AdminPhotoEditor';
import { AutomationBuilderPage } from '../../pages/AutomationBuilderPage';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { runExpiryWorkflow, processWorkflowJobs } from '../../automation/workflows';

interface AdminPortalProps {
  user: any;
  onLogout: () => void;
  onRefresh: () => void;
  onAgentAccessBack: () => void;
}

export default function AdminPortal({ user, onLogout, onRefresh, onAgentAccessBack }: AdminPortalProps) {
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/user-listings')) return 'user_listings';
    if (path.includes('/agents')) return 'agents';
    if (path.includes('/links') || path.includes('/admin/links')) return 'links';
    return 'dashboard';
  });
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [successProperty, setSuccessProperty] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const adminDarkMode = false;
  const toggleAdminDark = () => {
    // Force white theme permanently, removing dark mode toggle functionality
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

  // Setup Automated Workflows (Client-side polling)
  useEffect(() => {
    if (!isAuthorized) return;
    
    // Initial run
    runExpiryWorkflow().catch(console.error);
    processWorkflowJobs().catch(console.error);
    
    // Set up intervals
    const jobsInterval = setInterval(() => {
      processWorkflowJobs().catch(console.error);
    }, 5 * 60 * 1000); // every 5 minutes
    
    const expiryInterval = setInterval(() => {
      runExpiryWorkflow().catch(console.error);
    }, 6 * 60 * 60 * 1000); // every 6 hours
    
    return () => {
      clearInterval(jobsInterval);
      clearInterval(expiryInterval);
    };
  }, [isAuthorized]);

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
      onNavigate={(page) => {
        setActivePage(page);
        if (page === 'settings') window.history.pushState({}, '', '/admin-lk2026/settings');
        else if (page === 'user_listings') window.history.pushState({}, '', '/admin-lk2026/user-listings');
        else if (page === 'agents') window.history.pushState({}, '', '/admin-lk2026/agents');
        else if (page === 'links') window.history.pushState({}, '', '/admin-lk2026/links');
        else window.history.pushState({}, '', '/admin-lk2026');
      }} 
      user={user} 
      onLogout={onLogout}
      adminDarkMode={adminDarkMode}
      toggleAdminDark={toggleAdminDark}
    >
      {activePage === 'dashboard' && <AdminDashboard user={user} />}
      {activePage === 'photo-editor' && (
        <AdminPhotoEditor 
          user={user} 
          onBack={() => setActivePage('dashboard')} 
          adminDarkMode={adminDarkMode} 
        />
      )}
      {activePage === 'links' && <AdminLinks user={user} />}
      {activePage === 'enquiries' && <AdminInquiries user={user} />}
      {activePage === 'marketing' && <AdminMarketing />}
      {activePage === 'settings' && <AdminSettings user={user} />}
      {activePage === 'user_listings' && <AdminUserListings user={user} />}
      {activePage === 'agents' && <AdminAgents user={user} />}
      {activePage === 'listings' && (
        <AdminListings 
          user={user} 
          onEdit={handleEdit} 
          onNewProperty={handleNewProperty} 
        />
      )}
      {activePage === 'lands_manager' && <AdminLandsManager />}
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
      {activePage === 'automation' && <AutomationBuilderPage />}
      {activePage === 'analytics' && <AdminAnalytics />}
      {activePage === 'revenue' && <AdminRevenue />}
      {activePage === 'ai-writer' && <AdminAIWriter />}
      {activePage === 'maps' && <AdminMaps />}
      {activePage === 'pipeline' && <AdminPipeline />}
      {activePage === 'newsletter' && <AdminNewsletter />}
      {activePage === 'blog' && <AdminBlog />}
    </AdminLayout>
  );
}
