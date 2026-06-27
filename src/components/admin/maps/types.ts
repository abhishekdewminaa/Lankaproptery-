export interface DistrictData {
  district: string;
  province: string;
  count: number;
  avgPrice: number;
  trend: 'up' | 'down' | 'flat';
  demand: number; // 1-100
  avgDaysToSell: number;
  priceTrendMoM: number; // e.g. 8 for +8%, -3 for -3%
}

export interface FeaturedProject {
  id: string;
  name: string;
  developer: string;
  startingPrice: string;
  status: 'Under Construction' | 'Ready to Move' | 'Upcoming';
  image: string;
  lat: number;
  lng: number;
}

export interface PriceHistory {
  month: string;
  land: number;
  houses: number;
  apartments: number;
}

export const DISTRICT_COORDS: { [key: string]: [number, number] } = {
  'Colombo': [6.9271, 79.8612],
  'Gampaha': [7.0873, 80.0144],
  'Kalutara': [6.5854, 79.9607],
  'Kandy': [7.2906, 80.6337],
  'Matale': [7.4675, 80.6234],
  'Nuwara Eliya': [6.9497, 80.7891],
  'Galle': [6.0535, 80.2210],
  'Matara': [5.9549, 80.5550],
  'Hambantota': [6.1246, 81.1185],
  'Jaffna': [9.6615, 80.0255],
  'Kilinochchi': [9.3803, 80.3992],
  'Mannar': [8.9810, 79.9044],
  'Vavuniya': [8.7542, 80.4982],
  'Mullaitivu': [9.2662, 80.8143],
  'Batticaloa': [7.7171, 81.6924],
  'Ampara': [7.2912, 81.6747],
  'Trincomalee': [8.5873, 81.2152],
  'Kurunegala': [7.4863, 80.3647],
  'Puttalam': [8.0330, 79.8267],
  'Anuradhapura': [8.3114, 80.4037],
  'Polonnaruwa': [7.9403, 81.0188],
  'Badulla': [6.9842, 81.0564],
  'Moneragala': [6.8671, 81.3508],
  'Ratnapura': [6.6828, 80.3992],
  'Kegalle': [7.2513, 80.3464]
};

export const MOCK_DISTRICTS: DistrictData[] = [
  { district: 'Colombo', province: 'Western', count: 1245, avgPrice: 15000000, trend: 'up', demand: 95, avgDaysToSell: 35, priceTrendMoM: 8 },
  { district: 'Gampaha', province: 'Western', count: 850, avgPrice: 8500000, trend: 'up', demand: 88, avgDaysToSell: 42, priceTrendMoM: 12 },
  { district: 'Kalutara', province: 'Western', count: 320, avgPrice: 6500000, trend: 'flat', demand: 62, avgDaysToSell: 58, priceTrendMoM: 2 },
  { district: 'Kandy', province: 'Central', count: 420, avgPrice: 12000000, trend: 'up', demand: 81, avgDaysToSell: 45, priceTrendMoM: 6 },
  { district: 'Matale', province: 'Central', count: 140, avgPrice: 4500000, trend: 'flat', demand: 45, avgDaysToSell: 72, priceTrendMoM: 0 },
  { district: 'Nuwara Eliya', province: 'Central', count: 110, avgPrice: 16000000, trend: 'down', demand: 38, avgDaysToSell: 85, priceTrendMoM: -3 },
  { district: 'Galle', province: 'Southern', count: 310, avgPrice: 11000000, trend: 'up', demand: 76, avgDaysToSell: 48, priceTrendMoM: 5 },
  { district: 'Matara', province: 'Southern', count: 190, avgPrice: 6000000, trend: 'flat', demand: 52, avgDaysToSell: 64, priceTrendMoM: 1 },
  { district: 'Hambantota', province: 'Southern', count: 85, avgPrice: 4000000, trend: 'up', demand: 49, avgDaysToSell: 70, priceTrendMoM: 4 },
  { district: 'Jaffna', province: 'Northern', count: 165, avgPrice: 5500000, trend: 'flat', demand: 55, avgDaysToSell: 68, priceTrendMoM: 0 },
  { district: 'Kilinochchi', province: 'Northern', count: 42, avgPrice: 2500000, trend: 'flat', demand: 30, avgDaysToSell: 90, priceTrendMoM: 0 },
  { district: 'Mannar', province: 'Northern', count: 30, avgPrice: 2000000, trend: 'flat', demand: 25, avgDaysToSell: 110, priceTrendMoM: -1 },
  { district: 'Vavuniya', province: 'Northern', count: 55, avgPrice: 3000000, trend: 'flat', demand: 32, avgDaysToSell: 95, priceTrendMoM: 0 },
  { district: 'Mullaitivu', province: 'Northern', count: 20, avgPrice: 1800000, trend: 'flat', demand: 20, avgDaysToSell: 120, priceTrendMoM: 0 },
  { district: 'Batticaloa', province: 'Eastern', count: 120, avgPrice: 4200000, trend: 'flat', demand: 40, avgDaysToSell: 75, priceTrendMoM: 1 },
  { district: 'Ampara', province: 'Eastern', count: 95, avgPrice: 3800000, trend: 'flat', demand: 35, avgDaysToSell: 82, priceTrendMoM: 0 },
  { district: 'Trincomalee', province: 'Eastern', count: 115, avgPrice: 5000000, trend: 'flat', demand: 48, avgDaysToSell: 68, priceTrendMoM: 2 },
  { district: 'Kurunegala', province: 'NW', count: 250, avgPrice: 4800000, trend: 'up', demand: 65, avgDaysToSell: 52, priceTrendMoM: 3 },
  { district: 'Puttalam', province: 'NW', count: 130, avgPrice: 3500000, trend: 'flat', demand: 50, avgDaysToSell: 65, priceTrendMoM: 1 },
  { district: 'Anuradhapura', province: 'NC', count: 145, avgPrice: 4000000, trend: 'up', demand: 58, avgDaysToSell: 59, priceTrendMoM: 4 },
  { district: 'Polonnaruwa', province: 'NC', count: 80, avgPrice: 3200000, trend: 'flat', demand: 42, avgDaysToSell: 74, priceTrendMoM: 0 },
  { district: 'Badulla', province: 'Uva', count: 105, avgPrice: 4500000, trend: 'flat', demand: 41, avgDaysToSell: 78, priceTrendMoM: 1 },
  { district: 'Moneragala', province: 'Uva', count: 65, avgPrice: 2800000, trend: 'flat', demand: 28, avgDaysToSell: 88, priceTrendMoM: 0 },
  { district: 'Ratnapura', province: 'Sabaragamuwa', count: 175, avgPrice: 5200000, trend: 'flat', demand: 46, avgDaysToSell: 66, priceTrendMoM: 2 },
  { district: 'Kegalle', province: 'Sabaragamuwa', count: 140, avgPrice: 4600000, trend: 'flat', demand: 44, avgDaysToSell: 68, priceTrendMoM: 1 },
];

