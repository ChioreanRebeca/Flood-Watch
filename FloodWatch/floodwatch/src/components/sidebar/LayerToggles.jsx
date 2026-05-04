import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function LayerToggles() {
  const { activeLayers, toggleLayer } = useAppState();

  const layers = [
    // We added the AI Detection layer right here at the top!
    { id: 'aiDetection', label: 'AI Flood Detection (Galati)' },
    { id: 'infrastructure', label: 'Infrastructure & Logistics' },
    { id: 'villageLimits', label: 'Village & City Limits' },
    { id: 'bridges', label: 'Bridges & Crossings' },
    { id: 'transportRoutes', label: 'Main Transport Routes' },
    { id: 'emergencyServices', label: 'Emergency Services' }
  ];

  return (
    <div className="px-4 pb-4">
      <h3 className="font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-1">Detection Output Layers</h3>
      <div className="space-y-2">
        {layers.map(layer => (
          <label key={layer.id} className="flex items-center space-x-3 text-sm text-gray-400 cursor-pointer hover:text-gray-200 transition-colors">
            <input 
              type="checkbox" 
              className="form-checkbox h-4 w-4 text-blue-500 bg-gray-900 border-gray-600 rounded"
              // If the id is 'aiDetection', make it bold and blue so it stands out
              checked={activeLayers[layer.id]}
              onChange={() => toggleLayer(layer.id)}
            />
            <span className={layer.id === 'aiDetection' ? 'font-bold text-blue-400' : ''}>
              {layer.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}