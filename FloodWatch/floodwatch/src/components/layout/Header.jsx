import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import FloodWatchLogo from './FloodWatchLogo'; // 🌟 Import the new logo

export default function Header({ toggleSidebar }) {
  const { isMenuVisible, toggleIncidentPanel, incidents } = useAppState();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-gray-800 border-b border-gray-700 shadow-sm z-10 relative">
      
      {/* 🌟 Added Logo next to the Title and Mobile Menu Button */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button (Mobile Only) */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-1 mr-1 text-gray-400 hover:text-white focus:outline-none transition-colors"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <FloodWatchLogo className="w-8 h-8 hidden sm:block" />
        <h1 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          FloodWatch
        </h1>
      </div>

      {isMenuVisible && incidents.length > 0 && (
        <button 
          onClick={toggleIncidentPanel}
          className="flex items-center space-x-2 text-red-400 bg-red-900/20 px-3 py-1 rounded-full border border-red-500/30 hover:bg-red-900/40 transition-colors cursor-pointer shadow-sm"
        >
          <span className="animate-pulse flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-none">
            {incidents.length} Incidents <span className="hidden sm:inline">Detected</span>
          </span>
        </button>
      )}
    </header>
  );
}