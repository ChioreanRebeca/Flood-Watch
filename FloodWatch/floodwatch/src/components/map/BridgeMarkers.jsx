import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Icon SVG modern pentru poduri / treceri
const bridgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white"><path d="M21 15v-4a2 2 0 0 0-2-2h-3V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v4H2v2h20v-2h-1zm-9-6h4v4h-4V9zm-6 4V9h4v4H6z"/></svg>`;

// Creăm designul pin-ului (folosim violet pentru infrastructură)
const bridgeIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 rounded border-2 border-white bg-indigo-600 shadow-[0_0_8px_rgba(0,0,0,0.8)]">
      ${bridgeSvg}
    </div>
  `,
  className: '', 
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export default function BridgeMarkers() {
  const [bridges, setBridges] = useState([]);

  useEffect(() => {
    fetch('/bridges.geojson')
      .then((res) => {
        if (!res.ok) throw new Error("Bridges GeoJSON not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.features) {
          const parsedBridges = data.features.map((feature) => ({
            id: feature.properties.id,
            name: feature.properties.name || "Pod Nespecificat",
            type: feature.properties.type,
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1] 
          }));
          setBridges(parsedBridges);
        }
      })
      .catch((err) => console.error("Error loading bridges:", err));
  }, []);

  if (bridges.length === 0) return null;

  return (
    <>
      {bridges.map((bridge) => (
        <Marker 
          key={bridge.id} 
          position={[bridge.lat, bridge.lng]} 
          icon={bridgeIcon}
        >
          <Popup className="font-sans rounded-xl">
            <div className="text-center p-1 min-w-[150px]">
              <strong className="text-indigo-900 block border-b border-gray-200 pb-2 mb-2 text-sm leading-tight">
                {bridge.name}
              </strong>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded uppercase tracking-wider font-bold">
                Infrastructură Critică
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}