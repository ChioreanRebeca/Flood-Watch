import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function ReportIncidentCard({ closeSidebar }) {
  const {
    reportedIncidents,
    setReportedIncidents,
    reportingMode,
    setReportingMode,
    setAddingMode,
    setDraftReport,
  } = useAppState();

  const removeReport = (id) => {
    setReportedIncidents((prev) => prev.filter((inc) => inc.id !== id));
  };

  const handleToggleMode = () => {
    const nextReportingMode = !reportingMode;

    if (nextReportingMode) {
      // Do not allow POI add mode and incident report mode at the same time.
      setAddingMode(false);

      // Clear any previous unfinished draft location.
      setDraftReport(null);

      // On mobile, close the sidebar so it does not block map clicks.
      closeSidebar?.();
    }

    setReportingMode(nextReportingMode);
  };

  return (
    <div className="px-4 pb-4 mt-2 border-t border-gray-700 pt-4">
      <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
        <span>Crowdsourced Reports</span>
      </h3>

      <button
        onClick={handleToggleMode}
        className={`w-full py-2 rounded text-sm font-bold shadow-lg transition-colors mb-4 ${
          reportingMode
            ? 'bg-orange-900/50 text-orange-300 border border-orange-500/40'
            : 'bg-orange-600 hover:bg-orange-500 text-white'
        }`}
      >
        {reportingMode ? 'Click Map to Place Report' : 'Report Incident'}
      </button>

      {reportingMode && (
        <p className="text-xs text-orange-300 bg-orange-900/20 border border-orange-500/20 rounded p-2 mb-4">
          Select a point on the map. After you click, the incident form will open.
        </p>
      )}

      <ul className="space-y-3 mb-4 pr-1">
        {reportedIncidents.length === 0 && (
          <li className="text-xs text-gray-500 italic">
            No unverified incidents reported.
          </li>
        )}

        {reportedIncidents.map((incident) => (
          <li
            key={incident.id}
            className="bg-gray-900 border border-gray-700 rounded p-3"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {incident.type}
                </p>

                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {incident.details}
                </p>

                <p className="text-[10px] text-gray-500 font-mono mt-2">
                  {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)} ·{' '}
                  {incident.time}
                </p>
              </div>

              <button
                onClick={() => removeReport(incident.id)}
                className="text-gray-500 hover:text-red-400 transition-colors text-sm"
                aria-label="Remove incident report"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}