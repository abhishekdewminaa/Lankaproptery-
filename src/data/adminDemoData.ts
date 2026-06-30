// Sri Lankan fallback datasets for LankaProperty.lk Admin Dashboard

export interface DemoUser {
  id: string;
  email: string;
  role: 'owner' | 'agent' | 'admin';
  full_name: string;
  phone: string;
  whatsapp: string;
  created_at: string;
  is_active: boolean;
  package_paid: boolean;
  package_price: number;
  package_expires_at: string;
  selected_package: string;
  agency_name?: string;
  views_count?: number;
  leads_count?: number;
}

export interface DemoProperty {
  id: string;
  ref_no: string;
  listing_title: string;
  price_lkr: number;
  usd_estimate: number;
  city: string;
  district: string;
  property_category: string;
  listing_type: 'Sale' | 'Rent' | 'FOR SALE' | 'FOR RENT';
  views_count: number;
  leads_count: number;
  saves_count?: number;
  status: 'active' | 'pending' | 'expired' | 'rejected';
  images: string[];
  rooms: number;
  bathrooms: number;
  land_area: string;
  floor_area: string;
  property_description: string;
  owner_email: string;
  agent_email: string;
  agent_id: string;
  created_at: string;
  is_negotiable?: boolean;
  additional_info?: string;
}

export interface DemoPayment {
  id: string;
  user_id: string;
  amount_lkr: number;
  payment_method: string;
  reference: string;
  paid_at: string;
  created_at: string;
  status: 'paid' | 'pending' | 'failed' | 'free';
  selected_package: string;
}

export interface DemoLead {
  id: string;
  property_id: string;
  property_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  status: 'New' | 'Read' | 'Contacted' | 'Closed';
}

export const sriLankanDistricts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
  'Moneragala', 'Ratnapura', 'Kegalle'
];

export const fallbackUsers: DemoUser[] = [
  {
    id: 'user-001',
    email: 'nishantha.perera@gmail.com',
    role: 'owner',
    full_name: 'Nishantha Perera',
    phone: '+94 77 123 4567',
    whatsapp: '+94 77 123 4567',
    created_at: '2026-05-15T08:30:00Z',
    is_active: true,
    package_paid: true,
    package_price: 4500,
    package_expires_at: '2026-08-15T08:30:00Z',
    selected_package: 'Premium Pro',
    views_count: 520,
    leads_count: 14,
  },
  {
    id: 'user-002',
    email: 'chaminda.silva@lankabrokers.com',
    role: 'agent',
    full_name: 'Chaminda Silva',
    phone: '+94 71 890 1234',
    whatsapp: '+94 71 890 1234',
    created_at: '2026-04-10T11:15:00Z',
    is_active: true,
    package_paid: true,
    package_price: 8500,
    package_expires_at: '2026-09-10T11:15:00Z',
    selected_package: 'Elite Pro',
    agency_name: 'Lanka Prime Realtors',
    views_count: 1450,
    leads_count: 42,
  },
  {
    id: 'user-003',
    email: 'sarah.fernando@outlook.com',
    role: 'owner',
    full_name: 'Sarah Fernando',
    phone: '+94 76 543 2109',
    whatsapp: '+94 76 543 2109',
    created_at: '2026-06-25T14:20:00Z',
    is_active: true,
    package_paid: false,
    package_price: 0,
    package_expires_at: '',
    selected_package: 'Free Plan',
    views_count: 85,
    leads_count: 2,
  },
  {
    id: 'user-004',
    email: 'priyantha.bandara@gmail.com',
    role: 'owner',
    full_name: 'Priyantha Bandara',
    phone: '+94 77 987 6543',
    whatsapp: '+94 77 987 6543',
    created_at: '2026-06-01T09:00:00Z',
    is_active: true,
    package_paid: true,
    package_price: 4500,
    package_expires_at: '2026-08-01T09:00:00Z',
    selected_package: 'Premium Pro',
    views_count: 310,
    leads_count: 9,
  },
  {
    id: 'user-005',
    email: 'dilrukshi.de.silva@yahoo.com',
    role: 'agent',
    full_name: 'Dilrukshi De Silva',
    phone: '+94 72 345 6789',
    whatsapp: '+94 72 345 6789',
    created_at: '2026-03-20T10:45:00Z',
    is_active: true,
    package_paid: true,
    package_price: 8500,
    package_expires_at: '2026-07-20T10:45:00Z',
    selected_package: 'Elite Pro',
    agency_name: 'Apex Property Brokers',
    views_count: 980,
    leads_count: 29,
  },
  {
    id: 'user-006',
    email: 'tharindu.jayawardena@gmail.com',
    role: 'owner',
    full_name: 'Tharindu Jayawardena',
    phone: '+94 77 456 7890',
    whatsapp: '+94 77 456 7890',
    created_at: '2026-06-26T17:40:00Z',
    is_active: true,
    package_paid: false,
    package_price: 4500,
    package_expires_at: '',
    selected_package: 'Premium Pro',
    views_count: 12,
    leads_count: 0,
  }
];

