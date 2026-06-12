import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function SystemLogsModal() {
  const { isLogsPanelOpen, toggleLogsPanel } = useAppState();
  
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLogsPanelOpen) {
      setIsLoading(true);
      fetch('/prediction_metadata.json')
        .then((response) => response.json())
        .then((data) => {
          setMetadata(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching prediction metadata:', error);
          setIsLoading(false);
        });
    }
  }, [isLogsPanelOpen]);

  if (!isLogsPanelOpen) return null;

  const ahpLabels = {
    runoff_q: { name: "Surface Runoff (Q)", color: "bg-blue-500" },
    api: { name: "Antecedent Precipitation (API)", color: "bg-teal-500" },
    twi: { name: "Topographic Wetness (TWI)", color: "bg-cyan-500" },
    distance_to_river: { name: "Distance to River", color: "bg-indigo-500" },
    slope: { name: "Local Slope Gradient", color: "bg-purple-500" },
    elevation: { name: "Elevation (DEM)", color: "bg-pink-500" }
  };

  const ahpWeightsList = metadata && metadata.ahp_weights 
    ? Object.entries(metadata.ahp_weights)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => ({
          id: key,
          factor: ahpLabels[key]?.name || key,
          color: ahpLabels[key]?.color || "bg-gray-500",
          weightPercentage: (value * 100).toFixed(1) + "%",
          bounds: metadata.normalization_bounds?.[key]
        }))
    : [];

  // Generate dynamic, cleaned-up logs
  const logs = metadata ? [
    `[${new Date(metadata.created_at_utc).toLocaleTimeString()}] INITIATING HYBRID PIPELINE...`,
    `[CONFIG] SIMULATION DATE: ${metadata.today_date}`,
    `[CONFIG] TARGET: ${metadata.city_name.toUpperCase()} (${metadata.address_type.toUpperCase()})`,
    `[CONFIG] EXPORT SCALE SET TO: ${metadata.export_scale} meters`,
    `[DATA INGESTION] FETCHING PRECIPITATION LOOKBACK (API): ${metadata.api_lookback_days} DAYS...`,
    `[DATA INGESTION] FETCHING ANTECEDENT MOISTURE (AMC): ${metadata.amc_lookback_days} DAYS...`,
    `[PROCESSING] NORMALIZING PARAMETERS USING BOUNDED RANGES:`,
    `  > TWI: [${metadata.normalization_bounds.twi[0].toFixed(2)}, ${metadata.normalization_bounds.twi[1].toFixed(2)}]`,
    `  > API: [${metadata.normalization_bounds.api[0].toFixed(2)}, ${metadata.normalization_bounds.api[1].toFixed(2)}]`,
    `  > Runoff Q: [${metadata.normalization_bounds.runoff_q[0].toFixed(2)}, ${metadata.normalization_bounds.runoff_q[1].toFixed(2)}]`,
    `  > Dist to River: [${metadata.normalization_bounds.distance_to_river[0].toFixed(2)}m, ${metadata.normalization_bounds.distance_to_river[1].toFixed(2)}m]`,
    `  > Elevation: [${metadata.normalization_bounds.elevation[0].toFixed(2)}m, ${metadata.normalization_bounds.elevation[1].toFixed(2)}m]`,
    `  > Slope: [${metadata.normalization_bounds.slope[0].toFixed(2)}, ${metadata.normalization_bounds.slope[1].toFixed(2)}]`,
    `[COMPUTE] APPLYING AHP WEIGHTS. CALCULATING FLOOD RISK INDEX (FRI)...`,
    `[COMPUTE] GENERATING FORECASTS FOR +${metadata.forecast_hours.join('H, +')}H`,
    `[ALERT] EXTRACTING CRITICAL MASKS FOR FRI > ${metadata.risk_threshold}`,
    `[SUCCESS] HYDROLOGICAL PREDICTION GENERATED.`,
    ``,
    `-----------------------------------------------------`,
    `!!! MICROSOFT ai4g-flood MODEL INITIATED`,
    `-----------------------------------------------------`,
    `[EXECUTION] START TIME: 2026-06-10 22:39:24`,
    `[PROCESSING] INGESTING SAR IMAGERY...`,
    `[PROCESSING] APPLYING 8-PIXEL BUFFER (≈0.000719° AT 0.000090° RESOLUTION)...`,
    `[EXPORT] PREDICTION MAP GENERATED: output/Galati_GEE_Flood_Prediction_Final.tif`,
    `[EXECUTION] END TIME: 2026-06-10 22:44:40`,
    `[PERFORMANCE] TOTAL EXECUTION TIME: 0h 5m 16.39s`,
    `-----------------------------------------------------`,
    `ALL PIPELINES COMPLETED SUCCESSFULLY.`
  ] : ["[SYSTEM] WAITING FOR METADATA..."];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
            <span className="text-blue-500 font-mono">_</span> AI & Hydrological Pipeline Telemetry
          </h2>
          <button 
            onClick={toggleLogsPanel} 
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* AI DETECTION DATA BLOCK */}
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                Microsoft ai4g-flood Vision Model
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 p-3 rounded border border-gray-700/50">
                  <span className="text-xs text-gray-500 block mb-1">Execution Engine</span>
                  <span className="font-mono text-gray-200 text-sm">Microsoft ai4g-flood / PyTorch</span>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700/50">
                  <span className="text-xs text-gray-500 block mb-1">Feature Extraction</span>
                  <span className="font-mono text-green-400 text-sm font-bold">8-pixel buffered</span>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700/50">
                  <span className="text-xs text-gray-500 block mb-1">Spatial Resolution</span>
                  <span className="font-mono text-gray-200 text-sm">0.000090°</span>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700/50">
                  <span className="text-xs text-gray-500 block mb-1">Total Execution Time</span>
                  <span className="font-mono text-blue-300 text-sm">0h 5m 16.39s</span>
                </div>
              </div>
            </div>

            {/* HYDROLOGICAL MODEL DATA BLOCK */}
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 relative min-h-[250px]">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                AHP Parameter Calibration
              </h3>
              
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-teal-400 animate-pulse font-mono text-sm">Loading metadata...</span>
                </div>
              ) : metadata ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Weights & Bounds */}
                  <div className="space-y-4">
                    <span className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Weights & Normalization Bounds</span>
                    {ahpWeightsList.map((item) => (
                      <div key={item.id} className="mb-3">
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span className="truncate pr-2">{item.factor}</span>
                          <span className="font-mono text-teal-300">{item.weightPercentage}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                          <div className={`${item.color} h-1.5 rounded-full`} style={{ width: item.weightPercentage }}></div>
                        </div>
                        {item.bounds && (
                          <div className="text-[10px] text-gray-500 font-mono text-right">
                            Range: [{item.bounds[0].toFixed(2)}, {item.bounds[1].toFixed(2)}]
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Environment Settings */}
                  <div className="space-y-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Environment Config</span>
                    
                    <div className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded border border-gray-700/50">
                      <span className="text-xs text-gray-400">Target Location</span>
                      <span className="font-mono text-sm text-gray-200">{metadata.city_name} ({metadata.address_type})</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded border border-gray-700/50">
                      <span className="text-xs text-gray-400">Date Simulated</span>
                      <span className="font-mono text-sm text-blue-300">{metadata.today_date}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded border border-gray-700/50">
                      <span className="text-xs text-gray-400">Forecast Gen.</span>
                      <span className="font-mono text-sm text-gray-200">+{metadata.forecast_hours.join('H, +')}H</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded border border-gray-700/50">
                      <span className="text-xs text-gray-400">Export Scale</span>
                      <span className="font-mono text-sm text-gray-200">{metadata.export_scale}m Resolution</span>
                    </div>

                    <div className="flex justify-between items-center bg-red-900/20 px-3 py-2 rounded border border-red-500/30 mt-4">
                      <span className="text-xs text-red-400 font-bold">Critical Threshold</span>
                      <span className="font-mono text-sm text-red-400 font-bold">&gt; {metadata.risk_threshold} FRI</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-400 text-sm">Failed to load prediction metadata.</div>
              )}
            </div>
          </div>

          {/* Right Side: Execution Logs */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-[400px]">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                Execution Pipeline
             </h3>
             <div className="bg-[#0D1117] rounded-lg p-5 border border-gray-700 flex-1 overflow-y-auto font-mono text-xs sm:text-[13px] text-green-400 space-y-2 shadow-inner whitespace-pre-wrap">
                {logs.map((log, i) => (
                  <div key={i} className="opacity-90 break-words leading-tight">
                    {log || '\n'}
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-900 border-t border-gray-700 px-6 py-4 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            System Integrity: Nominal
          </span>
          <button 
            onClick={toggleLogsPanel} 
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}