import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function ReportIncidentCard() {
  const { 
    reportedIncidents, setReportedIncidents, 
    reportingMode, setReportingMode, 
    setAddingMode 
  } = useAppState();

  const removeReport = (id) => {
    setReportedIncidents(prev => prev.filter(inc => inc.id !== id));
  };

  const handleToggleMode = () => {
    if (!reportingMode) {
      setAddingMode(false);
    }
    setReportingMode(!reportingMode);
  };

  return (
    <div className="px-4 pb-4 mt-2 border-t border-gray-700 pt-4">
      <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
        <span>Crowdsourced Reports</span>
      </h3>
      
      <ul className="space-y-3 mb-4 pr-1">
        {reportedIncidents.length === 0 && (
          <li className="text-xs text-gray-500 italic">No unverified incidents reported.</li>
        )}
        {reportedIncidents.map(inc => (
          <li key={inc.id} className="bg-gray-800 p-2.5 rounded border border-orange-500/30 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-200 font-bold">{inc.type}</span>
              <button 
                onClick={() => removeReport(inc.id)} 
                className="text-[10px] font-semibold bg-red-900/40 px-1.5 py-0.5 rounded text-red-400 hover:bg-red-800/60 transition-colors"
              >
                Hide
              </button>
            </div>
            
            <p className="text-xs text-gray-400 italic truncate border-l-2 border-orange-500 pl-2">
              "{inc.details}"
            </p>

            <span className="text-[10px] text-gray-500 font-mono">
              Lat: {inc.lat.toFixed(4)} | Lng: {inc.lng.toFixed(4)}
            </span>
          </li>
        ))}
      </ul>

      <button 
        onClick={handleToggleMode}
        className={`w-full py-2 text-sm rounded transition-colors font-medium ${
          reportingMode 
            ? 'bg-orange-600 text-white animate-pulse shadow-lg border border-orange-500' 
            : 'border border-orange-500 text-orange-400 hover:bg-orange-900/30'
        }`}
      >
        {reportingMode ? "Click on map to place alert..." : " Report Incident"}
      </button>
    </div>
  );
}