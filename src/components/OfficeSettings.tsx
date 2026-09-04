import React, { useState } from 'react';
import { Settings, MapPin, Radio, Check, RotateCcw, Crosshair, Building } from 'lucide-react';
import { OfficeConfig, GPSState } from '../types';
import { DEFAULT_OFFICE_CONFIG } from '../utils/geo';

interface OfficeSettingsProps {
  office: OfficeConfig;
  gps: GPSState;
  onUpdateOffice: (updated: OfficeConfig) => void;
}

export const OfficeSettings: React.FC<OfficeSettingsProps> = ({
  office,
  gps,
  onUpdateOffice,
}) => {
  const [formData, setFormData] = useState<OfficeConfig>({ ...office });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOffice(formData);
    setSaveMessage('Office coordinates & geofence parameters updated successfully.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_OFFICE_CONFIG });
    onUpdateOffice({ ...DEFAULT_OFFICE_CONFIG });
    setSaveMessage('Reset to Patsoi CD Block official default coordinates.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleSetCurrentLocationAsOffice = () => {
    if (gps.latitude && gps.longitude) {
      const updated = {
        ...formData,
        latitude: parseFloat(gps.latitude.toFixed(6)),
        longitude: parseFloat(gps.longitude.toFixed(6)),
      };
      setFormData(updated);
      onUpdateOffice(updated);
      setSaveMessage('Office location set to your current device GPS coordinates!');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Patsoi CD Block Office & Geofence Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Configure official coordinates, campus radius, and duty hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 font-bold uppercase tracking-wider"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="mt-4 p-3.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Office Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                Office Name
              </label>
              <input
                type="text"
                value={formData.officeName}
                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                Administrative Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
              Physical Location & Address
            </label>
            <input
              type="text"
              value={formData.locationDetails}
              onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
              className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* GPS Coordinates & Geofence Radius */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Geofence Boundary Coordinates</span>
              </span>

              {gps.latitude && (
                <button
                  type="button"
                  onClick={handleSetCurrentLocationAsOffice}
                  className="text-[11px] text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Calibrate to My Current Location</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Longitude (°E)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Geofence Radius (meters)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={20}
                    max={1000}
                    step={10}
                    value={formData.geofenceRadiusMeters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        geofenceRadiusMeters: parseInt(e.target.value, 10) || 100,
                      })
                    }
                    className="w-full text-xs px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs font-medium">
                    meters
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <Radio className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>
                Standard recommendation: 100m radius comfortably encompasses the BDO office main building, administrative block, and vehicle parking.
              </span>
            </div>
          </div>

          {/* Shift Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                Office Start Time (AM)
              </label>
              <input
                type="time"
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                Office Closing Time (PM)
              </label>
              <input
                type="time"
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-indigo-500/20 uppercase tracking-wider"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
