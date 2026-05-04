import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon configuration for Emergency Services[cite: 1]
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mockFacilities = [
  { id: 1, name: "Hospital", lat: 45.77, lng: 27.96, icon: createIcon('red') },
  { id: 2, name: "Fire Station", lat: 45.75, lng: 27.99, icon: createIcon('orange') },
  { id: 3, name: "Police Station", lat: 45.76, lng: 28.02, icon: createIcon('blue') }
];

export default function POIMarkers() {
  return (
    <>
      {mockFacilities.map(facility => (
        <Marker key={facility.id} position={[facility.lat, facility.lng]} icon={facility.icon}>
          <Popup>
            <strong className="text-gray-900">{facility.name}</strong>
          </Popup>
        </Marker>
      ))}
    </>
  );
}