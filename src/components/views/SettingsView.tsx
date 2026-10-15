import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppSettings } from '../../types';
import {
  Settings,
  DollarSign,
  ShieldCheck,
  Clock,
  Bell,
  Cpu,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDefaults,
    showToast,
    currentUser,
    updateUserPassword
  } = useApp();

  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!currentUser) return;
    if (newPasswordInput.length < 4) {
      setPwdMsg({ text: 'Password must contain at least 4 characters.', error: true });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPwdMsg({ text: 'Passwords do not match. Please re-enter matching passwords.', error: true });
      return;
    }
    updateUserPassword(currentUser.id, newPasswordInput);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPwdMsg({
      text: `Password successfully updated for username @${currentUser.username || currentUser.name}!`,
      error: false
    });
  };

  const handleRemovePassword = () => {
    if (!currentUser) return;
    if (
      window.confirm(
        `Remove password for @${currentUser.username || currentUser.name}? This will switch your account to password-free instant login.`
      )
    ) {
      updateUserPassword(currentUser.id, '');
      setPwdMsg({
        text: 'Password removed. Password-free instant login is now active.',
        error: false
      });
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
    { code: 'EUR', symbol: '€', name: 'Euro (€)' },
    { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' }
  ];

  const handleCurrencyChange = (code: string) => {
    const curr = currencies.find(c => c.code === code);
    if (curr) {
      setForm(prev => ({
        ...prev,
        currency: curr.code,
        currencySymbol: curr.symbol
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Lab Station Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">System & Simulation Settings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure enterprise currency, statistical reorder rules, safety multipliers, and notification thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset all lab data and settings to baseline?')) {
                resetToDefaults();
                setForm(settings);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Lab Baseline</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Currency & Financial Assumptions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Currency & Carrying Cost Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Currency
              </label>
              <select
                value={form.currency}
                onChange={e => handleCurrencyChange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Inventory Carrying Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.holdingCostRatePct}
                onChange={e => setForm({ ...form, holdingCostRatePct: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard industrial benchmark: 15% - 25%
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stockout Penalty Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                value={form.stockoutPenaltyMultiplier}
                onChange={e => setForm({ ...form, stockoutPenaltyMultiplier: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Multiplier applied to unit cost on stockout
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Reorder Rules & Safety Stock */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Reorder Rules & Safety Buffers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Logic Mode
              </label>
              <select
                value={form.reorderRule}
                onChange={e => setForm({ ...form, reorderRule: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="statistical">Statistical Normal Distribution (Z-Score)</option>
                <option value="simple">Deterministic Lead-Time Demand + Fixed SS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead-Time Safety Multiplier
              </label>
              <input
                type="number"
                step="0.05"
                value={form.leadTimeSafetyMultiplier}
                onChange={e => setForm({ ...form, leadTimeSafetyMultiplier: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Factor applied to vendor stated lead times
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auto-Replenishment Workflow
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="autoReorder"
                  checked={form.autoReorderEnabled}
                  onChange={e => setForm({ ...form, autoReorderEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="autoReorder" className="text-xs text-slate-700 font-medium">
                  Auto-create replenishment drafts on ROP breach
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Alerts Preferences */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Autonomous Alert Triggers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificationPreferences.lowStock}
                onChange={e =>
                  setForm({
                    ...form,
                    notificationPreferences: { ...form.notificationPreferences, lowStock: e.target.checked }
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 block">Low Stock Alert</span>
                <span className="text-[11px] text-slate-500">Triggered when stock drops below Reorder Point</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificationPreferences.stockout}
                onChange={e =>
                  setForm({
                    ...form,
                    notificationPreferences: { ...form.notificationPreferences, stockout: e.target.checked }
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 block">Stockout Emergency Alert</span>
                <span className="text-[11px] text-slate-500">Triggered immediately when stock hits 0 units</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificationPreferences.delayedShipment}
                onChange={e =>
                  setForm({
                    ...form,
                    notificationPreferences: {
                      ...form.notificationPreferences,
                      delayedShipment: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 block">Freight Delay Warning</span>
                <span className="text-[11px] text-slate-500">Triggered if freight ETA exceeds target window</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notificationPreferences.excessInventory}
                onChange={e =>
                  setForm({
                    ...form,
                    notificationPreferences: {
                      ...form.notificationPreferences,
                      excessInventory: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 block">Excess Inventory Alert</span>
                <span className="text-[11px] text-slate-500">Triggered if stock reaches &gt; 90% warehouse capacity</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Lab Configurations</span>
          </button>
        </div>
      </form>

      {/* Section 5: Current User Account Password & Security */}
      {currentUser && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Account Security & Password Settings
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              User: <strong className="text-blue-600">@{currentUser.username || currentUser.name}</strong>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {currentUser.role}
                </span>
                <span className="text-[11px] font-mono text-blue-600 font-semibold">
                  @{currentUser.username}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Workspace: {currentUser.station} • Email: {currentUser.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.password ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password Protected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Password-Free Active</span>
                </span>
              )}
            </div>
          </div>

          {pwdMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                pwdMsg.error
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-1">
            <h4 className="text-xs font-bold text-slate-800">
              {currentUser.password
                ? `Update Password for @${currentUser.username || currentUser.name}`
                : `Set a Custom Password for @${currentUser.username || currentUser.name}`}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password (min. 4 chars)..."
                    className="w-full text-xs p-2.5 pr-9 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500">
                This password will only work for username <strong>@{currentUser.username}</strong> upon logging in.
              </span>

              <div className="flex items-center gap-2">
                {currentUser.password && (
                  <button
                    type="button"
                    onClick={handleRemovePassword}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Remove Password (Switch to Password-Free)
                  </button>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Save Password for @{currentUser.username}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
