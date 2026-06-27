import React, { useState } from 'react';
import { AppStateProvider } from './context/AppStateContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FloodMap from './components/map/FloodMap';
import IncidentPanelModal from './components/layout/IncidentPanelModal';
import SystemLogsModal from './components/layout/SystemLogsModal';
import ReportIncidentModal from './components/layout/ReportIncidentModal'; // 🌟 NEW

function AppContent() {
  // State to manage sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Modals injected at root level for global overlay */}
      <IncidentPanelModal />
      <SystemLogsModal />
      <ReportIncidentModal /> {/* 🌟 NEW: Inject modal here */}
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile Overlay Background */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />
        )}
        
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
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