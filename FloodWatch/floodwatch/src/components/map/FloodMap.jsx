import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useAppState } from '../../context/AppStateContext';
import POIMarkers from './POIMarkers';
import FloodOverlay from './FloodOverlay';
import FloodWarningMarkers from './FloodWarningMarkers';
import BridgeMarkers from './BridgeMarkers';
import InfrastructureLayer from './InfrastructureLayer';

export default function FloodMap() {
  const { activeLayers } = useAppState();
  const center = [45.75, 27.75]; 

  return (
    <div className="flex-1 relative bg-gray-900 z-0">
      <MapContainer 
        center={center} 
        zoom={11} 
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        
        {/* Layer 1: Current AI Detection (ONLY shows the raw detection heatmap) */}
        {activeLayers.aiDetection && <FloodOverlay />}

        {/* Layer 2: Future AI Prediction (Shows the Honeycomb Risk Nodes) */}
        {activeLayers.aiPrediction && <FloodWarningMarkers type="prediction" />}

        {/* Essential Services */}
        {activeLayers.emergencyServices && <POIMarkers />}
        
        {/* 🌟 Poduri și Treceri (Bridges & Crossings) */}
        {activeLayers.bridges && <BridgeMarkers />}

        {/* 🌟 Major Roads & Bridges (Bound to the transportRoutes toggle) */}
        {activeLayers.transportRoutes && <InfrastructureLayer />}
      </MapContainer>
    </div>
  );
}