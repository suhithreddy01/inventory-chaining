import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { AlertSeverity, AlertType } from '../../types';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Layers,
  ArrowRight,
  Check,
  Trash2,
  Filter,
  CheckCheck
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    markAlertRead,
    dismissAlert,
    clearAllAlerts,
    setActiveTab,
    setSelectedProductId
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter(
    a => severityFilter === 'all' || a.severity === severityFilter
  );

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  const handleAlertAction = (alert: any) => {
    markAlertRead(alert.id);
    if (alert.productId) {
      setSelectedProductId(alert.productId);
    }
    if (alert.actionType === 'reorder') {
      setActiveTab('reorder-point');
    } else if (alert.actionType === 'transfer') {
      setActiveTab('supply-chain');
    } else {
      setActiveTab('inventory');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Automated Supply Chain Exception Monitor</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Real-Time Inventory & Operational Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous rule triggers for low stock, stockouts, reorder breaches, delayed freights, excess inventory, and holding cost spikes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearAllAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Dismiss All</span>
          </button>
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSeverityFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'all'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">All Exceptions</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{alerts.length}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Full alert stream</span>
        </button>

        <button
          onClick={() => setSeverityFilter('critical')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'critical'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-100 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Critical
            </span>
            <span className="font-mono font-bold text-rose-700 text-sm">{criticalCount}</span>
          </div>
          <span className="text-[10px] text-rose-500 mt-1 block">Zero stock & severe breaches</span>
        </button>

        <button
          onClick={() => setSeverityFilter('warning')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'warning'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warnings
            </span>
            <span className="font-mono font-bold text-amber-700 text-sm">{warningCount}</span>
          </div>
          <span className="text-[10px] text-amber-500 mt-1 block">ROP breaches & delays</span>
        </button>

        <button
          onClick={() => setSeverityFilter('info')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'info'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Advisory Info
            </span>
            <span className="font-mono font-bold text-blue-700 text-sm">{infoCount}</span>
          </div>
          <span className="text-[10px] text-blue-500 mt-1 block">Holding liability notice</span>
        </button>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <CheckCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">No active alerts matching your filter.</p>
            <p className="text-xs text-slate-400 mt-1">All supply chain thresholds are within optimal tolerances.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alert.isRead ? 'opacity-70 bg-slate-50/70 border-slate-200' : 'bg-white shadow-xs'
                } ${
                  isCritical
                    ? 'border-rose-200 hover:border-rose-300'
                    : isWarning
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Layers className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                      <Badge status={alert.severity} size="sm" />
                      {alert.stage && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Tier: {alert.stage}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{alert.date}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alert.actionLabel && (
                    <button
                      onClick={() => handleAlertAction(alert)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title="Dismiss Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
