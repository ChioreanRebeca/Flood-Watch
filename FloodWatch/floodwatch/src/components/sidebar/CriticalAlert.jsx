import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';

// Native Ray-Casting algorithm to check if a point [lng, lat] is inside a polygon ring
const isPointInRing = (pt, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
                       (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Check if a point is inside a GeoJSON Feature (handles both standard and MultiPolygons)
const isPointInFeature = (pt, feature) => {
  const geom = feature.geometry;
  if (!geom) return false;
  if (geom.type === 'Polygon') {
    return isPointInRing(pt, geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (let poly of geom.coordinates) {
      if (isPointInRing(pt, poly[0])) return true;
    }
  }
  return false;
};

export default function CriticalAlert() {
  const { userPOIs, incidents } = useAppState();
  const [villageLimits, setVillageLimits] = useState(null);

  // Fetch the GeoJSON limits just like the map layers do
  useEffect(() => {
    fetch('/village_limits.geojson')
      .then(res => res.ok ? res.json() : null)
      .then(data => setVillageLimits(data))
      .catch(err => console.error("Error fetching village limits for alerts:", err));
  }, []);

  const affectedPOIs = useMemo(() => {
    if (!villageLimits || !villageLimits.features) return [];
    
    const matches = [];
    userPOIs.forEach(poi => {
      const poiPt = [poi.lng, poi.lat];
      
      // Step 1: Find which specific village/city limit the POI is physically inside
      const homeVillage = villageLimits.features.find(f => isPointInFeature(poiPt, f));
      
      if (homeVillage) {
        // Fallback for Romanian GeoJSON standard property names
        const villageName = homeVillage.properties?.name || homeVillage.properties?.NATLEVNAME || "the affected area";

        // Step 2: Check if any incident coordinate is ALSO inside that EXACT same village feature
        incidents.forEach(incident => {
          const match = incident.coordinates.match(/Lat:\s*([\d.]+),\s*Lng:\s*([\d.]+)/);
          if (match) {
            const incLat = parseFloat(match[1]);
            const incLng = parseFloat(match[2]);
            const incPt = [incLng, incLat];
            
            if (isPointInFeature(incPt, homeVillage)) {
               // Ensure we don't duplicate alerts if multiple points hit
               if (!matches.some(m => m.poi.id === poi.id && m.incident.id === incident.id)) {
                  matches.push({ poi, incident, villageName });
               }
            }
          }
        });
      }
    });
    return matches;
  }, [userPOIs, incidents, villageLimits]);

  // Hide the alert completely if the user's POI is safely outside an active village incident
  if (affectedPOIs.length === 0) return null;

  // Helper function to map severity to tailwind color themes matching the incident panel
  const getSeverityTheme = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical':
        return {
          bar: 'bg-purple-500',
          badge: 'bg-purple-900/50 text-purple-400 border border-purple-500/30'
        };
      case 'extreme':
        return {
          bar: 'bg-red-500',
          badge: 'bg-red-900/50 text-red-400 border border-red-500/30'
        };
      case 'high':
      default:
        return {
          bar: 'bg-yellow-500',
          badge: 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
        };
    }
  };

  return (
    <div className="space-y-4 m-4">
      {affectedPOIs.map(({ poi, incident, villageName }, idx) => {
        const theme = getSeverityTheme(incident.severity);
        
        return (
          <div 
            key={idx} 
            className="bg-gray-900 p-4 rounded border border-gray-700 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4"
          >
            {/* Visual severity indicator on the left edge */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bar}`}></div>
            
            <div className="pl-2">
              <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-2">
                <div>
                  <h3 className="font-bold text-gray-200 text-sm flex items-center mb-1">
                    <span className={`mr-2 animate-pulse h-2 w-2 rounded-full ${theme.bar}`}></span>
                    RISK DETECTED
                  </h3>
                  <span className="text-xs text-gray-400 leading-tight block">
                    <strong className="text-gray-200">{poi.name}</strong> is within <span className="underline decoration-gray-500 underline-offset-2">{villageName}</span>
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shrink-0 ${theme.badge}`}>
                  {incident.severity}
                </span>
              </div>

              <div className="flex flex-col gap-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500">Threat Source:</span> 
                  <span className="font-semibold text-gray-300">{incident.location}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Detected at:</span> 
                  <span className="font-semibold text-gray-300">{incident.time}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}