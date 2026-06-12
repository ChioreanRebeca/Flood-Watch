import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

export default function POIManager() {
  const { userPOIs, setUserPOIs, addingMode, setAddingMode } = useAppState();
  
  // States for editing existing locations
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  
  // States for the "Add New Location" menu
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showManualMenu, setShowManualMenu] = useState(false);
  const [coords, setCoords] = useState({ lat: "", lng: "" });

  // --- CRUD Handlers ---
  const removeLocation = (id) => setUserPOIs(prev => prev.filter(p => p.id !== id));
  
  const startEditing = (id, currentName) => { 
    setEditingId(id); 
    setEditName(currentName); 
  };
  
  const saveEdit = (id) => {
    setUserPOIs(prev => prev.map(p => p.id === id ? { ...p, name: editName } : p));
    setEditingId(null);
  };

  const addCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPOIs(prev => [...prev, { 
          id: Date.now(), 
          name: "My GPS Location", 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        }]);
        setShowAddMenu(false);
      }, () => alert("Location access was denied or is unavailable."));
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserPOIs(prev => [...prev, { id: Date.now(), name: "Manual Location", lat, lng }]);
      setShowManualMenu(false);
      setShowAddMenu(false);
      setCoords({ lat: "", lng: "" });
    }
  };

  return (
    <div className="px-4 pb-4">
      <h3 className="font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-1">Monitored Locations</h3>
      
      {/* List of active locations */}
      <ul className="space-y-3 mb-4 pr-1">
        {userPOIs.length === 0 && <li className="text-xs text-gray-500 italic">No locations monitored yet.</li>}
        {userPOIs.map(loc => (
          <li key={loc.id} className="bg-gray-700 p-2 rounded border border-gray-600 flex flex-col gap-2 shadow-sm">
            
            {/* If currently editing this item, show input field */}
            {editingId === loc.id ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-gray-900 text-white text-sm px-2 py-1 rounded border border-blue-500 focus:outline-none"
                  autoFocus
                />
                <button onClick={() => saveEdit(loc.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 text-xs rounded transition-colors">Save</button>
              </div>
            ) : (
              // Normal display state
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-200 font-medium truncate pr-2">{loc.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(loc.id, loc.name)} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                  <button onClick={() => removeLocation(loc.id)} className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors">Del</button>
                </div>
              </div>
            )}
            <span className="text-[10px] text-gray-400 font-mono">Lat: {loc.lat.toFixed(4)} | Lng: {loc.lng.toFixed(4)}</span>
          </li>
        ))}
      </ul>

      {/* Add Location Context Menu */}
      {!showAddMenu ? (
        <button 
          onClick={() => setShowAddMenu(true)}
          className={`w-full py-2 text-sm rounded transition-colors ${addingMode ? 'bg-blue-600 text-white shadow-lg animate-pulse' : 'border border-blue-500 text-blue-400 hover:bg-blue-900/30'}`}
        >
          {addingMode ? "Click anywhere on the map..." : "+ Add Monitored Location"}
        </button>
      ) : (
        <div className="bg-gray-800 border border-gray-600 rounded p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-2 font-medium">How would you like to add it?</p>
          
          <div className="space-y-1">
            <button 
              onClick={() => { setAddingMode(true); setShowAddMenu(false); }}
              className="w-full text-left text-sm text-gray-200 hover:bg-gray-700 px-2 py-2 rounded flex items-center gap-3 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
              Click on Map
            </button>
            
            <button 
              onClick={addCurrentLocation}
              className="w-full text-left text-sm text-gray-200 hover:bg-gray-700 px-2 py-2 rounded flex items-center gap-3 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-teal-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Use Current Location
            </button>
            
            <button 
              onClick={() => setShowManualMenu(!showManualMenu)}
              className="w-full text-left text-sm text-gray-200 hover:bg-gray-700 px-2 py-2 rounded flex items-center gap-3 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Enter Coordinates
            </button>
          </div>

          {/* Manual coordinate entry form */}
          {showManualMenu && (
            <form onSubmit={handleManualAdd} className="pt-3 border-t border-gray-600 mt-2 space-y-2">
              <input type="number" step="any" placeholder="Latitude (e.g. 45.43)" required
                value={coords.lat} onChange={e => setCoords({...coords, lat: e.target.value})}
                className="w-full bg-gray-900 text-sm px-2 py-1.5 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500" />
              <input type="number" step="any" placeholder="Longitude (e.g. 28.03)" required
                value={coords.lng} onChange={e => setCoords({...coords, lng: e.target.value})}
                className="w-full bg-gray-900 text-sm px-2 py-1.5 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-sm transition-colors mt-1">Submit</button>
            </form>
          )}

          <button 
            onClick={() => { setShowAddMenu(false); setShowManualMenu(false); setAddingMode(false); }}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 mt-3 pt-2 border-t border-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}