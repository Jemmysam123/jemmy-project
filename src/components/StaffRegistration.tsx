import React, { useState } from 'react';
import { UserPlus, Phone, User, Briefcase, CheckCircle2, AlertCircle, Trash2, Search, ArrowRight } from 'lucide-react';
import { Staff } from '../types';

interface StaffRegistrationProps {
  staffList: Staff[];
  onRegisterStaff: (staff: Omit<Staff, 'id' | 'registeredAt'>) => { success: boolean; message: string; staff?: Staff };
  onDeleteStaff: (id: string) => void;
  onSelectStaff: (staff: Staff) => void;
  selectedStaffId?: string;
}

const COMMON_DESIGNATIONS = [
  'Block Development Officer (BDO)',
  'Assistant Engineer (RD & PR)',
  'Junior Engineer (JE)',
  'Panchayat Extension Officer',
  'Extension Officer (Agriculture)',
  'Upper Division Clerk (UDC)',
  'Lower Division Clerk (LDC)',
  'Panchayat Secretary / Gram Sevak',
  'Computer Operator / MIS Executive',
  'Accountant / Cashier',
  'Multi-Tasking Staff (MTS)',
  'Office Peon / Attendant',
  'Village Level Worker (VLW)',
];

export const StaffRegistration: React.FC<StaffRegistrationProps> = ({
  staffList,
  onRegisterStaff,
  onDeleteStaff,
  onSelectStaff,
  selectedStaffId,
}) => {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState(COMMON_DESIGNATIONS[0]);
  const [customDesignation, setCustomDesignation] = useState('');
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate mobile number: 10 digits
    const cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.length !== 10) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid staff name (at least 2 characters).',
      });
      return;
    }

    const finalDesignation = isCustomDesignation ? customDesignation.trim() : designation;
    if (!finalDesignation) {
      setFeedback({
        type: 'error',
        message: 'Please enter or select a designation.',
      });
      return;
    }

    const result = onRegisterStaff({
      mobile: cleanedMobile,
      name: name.trim(),
      designation: finalDesignation,
    });

    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.message,
      });
      // Clear form
      setMobile('');
      setName('');
      setCustomDesignation('');
      setIsCustomDesignation(false);
    } else {
      setFeedback({
        type: 'error',
        message: result.message,
      });
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registration Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-5">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold shadow-inner">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Staff Registration Portal
                </h2>
                <p className="text-xs text-slate-400">
                  Patsoi CD Block Office, Imphal West
                </p>
              </div>
            </div>

            {feedback && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-xs font-mono text-slate-400 mr-1">+91</span>
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    id="staff-mobile-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9862145780"
                    maxLength={10}
                    className="w-full pl-16 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 ml-1">
                  Used as unique staff ID for biometric/GPS punch.
                </p>
              </div>

              {/* Staff Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                  Staff Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="staff-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kh. Rajesh Singh"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Staff Designation */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Designation <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDesignation(!isCustomDesignation)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {isCustomDesignation ? 'Select from list' : '+ Custom designation'}
                  </button>
                </div>

                {!isCustomDesignation ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    </div>
                    <select
                      id="staff-designation-select"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      {COMMON_DESIGNATIONS.map((desig) => (
                        <option key={desig} value={desig} className="bg-slate-950 text-white">
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      id="staff-custom-designation-input"
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      placeholder="e.g. Assistant Project Officer"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-staff-registration-btn"
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Staff Member</span>
              </button>
            </form>
          </div>

          {/* Quick Notice */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1 backdrop-blur-sm">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[10px]">
              Official Verification Policy
            </span>
            <p>
              Only registered staff of Patsoi CD Block can mark attendance. The GPS geofence automatically matches staff location against official block office coordinates.
            </p>
          </div>
        </div>

        {/* Right Column: Registered Staff Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Registered Staff Directory
                </h2>
                <p className="text-xs text-slate-400">
                  Total {staffList.length} staff enrolled in Patsoi CD Block
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, mobile, designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* List */}
            {filteredStaff.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No staff found matching "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredStaff.map((staff) => {
                  const isSelected = staff.id === selectedStaffId;
                  return (
                    <div
                      key={staff.id}
                      className={`p-3.5 rounded-xl flex items-center justify-between gap-3 transition border ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner ${
                            staff.avatarColor || 'bg-indigo-600'
                          }`}
                        >
                          {staff.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {staff.name}
                            </h3>
                            {isSelected && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-indigo-300 truncate">{staff.designation}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            +91 {staff.mobile}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectStaff(staff)}
                          className={`text-xs px-3 py-2 rounded-xl font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <span>Select</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteStaff(staff.id)}
                          title="Remove Staff"
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition border border-transparent hover:border-rose-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
