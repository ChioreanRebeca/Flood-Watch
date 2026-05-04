import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useAppState } from '../../context/AppStateContext';
import POIMarkers from './POIMarkers';
import FloodOverlay from './FloodOverlay';

export default function FloodMap() {
  const { activeLayers } = useAppState();
  
const center = [45.75, 27.75]; // Rough center of Galati County

  return (
    <div className="flex-1 relative bg-gray-900 z-0">
      <MapContainer center={center} zoom={11} className="w-full h-full">
        {/* Dark Mode CartoDB Map Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Render Flood Detection AI Output */}
        <FloodOverlay />

        {/* Render Emergency Services if toggled on[cite: 1] */}
        {activeLayers.emergencyServices && <POIMarkers />}
      </MapContainer>
    </div>
  );
}