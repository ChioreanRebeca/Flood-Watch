import React from 'react';
import CriticalAlert from '../sidebar/CriticalAlert';
import IncidentCard from '../sidebar/IncidentCard';
import LayerToggles from '../sidebar/LayerToggles';
import POIManager from '../sidebar/POIManager';
import ReportIncidentCard from '../sidebar/ReportIncidentCard'; // 🌟 NEW

export default function Sidebar({ isOpen, closeSidebar }) {
  return (
    <aside className={`
      absolute md:relative z-30 h-full w-80 bg-gray-800 border-r border-gray-700 shadow-xl scrollbar-thin
      transform transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      
      {/* Mobile Close Button Header */}
      <div className="md:hidden flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-900/50">
        <span className="text-gray-300 font-semibold tracking-wide">Menu</span>
        <button 
          onClick={closeSidebar} 
          className="text-gray-400 hover:text-white p-1 bg-gray-800 rounded-md border border-gray-700"
          aria-label="Close Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-12 flex flex-col gap-2">
        <CriticalAlert />
        <IncidentCard />
        <LayerToggles />
        <POIManager />
        <ReportIncidentCard /> {/* 🌟 NEW */}
      </div>
    </aside>
  );
}