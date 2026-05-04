import { useState, useEffect } from 'react';

export const useMapData = () => {
  const [floodData, setFloodData] = useState(null);

  useEffect(() => {
    // Mocking the AI output GeoJSON polygon for the 12km region[cite: 1]
    setFloodData({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { risk: "high", score: 67 },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [27.90, 45.70], [28.05, 45.70], [28.05, 45.85], [27.90, 45.85], [27.90, 45.70]
          ]]
        }
      }]
    });
  }, []);

  return { floodData };
};