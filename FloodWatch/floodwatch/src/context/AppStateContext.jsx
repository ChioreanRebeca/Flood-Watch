// import React, { createContext, useState, useContext } from 'react';

// const AppStateContext = createContext();

// export const AppStateProvider = ({ children }) => {
//   const [isMenuVisible, setIsMenuVisible] = useState(true);
  
//   const [isIncidentPanelOpen, setIsIncidentPanelOpen] = useState(false);
//   const toggleIncidentPanel = () => setIsIncidentPanelOpen(!isIncidentPanelOpen);

//   const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
//   const toggleLogsPanel = () => setIsLogsPanelOpen(!isLogsPanelOpen);

//   const [incidents, setIncidents] = useState([
//     {
//       id: "INC-001",
//       location: "Izvoarele Region",
//       time: "14 Sep, 00:45 AM",
//       severity: "Extreme",
//       probability: 85,
//       rainfall: "16.3 mm",
//       coordinates: "Lat: 45.54, Lng: 27.73"
//     },
//     {
//     id: "INC-002",
//     location: "Cudalbi Region",
//     time: "14 Sep, 00:45 AM",
//     severity: "High",
//     probability: 78,
//     rainfall: "14.2 mm",
//     coordinates: "Lat: 45.7718, Lng: 27.6965"
//   },
//   {
//     id: "INC-003",
//     location: "Pechea Region",
//     time: "14 Sep, 00:45 AM",
//     severity: "Critical",
//     probability: 92,
//     rainfall: "21.5 mm",
//     coordinates: "Lat: 45.62, Lng: 27.79"
//   }
//   ]);

//   const [activeLayers, setActiveLayers] = useState({
//     aiDetection: true,     
//     aiPrediction: false,   
//     emergencyServices: true,
//     infrastructure: true,
//     villageLimits: false,
//     bridges: false,
//     transportRoutes: false
//   });

//   const [userPOIs, setUserPOIs] = useState([
//     { id: 1, name: "Home", lat: 45.7532, lng: 27.6409 },
//     { id: 2, name: "Grandparents House", lat: 45.6712, lng: 27.7233 }
//   ]);

//   const [addingMode, setAddingMode] = useState(false);

//   const [reportedIncidents, setReportedIncidents] = useState([]);
//   const [reportingMode, setReportingMode] = useState(false);
  
//   // 🌟 NEW: Hold the coordinates temporarily before confirming the report
//   const [draftReport, setDraftReport] = useState(null);

//   const toggleLayer = (layerKey) => {
//     setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
//   };

//   return (
//     <AppStateContext.Provider value={{ 
//       isMenuVisible, setIsMenuVisible, 
//       activeLayers, toggleLayer, 
//       userPOIs, setUserPOIs,
//       addingMode, setAddingMode,
//       isIncidentPanelOpen, setIsIncidentPanelOpen, toggleIncidentPanel,
//       incidents, setIncidents,
//       isLogsPanelOpen, setIsLogsPanelOpen, toggleLogsPanel,
//       reportedIncidents, setReportedIncidents,
//       reportingMode, setReportingMode,
//       // 🌟 Export the new state
//       draftReport, setDraftReport
//     }}>
//       {children}
//     </AppStateContext.Provider>
//   );
// };

// export const useAppState = () => useContext(AppStateContext);


import React, { createContext, useState, useContext, useEffect } from 'react';

