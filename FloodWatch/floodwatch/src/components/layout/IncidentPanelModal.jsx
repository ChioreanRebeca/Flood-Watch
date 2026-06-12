import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function IncidentPanelModal() {
  const { isIncidentPanelOpen, toggleIncidentPanel, incidents } = useAppState();

  if (!isIncidentPanelOpen) return null;

  const handleDownload = () => {
    // Generate text dynamically based on the incidents array
    let reportContent = `=========================================\n`;
    reportContent += `      FLOODWATCH INCIDENT REPORT\n`;
    reportContent += `=========================================\n`;
    reportContent += `Date Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Total Active Incidents: ${incidents.length}\n\n`;

    incidents.forEach((inc, index) => {
      reportContent += `[INCIDENT ${index + 1}: ${inc.id}]\n`;
      reportContent += `- Location: ${inc.location}\n`;
      reportContent += `- Coordinates: ${inc.coordinates}\n`;
      reportContent += `- Time Detected: ${inc.time}\n`;
      reportContent += `- Severity: ${inc.severity}\n`;
      reportContent += `- Inundation Probability: ${inc.probability}%\n`;
      reportContent += `- Active Rainfall: ${inc.rainfall}\n\n`;
    });

    reportContent += `Action Recommended:\n`;
    reportContent += `Immediate monitoring of critical infrastructure in affected zones.\n`;
    reportContent += `Emergency response teams have been notified.\n`;
    reportContent += `=========================================\n`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FloodWatch_Report_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-900/30 border-b border-red-500/30 px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            Active Threat Nodes ({incidents.length})
          </h2>
          <button 
            onClick={toggleIncidentPanel} 
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin">
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Automated detection identified anomalous water levels exceeding threshold parameters in multiple sectors. Immediate monitoring and emergency response standby is advised.
          </p>

          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-gray-900 p-4 rounded border border-gray-700 shadow-sm relative overflow-hidden">
                {/* Visual severity indicator on the left edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  incident.severity === 'Critical' ? 'bg-purple-500' : 
                  incident.severity === 'Extreme' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                
                <div className="pl-2">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-2">
                    <div>
                      <h3 className="font-bold text-gray-200 text-lg">{incident.location}</h3>
                      <span className="text-xs text-gray-500 font-mono">{incident.id}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      incident.severity === 'Critical' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/30' : 
                      incident.severity === 'Extreme' ? 'bg-red-900/50 text-red-400 border border-red-500/30' : 
                      'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Detected:</span> 
                      <span className="font-semibold text-gray-300">{incident.time}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Rainfall:</span> 
                      <span className="font-semibold text-gray-300">{incident.rainfall}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Threat Level:</span> 
                      <span className={`${
                        incident.severity === 'Critical' ? 'text-purple-400' : 
                        incident.severity === 'Extreme' ? 'text-red-400' : 'text-yellow-400'
                      } font-bold`}>
                        {incident.probability}%
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Coords:</span> 
                      <span className="font-mono text-xs text-gray-400 mt-0.5">{incident.coordinates}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-end gap-3 shrink-0">
          <button 
            onClick={toggleIncidentPanel} 
            className="px-4 py-2 rounded text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close Panel
          </button>
          <button 
            onClick={handleDownload} 
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-bold shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            Download Report
          </button>
        </div>

      </div>
    </div>
  );
}