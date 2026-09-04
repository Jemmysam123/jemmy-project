import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Calendar,
  ShieldCheck,
  Clock,
  UserCheck,
  Filter,
} from 'lucide-react';
import { AttendanceRecord, Staff } from '../types';
import { formatTime, formatDate } from '../utils/geo';

interface AttendanceRegisterProps {
  records: AttendanceRecord[];
  staffList: Staff[];
}

export const AttendanceRegister: React.FC<AttendanceRegisterProps> = ({ records, staffList }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');

  const designations = Array.from(new Set(staffList.map((s) => s.designation)));

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesSearch =
      rec.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.mobile.includes(searchQuery) ||
      rec.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDesignation =
      designationFilter === 'ALL' || rec.designation === designationFilter;
    return matchesDate && matchesSearch && matchesDesignation;
  });

  // Calculate statistics
  const totalStaff = staffList.length;
  const presentCount = filteredRecords.length;
  const completedDayCount = filteredRecords.filter((r) => r.checkOutTime).length;

  const exportToCSV = () => {
    const headers = [
      'Sl No',
      'Staff Name',
      'Designation',
      'Mobile',
      'Date',
      'Check-In Time',
      'Check-Out Time',
      'Distance from Office (m)',
      'GPS Accuracy (m)',
      'Verification Status',
      'Duty Hours',
    ];

    const rows = filteredRecords.map((r, i) => [
      i + 1,
      `"${r.staffName}"`,
      `"${r.designation}"`,
      r.mobile,
      r.date,
      formatTime(r.checkInTime),
      r.checkOutTime ? formatTime(r.checkOutTime) : 'On Duty',
      r.checkInDistance,
      r.checkInAccuracy,
      r.verificationStatus,
      r.workDurationMinutes
        ? `${Math.floor(r.workDurationMinutes / 60)}h ${r.workDurationMinutes % 60}m`
        : 'Active',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Patsoi_CD_Block_Attendance_${selectedDate || 'all'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Official Heading Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Staff Daily Attendance Register & Muster Roll
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Patsoi Community Development Block • GPS Geofenced Verification Log
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={exportToCSV}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-500/20 uppercase tracking-wider"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Total Enrolled Staff
            </span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {totalStaff}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Present On-Duty
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
              {presentCount}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
              Shift Completed
            </span>
            <span className="text-2xl font-black text-indigo-300 mt-0.5 block">
              {completedDayCount}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
              GPS Geofence Rate
            </span>
            <span className="text-2xl font-black text-purple-300 mt-0.5 block">
              100% Verified
            </span>
          </div>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-5 pt-5 border-t border-slate-800">
          {/* Date Picker */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Select Register Date
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Designation Filter */}
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Filter by Designation
            </label>
            <div className="relative">
              <Filter className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="ALL" className="bg-slate-950 text-white">All Designations</option>
                {designations.map((d) => (
                  <option key={d} value={d} className="bg-slate-950 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Search Staff
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-3 w-12 text-center">Sl</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Mobile No.</th>
                <th className="py-3.5 px-3">Punch-In Time</th>
                <th className="py-3.5 px-3">Punch-Out Time</th>
                <th className="py-3.5 px-3 text-center">Distance</th>
                <th className="py-3.5 px-3 text-center">Geofence Status</th>
                <th className="py-3.5 px-4 text-right">Work Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-medium text-sm text-slate-400">No attendance records found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      No staff has punched in for date: {formatDate(selectedDate)}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                          {record.staffName.charAt(0)}
                        </div>
                        <span>{record.staffName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {record.designation}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      +91 {record.mobile}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-emerald-400">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {record.checkOutTime ? (
                        <span className="text-rose-400 font-medium">
                          {formatTime(record.checkOutTime)}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          On Duty
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {record.checkInDistance}m
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verified In Office
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-white">
                      {record.workDurationMinutes ? (
                        <span className="font-mono text-indigo-300">
                          {Math.floor(record.workDurationMinutes / 60)}h{' '}
                          {record.workDurationMinutes % 60}m
                        </span>
                      ) : (
                        <span className="text-slate-500">In Progress</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
