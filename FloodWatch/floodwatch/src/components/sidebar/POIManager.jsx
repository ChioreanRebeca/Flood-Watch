import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function POIManager() {
  const { userPOIs } = useAppState();

  return (
    <div className="px-4 pb-4">
      <h3 className="font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-1">Points of Interest</h3>
      <ul className="space-y-2 mb-3">
        {userPOIs.map(poi => (
          <li key={poi.id} className="text-sm text-gray-400 flex items-center before:content-['•'] before:mr-2 before:text-blue-500">
            {poi.name}
          </li>
        ))}
      </ul>
      <button className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">+ Add a new Point of interest</button>
    </div>
  );
}