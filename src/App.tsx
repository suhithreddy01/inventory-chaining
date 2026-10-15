import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { NotificationToast } from './components/common/NotificationToast';

// Views
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { SupplyChainFlowView } from './components/views/SupplyChainFlowView';
import { InventoryView } from './components/views/InventoryView';
import { ProductDetailsView } from './components/views/ProductDetailsView';
import { OrdersView } from './components/views/OrdersView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { TransactionsView } from './components/views/TransactionsView';
import { DemandAnalysisView } from './components/views/DemandAnalysisView';
import { SimulationView } from './components/views/SimulationView';
import { ReorderPointView } from './components/views/ReorderPointView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AlertsView } from './components/views/AlertsView';
import { ReportsView } from './components/views/ReportsView';
import { TrainingModeView } from './components/views/TrainingModeView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is not authenticated, display LoginView
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginView />
        <NotificationToast />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'supply-chain':
        return <SupplyChainFlowView />;
      case 'inventory':
        return <InventoryView />;
      case 'products':
        return <ProductDetailsView />;
      case 'orders':
        return <OrdersView />;
      case 'shipments':
        return <ShipmentsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'demand-analysis':
        return <DemandAnalysisView />;
      case 'simulation':
        return <SimulationView />;
      case 'reorder-point':
        return <ReorderPointView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      case 'training-mode':
        return <TrainingModeView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* View Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>

        {/* Academic Project Footer */}
        <Footer />
      </div>

      {/* Global Interactive Toast Notification */}
      <NotificationToast />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
