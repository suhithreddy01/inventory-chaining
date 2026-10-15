import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { LineChart } from '../charts/LineChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { BarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import {
  calculateInventoryValue,
  calculateHoldingCost,
  calculateServiceLevel,
  calculateSupplyChainEfficiency,
  formatCurrency,
  formatNumber
} from '../../utils/calculations';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  Clock,
  Truck,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { StageType } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    products,
    orders,
    transactions,
    alerts,
    settings,
    setActiveTab,
    setSelectedProductId,
    setSelectedStage,
    runQuickDemandShockDemo
  } = useApp();

  // Metrics Calculations
  const totalInventory = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalValue = products.reduce((acc, p) => acc + calculateInventoryValue(p.currentStock, p.unitCost), 0);
  const itemsBelowRop = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const pendingOrders = orders.filter(o => ['Pending', 'Processing', 'In Transit'].includes(o.status)).length;
  const stockoutCount = products.filter(p => p.currentStock <= 0).length;
  const avgLeadTime = Number(
    (products.reduce((acc, p) => acc + p.leadTime, 0) / (products.length || 1)).toFixed(1)
  );
  const totalHoldingCostDaily = products.reduce(
    (acc, p) => acc + calculateHoldingCost(p.currentStock, p.holdingCostPerDay),
    0
  );
  const totalCustomerDemandDaily = products.reduce((acc, p) => acc + p.dailyDemand, 0);

  const fulfilledOrders = orders.filter(o => o.status === 'Delivered').length;
  const serviceLevel = calculateServiceLevel(fulfilledOrders, orders.length);
  const stockoutRate = Number(((stockoutCount / (products.length || 1)) * 100).toFixed(1));
  const efficiency = calculateSupplyChainEfficiency(serviceLevel, stockoutRate, avgLeadTime, 4.8);

  // Stage inventory sums
  const stages: StageType[] = ['Supplier', 'Manufacturer', 'Distributor', 'Retailer', 'Customer'];
  const stageStockMap: Record<StageType, number> = {
    Supplier: 0,
    Manufacturer: 0,
    Distributor: 0,
    Retailer: 0,
    Customer: 0
  };

  products.forEach(p => {
    stages.forEach(st => {
      stageStockMap[st] += p.stageInventory[st] || 0;
    });
  });

  const stageDonutData = [
    { label: 'Supplier', value: stageStockMap.Supplier, color: '#6366f1' },
    { label: 'Manufacturer', value: stageStockMap.Manufacturer, color: '#3b82f6' },
    { label: 'Distributor', value: stageStockMap.Distributor, color: '#0ea5e9' },
    { label: 'Retailer', value: stageStockMap.Retailer, color: '#10b981' },
    { label: 'Customer', value: stageStockMap.Customer, color: '#f59e0b' }
  ];

  // Demand vs Supply Series (7-day simulated aggregated)
  const daysLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const demandSeries = [58, 64, 61, 72, 78, 48, 38];
  const supplySeries = [75, 70, 65, 60, 80, 75, 70];

  // Stock Movement Chart (Daily Incoming vs Outgoing)
  const movementLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const incomingStock = [120, 95, 140, 80, 160, 50, 20];
  const outgoingStock = [110, 105, 115, 130, 145, 65, 30];

  const recentTransactions = transactions.slice(0, 5);
  const lowStockAlerts = alerts.filter(a => a.type === 'low_stock' || a.type === 'out_of_stock' || a.type === 'reorder_required');

  return (
    <div className="space-y-6">
      {/* Welcome & Lab Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold mb-2 border border-blue-400/30">
              <Activity className="w-3.5 h-3.5 text-blue-200" />
              <span>Technical Training Lab Simulation Node</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Multi-Echelon Supply Chain Overview
            </h2>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              Real-time monitoring across Supplier, Manufacturer, Distributor, Retailer, and Customer.
              Analyze inventory velocity, holding liabilities, and reorder triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runQuickDemandShockDemo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate +30% Demand Shock</span>
            </button>
            <button
              onClick={() => setActiveTab('supply-chain')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              <span>Explore Interactive Chain</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient background styling */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Primary KPI Cards Grid (9 specified metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory"
          value={`${formatNumber(totalInventory)} units`}
          subtitle="Across all catalog SKU nodes"
          icon={Boxes}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={{ value: 'Healthy Stock', isPositive: true }}
          onClick={() => setActiveTab('inventory')}
        />

        <StatCard
          title="Inventory Value"
          value={formatCurrency(totalValue, settings.currencySymbol)}
          subtitle="Capital tied in current stock"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: '+4.2% vs avg', isPositive: true }}
          onClick={() => setActiveTab('inventory')}
        />

        <StatCard
          title="Below Reorder Point"
          value={itemsBelowRop}
          subtitle={itemsBelowRop > 0 ? 'Requires purchase replenishment' : 'All items safely buffered'}
          icon={AlertTriangle}
          iconColor={itemsBelowRop > 0 ? 'text-amber-600' : 'text-slate-400'}
          iconBg={itemsBelowRop > 0 ? 'bg-amber-50' : 'bg-slate-50'}
          highlight={itemsBelowRop > 0}
          trend={{ value: itemsBelowRop > 0 ? 'Replenish' : 'Nominal', isPositive: itemsBelowRop === 0 }}
          onClick={() => setActiveTab('reorder-point')}
        />

        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          subtitle="In pipeline or scheduled transit"
          icon={Truck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => setActiveTab('orders')}
        />

        <StatCard
          title="Active Stockouts"
          value={stockoutCount}
          subtitle={stockoutCount > 0 ? 'Critical lost sales risk' : 'Zero unfulfilled stockouts'}
          icon={ShieldAlert}
          iconColor={stockoutCount > 0 ? 'text-rose-600' : 'text-emerald-600'}
          iconBg={stockoutCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
          highlight={stockoutCount > 0}
          trend={{ value: stockoutCount > 0 ? 'Urgent PO' : '100% Fill', isPositive: stockoutCount === 0 }}
          onClick={() => setActiveTab('inventory')}
        />

        <StatCard
          title="Average Lead Time"
          value={`${avgLeadTime} Days`}
          subtitle="PO issuance to dock delivery"
          icon={Clock}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          onClick={() => setActiveTab('analytics')}
        />

        <StatCard
          title="Holding Cost"
          value={`${formatCurrency(totalHoldingCostDaily, settings.currencySymbol)}/day`}
          subtitle={`Annual rate: ~${formatCurrency(totalHoldingCostDaily * 365, settings.currencySymbol)}`}
          icon={Layers}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          onClick={() => setActiveTab('analytics')}
        />

        <StatCard
          title="Customer Demand"
          value={`${totalCustomerDemandDaily} units/day`}
          subtitle="Aggregated daily consumption"
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: 'Active', isNeutral: true }}
          onClick={() => setActiveTab('demand-analysis')}
        />

        <div className="sm:col-span-2 lg:col-span-1 xl:col-span-4 bg-gradient-to-r from-slate-900 to-blue-950 rounded-xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-4 border-blue-500/40 flex items-center justify-center font-bold text-lg bg-blue-600/20 text-blue-300 font-mono">
              {efficiency}%
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Overall Supply Chain Efficiency
              </div>
              <div className="text-sm font-medium text-slate-200 mt-0.5">
                Service Level: {serviceLevel}% | Stockout Rate: {stockoutRate}% | Avg Lead Time: {avgLeadTime}d
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              View Analytics Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Visual Interactive Supply Chain Flow Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Supply Chain Chaining Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Click any echelon to inspect stock balance and lead times
            </p>
          </div>
          <button
            onClick={() => setActiveTab('supply-chain')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Pipeline View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {stages.map((stage, idx) => {
            const stock = stageStockMap[stage];
            const colors = {
              Supplier: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50',
              Manufacturer: 'border-blue-200 hover:border-blue-400 bg-blue-50/50',
              Distributor: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/50',
              Retailer: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50',
              Customer: 'border-amber-200 hover:border-amber-400 bg-amber-50/50'
            }[stage];

            const badgeColor = {
              Supplier: 'text-indigo-700 bg-indigo-100',
              Manufacturer: 'text-blue-700 bg-blue-100',
              Distributor: 'text-cyan-700 bg-cyan-100',
              Retailer: 'text-emerald-700 bg-emerald-100',
              Customer: 'text-amber-700 bg-amber-100'
            }[stage];

            return (
              <div
                key={stage}
                onClick={() => {
                  setSelectedStage(stage);
                  setActiveTab('supply-chain');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${colors} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      Step {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {idx === 0 ? 'Raw Material' : idx === 4 ? 'End Consumer' : 'Buffer'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{stage}</h4>
                  <div className="mt-2 text-xl font-extrabold text-slate-800 font-mono">
                    {formatNumber(stock)} <span className="text-xs font-normal text-slate-500">units</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lead Time:</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {idx === 0 ? '3-5d' : idx === 1 ? '5-7d' : idx === 2 ? '2-4d' : idx === 3 ? '1-2d' : 'Instant'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section: Demand vs Supply & Inventory by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Demand vs Supply Dynamics (7-Day Trend)
              </h3>
              <p className="text-xs text-slate-500">
                Tracking fulfillment equilibrium to detect bullwhip divergence
              </p>
            </div>
            <button
              onClick={() => setActiveTab('demand-analysis')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Analyze Demand
            </button>
          </div>

          <MultiLineChart
            labels={daysLabels}
            series={[
              { name: 'Customer Demand', color: '#f59e0b', data: demandSeries },
              { name: 'Supply Inflow', color: '#2563eb', data: supplySeries }
            ]}
            height={220}
            valueSuffix=" units"
          />
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              Inventory by Stage
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Distribution of stock across the 5 chain levels
            </p>
          </div>

          <DonutChart
            data={stageDonutData}
            size={180}
            centerLabel={formatNumber(totalInventory)}
            centerSub="Total Units"
          />

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Largest Stock Buffer:</span>
            <span className="font-semibold text-slate-800">Supplier (41%)</span>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Stock Movement & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Weekly Stock Movement (Inflow vs Outflow)
              </h3>
              <p className="text-xs text-slate-500">
                Volume of incoming purchase receipts vs sales shipments
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              All Transactions
            </button>
          </div>

          <MultiLineChart
            labels={movementLabels}
            series={[
              { name: 'Incoming Transfers', color: '#10b981', data: incomingStock },
              { name: 'Outgoing Sales', color: '#6366f1', data: outgoingStock }
            ]}
            height={200}
            valueSuffix=" units"
          />
        </div>

        {/* Low-Stock Alerts & Action Panel */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Active Critical Alerts
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All ({alerts.length})
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {lowStockAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No critical inventory alerts at this time.
              </div>
            ) : (
              lowStockAlerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{alert.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{alert.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{alert.message}</p>
                  </div>
                  {alert.actionLabel && (
                    <button
                      onClick={() => {
                        if (alert.productId) setSelectedProductId(alert.productId);
                        setActiveTab('reorder-point');
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0 shadow-2xs cursor-pointer"
                    >
                      Action
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Inventory Transactions
            </h3>
            <p className="text-xs text-slate-500">Audit log of latest supply chain transfers and dispatches</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3">From → To</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{tx.id}</td>
                  <td className="py-2.5 px-3 text-slate-500">{tx.date} {tx.time}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{tx.productName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="font-medium text-slate-800">{tx.fromStage}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="font-medium text-slate-800">{tx.toStage}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{tx.user}</td>
                  <td className="py-2.5 px-3">
                    <Badge status={tx.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
