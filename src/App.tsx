import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardView } from './pages/DashboardView';
import { LiveMonitoringView } from './pages/LiveMonitoringView';
import { VibrationAnalysisView } from './pages/VibrationAnalysisView';
import { AiPredictionView } from './pages/AiPredictionView';
import { MotorControlView } from './pages/MotorControlView';
import { HistoricalDataView } from './pages/HistoricalDataView';
import { AlertsView } from './pages/AlertsView';
import { MaintenanceView } from './pages/MaintenanceView';
import { DevicesView } from './pages/DevicesView';
import { SystemInfoView } from './pages/SystemInfoView';
import { SettingsView } from './pages/SettingsView';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'live':
        return <LiveMonitoringView />;
      case 'vibration':
        return <VibrationAnalysisView />;
      case 'ai':
        return <AiPredictionView />;
      case 'motor':
        return <MotorControlView />;
      case 'history':
        return <HistoricalDataView />;
      case 'alerts':
        return <AlertsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'devices':
        return <DevicesView />;
      case 'system':
        return <SystemInfoView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0B0F17] scrollbar-thin scrollbar-thumb-surface-border">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
