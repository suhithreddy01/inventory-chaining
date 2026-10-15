import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { LineChart } from '../charts/LineChart';
import { BarChart } from '../charts/BarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { DonutChart } from '../charts/DonutChart';
import {
  calculateInventoryTurnover,
  calculateHoldingCost,
  calculateServiceLevel,
  calculateSupplyChainEfficiency,
  formatCurrency,
  formatNumber
} from '../../utils/calculations';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Boxes,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { products, orders, settings } = useApp();

  // Metrics
  const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
  const avgInventory = Math.round(totalStock / (products.length || 1));
  const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.unitCost, 0);
  const totalDailyHolding = products.reduce(
    (acc, p) => acc + calculateHoldingCost(p.currentStock, p.holdingCostPerDay),
    0
  );

  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const serviceLevel = calculateServiceLevel(deliveredOrders, orders.length);
  const stockoutCount = products.filter(p => p.currentStock <= 0).length;
  const stockoutRate = Number(((stockoutCount / (products.length || 1)) * 100).toFixed(1));
  const avgLeadTime = Number(
    (products.reduce((acc, p) => acc + p.leadTime, 0) / (products.length || 1)).toFixed(1)
  );

  // Simulated annual COGS
  const annualCogs = totalValue * 4.8;
  const inventoryTurnover = calculateInventoryTurnover(annualCogs, totalValue);

  const fulfillmentRate = orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 95;
  const efficiency = calculateSupplyChainEfficiency(
    serviceLevel,
    stockoutRate,
    avgLeadTime,
    inventoryTurnover
  );

  // Bar chart: Turnover by Product
  const turnoverData = products.map(p => ({
    label: p.name.split(' ')[0],
    value: Number((3.5 + (p.dailyDemand / (p.leadTime || 1)) * 1.2).toFixed(1))
  }));

  // Stage lead times
  const stageLeadTimeData = [
    { label: 'Supplier', value: 5, color: '#6366f1' },
    { label: 'Manufacturer', value: 7, color: '#3b82f6' },
    { label: 'Distributor', value: 3, color: '#0ea5e9' },
    { label: 'Retailer', value: 2, color: '#10b981' },
    { label: 'Customer', value: 1, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Operational Research & Lab Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Supply Chain Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate multi-echelon velocity, inventory turnover, fill rates, holding cost exposures, and overall efficiency.
          </p>
        </div>

        {/* Efficiency Score Pill */}
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
              Composite Efficiency
            </div>
            <div className="text-lg font-mono font-extrabold text-blue-900">{efficiency} / 100</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center font-bold text-blue-700 bg-white">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* 8 Required KPI Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Inventory Turnover"
          value={`${inventoryTurnover}x / year`}
          subtitle="COGS / Average Inventory"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={{ value: 'Good Velocity', isPositive: true }}
        />

        <StatCard
          title="Stockout Rate"
          value={`${stockoutRate}%`}
          subtitle="Proportion of SKUs with zero stock"
          icon={ShieldCheck}
          iconColor={stockoutRate > 0 ? 'text-rose-600' : 'text-emerald-600'}
          iconBg={stockoutRate > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
          trend={{ value: stockoutRate > 0 ? 'Backorders' : 'Zero Lost Sales', isPositive: stockoutRate === 0 }}
        />

        <StatCard
          title="Average Inventory"
          value={`${formatNumber(avgInventory)} units`}
          subtitle="Mean SKU buffer per catalog entry"
          icon={Boxes}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="Total Holding Cost"
          value={`${formatCurrency(totalDailyHolding, settings.currencySymbol)} / d`}
          subtitle={`Annualized: ${formatCurrency(totalDailyHolding * 365, settings.currencySymbol)}`}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />

        <StatCard
          title="Order Fulfillment Rate"
          value={`${fulfillmentRate}%`}
          subtitle="Orders delivered vs total placed"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: '+2.1% MoM', isPositive: true }}
        />

        <StatCard
          title="Average Lead Time"
          value={`${avgLeadTime} Days`}
          subtitle="Order placement to receipt cycle"
          icon={Clock}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />

        <StatCard
          title="Customer Service Level"
          value={`${serviceLevel}%`}
          subtitle="Fulfilled units / demanded units"
          icon={Activity}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: 'Target: >95%', isPositive: serviceLevel >= 95 }}
        />

        <StatCard
          title="Supply Chain Efficiency"
          value={`${efficiency}%`}
          subtitle="Composite multi-criteria score"
          icon={Zap}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: 'Optimal', isPositive: true }}
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Turnover by SKU */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Inventory Turnover Velocity by Product (x / Year)
              </h3>
              <p className="text-xs text-slate-500">Frequency of stock complete replenishment cycles</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Velocity
            </span>
          </div>

          <BarChart
            data={turnoverData}
            height={210}
            barColor="#3b82f6"
            valueSuffix="x"
          />
        </div>

        {/* Lead Time by Supply Chain Echelon */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Average Latency (Lead Time Days) by Stage
              </h3>
              <p className="text-xs text-slate-500">Bottleneck detection across the 5 chain tiers</p>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Latency
            </span>
          </div>

          <BarChart
            data={stageLeadTimeData}
            height={210}
            barColor="#6366f1"
            valueSuffix=" days"
          />
        </div>
      </div>

      {/* Efficiency Scoring Matrix Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Supply Chain Diagnostic Scorecard
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Performance Dimension</th>
                <th className="py-2.5 px-3">Observed Value</th>
                <th className="py-2.5 px-3">Industry Benchmark</th>
                <th className="py-2.5 px-3">Evaluation Status</th>
                <th className="py-2.5 px-3">Lab Pedagogical Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Customer Service Level</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{serviceLevel}%</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">&gt; 95.0%</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    High Reliability
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Maintained through responsive retail buffers and safety stock policies.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Stockout Frequency</td>
                <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{stockoutRate}%</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">&lt; 3.0%</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    Attention Required
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Gear Assembly experienced depletion due to supplier lead time friction.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Order Cycle Time</td>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{avgLeadTime} Days</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">&lt; 5.0 Days</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Acceptable
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Manufacturer assembly line constitutes the primary cycle lag (7 days).
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Annual Inventory Turnover</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{inventoryTurnover}x</td>
                <td className="py-2.5 px-3 font-mono text-slate-500">4.0x - 6.0x</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Good Capital Velocity
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Healthy rotation prevents obsolete stock buildup and storage waste.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
