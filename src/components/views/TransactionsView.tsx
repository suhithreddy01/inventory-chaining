import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionType, StageType } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { exportToCSV } from '../../utils/exportUtils';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import {
  ArrowLeftRight,
  Download,
  Filter,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, products, settings, addTransaction, updateStock } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [productId, setProductId] = useState(products[0]?.id || 'PRD-101');
  const [txnType, setTxnType] = useState<TransactionType>('Purchase');
  const [quantity, setQuantity] = useState(25);
  const [fromStage, setFromStage] = useState<StageType | 'External'>('Supplier');
  const [toStage, setToStage] = useState<StageType | 'External'>('Manufacturer');
  const [notes, setNotes] = useState('Laboratory physical stock calibration');

  const txnTypes: (TransactionType | 'All')[] = [
    'All',
    'Purchase',
    'Production',
    'Transfer',
    'Sale',
    'Return',
    'Adjustment'
  ];

  const filteredTransactions = transactions.filter(t => {
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesSearch =
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    addTransaction({
      productId: prod.id,
      productName: prod.name,
      type: txnType,
      quantity,
      unitCost: prod.unitCost,
      fromStage,
      toStage,
      user: 'Technical Lab Student',
      status: 'Completed',
      notes
    });

    // Update stock if relevant
    if (toStage !== 'External') {
      updateStock(prod.id, quantity, toStage as StageType, notes, txnType);
    } else if (fromStage !== 'External') {
      updateStock(prod.id, -quantity, fromStage as StageType, notes, txnType);
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const rows = transactions.map(t => ({
      'Transaction ID': t.id,
      Date: t.date,
      Time: t.time,
      Product: t.productName,
      'Product ID': t.productId,
      Type: t.type,
      Quantity: t.quantity,
      'Unit Cost': t.unitCost,
      'From Stage': t.fromStage,
      'To Stage': t.toStage,
      User: t.user,
      Status: t.status,
      Notes: t.notes
    }));
    exportToCSV('Inventory_Transaction_Audit_Trail', rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Audit Trail & Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete sequential log of purchases, production runs, inter-stage transfers, sales, returns, and write-offs.
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
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Manual Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, product, or user..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {txnTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Transaction ID</th>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Product SKU</th>
                <th className="py-3 px-3.5">Transaction Type</th>
                <th className="py-3 px-3.5 text-right">Quantity</th>
                <th className="py-3 px-3.5">Movement Route</th>
                <th className="py-3 px-3.5 text-right">Est. Value</th>
                <th className="py-3 px-3.5">Operator / User</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-800">{tx.id}</td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono">
                      <div>{tx.date}</div>
                      <div className="text-[10px] text-slate-400">{tx.time}</div>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">{tx.productName}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {tx.type === 'Sale' ? `-${tx.quantity}` : tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <span className="font-medium text-slate-800">{tx.fromStage}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-medium text-slate-800">{tx.toStage}</span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                      {formatCurrency(tx.quantity * tx.unitCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">{tx.user}</td>
                    <td className="py-3 px-3.5">
                      <Badge status={tx.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 max-w-[180px] truncate" title={tx.notes}>
                      {tx.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Inventory Transaction"
        subtitle="Post a verified stock movement to the ledger"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Type
              </label>
              <select
                value={txnType}
                onChange={e => setTxnType(e.target.value as TransactionType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Purchase">Purchase</option>
                <option value="Production">Production</option>
                <option value="Transfer">Transfer</option>
                <option value="Sale">Sale</option>
                <option value="Return">Return</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Echelon
              </label>
              <select
                value={fromStage}
                onChange={e => setFromStage(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="External">External Supplier / Market</option>
                <option value="Supplier">Supplier</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Retailer">Retailer</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To Echelon
              </label>
              <select
                value={toStage}
                onChange={e => setToStage(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Supplier">Supplier</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Retailer">Retailer</option>
                <option value="Customer">Customer</option>
                <option value="External">External Scrap / Disposal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes</label>
            <input
              type="text"
              required
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm cursor-pointer"
            >
              Post Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
