import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// 1. Define clean, crisp SVG paths for each service type
const hospitalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white"><path d="M7 4v16h3v-6.5h4V20h3V4h-3v6.5h-4V4H7z"/></svg>`;

const policeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`;

const fireSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a7.34 7.34 0 01-1.65-2.73c-.15-.43-.75-.41-.85.03-.23 1.1-.18 2.29.15 3.38.33 1.1.92 2.1 1.7 2.92 1.48 1.55 3.52 2.47 5.77 2.47 4.25 0 7.72-3.4 7.72-7.6 0-1.25-.33-2.41-.84-3.52zM12 18.25c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

// 2. Wrap the SVGs in a styled Tailwind container
const createServiceIcon = (svgContent, bgColor) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.8)] ${bgColor}">
        ${svgContent}
      </div>
    `,
    className: '', // Prevents Leaflet's default white square background
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// 3. Map the facility types to their unique icons and colors
const getIconForType = (type) => {
  switch (type) {
    case 'hospital': 
      return createServiceIcon(hospitalSvg, 'bg-red-600');
    case 'fire_station': 
      return createServiceIcon(fireSvg, 'bg-orange-500');
    case 'police': 
      return createServiceIcon(policeSvg, 'bg-blue-600');
    default: 
      return createServiceIcon(hospitalSvg, 'bg-gray-500');
  }
};

export default function POIMarkers() {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetch('/emergency_services.geojson')
      .then((res) => {
        if (!res.ok) throw new Error("Emergency services GeoJSON not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.features) {
          const parsedFacilities = data.features.map((feature) => ({
            id: feature.id,
            name: feature.properties.name || "Unnamed Facility",
            type: feature.properties.amenity,
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1] 
          }));
          setFacilities(parsedFacilities);
        }
      })
      .catch((err) => console.error("Error loading emergency POIs:", err));
  }, []);

  if (facilities.length === 0) return null;

  return (
    <>
      {facilities.map((facility) => (
        <Marker 
          key={facility.id} 
          position={[facility.lat, facility.lng]} 
          icon={getIconForType(facility.type)}
        >
          <Popup className="font-sans rounded-xl">
            <div className="text-center p-1 min-w-[150px]">
              <strong className="text-gray-900 block border-b border-gray-200 pb-2 mb-2 text-sm leading-tight">
                {facility.name}
              </strong>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wider font-bold">
                {facility.type ? facility.type.replace('_', ' ') : 'Service'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}