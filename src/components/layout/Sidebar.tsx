import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  GitFork,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  Cpu,
  Target,
  BarChart3,
  Bell,
  FileText,
  GraduationCap,
  Settings,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, alerts, orders, products } = useApp();

  const lowStockCount = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'In Transit').length;
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core Simulation' },
    { id: 'supply-chain', label: 'Supply Chain', icon: GitFork, category: 'Core Simulation' },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined, badgeColor: 'bg-amber-100 text-amber-800', category: 'Stock & Operations' },
    { id: 'products', label: 'Products', icon: Boxes, category: 'Stock & Operations' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-blue-100 text-blue-800', category: 'Stock & Operations' },
    { id: 'shipments', label: 'Shipments', icon: Truck, category: 'Stock & Operations' },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, category: 'Stock & Operations' },
    { id: 'demand-analysis', label: 'Demand Analysis', icon: TrendingUp, category: 'Engineering & Modeling' },
    { id: 'simulation', label: 'Simulation', icon: Cpu, badge: 'Interactive', badgeColor: 'bg-purple-100 text-purple-800', category: 'Engineering & Modeling' },
    { id: 'reorder-point', label: 'Reorder Point', icon: Target, category: 'Engineering & Modeling' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, category: 'Engineering & Modeling' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined, badgeColor: 'bg-rose-100 text-rose-800', category: 'Reports & Training' },
    { id: 'reports', label: 'Reports', icon: FileText, category: 'Reports & Training' },
    { id: 'training-mode', label: 'Training Mode', icon: GraduationCap, badge: 'Tutorial', badgeColor: 'bg-emerald-100 text-emerald-800', category: 'Reports & Training' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'System' }
  ];

  // Group items by category
  const categories = Array.from(new Set(navItems.map(item => item.category || 'General')));

  const handleSelect = (id: ActiveTab) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              IC
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Training Lab
              </div>
              <div className="text-[10px] text-blue-400 font-medium">Inventory Chaining</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items scroll area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {categories.map(cat => (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {cat}
              </div>
              {navItems
                .filter(item => item.category === cat)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isActive ? 'bg-blue-700 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                      </div>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Lab Info Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-800/80 rounded-lg p-3 text-[11px] border border-slate-700/50">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
              <span>Supply Flow Status</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                5 Echelons
              </span>
            </div>
            <p className="text-slate-300 text-[10px] leading-relaxed">
              Supplier → Manufacturer → Distributor → Retailer → Customer
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
