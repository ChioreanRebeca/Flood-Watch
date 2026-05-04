import React from 'react';

export default function CriticalAlert() {
  return (
    <div className="bg-red-600 text-white p-4 m-4 rounded-md shadow-lg border border-red-500">
      <h2 className="font-bold flex items-center mb-1 text-sm uppercase">
        <span className="mr-2">⚠️</span> [CRITICAL] Flood Incident
      </h2>
      <p className="text-xs text-red-100">Izvoarele detected at 14 Sep, 00:45 AM</p>
    </div>
  );
}