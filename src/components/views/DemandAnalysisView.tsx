import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart } from '../charts/LineChart';
import { BarChart } from '../charts/BarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { StatCard } from '../common/StatCard';
import {
  TrendingUp,
  Activity,
  Calendar,
  Sliders,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { calculateReorderPoint, formatNumber } from '../../utils/calculations';

export const DemandAnalysisView: React.FC = () => {
  const { products, settings, updateProduct, showToast } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'PRD-101');
  const [demandTimeframe, setDemandTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Interactive Demand Simulator Inputs
  const [customDemand, setCustomDemand] = useState<number>(20);
  const [demandVariability, setDemandVariability] = useState<number>(25); // % std dev

  const product = products.find(p => p.id === selectedProductId) || products[0];

  // Daily demand breakdown
  const dailyData = product.demandHistory.map(d => ({
    label: d.day,
    value: d.demand
  }));

  // Weekly simulated aggregation (4 weeks)
  const weeklyData = [
    { label: 'Week 1', value: Math.round(product.dailyDemand * 7 * 0.95) },
    { label: 'Week 2', value: Math.round(product.dailyDemand * 7 * 1.05) },
    { label: 'Week 3', value: Math.round(product.dailyDemand * 7 * 1.15) },
    { label: 'Week 4', value: Math.round(product.dailyDemand * 7 * 0.9) }
  ];

  // Monthly simulated aggregation (6 months)
  const monthlyData = [
    { label: 'May', value: Math.round(product.dailyDemand * 30 * 0.88) },
    { label: 'Jun', value: Math.round(product.dailyDemand * 30 * 0.94) },
    { label: 'Jul', value: Math.round(product.dailyDemand * 30 * 1.02) },
    { label: 'Aug', value: Math.round(product.dailyDemand * 30 * 1.1) },
    { label: 'Sep', value: Math.round(product.dailyDemand * 30 * 1.05) },
    { label: 'Oct (Est)', value: Math.round(product.dailyDemand * 30 * 1.18) }
  ];

  const currentChartData =
    demandTimeframe === 'daily'
      ? dailyData
      : demandTimeframe === 'weekly'
      ? weeklyData
      : monthlyData;

  const currentValues = currentChartData.map(d => d.value);
  const avgDemand = Number(
    (currentValues.reduce((a, b) => a + b, 0) / (currentValues.length || 1)).toFixed(1)
  );
  const maxDemand = Math.max(...currentValues);
  const minDemand = Math.min(...currentValues);

  // Apply user-simulated demand
  const handleApplySimulatedDemand = (newDemand: number) => {
    updateProduct(product.id, {
      dailyDemand: newDemand,
      reorderPoint: calculateReorderPoint(newDemand, product.leadTime, product.safetyStock)
    });
    showToast(`Updated baseline daily demand for ${product.name} to ${newDemand} units`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Demand Forecasting & Pull Velocity</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Demand Management & Analysis</h2>
          <p className="text-xs text-slate-500 mt-1">
            Examine customer order patterns, variability spikes, and test simulated market shocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards: Daily, Weekly, Monthly, Average, Max, Trend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Daily Demand
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {product.dailyDemand} <span className="text-xs font-normal text-slate-500">units/d</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Baseline consumption</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Weekly Demand
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {product.dailyDemand * 7} <span className="text-xs font-normal text-slate-500">units/wk</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">7-day aggregate</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Monthly Demand
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {product.dailyDemand * 30} <span className="text-xs font-normal text-slate-500">units/mo</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">30-day projection</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
            Average Demand
          </span>
          <div className="text-xl font-bold font-mono text-blue-900">
            {avgDemand} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Mean observed</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            Maximum Demand
          </span>
          <div className="text-xl font-bold font-mono text-amber-900">
            {maxDemand} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Peak surge recorded</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Demand Trend
          </span>
          <div className="text-lg font-bold text-emerald-800 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>+8.4% Up</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Steady expansion</span>
        </div>
      </div>

      {/* Main Charts: Toggle between Daily, Weekly, and Monthly with Line & Bar Views */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {demandTimeframe.toUpperCase()} Demand Visualization
            </h3>
            <p className="text-xs text-slate-500">Historical client ordering patterns for {product.name}</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setDemandTimeframe(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all cursor-pointer ${
                  demandTimeframe === tf
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Line Chart */}
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/30">
            <div className="text-xs font-bold text-slate-600 mb-2">Continuous Demand Line</div>
            <LineChart
              data={currentChartData}
              height={210}
              color="#2563eb"
              valueSuffix=" units"
            />
          </div>

          {/* Bar Chart */}
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/30">
            <div className="text-xs font-bold text-slate-600 mb-2">Discrete Periodic Demand Bar</div>
            <BarChart
              data={currentChartData}
              height={210}
              barColor="#f59e0b"
              valueSuffix=" units"
            />
          </div>
        </div>
      </div>

      {/* Student Demand Simulation & Shock Injection Tool */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/80 rounded-2xl p-6 border border-blue-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          <Sliders className="w-4 h-4" />
          <span>Technical Training Lab — Demand Shock Injector</span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Simulate Demand Changes on {product.name}
        </h3>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Enter experimental customer consumption rates. The system will dynamically recalibrate the Reorder Point (ROP)
          and calculate downstream safety buffers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Simulated Daily Demand (units)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="80"
                value={customDemand}
                onChange={e => setCustomDemand(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="font-mono font-bold text-sm text-blue-600 w-12 text-right">
                {customDemand}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Current baseline: {product.dailyDemand}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resulting Recalibrated ROP
            </label>
            <div className="text-2xl font-mono font-bold text-indigo-700">
              {calculateReorderPoint(customDemand, product.leadTime, product.safetyStock)}{' '}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Formula: ({customDemand} × {product.leadTime}d LT) + {product.safetyStock} SS
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-1">Quick Scenarios</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCustomDemand(Math.round(product.dailyDemand * 1.3))}
                  className="px-2 py-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded"
                >
                  +30% Surge
                </button>
                <button
                  onClick={() => setCustomDemand(Math.round(product.dailyDemand * 1.5))}
                  className="px-2 py-1 text-[11px] font-semibold bg-rose-100 hover:bg-rose-200 text-rose-900 rounded"
                >
                  +50% Spike
                </button>
                <button
                  onClick={() => setCustomDemand(Math.round(product.dailyDemand * 0.75))}
                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                >
                  -25% Slump
                </button>
              </div>
            </div>

            <button
              onClick={() => handleApplySimulatedDemand(customDemand)}
              className="mt-3 w-full py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
            >
              Apply Simulated Demand to SKU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
