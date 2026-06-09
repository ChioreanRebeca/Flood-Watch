import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useAppState } from '../../context/AppStateContext';
import POIMarkers from './POIMarkers';
import FloodOverlay from './FloodOverlay';
import FloodWarningMarkers from './FloodWarningMarkers';
import BridgeMarkers from './BridgeMarkers';
import InfrastructureLayer from './InfrastructureLayer';
import CityLimitsLayer from './CityLimitsLayer';
import LogisticsLayer from './LogisticsLayer';

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

        {activeLayers.aiDetection && <FloodOverlay />}

        {activeLayers.aiPrediction && <FloodWarningMarkers type="prediction" />}

        {activeLayers.emergencyServices && <POIMarkers />}

        {activeLayers.bridges && <BridgeMarkers />}

        {activeLayers.transportRoutes && <InfrastructureLayer />}

        {activeLayers.villageLimits && <CityLimitsLayer />}


        {activeLayers.infrastructure && <LogisticsLayer />}

      </MapContainer>
    </div>
  );
}