export interface Staff {
  id: string;
  mobile: string;
  name: string;
  designation: string;
  registeredAt: string;
  avatarColor?: string;
}

export type GeofenceVerificationStatus = 'VERIFIED_IN_OFFICE' | 'OUTSIDE_PERIMETER';

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  designation: string;
  mobile: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // ISO string
  checkOutTime?: string; // ISO string
  checkInLat: number;
  checkInLng: number;
  checkInAccuracy: number;
  checkInDistance: number; // in meters
  verificationStatus: GeofenceVerificationStatus;
  workDurationMinutes?: number;
  notes?: string;
}

export interface OfficeConfig {
  officeName: string;
  department: string;
  locationDetails: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  workStartTime: string;
  workEndTime: string;
}

export interface GPSState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  distanceToOffice: number | null;
  isInsideGeofence: boolean | null;
  error: string | null;
  loading: boolean;
  timestamp: number | null;
  isSimulated: boolean;
}
