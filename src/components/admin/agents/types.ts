export interface AgentNote {
  date: string;
  author: string;
  note: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  agency_name: string;
  license_no: string;
  years_experience: number;
  specialization: string[];
  service_areas: string[];
  bio: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  website_url: string;
  is_verified: boolean | 'rejected' | 'pending';
  status: 'active' | 'inactive';
  is_featured: boolean;
  created_at: string;
  last_login: string;
  avatar_url?: string;
  admin_notes: AgentNote[];
  package: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  package_expiry: string;
  total_paid: number;
}

export interface AgentProperty {
  id: string;
  agent_id: string;
  title: string;
  city: string;
  district: string;
  category: string;
  listing_type: 'Sale' | 'Rent';
  price: number;
  bedrooms: number;
  bathrooms: number;
  land_area: string;
  floor_area: string;
  cover_image: string;
  images: string[];
  status: 'active' | 'pending' | 'expired' | 'rejected';
  package_tier: string;
  created_at: string;
  expires_at: string;
  client_name?: string;
  client_phone?: string;
  views: number;
  leads: number;
  saved: number;
  shares: number;
  description: string;
  amenities: string[];
  address: string;
  lat: number;
  lng: number;
}

export interface AgentLead {
  id: string;
  agent_id: string;
  property_id: string;
  property_title: string;
  property_image: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  status: 'New' | 'Contacted' | 'Viewing' | 'Negotiating' | 'Won' | 'Lost';
  unread: boolean;
}

export interface AgentPayment {
  id: string;
  agent_id: string;
  date: string;
  package: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  amount: number;
  method: string;
  order_id: string;
  status: 'paid' | 'pending' | 'failed' | 'free';
}

export interface AgentActivityLog {
  id: string;
  agent_id: string;
  type: 'listings' | 'leads' | 'payments' | 'logins' | 'general';
  action: string;
  detail: string;
  created_at: string;
}
