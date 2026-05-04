import React, { createContext, useState, useContext } from 'react';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(true); // Toggled when flooding is detected
  const [activeLayers, setActiveLayers] = useState({
    aiDetection: false,
    emergencyServices: true,
    infrastructure: true,
    villageLimits: false,
    bridges: false,
    transportRoutes: false
  });
  const [userPOIs, setUserPOIs] = useState([
    { id: 1, name: "my home", lat: 45.78, lng: 27.95 }, // Mock coordinates near Cudalbi
    { id: 2, name: "friends house", lat: 45.79, lng: 27.98 }
  ]);

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <AppStateContext.Provider value={{ 
      isMenuVisible, setIsMenuVisible, 
      activeLayers, toggleLayer, 
      userPOIs, setUserPOIs 
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);