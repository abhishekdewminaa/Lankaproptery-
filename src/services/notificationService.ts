import { supabase } from '../supabaseClient';

export interface InquiryNotificationData {
  property_title: string;
  property_id: number | string;
  district: string;
  city: string;
  price_lkr: number | string;
  agent_email: string;
  agent_phone: string;
  agent_whatsapp_key?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  message: string;
}

export const triggerNotification = async (type: 'new_inquiry' | 'new_agent' | 'new_property' | 'inquiry_status_change', data: any) => {
  console.log(`[NotificationTrigger] Triggering ${type} for data:`, data);
  
  // 1. Try Supabase Edge Function first
  try {
    const { data: resData, error } = await supabase.functions.invoke('send-notification', {
      body: { type, data }
    });
    
    if (!error) {
      console.log('[NotificationTrigger] Supabase Edge Function executed successfully:', resData);
      return { success: true, source: 'edge-function' };
    }
    console.warn('[NotificationTrigger] Supabase Edge Function invocation failed, trying local fallback:', error);
  } catch (err) {
    console.warn('[NotificationTrigger] Supabase Edge Function error, trying local fallback:', err);
  }

  // 2. Fall back to local Express server API endpoint
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data })
    });
    
    if (response.ok) {
      const resVal = await response.json();
      console.log('[NotificationTrigger] Local notification service executed successfully:', resVal);
      return { success: true, source: 'local-api' };
    }
    console.error('[NotificationTrigger] Local notification service failed with status:', response.status);
  } catch (err) {
    console.error('[NotificationTrigger] Local notification service request failed:', err);
  }

  return { success: false };
};
