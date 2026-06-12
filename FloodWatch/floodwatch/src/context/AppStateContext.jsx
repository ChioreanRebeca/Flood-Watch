import React, { createContext, useState, useContext } from 'react';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  
  const [isIncidentPanelOpen, setIsIncidentPanelOpen] = useState(false);
  const toggleIncidentPanel = () => setIsIncidentPanelOpen(!isIncidentPanelOpen);

  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
  const toggleLogsPanel = () => setIsLogsPanelOpen(!isLogsPanelOpen);

  const [incidents, setIncidents] = useState([
    {
      id: "INC-001",
      location: "Izvoarele Region",
      time: "14 Sep, 00:45 AM",
      severity: "Extreme",
      probability: 85,
      rainfall: "16.3 mm",
      coordinates: "Lat: 45.54, Lng: 27.73"
    },
    {
    id: "INC-002",
    location: "Cudalbi Region",
    time: "14 Sep, 00:45 AM",
    severity: "High",
    probability: 78,
    rainfall: "14.2 mm",
    coordinates: "Lat: 45.7718, Lng: 27.6965"
  },
  {
    id: "INC-003",
    location: "Pechea Region",
    time: "14 Sep, 00:45 AM",
    severity: "Critical",
    probability: 92,
    rainfall: "21.5 mm",
    coordinates: "Lat: 45.62, Lng: 27.79"
  }
  ]);

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
  
  // 🌟 NEW: Hold the coordinates temporarily before confirming the report
  const [draftReport, setDraftReport] = useState(null);

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
      // 🌟 Export the new state
      draftReport, setDraftReport
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);