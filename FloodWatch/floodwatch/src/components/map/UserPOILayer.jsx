import React from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppState } from '../../context/AppStateContext';

// A nice custom star icon for user POIs
const createStarIcon = () => L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] text-lg hover:scale-110 transition-transform">⭐</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export default function UserPOILayer() {
  const { userPOIs, setUserPOIs, addingMode, setAddingMode } = useAppState();

  // Hook into Leaflet's map click event
  useMapEvents({
    click(e) {
      if (addingMode) {
        const newPOI = {
          id: Date.now(),
          name: "New Custom Location",
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        setUserPOIs((prev) => [...prev, newPOI]);
        setAddingMode(false); // Turn off adding mode after placing the pin
      }
    }
  });

  if (!userPOIs || userPOIs.length === 0) return null;

  return (
    <>
      {userPOIs.map((poi) => (
        <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={createStarIcon()}>
          <Popup className="font-sans rounded-xl">
            <div className="text-center p-1 min-w-[120px]">
              <strong className="text-gray-900 block border-b border-gray-200 pb-1 mb-1 text-sm">
                {poi.name}
              </strong>
              <span className="text-[10px] text-gray-500 font-mono">
                Lat: {poi.lat.toFixed(4)}, Lng: {poi.lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}