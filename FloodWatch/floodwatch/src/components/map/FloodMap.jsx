import React from 'react';
import { MapContainer, TileLayer, Pane } from 'react-leaflet';
import { useAppState } from '../../context/AppStateContext';
import POIMarkers from './POIMarkers';
import FloodOverlay from './FloodOverlay';
import FloodWarningMarkers from './FloodWarningMarkers';
import BridgeMarkers from './BridgeMarkers';
import InfrastructureLayer from './InfrastructureLayer';
import CityLimitsLayer from './CityLimitsLayer';
import LogisticsLayer from './LogisticsLayer';
import UserPOILayer from './UserPOILayer';
import ReportedIncidentsLayer from './ReportedIncidentsLayer'; // 🌟 NEW


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
        <Pane name="floodPane" style={{ zIndex: 410 }} />
        <Pane name="roadsPane" style={{ zIndex: 650 }} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        {activeLayers.aiDetection && <FloodOverlay pane="floodPane" />}
        {activeLayers.aiPrediction && <FloodWarningMarkers type="prediction" pane="floodPane" />}

        {activeLayers.transportRoutes && <InfrastructureLayer pane="roadsPane" />}

        {activeLayers.emergencyServices && <POIMarkers />}
        {activeLayers.bridges && <BridgeMarkers />}
        {activeLayers.villageLimits && <CityLimitsLayer />}
        {activeLayers.infrastructure && <LogisticsLayer />}

        <UserPOILayer />
    </MapContainer>
    </div>
  );
}