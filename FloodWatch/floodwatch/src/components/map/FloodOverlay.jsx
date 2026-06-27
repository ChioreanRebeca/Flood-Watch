import React from 'react';
import { ImageOverlay } from 'react-leaflet';
import { useAppState } from '../../context/AppStateContext';

export default function FloodOverlay() {
  const { activeLayers } = useAppState();

  // Don't render anything if the checkbox is off
  if (!activeLayers.aiDetection) return null;

  // The exact coordinates from your Python script!
  const galatiBounds = [
    [45.24993749166853, 27.199998656326578], // South-West
    [46.251379370404976, 28.300075553259344]  // North-East
  ];

  return (
    <ImageOverlay
      url="/Galati_Flood_Overlay.png"
      bounds={galatiBounds}
      opacity={0.7} // 70% opacity so we can see the roads underneath
      zIndex={10}
    />
  );
}