import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { LineChart } from '../charts/LineChart';
import { BarChart } from '../charts/BarChart';
import {
  getProductStatus,
  calculateInventoryValue,
  formatCurrency,
  formatNumber
} from '../../utils/calculations';
import {
  Boxes,
  Truck,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  ShoppingCart,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { StageType } from '../../types';

export const ProductDetailsView: React.FC = () => {
  const {
    products,
    transactions,
    settings,
    selectedProductId,
    setSelectedProductId,
    createOrder,
    setActiveTab,
    showToast
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'overview' | 'history' | 'chain'>('overview');

  const currentProduct =
    products.find(p => p.id === selectedProductId) || products[0] || null;

  if (!currentProduct) {
    return (
      <div className="p-8 text-center text-slate-500">
        No product selected or catalogue is empty.
      </div>
    );
  }

  const status = getProductStatus(
    currentProduct.currentStock,
    currentProduct.reorderPoint,
    currentProduct.minStock
  );
  const inventoryValue = calculateInventoryValue(currentProduct.currentStock, currentProduct.unitCost);

  // Filter purchase and sales history from transactions
  const productTransactions = transactions.filter(t => t.productId === currentProduct.id);
  const purchaseHistory = productTransactions.filter(
    t => t.type === 'Purchase' || t.type === 'Production' || t.type === 'Transfer'
  );
  const salesHistory = productTransactions.filter(t => t.type === 'Sale');

  // Chart data format
  const stockHistoryChartData = currentProduct.historicalStock.map(item => ({
    label: item.day,
    value: item.stock
  }));

  const demandHistoryChartData = currentProduct.demandHistory.map(item => ({
    label: item.day,
    value: item.demand
  }));

  const stages: StageType[] = ['Supplier', 'Manufacturer', 'Distributor', 'Retailer', 'Customer'];

  const handleQuickReorder = () => {
    const orderQty = Math.max(
      currentProduct.reorderPoint * 2 - currentProduct.currentStock,
      50
    );
    createOrder({
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantity: orderQty,
      unitCost: currentProduct.unitCost,
      totalCost: orderQty * currentProduct.unitCost,
      sourceStage: 'Distributor',
      destinationStage: 'Retailer',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + currentProduct.leadTime * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      status: 'Pending',
      notes: `Lab auto-reorder trigger for ${currentProduct.name}`
    });
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Engineering SKU Deep Dive</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{currentProduct.name}</h2>
            <Badge status={status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ID: <span className="font-mono font-bold text-slate-700">{currentProduct.id}</span> | Category: {currentProduct.category} | Supplier: {currentProduct.supplier}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Product Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentProduct.id}
              onChange={e => setSelectedProductId(e.target.value)}
              className="appearance-none text-xs font-semibold py-2 pl-3 pr-8 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <button
            onClick={handleQuickReorder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Issue Restocking PO</span>
          </button>
        </div>
      </div>

      {/* 9 Specified Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Current Inventory
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatNumber(currentProduct.currentStock)} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">At Retailer tier</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Inventory Value
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatCurrency(inventoryValue, settings.currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">@ {formatCurrency(currentProduct.unitCost, settings.currencySymbol)} / unit</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
            Reorder Point (ROP)
          </span>
          <div className="text-xl font-bold font-mono text-amber-800">
            {currentProduct.reorderPoint} <span className="text-xs font-normal text-amber-800">units</span>
          </div>
          <span className="text-[10px] text-amber-800 mt-1 block">Lead demand + safety</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Lead Time
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {currentProduct.leadTime} <span className="text-xs font-normal text-slate-500">Days</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Supplier cycle time</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Safety Stock
          </span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {currentProduct.safetyStock} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Buffer reserve</span>
        </div>
      </div>

      {/* Multi-echelon stock levels for this product */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Multi-Echelon Stock Distribution Across Chain
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stages.map(st => {
            const stock = currentProduct.stageInventory[st] || 0;
            const cap = currentProduct.stageCapacity[st] || 100;
            const pct = Math.min(100, Math.round((stock / cap) * 100));

            return (
              <div key={st} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{st}</span>
                  <span className="font-mono text-slate-500">{pct}%</span>
                </div>
                <div className="text-lg font-mono font-bold text-slate-900">
                  {formatNumber(stock)}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {cap}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stock <= 0 ? 'bg-rose-500' : stock < cap * 0.25 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section: Historical Stock & Historical Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Stock Trend */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Historical Stock Trend
              </h3>
              <p className="text-xs text-slate-500">Inventory level progression over past 7 days</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Trend
            </span>
          </div>

          <LineChart
            data={stockHistoryChartData}
            height={200}
            color="#2563eb"
            valueSuffix=" units"
          />

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Minimum Recorded:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {Math.min(...stockHistoryChartData.map(d => d.value))} units
            </span>
          </div>
        </div>

        {/* Historical Demand */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Weekly Customer Demand Profile
              </h3>
              <p className="text-xs text-slate-500">Daily unit sales and pull demand</p>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Consumption
            </span>
          </div>

          <BarChart
            data={demandHistoryChartData}
            height={200}
            barColor="#f59e0b"
            valueSuffix=" units"
          />

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Demand Day:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {demandHistoryChartData.reduce((prev, curr) => (curr.value > prev.value ? curr : prev)).label}{' '}
              ({Math.max(...demandHistoryChartData.map(d => d.value))} units)
            </span>
          </div>
        </div>
      </div>

      {/* History Tables: Purchase History & Sales History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase / Inflow History */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Purchase & Replenishment History
            </h3>
            <span className="text-xs text-slate-400 font-mono">{purchaseHistory.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Type</th>
                  <th className="py-2 px-2.5">Route</th>
                  <th className="py-2 px-2.5 text-right">Qty</th>
                  <th className="py-2 px-2.5 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No purchase transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchaseHistory.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 text-slate-500 font-mono">{tx.date}</td>
                      <td className="py-2 px-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-slate-600">
                        {tx.fromStage} → {tx.toStage}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-600">
                        +{tx.quantity}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                        {formatCurrency(tx.quantity * tx.unitCost, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales / Outflow History */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Sales & Fulfillment History
            </h3>
            <span className="text-xs text-slate-400 font-mono">{salesHistory.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Customer Echelon</th>
                  <th className="py-2 px-2.5 text-right">Units Sold</th>
                  <th className="py-2 px-2.5 text-right">Revenue</th>
                  <th className="py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No sales recorded for this SKU yet.
                    </td>
                  </tr>
                ) : (
                  salesHistory.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 text-slate-500 font-mono">{tx.date}</td>
                      <td className="py-2 px-2.5 text-slate-600">Customer</td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                        {tx.quantity}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-semibold text-emerald-700">
                        {formatCurrency(tx.quantity * currentProduct.sellingPrice, settings.currencySymbol)}
                      </td>
                      <td className="py-2 px-2.5">
                        <Badge status={tx.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
