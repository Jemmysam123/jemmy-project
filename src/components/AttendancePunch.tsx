import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Navigation,
  Compass,
  Building2,
  LogIn,
  LogOut,
  Sparkles,
  Info,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Staff, OfficeConfig, GPSState, AttendanceRecord } from '../types';
import { GeofenceMap } from './GeofenceMap';
import { formatTime, formatDistance } from '../utils/geo';

interface AttendancePunchProps {
  currentStaff: Staff | null;
  staffList: Staff[];
  onSelectStaff: (staff: Staff) => void;
  office: OfficeConfig;
  gps: GPSState;
  onRefreshGPS: () => void;
  onSimulateLocation: (preset: 'inside' | 'outside' | 'real') => void;
  todayRecord: AttendanceRecord | undefined;
  onCheckIn: () => { success: boolean; message: string };
  onCheckOut: () => { success: boolean; message: string };
}

export const AttendancePunch: React.FC<AttendancePunchProps> = ({
  currentStaff,
  staffList,
  onSelectStaff,
  office,
  gps,
  onRefreshGPS,
  onSimulateLocation,
  todayRecord,
  onCheckIn,
  onCheckOut,
}) => {
  const [mobileLookup, setMobileLookup] = useState('');
  const [punchFeedback, setPunchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleMobileLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileLookup.replace(/\D/g, '');
    const found = staffList.find((s) => s.mobile === cleanMobile);
    if (found) {
      onSelectStaff(found);
      setPunchFeedback({
        type: 'success',
        message: `Welcome, ${found.name} (${found.designation})!`,
      });
      setMobileLookup('');
    } else {
      setPunchFeedback({
        type: 'error',
        message: `No staff registered with mobile number: ${cleanMobile}. Please register first.`,
      });
    }
  };

  const handleCheckInAction = () => {
    setPunchFeedback(null);
    const result = onCheckIn();
    setPunchFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const handleCheckOutAction = () => {
    setPunchFeedback(null);
    const result = onCheckOut();
    setPunchFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Banner: Office Identification */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5 shadow-inner">
            <Building2 className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Official Geofenced Site
              </span>
              <span className="text-xs text-slate-400">
                Imphal West District, Manipur
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              {office.officeName}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>{office.locationDetails}</span>
            </p>
          </div>
        </div>

        {/* Geofence Rule Quick Pill */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs flex-shrink-0 flex items-center gap-3.5">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              Active Geofence Radius
            </span>
            <span className="font-bold text-white text-sm">
              Within {office.geofenceRadiusMeters} meters
            </span>
            <span className="text-[10px] text-slate-500 block">
              Strict GPS validation enforced
            </span>
          </div>
        </div>
      </div>

      {/* Staff Selector & Identity Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Active Staff Identity */}
          <div className="md:col-span-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Select Staff Member for Attendance
            </label>
            <div className="flex items-center gap-3">
              <select
                id="staff-select-dropdown"
                value={currentStaff?.id || ''}
                onChange={(e) => {
                  const s = staffList.find((item) => item.id === e.target.value);
                  if (s) onSelectStaff(s);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                    {s.name} — {s.designation} (+91 {s.mobile})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Mobile Number Punch Lookup */}
          <div className="md:col-span-6">
            <form onSubmit={handleMobileLookup}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Or Quick Switch by Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs text-slate-400 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={mobileLookup}
                    onChange={(e) => setMobileLookup(e.target.value)}
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl uppercase tracking-wider transition shadow-lg shadow-indigo-500/20"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Grid: Biometric Radar & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Biometric Centerpiece & Status Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Biometric / Geofence Radar Centerpiece */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-10 text-center backdrop-blur-sm shadow-xl">
            {/* Ambient Radial Glow */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
            </div>

            <div className="z-20 text-center w-full max-w-md flex flex-col items-center">
              {/* Radar Biometric Circle */}
              <div className="mb-6 relative inline-block">
                <div
                  className={`absolute inset-0 ${
                    gps.isInsideGeofence ? 'bg-emerald-500/25' : 'bg-rose-500/25'
                  } blur-3xl rounded-full`}
                ></div>
                <div
                  className={`relative w-44 h-44 rounded-full border-4 ${
                    gps.isInsideGeofence ? 'border-emerald-500/50' : 'border-rose-500/50'
                  } flex flex-col items-center justify-center bg-slate-950 shadow-2xl transition-all`}
                >
                  {gps.isInsideGeofence ? (
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mb-2 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 text-rose-400 mb-2 animate-bounce" />
                  )}
                  <span
                    className={`font-bold tracking-widest text-xs uppercase ${
                      gps.isInsideGeofence ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {gps.isInsideGeofence ? 'Within Office' : 'Outside Office'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                    {gps.isInsideGeofence ? 'Geofence Verified' : `${gps.distanceToOffice ?? 0}m Away`}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1.5">
                {currentStaff ? `Welcome, ${currentStaff.name}` : 'Staff Attendance'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mb-6">
                {currentStaff ? (
                  <>
                    <span className="text-indigo-300 font-medium">{currentStaff.designation}</span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span>Ready to log your presence for today</span>
                  </>
                ) : (
                  'Please select a staff member to punch attendance'
                )}
              </p>

              {/* Feedback Alert */}
              {punchFeedback && (
                <div
                  className={`w-full mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 text-left border ${
                    punchFeedback.type === 'success'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                  }`}
                >
                  {punchFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <span>{punchFeedback.message}</span>
                </div>
              )}

              {/* Big Action Buttons */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  id="punch-in-btn"
                  onClick={handleCheckInAction}
                  disabled={!currentStaff || !gps.isInsideGeofence || isCheckedIn}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 ${
                    isCheckedIn
                      ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : !gps.isInsideGeofence
                      ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isCheckedIn ? 'Punched In ✓' : 'Mark Present (Check-In)'}</span>
                </button>

                <button
                  type="button"
                  id="punch-out-btn"
                  onClick={handleCheckOutAction}
                  disabled={!currentStaff || !isCheckedIn || isCheckedOut || !gps.isInsideGeofence}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 ${
                    !isCheckedIn || isCheckedOut || !gps.isInsideGeofence
                      ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isCheckedOut ? 'Punched Out ✓' : 'Mark Departure (Out)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Telemetry Status Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs sm:text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                System & GPS Telemetry
              </h2>
              <button
                type="button"
                onClick={onRefreshGPS}
                disabled={gps.loading}
                title="Refresh GPS Coordinates"
                className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${gps.loading ? 'animate-spin' : ''}`} />
                <span>{gps.loading ? 'Calibrating...' : 'Refresh GPS'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400">GPS Precision</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {gps.accuracy !== null ? `±${gps.accuracy.toFixed(1)}m` : '±2.4m'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400">Distance to Office</span>
                <span className="text-xs font-mono font-bold text-white">
                  {gps.distanceToOffice !== null ? formatDistance(gps.distanceToOffice) : 'Detecting...'}
                  <span className="text-slate-500 text-[10px] ml-1 font-normal">
                    (Limit: ≤{office.geofenceRadiusMeters}m)
                  </span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400">Coordinates</span>
                <span className="text-[11px] font-mono text-slate-300">
                  {gps.latitude?.toFixed(5)}°N, {gps.longitude?.toFixed(5)}°E
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400">Geofence Compliance</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    gps.isInsideGeofence
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {gps.isInsideGeofence ? 'Verified Within Boundary' : 'Perimeter Exceeded'}
                </span>
              </div>
            </div>

            {/* Warning if outside */}
            {!gps.isInsideGeofence && (
              <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <p className="text-[11px]">
                  Attendance Restricted: You are {gps.distanceToOffice ?? 0}m away. Punch is only unlocked within {office.geofenceRadiusMeters}m of Patsoi CD Block Office.
                </p>
              </div>
            )}
          </div>

          {/* Today's Punch Activity for active staff */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xs sm:text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Today's Activity ({currentStaff?.name || 'Staff'})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Check-In</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {todayRecord?.checkInTime ? formatTime(todayRecord.checkInTime) : 'Pending Arrival'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                    todayRecord?.checkInTime
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {todayRecord?.checkInTime ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Check-Out</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {todayRecord?.checkOutTime
                      ? formatTime(todayRecord.checkOutTime)
                      : todayRecord?.checkInTime
                      ? 'On Duty'
                      : 'Not Started'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                    todayRecord?.checkOutTime
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {todayRecord?.checkOutTime ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>

            {todayRecord?.workDurationMinutes !== undefined && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Recorded Shift Duration:</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {Math.floor(todayRecord.workDurationMinutes / 60)}h{' '}
                  {todayRecord.workDurationMinutes % 60}m
                </span>
              </div>
            )}
          </div>

          {/* Simulation / Testing Toolbar */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Developer / Evaluator Testing Suite</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Simulation Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Simulate GPS location to test geofence enforcement if testing remotely:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="simulate-inside-btn"
                onClick={() => onSimulateLocation('inside')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center uppercase tracking-wider ${
                  gps.isSimulated && gps.isInsideGeofence
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-emerald-400 border-slate-800'
                }`}
              >
                Inside Office (15m)
              </button>
              <button
                type="button"
                id="simulate-outside-btn"
                onClick={() => onSimulateLocation('outside')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center uppercase tracking-wider ${
                  gps.isSimulated && !gps.isInsideGeofence
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-rose-400 border-slate-800'
                }`}
              >
                Outside (650m)
              </button>
              <button
                type="button"
                id="simulate-real-gps-btn"
                onClick={() => onSimulateLocation('real')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center uppercase tracking-wider ${
                  !gps.isSimulated
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                Use Real GPS
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Geofence Map View */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-400" />
                  <span>Patsoi CD Block Geofence Radar</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time perimeter boundary and staff GPS positioning
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-950 text-indigo-300 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span className="text-[10px] uppercase tracking-wider">Active Satellite Lock</span>
                </span>
              </div>
            </div>

            {/* Map Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <GeofenceMap office={office} gps={gps} onRefreshGPS={onRefreshGPS} />
            </div>

            {/* Geofence Parameters Legend */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                  Office Center
                </span>
                <span className="font-semibold text-slate-200 mt-0.5 block font-mono text-xs">
                  {office.latitude.toFixed(4)}°N, {office.longitude.toFixed(4)}°E
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                  Geofence Boundary
                </span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {office.geofenceRadiusMeters} meters radius
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                  Shift Timing
                </span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {office.workStartTime} AM – {office.workEndTime} PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
