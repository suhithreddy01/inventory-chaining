import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateReorderPoint, formatNumber } from '../../utils/calculations';
import { Badge } from '../common/Badge';
import {
  Target,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Clock,
  TrendingUp,
  Layers,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const ReorderPointView: React.FC = () => {
  const { products, updateProduct, showToast } = useApp();

  const [selectedId, setSelectedId] = useState<string>(products[0]?.id || 'PRD-101');
  const product = products.find(p => p.id === selectedId) || products[0];

  // Interactive Live Sliders State for selected product
  const [demandInput, setDemandInput] = useState<number>(product.dailyDemand);
  const [leadTimeInput, setLeadTimeInput] = useState<number>(product.leadTime);
  const [safetyStockInput, setSafetyStockInput] = useState<number>(product.safetyStock);

  // Sync state when product selector changes
  const handleProductSelect = (id: string) => {
    setSelectedId(id);
    const p = products.find(prod => prod.id === id);
    if (p) {
      setDemandInput(p.dailyDemand);
      setLeadTimeInput(p.leadTime);
      setSafetyStockInput(p.safetyStock);
    }
  };

  // Live Calculations
  const demandDuringLeadTime = demandInput * leadTimeInput;
  const computedRop = calculateReorderPoint(demandInput, leadTimeInput, safetyStockInput);
  const isBelowRop = product.currentStock <= computedRop;

  // Save updated parameters to product catalogue
  const handleSaveRop = () => {
    updateProduct(product.id, {
      dailyDemand: demandInput,
      leadTime: leadTimeInput,
      safetyStock: safetyStockInput,
      reorderPoint: computedRop
    });
    showToast(`Updated Reorder Point for ${product.name} to ${computedRop} units`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Inventory Replenishment Logic</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reorder Point (ROP) Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculate and calibrate optimal restock thresholds using lead-time demand plus safety buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={product.id}
            onChange={e => handleProductSelect(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-slate-300 bg-white"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mathematical Formula Interactive Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-widest">
            Laboratory Formula
          </span>
          <span className="text-xs text-blue-200">Continuous Review (s, S) Policy</span>
        </div>

        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/20">
          <div className="text-lg sm:text-2xl font-bold font-mono text-center tracking-wide">
            ROP = (Daily Demand × Lead Time) + Safety Stock
          </div>
          <div className="text-center text-xs text-blue-200 mt-2 font-mono">
            ROP = ({demandInput} × {leadTimeInput}d) + {safetyStockInput} ={' '}
            <span className="text-amber-300 font-extrabold text-base underline decoration-2 underline-offset-4">
              {computedRop} units
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs text-blue-100">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="font-bold text-white block mb-0.5">1. Demand During Lead Time</span>
            <span>{demandDuringLeadTime} units consumed while waiting for replenishment</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="font-bold text-white block mb-0.5">2. Safety Stock Buffer</span>
            <span>{safetyStockInput} units held against demand volatility or vendor delay</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="font-bold text-white block mb-0.5">3. Stock Trigger Status</span>
            <span>
              Current: {product.currentStock} units ({isBelowRop ? '⚠️ Reorder Required!' : '✅ Nominal buffer'})
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Calibrator */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Calibrate Parameters for {product.name}
            </h3>
            <p className="text-xs text-slate-500">
              Drag sliders to test how variations in lead time and demand affect the reorder point
            </p>
          </div>
          <button
            onClick={handleSaveRop}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            Apply & Save to Catalogue
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Daily Demand */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Average Daily Demand (d)
              </span>
              <span className="font-mono text-blue-600 font-bold text-sm">{demandInput}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={demandInput}
              onChange={e => setDemandInput(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-400">Rate at which units are sold per working day</p>
          </div>

          {/* Slider 2: Lead Time */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Lead Time (L in Days)
              </span>
              <span className="font-mono text-indigo-600 font-bold text-sm">{leadTimeInput} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={leadTimeInput}
              onChange={e => setLeadTimeInput(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[11px] text-slate-400">Total days from PO dispatch to dock receipt</p>
          </div>

          {/* Slider 3: Safety Stock */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Safety Stock (SS)
              </span>
              <span className="font-mono text-emerald-600 font-bold text-sm">{safetyStockInput}</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={safetyStockInput}
              onChange={e => setSafetyStockInput(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[11px] text-slate-400">Reserve buffer absorbing unexpected surge</p>
          </div>
        </div>

        {/* Visual Gauge Comparison */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Visual Inventory Buffer Spectrum</span>
            <span className="font-mono text-slate-500">Max Capacity: {product.maxStock}</span>
          </div>

          {/* Spectrum Bar */}
          <div className="relative w-full h-8 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex">
            {/* Safety Stock Region */}
            <div
              className="h-full bg-rose-200 border-r border-rose-300 flex items-center justify-center text-[10px] font-bold text-rose-800"
              style={{ width: `${Math.min(30, (safetyStockInput / product.maxStock) * 100)}%` }}
              title="Safety Stock Region"
            >
              SS ({safetyStockInput})
            </div>

            {/* Reorder Window */}
            <div
              className="h-full bg-amber-100 border-r border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-800"
              style={{
                width: `${Math.min(
                  40,
                  ((computedRop - safetyStockInput) / product.maxStock) * 100
                )}%`
              }}
              title="Reorder Point Window"
            >
              ROP ({computedRop})
            </div>

            {/* Healthy Stock Zone */}
            <div className="h-full bg-emerald-50 flex-1 flex items-center justify-center text-[10px] font-semibold text-emerald-800">
              Safe Operating Zone
            </div>
          </div>

          {/* Current Stock Marker */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="font-semibold text-slate-800">
                Current Physical Stock: {product.currentStock} units
              </span>
            </div>
            <span
              className={`font-bold px-2 py-0.5 rounded text-xs ${
                product.currentStock <= computedRop
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {product.currentStock <= computedRop ? 'Trigger Active' : 'Buffer Sufficient'}
            </span>
          </div>
        </div>
      </div>

      {/* All Products ROP Status Summary Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Catalogue-Wide Reorder Threshold Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-3 text-right">Daily Demand</th>
                <th className="py-2.5 px-3 text-right">Lead Time</th>
                <th className="py-2.5 px-3 text-right">Safety Stock</th>
                <th className="py-2.5 px-3 text-right">Calculated ROP</th>
                <th className="py-2.5 px-3 text-center">Alert State</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => {
                const rop = calculateReorderPoint(p.dailyDemand, p.leadTime, p.safetyStock);
                const breached = p.currentStock <= rop;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {p.name}
                      <span className="text-[10px] text-slate-400 font-mono block">{p.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatNumber(p.currentStock)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{p.dailyDemand}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{p.leadTime}d</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{p.safetyStock}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700 bg-amber-50/40">
                      {rop}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          breached ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {breached ? 'Reorder Required' : 'Adequate'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleProductSelect(p.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Calibrate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
