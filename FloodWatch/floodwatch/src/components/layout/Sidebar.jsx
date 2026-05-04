import React from 'react';
import CriticalAlert from '../sidebar/CriticalAlert';
import IncidentCard from '../sidebar/IncidentCard';
import LayerToggles from '../sidebar/LayerToggles';
import POIManager from '../sidebar/POIManager';

export default function Sidebar() {
  return (
    <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col shadow-xl z-10 relative">
      <CriticalAlert />
      <IncidentCard />
      <LayerToggles />
      <POIManager />
    </aside>
  );
}