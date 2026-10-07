export interface TeamSeedData {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoText: string;
  totalPurse: number; // 100 Cr = 1,000,000,000
  maxSquadSize: number;
  maxOverseas: number;
}

export const SEED_TEAMS: TeamSeedData[] = [
  {
    name: 'Coastal Kings',
    shortName: 'CK',
    primaryColor: '#eab308', // Gold
    secondaryColor: '#1e3a8a', // Deep Blue
    logoText: 'CK',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Capital Warriors',
    shortName: 'CW',
    primaryColor: '#ef4444', // Crimson Red
    secondaryColor: '#1e293b', // Slate Dark
    logoText: 'CW',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Southern Strikers',
    shortName: 'SS',
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#0f172a', // Midnight
    logoText: 'SS',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Western Titans',
    shortName: 'WT',
    primaryColor: '#8b5cf6', // Violet/Purple
    secondaryColor: '#312e81', // Indigo Dark
    logoText: 'WT',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Eastern Challengers',
    shortName: 'EC',
    primaryColor: '#10b981', // Emerald
    secondaryColor: '#064e3b', // Deep Forest
    logoText: 'EC',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Northern Royals',
    shortName: 'NR',
    primaryColor: '#ec4899', // Pink / Rose
    secondaryColor: '#831843', // Royal Wine
    logoText: 'NR',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Metro Falcons',
    shortName: 'MF',
    primaryColor: '#f97316', // Fiery Orange
    secondaryColor: '#431407', // Dark Amber
    logoText: 'MF',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
  {
    name: 'Harbor Giants',
    shortName: 'HG',
    primaryColor: '#3b82f6', // Electric Blue
    secondaryColor: '#172554', // Oceanic Navy
    logoText: 'HG',
    totalPurse: 1000000000,
    maxSquadSize: 25,
    maxOverseas: 8,
  },
];