export const fallbackProperties: DemoProperty[] = [
  {
    id: 'prop-001',
    ref_no: 'LP-90812',
    listing_title: 'Luxury 3-Bedroom Apartment in Colombo 03',
    price_lkr: 125000000,
    usd_estimate: 416600,
    city: 'Kollupitiya',
    district: 'Colombo',
    property_category: 'Apartment',
    listing_type: 'Sale',
    views_count: 285,
    leads_count: 12,
    saves_count: 18,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: 3,
    bathrooms: 3,
    land_area: 'N/A',
    floor_area: '1,850 sqft',
    property_description: 'This gorgeous high-floor apartment offers breath-taking Indian Ocean vistas. Fully furnished with premier appliances, spacious rooms, open plan gourmet pantry, private service entrance, and designated double parking bays. The complex hosts a massive infinity deck pool, state-of-the-art gym, security control room, and fiber optic cabling.',
    owner_email: 'nishantha.perera@gmail.com',
    agent_email: '',
    agent_id: '',
    created_at: '2026-05-16T10:00:00Z',
    is_negotiable: true,
    additional_info: 'Swimming Pool, Gym, 24/7 Security, Ocean View, Back-up Generator'
  },
  {
    id: 'prop-002',
    ref_no: 'LP-34102',
    listing_title: 'Architect-Designed Modern Villa in Kotte',
    price_lkr: 88000000,
    usd_estimate: 293300,
    city: 'Kotte',
    district: 'Colombo',
    property_category: 'House',
    listing_type: 'Sale',
    views_count: 650,
    leads_count: 24,
    saves_count: 32,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: 4,
    bathrooms: 4,
    land_area: '15 Perches',
    floor_area: '3,800 sqft',
    property_description: 'An elegant contemporary residence showcasing natural stone elements, teak floors, double-height voids, and generous natural ventilation. Situated in a private, tree-lined residential lane. Features dynamic landscaped courtyard pond, custom modular kitchen, separate maid quarters, and comprehensive CCTV setup. Minutes to parliament pathways.',
    owner_email: '',
    agent_email: 'chaminda.silva@lankabrokers.com',
    agent_id: 'chaminda.silva@lankabrokers.com',
    created_at: '2026-04-12T15:30:00Z',
    is_negotiable: false,
    additional_info: 'Pond Courtyard, Rooftop Terrace, Double Teak Carport, Solar Water heating'
  },
  {
    id: 'prop-003',
    ref_no: 'LP-45199',
    listing_title: 'Commercial Land near Kandy City Center',
    price_lkr: 145000000,
    usd_estimate: 483300,
    city: 'Kandy',
    district: 'Kandy',
    property_category: 'Land',
    listing_type: 'Sale',
    views_count: 800,
    leads_count: 18,
    saves_count: 21,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: 0,
    bathrooms: 0,
    land_area: '45 Perches',
    floor_area: 'N/A',
    property_description: 'Premium bare land with perfect rectangular footprint boasting direct main road frontage of over 85 feet. Excellent commercial feasibility for shopping plazas, corporate headquarters, boutique hotel, or service center. Offers access to three-phase electrical lines and deep well water supplies. Clear deed with banks approvals.',
    owner_email: '',
    agent_email: 'chaminda.silva@lankabrokers.com',
    agent_id: 'chaminda.silva@lankabrokers.com',
    created_at: '2026-04-15T09:10:00Z',
    is_negotiable: true,
    additional_info: 'Commercial Frontage, 3-Phase Power, Rectangular Cut, Main Road Frontage'
  },
  {
    id: 'prop-004',
    ref_no: 'LP-11204',
    listing_title: 'Bungalow style 2-BR House in Negombo',
    price_lkr: 22000000,
    usd_estimate: 73300,
    city: 'Negombo',
    district: 'Gampaha',
    property_category: 'House',
    listing_type: 'Sale',
    views_count: 85,
    leads_count: 2,
    saves_count: 4,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: 2,
    bathrooms: 1,
    land_area: '10 Perches',
    floor_area: '1,200 sqft',
    property_description: 'Charming traditional bungalow perfect for quiet retirements or vacation retreats. Features a cozy sit-out veranda, mature garden with coconut trees, high ceilings, timber rafters, and fully tiled bathrooms. Tucked inside a highly peaceful residential zone just 8 minutes from the sandy Negombo beaches.',
    owner_email: 'sarah.fernando@outlook.com',
    agent_email: '',
    agent_id: '',
    created_at: '2026-06-25T14:45:00Z',
    is_negotiable: true,
    additional_info: 'Sit-out Veranda, Private Garden, Well Water, Fully Gated'
  },
  {
    id: 'prop-005',
    ref_no: 'LP-87634',
    listing_title: 'Luxury Beachfront Villa in Galle',
    price_lkr: 210000000,
    usd_estimate: 700000,
    city: 'Galle',
    district: 'Galle',
    property_category: 'House',
    listing_type: 'Sale',
    views_count: 980,
    leads_count: 29,
    saves_count: 45,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: 5,
    bathrooms: 5,
    land_area: '30 Perches',
    floor_area: '5,200 sqft',
    property_description: 'Spectacular seaside architectural mansion with infinity glass panels facing the golden beaches. Master suite opens to a private veranda above the sands. Incorporates standard pool deck, smart home automation, high-end marble finishings, professional chef pantry, and advanced solar energy network. Perfect private sanctuary.',
    owner_email: '',
    agent_email: 'dilrukshi.de.silva@yahoo.com',
    agent_id: 'dilrukshi.de.silva@yahoo.com',
    created_at: '2026-03-22T12:00:00Z',
    is_negotiable: true,
    additional_info: 'Private Infinity Pool, Smart Home, Direct Beach Access, Servants quarters'
  },
  {
    id: 'prop-006',
    ref_no: 'LP-12290',
    listing_title: 'Cozy Townhouse near Gampaha Town',
    price_lkr: 185000000,
    usd_estimate: 61600,
    city: 'Gampaha',
    district: 'Gampaha',
    property_category: 'House',
    listing_type: 'Sale',
    views_count: 12,
    leads_count: 0,
    saves_count: 1,
    status: 'pending',
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: 3,
    bathrooms: 2,
    land_area: '8 Perches',
    floor_area: '1,800 sqft',
    property_description: 'Newly completed double-story townhouse listing featuring high-grade bricks, modern mahogany cupboards, private storage room, secure garage with remote roller gate, and scenic balcony overlooking nearby paddy fields. A perfect choice for a working family, offering direct shortcuts to Colombo highway.',
    owner_email: 'tharindu.jayawardena@gmail.com',
    agent_email: '',
    agent_id: '',
    created_at: '2026-06-26T17:45:00Z',
    is_negotiable: true,
    additional_info: 'Mahogany Kitchen, Paddy Field View, Roller Gate Garage, Hot Water'
  }
];

