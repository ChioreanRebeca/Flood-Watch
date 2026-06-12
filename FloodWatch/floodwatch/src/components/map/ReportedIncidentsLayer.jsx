import React from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppState } from '../../context/AppStateContext';

const hazardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`;

const createHazardIcon = () => L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-[0_0_10px_rgba(249,115,22,0.8)] hover:scale-110 transition-transform animate-bounce">${hazardSvg}</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export default function ReportedIncidentsLayer() {
  const { 
    reportedIncidents, 
    reportingMode, setReportingMode,
    setDraftReport // 🌟 NEW
  } = useAppState();

  useMapEvents({
    click(e) {
      if (reportingMode) {
        // 🌟 CHANGED: Temporarily hold coordinates to trigger the modal
        setDraftReport({ lat: e.latlng.lat, lng: e.latlng.lng });
        setReportingMode(false);
      }
    }
  });

  if (!reportedIncidents || reportedIncidents.length === 0) return null;

  return (
    <>
      {reportedIncidents.map((inc) => (
        <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={createHazardIcon()}>
          <Popup className="font-sans rounded-xl">
            <div className="p-2 min-w-[200px]">
              <div className="bg-orange-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded mb-2 inline-block">
                User Reported
              </div>
              <strong className="text-gray-900 block text-sm mb-1 leading-tight">
                {inc.type} {/* 🌟 NEW: Show selected type */}
              </strong>
              
              <div className="bg-orange-50 p-2 rounded text-xs text-gray-700 italic border border-orange-100 mb-2">
                "{inc.details}" {/* 🌟 NEW: Show user details */}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-200 pt-2 mt-1">
                <span>{inc.time}</span>
                <span className="font-mono">
                  {inc.lat.toFixed(4)}, {inc.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}