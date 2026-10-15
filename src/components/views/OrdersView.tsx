import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, StageType } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  formatCurrency,
  formatNumber
} from '../../utils/calculations';
import { exportToCSV } from '../../utils/exportUtils';
import {
  ShoppingCart,
  Plus,
  Filter,
  Download,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    orders,
    products,
    settings,
    createOrder,
    updateOrderStatus,
    createShipmentFromOrder,
    setActiveTab
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Order Form state
  const [newOrderProduct, setNewOrderProduct] = useState(products[0]?.id || 'PRD-101');
  const [newOrderQty, setNewOrderQty] = useState(50);
  const [newOrderSource, setNewOrderSource] = useState<StageType>('Distributor');
  const [newOrderDestination, setNewOrderDestination] = useState<StageType>('Retailer');
  const [newOrderNotes, setNewOrderNotes] = useState('Standard replenishment batch');

  const selectedProduct = products.find(p => p.id === newOrderProduct) || products[0];

  const filteredOrders = orders.filter(
    o => statusFilter === 'All' || o.status === statusFilter
  );

  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const transitCount = orders.filter(o => o.status === 'In Transit').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalValue = orders.reduce((sum, o) => sum + (o.totalCost || o.quantity * o.unitCost), 0);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const unitCost = selectedProduct.unitCost;
    const totalCost = newOrderQty * unitCost;
    const now = new Date();
    const orderDate = now.toISOString().split('T')[0];
    const deliveryDate = new Date(now.getTime() + (selectedProduct.leadTime || 4) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    createOrder({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: newOrderQty,
      unitCost,
      totalCost,
      sourceStage: newOrderSource,
      destinationStage: newOrderDestination,
      orderDate,
      expectedDelivery: deliveryDate,
      status: 'Pending',
      notes: newOrderNotes
    });

    setIsCreateModalOpen(false);
  };

  const handleExportCSV = () => {
    const rows = orders.map(o => ({
      'Order ID': o.id,
      Product: o.productName,
      Quantity: o.quantity,
      'Source Stage': o.sourceStage,
      'Destination Stage': o.destinationStage,
      'Unit Cost': o.unitCost,
      'Total Cost': o.totalCost,
      'Order Date': o.orderDate,
      'Expected Delivery': o.expectedDelivery,
      'Actual Delivery': o.actualDelivery || 'N/A',
      Status: o.status,
      Notes: o.notes || ''
    }));
    exportToCSV('Supply_Chain_Orders_Log', rows);
  };

  const stagesList: StageType[] = ['Supplier', 'Manufacturer', 'Distributor', 'Retailer', 'Customer'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Order Fulfillment Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track inter-echelon purchase orders, stage replenishment, transit dispatches, and delivery sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Orders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Orders
          </span>
          <div className="text-2xl font-mono font-bold text-slate-900">{totalOrdersCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">In pipeline ledger</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
            Pending / Processing
          </span>
          <div className="text-2xl font-mono font-bold text-amber-800">{pendingCount}</div>
          <span className="text-[11px] text-amber-800 mt-1 block">Awaiting fulfillment</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block mb-1">
            In Transit
          </span>
          <div className="text-2xl font-mono font-bold text-blue-900">{transitCount}</div>
          <span className="text-[11px] text-blue-800 mt-1 block">Active freight routes</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Delivered
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-900">{deliveredCount}</div>
          <span className="text-[11px] text-emerald-800 mt-1 block">100% fulfilled</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Pending', 'Processing', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Order ID</th>
                <th className="py-3 px-3.5">Product SKU</th>
                <th className="py-3 px-3.5 text-right">Quantity</th>
                <th className="py-3 px-3.5">Source → Destination</th>
                <th className="py-3 px-3.5 text-right">Order Value</th>
                <th className="py-3 px-3.5">Order Date</th>
                <th className="py-3 px-3.5">Expected Delivery</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    No orders match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-800">{ord.id}</td>
                    <td className="py-3 px-3.5">
                      <span className="font-semibold text-slate-900 block">{ord.productName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{ord.productId}</span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {formatNumber(ord.quantity)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <span className="font-medium text-slate-800">{ord.sourceStage}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-medium text-slate-800">{ord.destinationStage}</span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(ord.totalCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono">{ord.orderDate}</td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono">
                      {ord.expectedDelivery}
                      {ord.status === 'Delayed' && (
                        <span className="text-[10px] font-bold text-rose-500 block">Past Due</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <Badge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {ord.status === 'Pending' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'Processing')}
                            className="px-2 py-1 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            Process
                          </button>
                        )}

                        {ord.status === 'Processing' && (
                          <button
                            onClick={() => createShipmentFromOrder(ord.id)}
                            className="px-2 py-1 text-[11px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                          >
                            <Truck className="w-3 h-3" />
                            Dispatch
                          </button>
                        )}

                        {ord.status === 'In Transit' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'Delivered')}
                            className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Receive
                          </button>
                        )}

                        {ord.status === 'Delivered' && (
                          <span className="text-[10px] text-emerald-600 font-mono">Completed</span>
                        )}

                        {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'Cancelled')}
                            className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Issue New Supply Chain Order"
        subtitle="Establish batch replenishment between stages"
      >
        <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product SKU
            </label>
            <select
              value={newOrderProduct}
              onChange={e => setNewOrderProduct(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — Unit Cost: {formatCurrency(p.unitCost, settings.currencySymbol)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Tier
              </label>
              <select
                value={newOrderSource}
                onChange={e => setNewOrderSource(e.target.value as StageType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {stagesList.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Tier
              </label>
              <select
                value={newOrderDestination}
                onChange={e => setNewOrderDestination(e.target.value as StageType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {stagesList.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={newOrderQty}
                onChange={e => setNewOrderQty(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Calculated Value
              </label>
              <div className="text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold font-mono text-slate-800">
                {formatCurrency(newOrderQty * (selectedProduct?.unitCost || 0), settings.currencySymbol)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes</label>
            <input
              type="text"
              value={newOrderNotes}
              onChange={e => setNewOrderNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm cursor-pointer"
            >
              Issue Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
