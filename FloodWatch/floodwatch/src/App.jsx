import React from 'react';
import { AppStateProvider } from './context/AppStateContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FloodMap from './components/map/FloodMap';

function AppContent() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar />
        <FloodMap />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}