import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function IncidentCard({ 
  lastDetectionTime = "14 Sep, 02:30 AM", 
  lastPredictionTime = "14 Sep, 01:00 AM",
  isDetecting = false
}) {
  // 🌟 NEW: Pull the toggle function from context
  const { toggleLogsPanel } = useAppState();

  return (
    <div className="mx-4 bg-gray-700 rounded-md p-4 shadow-sm border border-gray-600 mb-6">
      <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-3 text-white">
        System Status
      </h3>
      
      <div className="space-y-3 text-sm">
        {/* AI Detection Info */}
        <div className="flex flex-col bg-gray-800 p-3 rounded border border-gray-600">
          <span className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-semibold">
            AI Flood Detection
          </span>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Last scan:</span>
            <span className="font-bold text-blue-400">{lastDetectionTime}</span>
          </div>
        </div>

        {/* Hydrological Model Info */}
        <div className="flex flex-col bg-gray-800 p-3 rounded border border-gray-600">
          <span className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-semibold">
            Hydrological Forecast
          </span>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Last predicted:</span>
            <span className="font-bold text-teal-400">{lastPredictionTime}</span>
          </div>
        </div>
        
        <p className="pt-1">
          <span className="text-gray-400">Monitoring status:</span>{' '}
          <span className="text-green-400 font-medium animate-pulse">● Active</span>
        </p>
      </div>

      <button 
        disabled={isDetecting}
        className={`w-full mt-4 py-2 rounded transition-colors font-medium cursor-pointer ${
          isDetecting 
            ? 'bg-blue-800 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {isDetecting ? 'Running scan...' : 'Run Manual Detection'}
      </button>

      {/* 🌟 ADDED onClick handler here */}
      <button 
        onClick={toggleLogsPanel}
        className="w-full mt-2 text-gray-400 hover:text-white py-1 text-sm transition-colors cursor-pointer"
      >
        View detailed logs
      </button>
    </div>
  );
}