// --- SPATIAL MATH HELPERS (Point-in-Polygon) ---
// Native Ray-Casting algorithm to check if a point [lng, lat] is inside a polygon ring
const isPointInRing = (pt, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
                       (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Check if a point is inside a GeoJSON Feature (handles both standard and MultiPolygons)
const isPointInFeature = (pt, feature) => {
  const geom = feature.geometry;
  if (!geom) return false;
  if (geom.type === 'Polygon') {
    return isPointInRing(pt, geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (let poly of geom.coordinates) {
      if (isPointInRing(pt, poly[0])) return true;
    }
  }
  return false;
};
// -----------------------------------------------

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  
  const [isIncidentPanelOpen, setIsIncidentPanelOpen] = useState(false);
  const toggleIncidentPanel = () => setIsIncidentPanelOpen(!isIncidentPanelOpen);

  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
  const toggleLogsPanel = () => setIsLogsPanelOpen(!isLogsPanelOpen);

  const [incidents, setIncidents] = useState([]);

  const [activeLayers, setActiveLayers] = useState({
    aiDetection: true,     
    aiPrediction: false,   
    emergencyServices: true,
    infrastructure: true,
    villageLimits: false,
    bridges: false,
    transportRoutes: false
  });

  const [userPOIs, setUserPOIs] = useState([
    { id: 1, name: "Home", lat: 45.7532, lng: 27.6409 },
    { id: 2, name: "Grandparents House", lat: 45.6712, lng: 27.7233 }
  ]);

  const [addingMode, setAddingMode] = useState(false);
  const [reportedIncidents, setReportedIncidents] = useState([]);
  const [reportingMode, setReportingMode] = useState(false);
  const [draftReport, setDraftReport] = useState(null);

  // 🌟 Fetch BOTH the Algorithmic Predictions AND the Village Limits simultaneously
  useEffect(() => {
    Promise.all([
      fetch('/flood_warnings.geojson').then((res) => (res.ok ? res.json() : null)),
      fetch('/village_limits.geojson').then((res) => (res.ok ? res.json() : null))
    ])
      .then(([warningsData, villageData]) => {
        let algoIncidents = [];
        
        if (warningsData && warningsData.features) {
          algoIncidents = warningsData.features.map((f, index) => {
            const lng = f.geometry.coordinates[0];
            const lat = f.geometry.coordinates[1];
            const pt = [lng, lat];
            
            // 🌟 SPATIAL JOIN: Figure out which village this point is inside
            let locationName = `Unidentified Sector (Node ${index + 1})`; // Fallback
            
            if (villageData && villageData.features) {
              const foundVillage = villageData.features.find(vf => isPointInFeature(pt, vf));
              if (foundVillage) {
                // Extract the name. Adjust properties?.name based on your actual GeoJSON fields
                locationName = foundVillage.properties?.name || foundVillage.properties?.NATLEVNAME || locationName;
              }
            }

            // Extract the actual AHP prediction score from the Python model
            const ahpScore = f.properties.Flood_Risk_Index || 0.75; 
            
            let severity = "High";
            if (ahpScore >= 0.90) {
              severity = "Critical";
            } else if (ahpScore >= 0.80) {
              severity = "Extreme";
            }

            return {
              id: `ALGO-WARN-${index + 1}`,
              location: locationName, // 🌟 Now uses the REAL geographical name!
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              severity: severity,
              probability: Math.round(ahpScore * 100), 
              rainfall: "Algorithmic Trigger",
              coordinates: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
              source: "ALGORITHMIC" 
            };
          });
        }

        const formattedUserReports = reportedIncidents.map((report) => ({
          id: report.id,
          location: "User Reported Location",
          time: report.time,
          severity: report.type === "Trapped Individuals" ? "Critical" : "High",
          probability: 100, 
          rainfall: "N/A",
          coordinates: `Lat: ${report.lat.toFixed(4)}, Lng: ${report.lng.toFixed(4)}`,
          details: report.details,
          source: "CROWDSOURCED"
        }));

        setIncidents([...formattedUserReports, ...algoIncidents.slice(0, 5)]);
      })
      .catch((err) => console.error("Error processing algorithmic incidents:", err));
      
  }, [reportedIncidents]); 

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <AppStateContext.Provider value={{ 
      isMenuVisible, setIsMenuVisible, 
      activeLayers, toggleLayer, 
      userPOIs, setUserPOIs,
      addingMode, setAddingMode,
      isIncidentPanelOpen, setIsIncidentPanelOpen, toggleIncidentPanel,
      incidents, setIncidents,
      isLogsPanelOpen, setIsLogsPanelOpen, toggleLogsPanel,
      reportedIncidents, setReportedIncidents,
      reportingMode, setReportingMode,
      draftReport, setDraftReport
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);