export const MOCK_PROJECTS: FeaturedProject[] = [
  {
    id: 'proj1',
    name: 'Marina Square Uptown',
    developer: 'Access Engineering & China Harbour',
    startingPrice: 'Rs. 32,000,000',
    status: 'Under Construction',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    lat: 6.9458,
    lng: 79.8510
  },
  {
    id: 'proj2',
    name: 'Tri-Zen Residencies',
    developer: 'John Keells Properties',
    startingPrice: 'Rs. 28,500,000',
    status: 'Ready to Move',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    lat: 6.9231,
    lng: 79.8582
  },
  {
    id: 'proj3',
    name: 'Green Path Luxury Towers',
    developer: 'Prime Group',
    startingPrice: 'Rs. 45,000,000',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    lat: 6.9090,
    lng: 79.8654
  },
  {
    id: 'proj4',
    name: 'Aurelia Galle View',
    developer: 'Fairway Properties',
    startingPrice: 'Rs. 38,000,000',
    status: 'Under Construction',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    lat: 6.0560,
    lng: 80.2155
  },
  {
    id: 'proj5',
    name: 'Capital Heights Rajagiriya',
    developer: 'Access Engineering',
    startingPrice: 'Rs. 55,000,000',
    status: 'Ready to Move',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    lat: 6.9110,
    lng: 79.9125
  }
];

export const MOCK_PRICE_HISTORY: PriceHistory[] = [
  { month: 'Jul 2025', land: 780000, houses: 9500000, apartments: 14000000 },
  { month: 'Aug 2025', land: 795000, houses: 9700000, apartments: 14200000 },
  { month: 'Sep 2025', land: 810000, houses: 9800000, apartments: 14500000 },
  { month: 'Oct 2025', land: 820000, houses: 9950000, apartments: 14600000 },
  { month: 'Nov 2025', land: 830000, houses: 10100000, apartments: 14800000 },
  { month: 'Dec 2025', land: 840000, houses: 10250000, apartments: 14900000 },
  { month: 'Jan 2026', land: 845000, houses: 10400000, apartments: 15100000 },
  { month: 'Feb 2026', land: 852000, houses: 10500000, apartments: 15300000 },
  { month: 'Mar 2026', land: 859000, houses: 10650000, apartments: 15450000 },
  { month: 'Apr 2026', land: 864000, houses: 10800000, apartments: 15600000 },
  { month: 'May 2026', land: 872000, houses: 10950000, apartments: 15800000 },
  { month: 'Jun 2026', land: 885000, houses: 11100000, apartments: 16000000 }
];
