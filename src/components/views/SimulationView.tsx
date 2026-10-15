import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StageType, SimulationParams, SimulationDailyResult, SimulationResult } from '../../types';
import { LineChart } from '../charts/LineChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { BarChart } from '../charts/BarChart';
import {
  formatCurrency,
  formatNumber,
  calculateBullwhipRatio,
  calculateServiceLevel
} from '../../utils/calculations';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Boxes,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';

export const SimulationView: React.FC = () => {
  const { products, settings, showToast } = useApp();

  // Selected product to base simulation on
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'PRD-101');
  const baseProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Simulation Parameters
  const [params, setParams] = useState<SimulationParams>({
    productId: baseProduct?.id || 'PRD-101',
    initialInventory: 120,
    customerDemand: 16,
    demandPattern: 'spike_30', // Default demo scenario (+30% shock)
    productionQuantity: 50,
    orderQuantity: 60,
    reorderPoint: 80,
    leadTime: 4,
    holdingCostPerUnit: 0.15,
    stockoutCostPerUnit: 4.5,
    durationDays: 20
  });

  // Simulation Results
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Animated Playback State
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600); // ms per day
  const timerRef = useRef<any>(null);

  // Sync parameters when changing selected product
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const p = products.find(prod => prod.id === id);
    if (p) {
      setParams(prev => ({
        ...prev,
        productId: p.id,
        initialInventory: p.currentStock || 120,
        customerDemand: p.dailyDemand || 16,
        reorderPoint: p.reorderPoint || 80,
        leadTime: p.leadTime || 4,
        holdingCostPerUnit: p.holdingCostPerDay || 0.15
      }));
    }
  };

  // Run the multi-echelon simulation algorithm
  const executeSimulation = (customParams?: SimulationParams) => {
    const config = customParams || params;
    const days: SimulationDailyResult[] = [];

    // Initial state across 5 echelons
    let supplierStock = config.initialInventory * 2.5;
    let manufacturerStock = config.initialInventory * 1.5;
    let distributorStock = config.initialInventory * 1.2;
    let retailerStock = config.initialInventory;
    let customerReceivedCumul = 0;

    // Pipeline order arrivals tracker: day -> arrival qty
    const arrivingOrders: Record<number, number> = {};
    const arrivingProduction: Record<number, number> = {};
    const arrivingDistributor: Record<number, number> = {};

    let totalDemand = 0;
    let totalFulfilled = 0;
    let totalStockouts = 0;
    let cumulativeCost = 0;
    let totalHoldingCost = 0;
    let totalStockoutCost = 0;

    const ordersGeneratedSeries: number[] = [];
    const demandSeries: number[] = [];
    let peakInv = retailerStock;
    let minInv = retailerStock;

    for (let day = 1; day <= config.durationDays; day++) {
      // 1. Calculate Customer Demand for the day
      let demand = config.customerDemand;
      if (config.demandPattern === 'spike_30') {
        // Sudden +30% demand shock from day 4 onwards!
        demand = day >= 4 ? Math.round(config.customerDemand * 1.3) : config.customerDemand;
      } else if (config.demandPattern === 'fluctuating') {
        const factor = 1 + 0.35 * Math.sin((day / 3) * Math.PI);
        demand = Math.max(2, Math.round(config.customerDemand * factor));
      } else if (config.demandPattern === 'seasonal') {
        const factor = day > 10 && day < 20 ? 1.6 : 0.85;
        demand = Math.round(config.customerDemand * factor);
      }

      demandSeries.push(demand);
      totalDemand += demand;

      // 2. Deliver in-flight shipments from upstream stages
      if (arrivingOrders[day]) {
        retailerStock += arrivingOrders[day];
      }
      if (arrivingDistributor[day]) {
        distributorStock += arrivingDistributor[day];
      }
      if (arrivingProduction[day]) {
        manufacturerStock += arrivingProduction[day];
      }

      // 3. Retailer attempts to fulfill customer demand
      let fulfilledToday = 0;
      let stockoutToday = 0;

      if (retailerStock >= demand) {
        fulfilledToday = demand;
        retailerStock -= demand;
      } else {
        fulfilledToday = retailerStock;
        stockoutToday = demand - retailerStock;
        retailerStock = 0;
      }

      totalFulfilled += fulfilledToday;
      totalStockouts += stockoutToday;
      customerReceivedCumul += fulfilledToday;

      // 4. Retailer Reorder logic: Check if Current Stock <= Reorder Point
      let orderGeneratedQty = 0;
      let note = '';

      if (stockoutToday > 0) {
        note = `Stockout of ${stockoutToday} units occurred! Demand exceeded store inventory.`;
      }

      if (retailerStock <= config.reorderPoint) {
        orderGeneratedQty = config.orderQuantity;
        ordersGeneratedSeries.push(orderGeneratedQty);

        // Schedule delivery after Lead Time
        const arrivalDay = day + config.leadTime;
        arrivingOrders[arrivalDay] = (arrivingOrders[arrivalDay] || 0) + orderGeneratedQty;

        // Distributor fulfills to retailer if stock permits
        if (distributorStock >= orderGeneratedQty) {
          distributorStock -= orderGeneratedQty;
        } else {
          // Distributor itself orders from Manufacturer
          const distArrivalDay = day + Math.max(2, config.leadTime - 1);
          arrivingDistributor[distArrivalDay] = (arrivingDistributor[distArrivalDay] || 0) + config.orderQuantity * 1.5;
        }

        note += ` Triggered ROP order of ${orderGeneratedQty} units arriving Day ${arrivalDay}.`;
      } else {
        ordersGeneratedSeries.push(0);
      }

      // 5. Upstream Manufacturer Production logic
      if (manufacturerStock < config.reorderPoint * 1.2) {
        const prodArrivalDay = day + config.leadTime + 1;
        arrivingProduction[prodArrivalDay] = (arrivingProduction[prodArrivalDay] || 0) + config.productionQuantity;
        supplierStock = Math.max(0, supplierStock - config.productionQuantity * 0.8);
      }

      // 6. Calculate daily costs
      const totalInventoryInChain = supplierStock + manufacturerStock + distributorStock + retailerStock;
      const dayHolding = retailerStock * config.holdingCostPerUnit;
      const dayStockout = stockoutToday * config.stockoutCostPerUnit;
      cumulativeCost += dayHolding + dayStockout;
      totalHoldingCost += dayHolding;
      totalStockoutCost += dayStockout;

      peakInv = Math.max(peakInv, retailerStock);
      minInv = Math.min(minInv, retailerStock);

      days.push({
        day,
        customerDemand: demand,
        customerReceived: fulfilledToday,
        stockoutQty: stockoutToday,
        stageStock: {
          Supplier: Math.round(supplierStock),
          Manufacturer: Math.round(manufacturerStock),
          Distributor: Math.round(distributorStock),
          Retailer: Math.round(retailerStock),
          Customer: customerReceivedCumul
        },
        ordersInPipeline: Object.values(arrivingOrders).reduce((a, b) => a + b, 0),
        holdingCostDay: Number(dayHolding.toFixed(2)),
        stockoutCostDay: Number(dayStockout.toFixed(2)),
        cumulativeCost: Number(cumulativeCost.toFixed(2)),
        notes: note.trim() || 'Steady supply equilibrium maintained.'
      });
    }

    const serviceLevel = calculateServiceLevel(totalFulfilled, totalDemand);
    const bullwhip = calculateBullwhipRatio(ordersGeneratedSeries, demandSeries);

    const recommendations = [];
    if (totalStockouts > 0) {
      recommendations.push(
        `Increase Safety Stock by at least ${Math.ceil(totalStockouts / 2)} units to eliminate the ${totalStockouts} stockout occurrences observed during demand peaks.`
      );
    }
    if (config.leadTime > 3) {
      recommendations.push(
        `Lead time is ${config.leadTime} days. Negotiating vendor lead times down to 2 days will reduce pipeline inventory and lower holding liabilities.`
      );
    }
    if (bullwhip > 1.4) {
      recommendations.push(
        `High Bullwhip Ratio (${bullwhip}): Order volatility is amplified upstream. Implement smaller, more frequent batch sizes (Continuous Replenishment) rather than lumpy batching.`
      );
    } else {
      recommendations.push('Supply chain demonstrates stable echelon flow with low signal amplification.');
    }

    const result: SimulationResult = {
      params: config,
      dailyResults: days,
      totalDemand,
      totalFulfilled,
      totalStockouts,
      serviceLevel,
      totalHoldingCost: Number(totalHoldingCost.toFixed(2)),
      totalStockoutCost: Number(totalStockoutCost.toFixed(2)),
      totalSupplyChainCost: Number(cumulativeCost.toFixed(2)),
      bullwhipRatio: bullwhip,
      peakInventory: peakInv,
      minInventory: minInv,
      recommendations
    };

    setSimulationResult(result);
    setCurrentDayIndex(0);
    setIsPlaying(false);
    showToast(`Simulation completed over ${config.durationDays} operational days!`, 'success');
  };

  // Run on mount
  useEffect(() => {
    executeSimulation();
  }, []);

  // Animation Timer for Play / Pause
  useEffect(() => {
    if (isPlaying && simulationResult) {
      timerRef.current = setInterval(() => {
        setCurrentDayIndex(prev => {
          if (prev >= simulationResult.dailyResults.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, simulationResult, playbackSpeed]);

  // Demonstration Scenario (+30% sudden surge)
  const handleRunDemoScenario = () => {
    const demoParams: SimulationParams = {
      productId: selectedProductId,
      initialInventory: 100,
      customerDemand: 15,
      demandPattern: 'spike_30',
      productionQuantity: 45,
      orderQuantity: 50,
      reorderPoint: 75,
      leadTime: 5,
      holdingCostPerUnit: 0.15,
      stockoutCostPerUnit: 5.0,
      durationDays: 24
    };
    setParams(demoParams);
    executeSimulation(demoParams);
    setIsPlaying(true);
    showToast('Running Official Demo: Sudden +30% Demand Surge across 5 tiers!', 'warning');
  };

  const currentDayData = simulationResult?.dailyResults[currentDayIndex] || null;

  // Chart data formatting
  const inventoryChartLabels = simulationResult?.dailyResults.map(d => `D${d.day}`) || [];
  const retailerStockSeries = simulationResult?.dailyResults.map(d => d.stageStock.Retailer) || [];
  const distributorStockSeries = simulationResult?.dailyResults.map(d => d.stageStock.Distributor) || [];
  const manufacturerStockSeries = simulationResult?.dailyResults.map(d => d.stageStock.Manufacturer) || [];
  const demandLineSeries = simulationResult?.dailyResults.map(d => d.customerDemand) || [];

  const handleExportCSV = () => {
    if (!simulationResult) return;
    const rows = simulationResult.dailyResults.map(d => ({
      Day: d.day,
      'Customer Demand': d.customerDemand,
      'Customer Fulfilled': d.customerReceived,
      'Stockouts (Lost Sales)': d.stockoutQty,
      'Retailer Stock': d.stageStock.Retailer,
      'Distributor Stock': d.stageStock.Distributor,
      'Manufacturer Stock': d.stageStock.Manufacturer,
      'Supplier Stock': d.stageStock.Supplier,
      'Daily Holding Cost': d.holdingCostDay,
      'Daily Stockout Cost': d.stockoutCostDay,
      'Cumulative Cost': d.cumulativeCost,
      'Lab Notes': d.notes
    }));
    exportToCSV('Supply_Chain_Simulation_Run_Results', rows);
  };

  const stagesList: StageType[] = ['Supplier', 'Manufacturer', 'Distributor', 'Retailer', 'Customer'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Technical Training Lab — Dynamic Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Supply Chain & Inventory Flow Simulation
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulate day-by-day inventory movement through Supplier → Manufacturer → Distributor → Retailer → Customer.
            Test lead times, demand shocks, bullwhip amplification, and holding vs stockout penalties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunDemoScenario}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-all hover:scale-102 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Demo (+30% Demand Shock)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Simulator Configuration Panel */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Configure Simulation Parameters
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Base SKU:</span>
            <select
              value={selectedProductId}
              onChange={e => handleProductSelect(e.target.value)}
              className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Initial Inventory (units)
            </label>
            <input
              type="number"
              value={params.initialInventory}
              onChange={e => setParams({ ...params, initialInventory: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Customer Demand (units/day)
            </label>
            <input
              type="number"
              value={params.customerDemand}
              onChange={e => setParams({ ...params, customerDemand: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Demand Pattern / Shock
            </label>
            <select
              value={params.demandPattern}
              onChange={e => setParams({ ...params, demandPattern: e.target.value as any })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="spike_30">Sudden +30% Surge (Demo)</option>
              <option value="steady">Steady Flat Demand</option>
              <option value="fluctuating">Fluctuating Wave</option>
              <option value="seasonal">Seasonal Peak Surge</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Reorder Point (ROP)
            </label>
            <input
              type="number"
              value={params.reorderPoint}
              onChange={e => setParams({ ...params, reorderPoint: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Order Quantity (Lot Size)
            </label>
            <input
              type="number"
              value={params.orderQuantity}
              onChange={e => setParams({ ...params, orderQuantity: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Production Batch Size
            </label>
            <input
              type="number"
              value={params.productionQuantity}
              onChange={e => setParams({ ...params, productionQuantity: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Lead Time (Days)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={params.leadTime}
              onChange={e => setParams({ ...params, leadTime: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Holding Cost ($/unit/d)
            </label>
            <input
              type="number"
              step="0.05"
              value={params.holdingCostPerUnit}
              onChange={e => setParams({ ...params, holdingCostPerUnit: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Stockout Penalty ($/unit)
            </label>
            <input
              type="number"
              step="0.5"
              value={params.stockoutCostPerUnit}
              onChange={e => setParams({ ...params, stockoutCostPerUnit: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Duration (Days)
            </label>
            <select
              value={params.durationDays}
              onChange={e => setParams({ ...params, durationDays: Number(e.target.value) })}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
            >
              <option value={14}>14 Days</option>
              <option value={20}>20 Days</option>
              <option value={30}>30 Days</option>
              <option value={45}>45 Days</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => executeSimulation()}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            Run Dynamic Simulation
          </button>
        </div>
      </div>

      {/* Animated Step-by-Step Playback Controller */}
      {simulationResult && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30">
                DAY {currentDayData?.day || 1} OF {simulationResult.params.durationDays}
              </span>
              <span className="text-xs text-slate-300">
                {currentDayData?.notes || 'Simulation Running'}
              </span>
            </div>

            {/* Playback buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDayIndex(0)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Restart Day 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
              </button>
              <button
                onClick={() =>
                  setCurrentDayIndex(prev =>
                    Math.min(simulationResult.dailyResults.length - 1, prev + 1)
                  )
                }
                disabled={currentDayIndex >= simulationResult.dailyResults.length - 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Step Next Day"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <select
                value={playbackSpeed}
                onChange={e => setPlaybackSpeed(Number(e.target.value))}
                className="text-xs bg-slate-800 text-slate-200 py-1.5 px-2 rounded-lg border border-slate-700 font-mono"
              >
                <option value={1000}>1.0x Speed</option>
                <option value={600}>1.5x Speed</option>
                <option value={300}>2.5x Speed</option>
              </select>
            </div>
          </div>

          {/* Timeline scrubber slider */}
          <div className="w-full">
            <input
              type="range"
              min={0}
              max={simulationResult.dailyResults.length - 1}
              value={currentDayIndex}
              onChange={e => setCurrentDayIndex(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>

          {/* Animated 5-Tier Pipeline Nodes Live State */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {stagesList.map((st, idx) => {
              const stock = currentDayData?.stageStock[st] ?? 0;
              const isRetailer = st === 'Retailer';
              const isStockout = isRetailer && stock <= 0;

              return (
                <div
                  key={st}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isStockout
                      ? 'bg-rose-950/60 border-rose-500 animate-pulse'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                    Tier {idx + 1}: {st}
                  </div>
                  <div
                    className={`text-xl font-bold font-mono ${
                      isStockout ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {formatNumber(stock)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {idx === 4
                      ? `Demand: ${currentDayData?.customerDemand} units`
                      : idx === 3 && currentDayData && currentDayData.stockoutQty > 0
                      ? `Stockout: -${currentDayData.stockoutQty}`
                      : 'Active Inventory'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcome Summary KPI Cards */}
      {simulationResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Service Level
            </span>
            <div
              className={`text-2xl font-mono font-bold ${
                simulationResult.serviceLevel > 90 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {simulationResult.serviceLevel}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {simulationResult.totalFulfilled} / {simulationResult.totalDemand} units
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Stockout Units
            </span>
            <div
              className={`text-2xl font-mono font-bold ${
                simulationResult.totalStockouts > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {simulationResult.totalStockouts}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Unfulfilled lost sales</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Holding Cost
            </span>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {formatCurrency(simulationResult.totalHoldingCost, settings.currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Accumulated liability</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Stockout Cost
            </span>
            <div className="text-2xl font-mono font-bold text-rose-600">
              {formatCurrency(simulationResult.totalStockoutCost, settings.currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Penalty & loss</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Supply Chain Cost
            </span>
            <div className="text-2xl font-mono font-bold text-indigo-700">
              {formatCurrency(simulationResult.totalSupplyChainCost, settings.currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Holding + Stockout</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block mb-1">
              Bullwhip Ratio
            </span>
            <div className="text-2xl font-mono font-bold text-purple-900">
              {simulationResult.bullwhipRatio}x
            </div>
            <span className="text-[10px] text-purple-800 mt-1 block">
              {simulationResult.bullwhipRatio > 1.3 ? 'High amplification' : 'Stable flow'}
            </span>
          </div>
        </div>
      )}

      {/* Multi-Series Simulation Charts */}
      {simulationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              Multi-Tier Stock Levels Over Time
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tracking how inventory depletion at Retailer ripples upstream to Distributor & Manufacturer
            </p>

            <MultiLineChart
              labels={inventoryChartLabels}
              series={[
                { name: 'Customer Demand', color: '#f59e0b', data: demandLineSeries },
                { name: 'Retailer Stock', color: '#10b981', data: retailerStockSeries },
                { name: 'Distributor Stock', color: '#0ea5e9', data: distributorStockSeries },
                { name: 'Manufacturer Stock', color: '#3b82f6', data: manufacturerStockSeries }
              ]}
              height={230}
              valueSuffix=" units"
            />
          </div>

          {/* Daily Costs & Losses */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              Cost Accumulation Over Simulation Horizon
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Holding liability vs stockout lost revenue penalty progression
            </p>

            <MultiLineChart
              labels={inventoryChartLabels}
              series={[
                {
                  name: 'Daily Holding Cost ($)',
                  color: '#6366f1',
                  data: simulationResult.dailyResults.map(d => d.holdingCostDay)
                },
                {
                  name: 'Daily Stockout Cost ($)',
                  color: '#ef4444',
                  data: simulationResult.dailyResults.map(d => d.stockoutCostDay)
                }
              ]}
              height={230}
              valuePrefix="$"
            />
          </div>
        </div>
      )}

      {/* Educational Findings & Academic Recommendations */}
      {simulationResult && (
        <div className="bg-blue-50/70 rounded-2xl p-6 border border-blue-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Academic Lab Findings & Optimizations</span>
          </div>

          <h4 className="text-base font-bold text-slate-900">
            Observation on the Demonstration Scenario (+30% Demand Shock)
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
            When customer demand increased abruptly by 30%, Retailer inventory dropped past the Reorder Point.
            Because replenishment has a lead time of {simulationResult.params.leadTime} days, the buffer
            was depleted, generating stockout incidents. Downstream distress signaled larger batch orders
            to Distributor and Manufacturer, demonstrating how small demand swings trigger magnified swings upstream (the Bullwhip Effect).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {simulationResult.recommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-slate-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
