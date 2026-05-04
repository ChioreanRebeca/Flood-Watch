import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function Header() {
  const { isMenuVisible } = useAppState();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shadow-sm z-10 relative">
      <h1 className="text-xl font-bold tracking-wide text-blue-400">FloodWatch</h1>
      {isMenuVisible && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 px-3 py-1 rounded-full border border-red-500/30">
          <span className="animate-pulse flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm font-semibold">1 Incident Detected</span>
        </div>
      )}
    </header>
  );
}