export const fallbackPayments: DemoPayment[] = [
  {
    id: 'pay-001',
    user_id: 'user-001',
    amount_lkr: 4500,
    payment_method: 'payhere',
    reference: 'LP-123-1719123456',
    paid_at: '2026-05-15T08:35:00Z',
    created_at: '2026-05-15T08:30:00Z',
    status: 'paid',
    selected_package: 'Premium Pro'
  },
  {
    id: 'pay-002',
    user_id: 'user-002',
    amount_lkr: 8500,
    payment_method: 'payhere',
    reference: 'LP-123-1719125432',
    paid_at: '2026-04-10T11:20:00Z',
    created_at: '2026-04-10T11:15:00Z',
    status: 'paid',
    selected_package: 'Elite Pro'
  },
  {
    id: 'pay-003',
    user_id: 'user-004',
    amount_lkr: 4500,
    payment_method: 'payhere',
    reference: 'LP-123-1719129999',
    paid_at: '2026-06-01T09:05:00Z',
    created_at: '2026-06-01T09:00:00Z',
    status: 'paid',
    selected_package: 'Premium Pro'
  },
  {
    id: 'pay-004',
    user_id: 'user-005',
    amount_lkr: 8500,
    payment_method: 'payhere',
    reference: 'LP-123-1719131234',
    paid_at: '2026-03-20T10:50:00Z',
    created_at: '2026-03-20T10:45:00Z',
    status: 'paid',
    selected_package: 'Elite Pro'
  }
];

export const fallbackLeads: DemoLead[] = [
  {
    id: 'lead-001',
    property_id: 'prop-001',
    property_title: 'Luxury 3-Bedroom Apartment in Colombo 03',
    name: 'Kavinda Gunawardena',
    email: 'kavinda.g@gmail.com',
    phone: '+94 77 345 6123',
    message: 'I am interested in viewing this penthouse. Can we schedule a visit this Saturday afternoon? Please let me know the negotiable range.',
    created_at: '2026-06-25T10:30:00Z',
    status: 'New'
  },
  {
    id: 'lead-002',
    property_id: 'prop-002',
    property_title: 'Architect-Designed Modern Villa in Kotte',
    name: 'Anjula Perera',
    email: 'anjula@pereralaw.lk',
    phone: '+94 71 456 7812',
    message: 'We are looking for a house in Kotte. This looks highly suitable. Can you confirm if the title is clear and if bank loans are easily available?',
    created_at: '2026-06-24T15:20:00Z',
    status: 'Contacted'
  },
  {
    id: 'lead-003',
    property_id: 'prop-003',
    property_title: 'Commercial Land near Kandy City Center',
    name: 'Senaka De Silva',
    email: 'senaka@srilankahotels.com',
    phone: '+94 76 123 9876',
    message: 'Is this land commercial zoned? We are interested in setting up a boutique hotel. Please share the clear deed scans.',
    created_at: '2026-06-20T09:40:00Z',
    status: 'Closed'
  }
];
