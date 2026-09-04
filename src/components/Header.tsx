import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, FileSpreadsheet, Settings, Clock, Building2 } from 'lucide-react';
import { Staff } from '../types';

interface HeaderProps {
  activeTab: 'punch' | 'register' | 'logs' | 'settings';
  onSelectTab: (tab: 'punch' | 'register' | 'logs' | 'settings') => void;
  currentStaff: Staff | null;
  totalRegistered: number;
  todayPresentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  currentStaff,
  totalRegistered,
  todayPresentCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-950/90 backdrop-blur-md text-white border-b border-slate-800/80 sticky top-0 z-50">
      {/* Top National / State Ribbon */}
      <div className="bg-slate-950 px-4 sm:px-8 py-1.5 border-b border-slate-850 text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400"></span>
          <span className="font-semibold tracking-wider text-slate-300 uppercase">
            GOVERNMENT OF MANIPUR
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Department of Rural Development & Panchayati Raj</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Server Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GPS Linked</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 flex-shrink-0">
            <span className="font-bold text-white text-xl">P</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight uppercase">
              Patsoi CD Block Office
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
              Official Staff Attendance Portal • Geofence Verified
            </p>
          </div>
        </div>

        {/* Live Clock & Quick Status */}
        <div className="flex items-center gap-5 justify-between md:justify-end">
          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-right">
              <span className="text-slate-500 block text-[9px] uppercase tracking-widest font-bold">
                Today's Turnout
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {todayPresentCount} <span className="text-slate-500 font-normal text-xs">/ {totalRegistered} present</span>
              </span>
            </div>

            {currentStaff && (
              <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-white font-bold text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="font-bold text-white text-xs block truncate max-w-[130px]">
                    {currentStaff.name}
                  </span>
                  <span className="text-[10px] text-indigo-300 block truncate max-w-[130px]">
                    {currentStaff.designation}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-mono font-medium text-white tracking-wider">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
              {currentDate || 'LIVE ATTENDANCE'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <nav className="flex space-x-2 border-t border-slate-800/80 pt-2.5 pb-2.5 overflow-x-auto scrollbar-none">
          <button
            id="tab-punch"
            type="button"
            onClick={() => onSelectTab('punch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'punch'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>Mark Attendance</span>
          </button>

          <button
            id="tab-register"
            type="button"
            onClick={() => onSelectTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <UserPlus className="w-4 h-4 text-indigo-300" />
            <span>Staff Registration</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
              {totalRegistered}
            </span>
          </button>

          <button
            id="tab-logs"
            type="button"
            onClick={() => onSelectTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
            <span>Attendance Register & Logs</span>
          </button>

          <button
            id="tab-settings"
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap uppercase tracking-wider ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-300" />
            <span>Office Geofence Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
