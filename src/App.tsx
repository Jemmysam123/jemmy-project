import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { AttendancePunch } from './components/AttendancePunch';
import { StaffRegistration } from './components/StaffRegistration';
import { AttendanceRegister } from './components/AttendanceRegister';
import { OfficeSettings } from './components/OfficeSettings';
import { Staff, AttendanceRecord, OfficeConfig, GPSState } from './types';
import {
  DEFAULT_OFFICE_CONFIG,
  INITIAL_STAFF,
  INITIAL_ATTENDANCE,
  calculateDistanceMeters,
} from './utils/geo';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'punch' | 'register' | 'logs' | 'settings'>('punch');

  // Office Configuration
  const [office, setOffice] = useState<OfficeConfig>(() => {
    try {
      const saved = localStorage.getItem('patsoi_office_config');
      return saved ? JSON.parse(saved) : DEFAULT_OFFICE_CONFIG;
    } catch {
      return DEFAULT_OFFICE_CONFIG;
    }
  });

  // Staff Roster
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    try {
      const saved = localStorage.getItem('patsoi_staff_list');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  // Active Staff Member
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(() => {
    return staffList.length > 0 ? staffList[0] : null;
  });

  // Attendance Records
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('patsoi_attendance_records');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  // GPS State
  const [gps, setGps] = useState<GPSState>({
    latitude: 24.79865, // Default near Patsoi Office courtyard
    longitude: 93.88352,
    accuracy: 6.5,
    distanceToOffice: 8,
    isInsideGeofence: true,
    error: null,
    loading: false,
    timestamp: Date.now(),
    isSimulated: true, // Default to convenient simulated office position so app works out of the box in container preview
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('patsoi_office_config', JSON.stringify(office));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [office]);

  useEffect(() => {
    try {
      localStorage.setItem('patsoi_staff_list', JSON.stringify(staffList));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem('patsoi_attendance_records', JSON.stringify(records));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [records]);

  // Recalculate distance and geofence whenever GPS or Office location changes
  const updateDistanceAndGeofence = useCallback(
    (lat: number, lon: number, accuracy: number, isSimulated: boolean) => {
      const dist = calculateDistanceMeters(lat, lon, office.latitude, office.longitude);
      const isInside = dist <= office.geofenceRadiusMeters;

      setGps({
        latitude: lat,
        longitude: lon,
        accuracy: accuracy,
        distanceToOffice: dist,
        isInsideGeofence: isInside,
        error: null,
        loading: false,
        timestamp: Date.now(),
        isSimulated: isSimulated,
      });
    },
    [office.latitude, office.longitude, office.geofenceRadiusMeters]
  );

  // Real GPS fetch
  const fetchRealGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGps((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        loading: false,
      }));
      return;
    }

    setGps((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateDistanceAndGeofence(latitude, longitude, accuracy, false);
      },
      (err) => {
        console.warn('GPS lookup error:', err);
        setGps((prev) => ({
          ...prev,
          loading: false,
          error: `Location access denied or unavailable (${err.message}). Using simulated mode.`,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [updateDistanceAndGeofence]);

  // Simulation handler
  const handleSimulateLocation = (preset: 'inside' | 'outside' | 'real') => {
    if (preset === 'real') {
      fetchRealGPS();
      return;
    }

    if (preset === 'inside') {
      // Offset by ~12 meters from office
      const simLat = office.latitude + 0.0001;
      const simLon = office.longitude + 0.00008;
      updateDistanceAndGeofence(simLat, simLon, 5.2, true);
    } else if (preset === 'outside') {
      // Offset by ~650 meters from office (outside geofence)
      const simLat = office.latitude + 0.0055;
      const simLon = office.longitude + 0.0042;
      updateDistanceAndGeofence(simLat, simLon, 12.0, true);
    }
  };

  // When office coordinates change, recompute distance
  useEffect(() => {
    if (gps.latitude && gps.longitude) {
      const dist = calculateDistanceMeters(
        gps.latitude,
        gps.longitude,
        office.latitude,
        office.longitude
      );
      setGps((prev) => ({
        ...prev,
        distanceToOffice: dist,
        isInsideGeofence: dist <= office.geofenceRadiusMeters,
      }));
    }
  }, [office.latitude, office.longitude, office.geofenceRadiusMeters]);

  // Register New Staff
  const handleRegisterStaff = (
    newStaffData: Omit<Staff, 'id' | 'registeredAt'>
  ): { success: boolean; message: string; staff?: Staff } => {
    const existing = staffList.find((s) => s.mobile === newStaffData.mobile);
    if (existing) {
      return {
        success: false,
        message: `Mobile number ${newStaffData.mobile} is already registered under name: ${existing.name}.`,
      };
    }

    const colors = [
      'bg-blue-600',
      'bg-emerald-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-teal-600',
      'bg-rose-600',
    ];
    const randomColor = colors[staffList.length % colors.length];

    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      ...newStaffData,
      registeredAt: new Date().toISOString(),
      avatarColor: randomColor,
    };

    const updated = [newStaff, ...staffList];
    setStaffList(updated);
    setCurrentStaff(newStaff); // Auto switch to newly registered staff

    return {
      success: true,
      message: `Staff member ${newStaff.name} successfully registered with Patsoi CD Block Office!`,
      staff: newStaff,
    };
  };

  // Delete Staff
  const handleDeleteStaff = (id: string) => {
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    if (currentStaff?.id === id) {
      setCurrentStaff(updated.length > 0 ? updated[0] : null);
    }
  };

  // Find today's record for active staff
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(
    (r) => r.staffId === currentStaff?.id && r.date === todayDate
  );

  // Check In Punch
  const handleCheckIn = (): { success: boolean; message: string } => {
    if (!currentStaff) {
      return { success: false, message: 'Please select a registered staff member first.' };
    }

    if (!gps.latitude || !gps.longitude || gps.distanceToOffice === null) {
      return { success: false, message: 'GPS signal not available. Please refresh your location.' };
    }

    if (!gps.isInsideGeofence) {
      return {
        success: false,
        message: `Attendance Restricted: You are ${gps.distanceToOffice}m away. You must be physically within ${office.geofenceRadiusMeters}m of Patsoi CD Block Office.`,
      };
    }

    if (todayRecord?.checkInTime) {
      return {
        success: false,
        message: `You have already punched in for today at ${new Date(
          todayRecord.checkInTime
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      designation: currentStaff.designation,
      mobile: currentStaff.mobile,
      date: todayDate,
      checkInTime: new Date().toISOString(),
      checkInLat: gps.latitude,
      checkInLng: gps.longitude,
      checkInAccuracy: gps.accuracy || 5,
      checkInDistance: gps.distanceToOffice,
      verificationStatus: 'VERIFIED_IN_OFFICE',
    };

    setRecords([newRecord, ...records]);
    return {
      success: true,
      message: `Punch-in recorded and verified via GPS Geofence (${gps.distanceToOffice}m from Patsoi CD Block Office).`,
    };
  };

  // Check Out Punch
  const handleCheckOut = (): { success: boolean; message: string } => {
    if (!currentStaff || !todayRecord) {
      return { success: false, message: 'No active punch-in found for today.' };
    }

    if (todayRecord.checkOutTime) {
      return { success: false, message: 'You have already punched out for today.' };
    }

    if (!gps.isInsideGeofence) {
      return {
        success: false,
        message: `Punch-Out Restricted: You must be within the ${office.geofenceRadiusMeters}m office perimeter to verify departure.`,
      };
    }

    const checkOutDate = new Date();
    const checkInDate = new Date(todayRecord.checkInTime);
    const durationMinutes = Math.max(
      1,
      Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60))
    );

    const updatedRecords = records.map((r) => {
      if (r.id === todayRecord.id) {
        return {
          ...r,
          checkOutTime: checkOutDate.toISOString(),
          workDurationMinutes: durationMinutes,
        };
      }
      return r;
    });

    setRecords(updatedRecords);
    return {
      success: true,
      message: `Punch-out verified. Total duty hours: ${Math.floor(durationMinutes / 60)}h ${
        durationMinutes % 60
      }m. Have a great evening!`,
    };
  };

  // Today present staff count
  const todayPresentCount = new Set(
    records.filter((r) => r.date === todayDate).map((r) => r.staffId)
  ).size;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Dot Matrix Texture */}
      <div className="fixed inset-0 opacity-25 pointer-events-none bg-grid-dots z-0"></div>

      {/* Header */}
      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentStaff={currentStaff}
          totalRegistered={staffList.length}
          todayPresentCount={todayPresentCount}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-14 relative z-10">
        {activeTab === 'punch' && (
          <AttendancePunch
            currentStaff={currentStaff}
            staffList={staffList}
            onSelectStaff={setCurrentStaff}
            office={office}
            gps={gps}
            onRefreshGPS={fetchRealGPS}
            onSimulateLocation={handleSimulateLocation}
            todayRecord={todayRecord}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}

        {activeTab === 'register' && (
          <StaffRegistration
            staffList={staffList}
            onRegisterStaff={handleRegisterStaff}
            onDeleteStaff={handleDeleteStaff}
            onSelectStaff={(staff) => {
              setCurrentStaff(staff);
              setActiveTab('punch');
            }}
            selectedStaffId={currentStaff?.id}
          />
        )}

        {activeTab === 'logs' && (
          <AttendanceRegister records={records} staffList={staffList} />
        )}

        {activeTab === 'settings' && (
          <OfficeSettings
            office={office}
            gps={gps}
            onUpdateOffice={setOffice}
          />
        )}
      </main>

      {/* Immersive Footer */}
      <footer className="h-14 bg-slate-950/90 backdrop-blur border-t border-slate-850 flex flex-wrap items-center px-4 sm:px-10 justify-between relative z-10 text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Server Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GPS Linked</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patsoi CD Block Unit</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          &copy; Digital Block Administration Unit • Government of Manipur
        </p>
      </footer>
    </div>
  );
}
