import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// 1. Define SVGs for the UI
const powerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd" /></svg>`;
const waterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path d="M11.584 2.376a.75.75 0 01.832 0c2.829 1.883 7.084 5.378 7.084 10.124a7.5 7.5 0 01-15 0c0-4.746 4.255-8.241 7.084-10.124zM8.5 13.5a3.5 3.5 0 005.188 3.084.75.75 0 10-.776-1.297 2 2 0 01-2.912-1.787.75.75 0 00-1.5 0z" /></svg>`;
const transitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" /></svg>`;
const fuelSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 011.5 0v2.25c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V15.75a.75.75 0 011.5 0v2.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V15.75z" clip-rule="evenodd" /></svg>`;
const telecomSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path fill-rule="evenodd" d="M10.5 4.5a3 3 0 116 0 3 3 0 01-6 0zm-1.873 5.485a.75.75 0 01.996-.282 6.5 6.5 0 013.377 3.377.75.75 0 01-1.35.64 5 5 0 00-2.598-2.598.75.75 0 01-.425-1.137zm-2.828-2.828a.75.75 0 011.06 0 10.5 10.5 0 015.657 5.657.75.75 0 01-1.298.752 9 9 0 00-4.849-4.849.75.75 0 010-1.56h-.57z" clip-rule="evenodd" /></svg>`;
const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`;

// 2. Wrap SVGs in styled containers
const createAssetIcon = (svg, bgColor) => L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-lg border border-white shadow-lg ${bgColor} hover:scale-110 transition-transform">${svg}</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// 3. Map the calculated category to the actual CSS design
const getIcon = (type) => {
  switch (type) {
    case 'power': return createAssetIcon(powerSvg, 'bg-yellow-500');
    case 'water': return createAssetIcon(waterSvg, 'bg-cyan-500');
    case 'transit': return createAssetIcon(transitSvg, 'bg-slate-600');
    case 'fuel': return createAssetIcon(fuelSvg, 'bg-rose-600');
    case 'telecom': return createAssetIcon(telecomSvg, 'bg-fuchsia-600');
    default: return createAssetIcon(defaultSvg, 'bg-gray-500');
  }
};

export default function LogisticsLayer() {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetch('/logistics.geojson')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.features) {
          const parsed = data.features.map((f) => {
            const props = f.properties || {};
            
            // 🌟 LOGIC GATE: Translate OpenStreetMap tags into our Dashboard Categories
            let category = 'unknown';
            if (props.power) category = 'power';
            else if (props.man_made === 'water_works' || props.man_made === 'wastewater_plant') category = 'water';
            else if (props.building === 'train_station' || props.amenity === 'bus_station') category = 'transit';
            else if (props.amenity === 'fuel') category = 'fuel';
            else if (props.man_made === 'communications_tower') category = 'telecom';

            // Resolve a human-readable name, falling back to the operator or category name
            const name = props.name || props.operator || `${category.toUpperCase()} Infrastructure`;

            return {
              id: f.id || Math.random().toString(),
              name: name,
              type: category,
              // Overpass center coordinates are stored slightly differently depending on the geometry
              lng: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1] 
            };
          });
          
          setFacilities(parsed);
        }
      });
  }, []);

  if (facilities.length === 0) return null;

  return (
    <>
      {facilities.map((fac) => (
        <Marker key={fac.id} position={[fac.lat, fac.lng]} icon={getIcon(fac.type)}>
          <Popup className="font-sans rounded-xl shadow-2xl overflow-hidden">
            <div className="min-w-[160px] -m-1">
               {/* Color-matched Header */}
              <div className={`px-3 py-1.5 text-white font-bold text-[10px] uppercase tracking-wider ${getIcon(fac.type).options.html.match(/bg-[a-z]+-[0-9]+/)[0]}`}>
                {fac.type} Hub
              </div>
              
              <div className="p-3 bg-white text-center">
                <strong className="text-gray-900 block text-sm leading-tight">
                  {fac.name}
                </strong>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}