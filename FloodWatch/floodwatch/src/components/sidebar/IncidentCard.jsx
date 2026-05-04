import React from 'react';

export default function IncidentCard() {
  return (
    <div className="mx-4 bg-gray-700 rounded-md p-4 shadow-sm border border-gray-600 mb-6">
      <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-3">Incident Report</h3>
      <div className="space-y-2 text-sm">
        <p><span className="text-gray-400">Location:</span> Cudalbi Village</p>
        <p><span className="text-gray-400">Active rainfall:</span> 16.3 mm</p>
        <div className="flex justify-between items-center mt-2 p-2 bg-gray-800 rounded">
          <span className="text-gray-400">Inundation prediction score:</span>
          <span className="font-bold text-red-400">67 (high probability)</span>
        </div>
        <p><span className="text-gray-400">Region affected:</span> 12km</p>
      </div>
      <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors font-medium cursor-pointer">
        Run detection
      </button>
      <button className="w-full mt-2 text-gray-400 hover:text-white py-1 text-sm transition-colors cursor-pointer">
        More
      </button>
    </div>
  );
}