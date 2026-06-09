import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

// 1. CSS Hexagon Cluster Generator (The Honeycomb)
const createHexCluster = (cluster) => {
  const count = cluster.getChildCount();
  
  // If the cluster has many points, it's a Red Extreme danger zone. Otherwise, Yellow Warning.
  const isExtreme = count > 15; 
  const bgColor = isExtreme ? 'bg-red-500' : 'bg-yellow-500';
  const pulseColor = isExtreme ? 'bg-red-500' : 'bg-yellow-500';

  const html = `
    <div class="relative flex items-center justify-center w-12 h-12">
      <div style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);" 
           class="absolute w-full h-full ${pulseColor} opacity-40 animate-ping"></div>
      
      <div style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);" 
           class="absolute w-10 h-10 ${bgColor} flex items-center justify-center shadow-2xl border border-white">
        <span class="text-white font-bold text-sm drop-shadow-md">${count}</span>
      </div>
    </div>
  `;

  return L.divIcon({ html, className: '', iconSize: [48, 48], iconAnchor: [24, 24] });
};

// 2. Individual Point Icons (When Zoomed In)
const createNodeIcon = (severity) => {
  const colorClass = severity === 'extreme' ? 'bg-red-500' : 'bg-yellow-500';
  return L.divIcon({
    html: `
      <div class="w-4 h-4 ${colorClass} rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>
    `,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function FloodWarningMarkers({ type }) {
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch 'detection.geojson' or 'prediction.geojson' based on the `type` prop
    fetch('/flood_warnings-80.geojson')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.features) {
          const points = data.features.map((f, index) => ({
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
            // Mocking severity so you can see both Yellow and Red right away
            severity: index % 3 === 0 ? 'extreme' : 'warning'
          }));
          setWarnings(points);
        }
      })
      .catch((err) => console.error(err));
  }, [type]);

  if (warnings.length === 0) return null;

  return (
    <MarkerClusterGroup 
      chunkedLoading 
      iconCreateFunction={createHexCluster} 
      maxClusterRadius={60}
      disableClusteringAtZoom={13} // Breaks into detailed nodes when you zoom in close
    >
      {warnings.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={createNodeIcon(point.severity)}>
          
          {/* Google Flood Hub Style Intelligence Card */}
          <Popup className="rounded-xl overflow-hidden" minWidth={260}>
            <div className="font-sans -m-1">
              <div className={`${point.severity === 'extreme' ? 'bg-red-600' : 'bg-yellow-500'} text-white px-4 py-2 flex justify-between items-center`}>
                <span className="font-bold text-xs uppercase tracking-wider">
                  {point.severity === 'extreme' ? 'Extreme Danger' : 'Moderate Warning'}
                </span>
                <span>⚠️</span>
              </div>
              <div className="p-4 bg-white">
                <h4 className="text-gray-900 font-bold text-lg leading-tight mb-1">
                  {type === 'prediction' ? 'Forecasted Inundation' : 'Active Flood Zone'}
                </h4>
                <p className="text-gray-500 text-xs font-mono mb-4">
                  {point.lat.toFixed(4)}°N, {point.lng.toFixed(4)}°E
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Model Confidence:</span>
                    <span className="text-gray-900 font-bold">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Water Trend:</span>
                    <span className={point.severity === 'extreme' ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>
                      {point.severity === 'extreme' ? 'Rising Rapidly 📈' : 'Stable ➖'}
                    </span>
                  </div>
                </div>
                <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-md text-sm font-bold transition-colors">
                  View Basin Analytics
                </button>
              </div>
            </div>
          </Popup>

        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}