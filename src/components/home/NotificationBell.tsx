import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Bell, MessageSquare, Building2, Check, CheckSquare } from 'lucide-react';

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'inquiry' | 'system' | 'agent';
  details?: any;
}

interface NotificationBellProps {
  user: any;
  onNavigate?: (view: any) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ user, onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const playNotificationSound = () => {
    // Elegant base64 synth play sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Could not play synthesized sound", e);
    }
  };

  const showBrowserNotification = (inquiry: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🏠 New Property Inquiry!', {
        body: `${inquiry.client_name || inquiry.full_name || 'Someone'} is interested in your property`,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }
  };

  const fetchNotifications = async () => {
    if (!user?.email) return;
    try {
      const { data, error } = await supabase
        .from('property_inquiries')
        .select('*')
        .eq('agent_id', user.email)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const mapped: NotificationItem[] = data.map((item: any) => ({
          id: item.id,
          message: `New inquiry from ${item.full_name || item.client_name || 'Customer'}`,
          time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: item.status !== 'new',
          type: 'inquiry',
          details: item
        }));

        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.read).length);
      }
    } catch (err) {
      console.warn("Notification fetch failed, using local notifications fallback:", err);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    fetchNotifications();

    if (!user?.email) return;

    // Real-time new inquiry alerts
    const channel = supabase
      .channel('new_inquiries')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'property_inquiries',
          filter: `agent_id=eq.${user.email}`
        },
        (payload) => {
          const newInquiry = payload.new;
          
          setNotifications(prev => [
            {
              id: newInquiry.id,
              message: `New inquiry from ${newInquiry.full_name || newInquiry.client_name || 'Customer'}`,
              time: 'Just now',
              read: false,
              type: 'inquiry',
              details: newInquiry
            },
            ...prev
          ]);
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
          showBrowserNotification(newInquiry);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('property_inquiries')
        .update({ status: 'contacted' })
        .eq('agent_id', user.email)
        .eq('status', 'new');

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read failed:", err);
      // Fallback
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // Mark as read first
    supabase
      .from('property_inquiries')
      .update({ status: 'contacted' })
      .eq('id', notif.id)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

    setIsOpen(false);
    if (onNavigate) {
      onNavigate({ type: 'inquiries' });
    }
  };

  return (
    <div className="relative">
      {/* Bell icon with red badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gray-50 text-gray-700 hover:bg-brand-green/10 hover:text-brand-green rounded-full transition-all relative outline-none focus:ring-2 focus:ring-brand-green/35"
        aria-label="Toggle notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-0.5 bg-brand-red text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modern styled drop down list */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100/80 z-[130] overflow-hidden transform origin-top-right transition-all duration-300">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-brand-green" />
                <h3 className="font-black text-dark-navy text-sm uppercase tracking-wider">
                  Notifications
                </h3>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs font-black text-brand-green hover:text-emerald-700 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">Incoming inquiries will display here</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 hover:bg-gray-50/80 ${
                      notif.read ? 'bg-white' : 'bg-brand-green/5'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      notif.read ? 'bg-gray-100 text-gray-500' : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      {notif.type === 'inquiry' ? <MessageSquare size={16} /> : <Building2 size={16} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-dark-navy truncate ${notif.read ? 'font-medium' : 'font-semibold'}`}>
                        {notif.message}
                      </p>
                      {notif.details?.message && (
                        <p className="text-xs text-gray-500 truncate mt-0.5 mt-1 bg-gray-50 p-2 rounded-lg italic">
                          "{notif.details.message}"
                        </p>
                      )}
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <span>{notif.time}</span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block ml-1" />
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-gray-100 text-center bg-gray-50/30">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate({ type: 'inquiries' });
                }}
                className="w-full py-2 bg-white hover:bg-gray-50 text-xs font-black text-dark-navy border border-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                View All Inquiries
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
