import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StageType, Product } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  formatCurrency,
  formatNumber,
  calculateInventoryValue
} from '../../utils/calculations';
import {
  Factory,
  Building2,
  Warehouse,
  Store,
  UserCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  Boxes,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StageMeta {
  type: StageType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  leadTimeDefault: number; // in days
  description: string;
}

const STAGES_META: StageMeta[] = [
  {
    type: 'Supplier',
    title: '1. Supplier Tier',
    subtitle: 'Raw Materials & Parts',
    icon: Factory,
    color: '#6366f1',
    leadTimeDefault: 5,
    description: 'Procures raw materials, extrusions, and specialized castings. Initiates the manufacturing chain.'
  },
  {
    type: 'Manufacturer',
    title: '2. Manufacturer Tier',
    subtitle: 'Assembly & Production',
    icon: Building2,
    color: '#3b82f6',
    leadTimeDefault: 7,
    description: 'Converts raw components into finished precision machinery, pumps, motors, and automation panels.'
  },
  {
    type: 'Distributor',
    title: '3. Distributor Tier',
    subtitle: 'Logistics Hub & Depots',
    icon: Warehouse,
    color: '#0ea5e9',
    leadTimeDefault: 3,
    description: 'Consolidates finished industrial SKUs in regional logistics hubs and fulfills multi-retailer orders.'
  },
  {
    type: 'Retailer',
    title: '4. Retailer Tier',
    subtitle: 'Store & Trade Counters',
    icon: Store,
    color: '#10b981',
    leadTimeDefault: 2,
    description: 'Direct sales channel to regional industrial contractors, workshops, and automated plants.'
  },
  {
    type: 'Customer',
    title: '5. Customer Tier',
    subtitle: 'End Consumption Point',
    icon: UserCheck,
    color: '#f59e0b',
    leadTimeDefault: 1,
    description: 'Factory lines, engineering plants, and service technicians requiring dependable on-demand stock.'
  }
];

export const SupplyChainFlowView: React.FC = () => {
  const {
    products,
    orders,
    transactions,
    settings,
    selectedStage,
    setSelectedStage,
    updateStock,
    showToast
  } = useApp();

  const [activeStage, setActiveStage] = useState<StageType>(selectedStage || 'Manufacturer');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || 'PRD-101');
  const [transferQty, setTransferQty] = useState<number>(20);
  const [transferTargetStage, setTransferTargetStage] = useState<StageType>('Distributor');

  const selectedMeta = STAGES_META.find(s => s.type === activeStage) || STAGES_META[0];

  // Stage Metrics Calculations
  const currentStageStock = products.reduce(
    (sum, p) => sum + (p.stageInventory[activeStage] || 0),
    0
  );

  const stageTotalCapacity = products.reduce(
    (sum, p) => sum + (p.stageCapacity[activeStage] || 500),
    0
  );

  const stageStockValue = products.reduce((sum, p) => {
    const stock = p.stageInventory[activeStage] || 0;
    return sum + calculateInventoryValue(stock, p.unitCost);
  }, 0);

  // Incoming and outgoing orders
  const incomingOrders = orders.filter(
    o => o.destinationStage === activeStage && o.status !== 'Delivered' && o.status !== 'Cancelled'
  );
  const outgoingOrders = orders.filter(
    o => o.sourceStage === activeStage && o.status !== 'Delivered' && o.status !== 'Cancelled'
  );

  const incomingStockQty = incomingOrders.reduce((sum, o) => sum + o.quantity, 0);
  const outgoingStockQty = outgoingOrders.reduce((sum, o) => sum + o.quantity, 0);

  const stageTransactions = transactions
    .filter(t => t.fromStage === activeStage || t.toStage === activeStage)
    .slice(0, 6);

  const capacityPct = Math.min(100, Math.round((currentStageStock / (stageTotalCapacity || 1)) * 100));

  // Handle stage transfer execution
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === transferProductId);
    if (!product) return;

    const available = product.stageInventory[activeStage] || 0;
    if (available < transferQty) {
      showToast(`Insufficient stock at ${activeStage} (${available} available). Cannot transfer ${transferQty}.`, 'error');
      return;
    }

    // Deduct from current stage
    updateStock(
      product.id,
      -transferQty,
      activeStage,
      `Chaining transfer dispatch to ${transferTargetStage}`,
      'Transfer'
    );

    // Add to target stage
    updateStock(
      product.id,
      transferQty,
      transferTargetStage,
      `Chaining transfer receipt from ${activeStage}`,
      'Transfer'
    );

    setIsTransferModalOpen(false);
    showToast(`Successfully moved ${transferQty} units of ${product.name} from ${activeStage} → ${transferTargetStage}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header description */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Interactive Supply Chain Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Multi-Tier Inventory Chaining Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Visualize how product batches move from upstream raw suppliers through discrete processing tiers to end customers.
            Click any stage node to inspect real-time buffer allocations and operational capacity.
          </p>
        </div>

        <button
          onClick={() => {
            // Suggest default next stage
            const currIdx = STAGES_META.findIndex(s => s.type === activeStage);
            const nextIdx = Math.min(STAGES_META.length - 1, currIdx + 1);
            setTransferTargetStage(STAGES_META[nextIdx].type);
            setIsTransferModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch Transfer From {activeStage}</span>
        </button>
      </div>

      {/* Visual Pipeline Interactive Nodes with Flow Arrows */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Supply Chain Pipeline
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Push-Pull Boundary: Distributor ⇄ Retailer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {STAGES_META.map((meta, index) => {
              const Icon = meta.icon;
              const isSelected = activeStage === meta.type;
              const stock = products.reduce((acc, p) => acc + (p.stageInventory[meta.type] || 0), 0);
              const capacity = products.reduce((acc, p) => acc + (p.stageCapacity[meta.type] || 500), 0);
              const percent = Math.min(100, Math.round((stock / capacity) * 100));

              return (
                <div key={meta.type} className="relative flex flex-col items-center">
                  <div
                    onClick={() => {
                      setActiveStage(meta.type);
                      setSelectedStage(meta.type);
                    }}
                    className={`w-full p-4 rounded-xl border transition-all cursor-pointer select-none text-left ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-400 shadow-lg ring-2 ring-blue-400/50 scale-[1.03]'
                        : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                        style={{ backgroundColor: `${meta.color}25`, color: meta.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        Tier {index + 1}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{meta.type}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{meta.subtitle}</p>

                    <div className="mt-3 pt-2 border-t border-slate-700/60">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-mono font-bold text-white">
                          {formatNumber(stock)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          / {formatNumber(capacity)}
                        </span>
                      </div>

                      {/* Capacity progress */}
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent > 85 ? 'bg-amber-400' : percent < 20 ? 'bg-rose-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Buffer: {percent}%</span>
                        <span className="font-mono">{meta.leadTimeDefault}d LT</span>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow (for md screens and up) */}
                  {index < STAGES_META.length - 1 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-900 border border-slate-600 items-center justify-center text-blue-400 shadow-md">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic Flow Legend & Educational note */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                Raw Inflow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                Assembly
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Local Fulfillment
              </span>
            </div>
            <div className="text-slate-300 font-mono text-[11px]">
              Selected Tier: <span className="text-blue-400 font-bold">{activeStage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Deep Dive Panel (8 specified metrics from requirement #2) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: `${selectedMeta.color}20`, color: selectedMeta.color }}
            >
              {React.createElement(selectedMeta.icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedMeta.title} Detail Inspection
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {selectedMeta.subtitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
            >
              Transfer Inventory
            </button>
          </div>
        </div>

        {/* 8 Required Stage Details Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Stock
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatNumber(currentStageStock)} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">In local storage racks</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
              Incoming Stock
            </span>
            <div className="text-xl font-bold font-mono text-emerald-900">
              +{formatNumber(incomingStockQty)} <span className="text-xs font-normal text-emerald-800">units</span>
            </div>
            <span className="text-[11px] text-emerald-800 mt-1 block">
              {incomingOrders.length} scheduled orders arriving
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block mb-1">
              Outgoing Stock
            </span>
            <div className="text-xl font-bold font-mono text-blue-900">
              -{formatNumber(outgoingStockQty)} <span className="text-xs font-normal text-blue-800">units</span>
            </div>
            <span className="text-[11px] text-blue-800 mt-1 block">
              {outgoingOrders.length} pending shipments
            </span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80">
            <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block mb-1">
              Stock Value
            </span>
            <div className="text-xl font-bold font-mono text-purple-900">
              {formatCurrency(stageStockValue, settings.currencySymbol)}
            </div>
            <span className="text-[11px] text-purple-800 mt-1 block">Asset capital evaluated</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Orders
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {incomingOrders.length + outgoingOrders.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Total orders linked</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Lead Time
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {selectedMeta.leadTimeDefault} <span className="text-xs font-normal text-slate-500">Days</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Standard echelon latency</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Capacity
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatNumber(stageTotalCapacity)} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Warehouse footprint</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Capacity Utilization
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">{capacityPct}%</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {capacityPct > 80 ? 'Near limit' : 'Nominal buffer room'}
            </span>
          </div>
        </div>

        {/* Product Stock Table at this specific Stage */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Inventory Breakdown at {activeStage}
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Stock At {activeStage}</th>
                  <th className="py-2.5 px-3 text-right">Capacity</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Stage Value</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => {
                  const stock = p.stageInventory[activeStage] || 0;
                  const capacity = p.stageCapacity[activeStage] || 100;
                  const val = calculateInventoryValue(stock, p.unitCost);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{p.id}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatNumber(stock)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatNumber(capacity)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(p.unitCost, settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(val, settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            stock <= 0
                              ? 'bg-rose-50 text-rose-700'
                              : stock < capacity * 0.2
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {stock <= 0 ? 'Depleted' : stock < capacity * 0.2 ? 'Low Buffer' : 'Nominal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stage Recent Transactions */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Recent Transactions Involving {activeStage}
          </h4>
          {stageTransactions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              No recent transactions recorded for this echelon tier.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stageTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{tx.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      {tx.fromStage} → {tx.toStage} • {tx.type} • {tx.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-800">
                      {tx.toStage === activeStage ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </div>
                    <Badge status={tx.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Inventory Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title={`Transfer Inventory from ${activeStage}`}
        subtitle="Simulate an inter-echelon dispatch transaction"
      >
        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product SKU
            </label>
            <select
              value={transferProductId}
              onChange={e => setTransferProductId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — Available at {activeStage}: {p.stageInventory[activeStage] || 0}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Echelon
              </label>
              <input
                type="text"
                disabled
                value={activeStage}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Echelon
              </label>
              <select
                value={transferTargetStage}
                onChange={e => setTransferTargetStage(e.target.value as StageType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {STAGES_META.filter(s => s.type !== activeStage).map(s => (
                  <option key={s.type} value={s.type}>
                    {s.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to Dispatch
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={transferQty}
              onChange={e => setTransferQty(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
