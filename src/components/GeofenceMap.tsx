import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { OfficeConfig, GPSState } from '../types';

interface GeofenceMapProps {
  office: OfficeConfig;
  gps: GPSState;
  onRefreshGPS?: () => void;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({ office, gps, onRefreshGPS }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const officeMarkerRef = useRef<L.Marker | null>(null);
  const staffMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [office.latitude, office.longitude],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Office Div Icon
    const officeIcon = L.divIcon({
      className: 'custom-office-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-10 h-10 bg-indigo-900 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs">
            <svg class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="absolute -bottom-6 bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap">
            Patsoi CD Block Office
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Update or create Office Marker
    if (!officeMarkerRef.current) {
      officeMarkerRef.current = L.marker([office.latitude, office.longitude], {
        icon: officeIcon,
      }).addTo(map);
      officeMarkerRef.current.bindPopup(`<b>${office.officeName}</b><br>${office.locationDetails}`);
    } else {
      officeMarkerRef.current.setLatLng([office.latitude, office.longitude]);
    }

    // Update or create Geofence Circle
    const isInside = gps.isInsideGeofence;
    const circleColor = isInside ? '#059669' : '#dc2626';
    const fillColor = isInside ? '#10b981' : '#f87171';

    if (!geofenceCircleRef.current) {
      geofenceCircleRef.current = L.circle([office.latitude, office.longitude], {
        radius: office.geofenceRadiusMeters,
        color: circleColor,
        fillColor: fillColor,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);
    } else {
      geofenceCircleRef.current.setLatLng([office.latitude, office.longitude]);
      geofenceCircleRef.current.setRadius(office.geofenceRadiusMeters);
      geofenceCircleRef.current.setStyle({
        color: circleColor,
        fillColor: fillColor,
      });
    }

    // Update or create Staff Marker
    if (gps.latitude && gps.longitude) {
      const staffIcon = L.divIcon({
        className: 'custom-staff-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${isInside ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75"></span>
            <div class="w-8 h-8 ${isInside ? 'bg-emerald-600' : 'bg-rose-600'} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold z-10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="absolute -bottom-5 ${isInside ? 'bg-emerald-900 text-emerald-100' : 'bg-rose-900 text-rose-100'} text-[9px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
              ${isInside ? 'In Perimeter' : 'Outside'} (${gps.distanceToOffice ?? 0}m)
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!staffMarkerRef.current) {
        staffMarkerRef.current = L.marker([gps.latitude, gps.longitude], {
          icon: staffIcon,
        }).addTo(map);
      } else {
        staffMarkerRef.current.setLatLng([gps.latitude, gps.longitude]);
        staffMarkerRef.current.setIcon(staffIcon);
      }

      // Accuracy circle
      if (gps.accuracy) {
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle([gps.latitude, gps.longitude], {
            radius: Math.min(gps.accuracy, 100),
            color: '#3b82f6',
            fillColor: '#93c5fd',
            fillOpacity: 0.12,
            weight: 1,
          }).addTo(map);
        } else {
          accuracyCircleRef.current.setLatLng([gps.latitude, gps.longitude]);
          accuracyCircleRef.current.setRadius(Math.min(gps.accuracy, 100));
        }
      }

      // Line connecting staff to office
      if (!lineRef.current) {
        lineRef.current = L.polyline(
          [
            [office.latitude, office.longitude],
            [gps.latitude, gps.longitude],
          ],
          {
            color: isInside ? '#059669' : '#e11d48',
            weight: 2,
            dashArray: '5, 8',
            opacity: 0.8,
          }
        ).addTo(map);
      } else {
        lineRef.current.setLatLngs([
          [office.latitude, office.longitude],
          [gps.latitude, gps.longitude],
        ]);
        lineRef.current.setStyle({
          color: isInside ? '#059669' : '#e11d48',
        });
      }

      // Fit bounds if both points exist and distance is substantial
      if (gps.distanceToOffice && gps.distanceToOffice > office.geofenceRadiusMeters * 1.5) {
        const bounds = L.latLngBounds([
          [office.latitude, office.longitude],
          [gps.latitude, gps.longitude],
        ]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
      }
    }

    return () => {
      // Map cleanup on unmount
    };
  }, [office, gps]);

  // Clean up entire map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleCenterOffice = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([office.latitude, office.longitude], 17);
    }
  };

  const handleCenterStaff = () => {
    if (mapInstanceRef.current && gps.latitude && gps.longitude) {
      mapInstanceRef.current.setView([gps.latitude, gps.longitude], 18);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      {/* Top Map Floating Status Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 backdrop-blur px-3.5 py-1.5 rounded-xl shadow-lg border border-slate-800 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              gps.isInsideGeofence
                ? 'bg-emerald-400 animate-pulse'
                : gps.latitude
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-semibold text-white">
            {gps.isInsideGeofence
              ? `Within Geofence (${gps.distanceToOffice}m from Office)`
              : gps.distanceToOffice !== null
              ? `Outside Geofence (${gps.distanceToOffice}m away, limit ${office.geofenceRadiusMeters}m)`
              : 'Acquiring GPS Signal...'}
          </span>
          {gps.isSimulated && (
            <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/20 uppercase tracking-wider">
              Simulation
            </span>
          )}
        </div>

        {/* Quick Map Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/90 backdrop-blur p-1 rounded-xl shadow-lg border border-slate-800 text-slate-300">
          <button
            type="button"
            onClick={handleCenterOffice}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Focus Patsoi CD Block Office"
          >
            Office
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={handleCenterStaff}
            disabled={!gps.latitude}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition"
            title="Focus Staff Location"
          >
            My GPS
          </button>
          {onRefreshGPS && (
            <>
              <span className="text-slate-700">|</span>
              <button
                type="button"
                onClick={onRefreshGPS}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                title="Recalculate GPS"
              >
                Refresh
              </button>
            </>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />

      {/* Map Footer Legend */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-indigo-300 inline-block"></span>
            <span className="font-medium text-slate-300">Patsoi CD Block HQ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 bg-emerald-500/20 inline-block"></span>
            <span className="font-medium text-slate-300">Geofence Zone ({office.geofenceRadiusMeters}m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span className="font-medium text-slate-300">Staff Position</span>
          </div>
        </div>
        <div className="text-slate-500 font-mono text-[10px]">
          Office: {office.latitude.toFixed(4)}°N, {office.longitude.toFixed(4)}°E
        </div>
      </div>
    </div>
  );
};
