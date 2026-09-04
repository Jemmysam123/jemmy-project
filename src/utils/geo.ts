import { OfficeConfig, Staff, AttendanceRecord } from '../types';

// Default Office location: Patsoi CD Block, Imphal West District, Manipur
export const DEFAULT_OFFICE_CONFIG: OfficeConfig = {
  officeName: 'Office of the Block Development Officer, Patsoi CD Block',
  department: 'Rural Development & Panchayati Raj, Govt. of Manipur',
  locationDetails: 'Patsoi CD Block HQ, NH-37 (New Cachar Road), Imphal West - 795113',
  latitude: 24.7986,
  longitude: 93.8835,
  geofenceRadiusMeters: 100, // 100 meters standard office campus radius
  workStartTime: '09:30',
  workEndTime: '17:00',
};

// Initial staff list for realistic demonstration
export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    mobile: '9862145780',
    name: 'Kh. Rajesh Singh',
    designation: 'Block Development Officer (BDO)',
    registeredAt: '2026-01-15T09:00:00.000Z',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'staff-2',
    mobile: '9436021890',
    name: 'T. Memcha Devi',
    designation: 'Assistant Engineer (RD & PR)',
    registeredAt: '2026-01-20T10:30:00.000Z',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'staff-3',
    mobile: '9774512399',
    name: 'N. Tomba Meitei',
    designation: 'Panchayat Extension Officer',
    registeredAt: '2026-02-01T09:15:00.000Z',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'staff-4',
    mobile: '8794123456',
    name: 'L. Bidyalaxmi Devi',
    designation: 'Computer Operator / MIS Executive',
    registeredAt: '2026-02-10T11:00:00.000Z',
    avatarColor: 'bg-purple-600',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    staffId: 'staff-1',
    staffName: 'Kh. Rajesh Singh',
    designation: 'Block Development Officer (BDO)',
    mobile: '9862145780',
    date: new Date().toISOString().split('T')[0],
    checkInTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    checkInLat: 24.79862,
    checkInLng: 93.88354,
    checkInAccuracy: 6.4,
    checkInDistance: 12,
    verificationStatus: 'VERIFIED_IN_OFFICE',
  },
  {
    id: 'att-2',
    staffId: 'staff-2',
    staffName: 'T. Memcha Devi',
    designation: 'Assistant Engineer (RD & PR)',
    mobile: '9436021890',
    date: new Date().toISOString().split('T')[0],
    checkInTime: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    checkInLat: 24.79858,
    checkInLng: 93.88348,
    checkInAccuracy: 8.1,
    checkInDistance: 24,
    verificationStatus: 'VERIFIED_IN_OFFICE',
  },
];

/**
 * Calculates great-circle distance between two points in meters using Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDate(isoOrDateString: string): string {
  try {
    const d = new Date(isoOrDateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoOrDateString;
  }
}
