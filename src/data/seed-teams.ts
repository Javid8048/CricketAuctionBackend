export interface TeamSeedData {
  name: string;
  shortName: string;
  ownerName: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  logoText: string;
  totalPurse: number;
  maxSquadSize: number;
  maxOverseas: number;
}

export const SEED_TEAMS: TeamSeedData[] = [
  {
    name: 'Coastal Kings',
    shortName: 'CK',
    ownerName: 'Vikram Merchant',
    phone: '+91 98765 43210',
    address: 'Marine Drive, South Zone',
    primaryColor: '#eab308', // Gold
    secondaryColor: '#1e3a8a', // Deep Blue
    logoText: 'CK',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Capital Warriors',
    shortName: 'CW',
    ownerName: 'Rajesh Singhania',
    phone: '+91 98450 11223',
    address: 'Connaught Place, Central Hub',
    primaryColor: '#ef4444', // Crimson Red
    secondaryColor: '#1e293b', // Slate Dark
    logoText: 'CW',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Southern Strikers',
    shortName: 'SS',
    ownerName: 'Karthik Narayanan',
    phone: '+91 94440 99887',
    address: 'Anna Nagar, Chennai',
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#0f172a', // Midnight
    logoText: 'SS',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Western Titans',
    shortName: 'WT',
    ownerName: 'Anand Mehta',
    phone: '+91 99200 44556',
    address: 'Bandra West, Mumbai',
    primaryColor: '#8b5cf6', // Violet
    secondaryColor: '#312e81', // Indigo
    logoText: 'WT',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Eastern Challengers',
    shortName: 'EC',
    ownerName: 'Debabrata Sen',
    phone: '+91 98300 77889',
    address: 'Salt Lake, Kolkata',
    primaryColor: '#10b981', // Emerald
    secondaryColor: '#064e3b', // Forest
    logoText: 'EC',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Northern Royals',
    shortName: 'NR',
    ownerName: 'Harpreet Singh',
    phone: '+91 98140 22334',
    address: 'Model Town, North Valley',
    primaryColor: '#ec4899', // Pink
    secondaryColor: '#831843', // Rose Dark
    logoText: 'NR',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Metro Falcons',
    shortName: 'MF',
    ownerName: 'Ravi Teja Reddy',
    phone: '+91 99490 66778',
    address: 'Banjara Hills, Hyderabad',
    primaryColor: '#f97316', // Orange
    secondaryColor: '#431407', // Deep Rust
    logoText: 'MF',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
  {
    name: 'Harbor Giants',
    shortName: 'HG',
    ownerName: 'Mohan Das Pai',
    phone: '+91 98450 33445',
    address: 'Harbor Road, Port Town',
    primaryColor: '#3b82f6', // Cobalt
    secondaryColor: '#172554', // Dark Navy
    logoText: 'HG',
    totalPurse: 15000,
    maxSquadSize: 12,
    maxOverseas: 4,
  },
];
