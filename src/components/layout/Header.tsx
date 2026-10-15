import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Play,
  RotateCcw,
  GraduationCap,
  Boxes,
  Activity,
  Menu,
  Sparkles,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    alerts,
    setActiveTab,
    runQuickDemandShockDemo,
    resetToDefaults,
    activeTab,
    currentUser,
    logout
  } = useApp();

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const roleBadgeColor = {
    student: 'bg-blue-100 text-blue-700 border-blue-200',
    instructor: 'bg-purple-100 text-purple-700 border-purple-200',
    operator: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    researcher: 'bg-amber-100 text-amber-700 border-amber-200'
  }[currentUser?.role || 'student'];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner with Project Branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center shrink-0">
              <Boxes className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-wide uppercase text-white font-mono">
                  Inventory Chaining – Technical Training Lab
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/40 text-blue-100 border border-blue-400/30">
                  Lab v2.4
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90 font-medium hidden sm:block">
                Understanding the Flow | Managing the Stock | Building an Efficient Supply Chain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={runQuickDemandShockDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              title="Demonstrates a sudden +30% surge in customer demand across the 5 chain echelons"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Demo Simulation (+30% Shock)</span>
            </button>
            <button
              onClick={() => setActiveTab('training-mode')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                activeTab === 'training-mode'
                  ? 'bg-white text-blue-900 border-white font-semibold'
                  : 'bg-blue-800/60 hover:bg-blue-700/80 text-blue-100 border-blue-600/40'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
              <span>Training Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Stage Quick Indicator Breadcrumb */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100/80 py-1.5 px-3 rounded-full border border-slate-200">
              <span className="font-semibold text-slate-700">Active Pipeline:</span>
              <span className="text-blue-700 font-semibold">Supplier</span>
              <span className="text-slate-300">→</span>
              <span className="text-blue-700 font-semibold">Manufacturer</span>
              <span className="text-slate-300">→</span>
              <span className="text-blue-700 font-semibold">Distributor</span>
              <span className="text-slate-300">→</span>
              <span className="text-blue-700 font-semibold">Retailer</span>
              <span className="text-slate-300">→</span>
              <span className="text-emerald-700 font-semibold">Customer</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Lab Node: Online</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('alerts')}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Supply Chain Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 border-2 border-white shadow-xs">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Reset to Defaults button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all lab data, products, orders, and simulation results back to default?')) {
                  resetToDefaults();
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Reset sample data back to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Lab</span>
            </button>

            {/* User profile / Station ID & Logout */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                {currentUser?.avatarText || 'TL'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                  <span>{currentUser?.name || 'Station #04'}</span>
                  {currentUser?.role && (
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                      {currentUser.role}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  {currentUser?.username && (
                    <span className="text-blue-600 font-semibold">@{currentUser.username}</span>
                  )}
                  <span>•</span>
                  <span>{currentUser?.station || 'Technical Student'}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  if (window.confirm('Sign out of your current lab station?')) {
                    logout();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out / Switch Station"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
