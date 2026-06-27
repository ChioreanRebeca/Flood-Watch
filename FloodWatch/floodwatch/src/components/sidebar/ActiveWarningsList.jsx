import React, { useEffect, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function ActiveWarningsList() {
  const { activeLayers } = useAppState();
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetch('/flood_warnings.geojson')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.features) {
          // Extract top 5 points so the sidebar doesn't get massive
          const topPoints = data.features.slice(0, 5).map((f) => ({
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
          }));
          setWarnings(topPoints);
        }
      })
      .catch((err) => console.error("Error fetching warnings for sidebar:", err));
  }, []);

  // Only show this list if the AI Detection layer is toggled ON
  if (!activeLayers.aiDetection || warnings.length === 0) return null;

  return (
    <div className="px-4 mt-6 mb-4">
      <h3 className="font-semibold text-red-400 mb-3 border-b border-gray-600 pb-1 flex items-center justify-between">
        <span>Active AI Threat Nodes</span>
        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{warnings.length}+</span>
      </h3>
      <div className="space-y-3">
        {warnings.map((point, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-red-500/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-gray-200">Node {idx + 1}</span>
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">High Risk</span>
            </div>
            <span className="text-xs text-gray-400 font-mono block">
              Lat: {point.lat.toFixed(4)} | Lng: {point.lng.toFixed(4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}