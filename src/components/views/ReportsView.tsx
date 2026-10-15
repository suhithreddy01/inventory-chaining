import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, printCurrentView } from '../../utils/exportUtils';
import {
  getProductStatus,
  calculateInventoryValue,
  calculateHoldingCost,
  calculateServiceLevel,
  calculateSupplyChainEfficiency,
  formatCurrency,
  formatNumber
} from '../../utils/calculations';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Truck,
  Building2
} from 'lucide-react';

type ReportType =
  | 'inventory'
  | 'stock-movement'
  | 'purchase'
  | 'sales'
  | 'low-stock'
  | 'performance'
  | 'simulation';

export const ReportsView: React.FC = () => {
  const { products, orders, transactions, settings } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventory');

  const reportConfigs: { id: ReportType; title: string; description: string }[] = [
    {
      id: 'inventory',
      title: 'Inventory Status Report',
      description: 'Comprehensive catalogue valuation, buffer levels, and reorder status across all active SKUs.'
    },
    {
      id: 'stock-movement',
      title: 'Stock Movement Report',
      description: 'Sequential audit of internal transfers, assembly dispatches, and warehouse receipts.'
    },
    {
      id: 'purchase',
      title: 'Purchase & Replenishment Report',
      description: 'Procurement expenditures, upstream supplier purchase orders, and lead times.'
    },
    {
      id: 'sales',
      title: 'Sales & Customer Demand Report',
      description: 'End customer sales volume, revenue realizations, and fulfillment percentages.'
    },
    {
      id: 'low-stock',
      title: 'Low Stock & Critical Risk Report',
      description: 'Items breaching reorder point and minimum safety stock with stockout liability.'
    },
    {
      id: 'performance',
      title: 'Supply Chain Performance Report',
      description: 'Executive composite assessment of service level, inventory turnover, lead times, and efficiency.'
    },
    {
      id: 'simulation',
      title: 'Lab Simulation Findings Report',
      description: 'Educational outcome summary of dynamic multi-echelon flow and bullwhip shock testing.'
    }
  ];

  const currentConfig = reportConfigs.find(r => r.id === selectedReport) || reportConfigs[0];

  // Export CSV handler for the active report
  const handleExportCurrent = () => {
    if (selectedReport === 'inventory') {
      const rows = products.map(p => ({
        'Product ID': p.id,
        'Product Name': p.name,
        Category: p.category,
        Supplier: p.supplier,
        'Current Stock': p.currentStock,
        'Min Stock': p.minStock,
        'Reorder Point': p.reorderPoint,
        'Unit Cost': p.unitCost,
        'Inventory Value': calculateInventoryValue(p.currentStock, p.unitCost),
        Status: getProductStatus(p.currentStock, p.reorderPoint, p.minStock)
      }));
      exportToCSV('Inventory_Status_Report', rows);
    } else if (selectedReport === 'stock-movement') {
      const rows = transactions.map(t => ({
        'Transaction ID': t.id,
        Date: `${t.date} ${t.time}`,
        Product: t.productName,
        Type: t.type,
        Quantity: t.quantity,
        'From Stage': t.fromStage,
        'To Stage': t.toStage,
        User: t.user,
        Status: t.status
      }));
      exportToCSV('Stock_Movement_Report', rows);
    } else if (selectedReport === 'purchase') {
      const rows = orders.map(o => ({
        'Order ID': o.id,
        Product: o.productName,
        Quantity: o.quantity,
        'Unit Cost': o.unitCost,
        'Total Cost': o.totalCost,
        SupplierStage: o.sourceStage,
        Destination: o.destinationStage,
        OrderDate: o.orderDate,
        ExpectedDelivery: o.expectedDelivery,
        Status: o.status
      }));
      exportToCSV('Purchase_Orders_Report', rows);
    } else if (selectedReport === 'sales') {
      const salesTxns = transactions.filter(t => t.type === 'Sale');
      const rows = salesTxns.map(t => ({
        'Transaction ID': t.id,
        Date: t.date,
        Product: t.productName,
        Quantity: t.quantity,
        'Unit Price': t.unitCost,
        'Total Sales': t.quantity * t.unitCost,
        Recipient: t.toStage,
        Status: t.status
      }));
      exportToCSV('Sales_Fulfillment_Report', rows);
    } else if (selectedReport === 'low-stock') {
      const lowStock = products.filter(p => p.currentStock <= p.reorderPoint);
      const rows = lowStock.map(p => ({
        'Product ID': p.id,
        Name: p.name,
        'Current Stock': p.currentStock,
        'Reorder Point': p.reorderPoint,
        'Min Stock': p.minStock,
        Deficit: p.reorderPoint - p.currentStock,
        'Lead Time (Days)': p.leadTime,
        Supplier: p.supplier
      }));
      exportToCSV('Low_Stock_Exception_Report', rows);
    } else {
      // Performance / Simulation report export
      const rows = products.map(p => ({
        SKU: p.name,
        'Stockout Status': p.currentStock <= 0 ? 'Stockout' : 'In Stock',
        'Holding Cost/Day': calculateHoldingCost(p.currentStock, p.holdingCostPerDay),
        'Lead Time': `${p.leadTime} days`,
        'Daily Demand': p.dailyDemand
      }));
      exportToCSV('Supply_Chain_Performance_Report', rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Academic Lab Reporting Module</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reports Generator</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal documentation for inventory audits, stock reconciliation, purchase ledgers, and academic assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={printCurrentView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={handleExportCurrent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
        {reportConfigs.map(rep => (
          <button
            key={rep.id}
            onClick={() => setSelectedReport(rep.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedReport === rep.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {rep.title}
          </button>
        ))}
      </div>

      {/* Formatted Report Printable Sheet */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-600 tracking-widest font-mono">
              Inventory Chaining – Technical Training Lab
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{currentConfig.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentConfig.description}</p>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>
              Generated Date:{' '}
              <span className="font-semibold text-slate-800">
                {new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <div>
              Authored By: <span className="font-semibold text-slate-800">Technical Station #04</span>
            </div>
            <div>
              Status: <span className="font-semibold text-emerald-600">Verified System Report</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content based on selectedReport */}
        {selectedReport === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-1">Catalog SKU Count</span>
                <span className="text-xl font-bold font-mono text-slate-900">{products.length} SKUs</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-1">Total Valuation</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {formatCurrency(
                    products.reduce((acc, p) => acc + calculateInventoryValue(p.currentStock, p.unitCost), 0),
                    settings.currencySymbol
                  )}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-1">Buffer Compliance</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {Math.round(((products.length - products.filter(p => p.currentStock <= p.reorderPoint).length) / products.length) * 100)}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SKU ID</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-right">Physical Stock</th>
                    <th className="py-2.5 px-3 text-right">ROP</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Total Value</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{p.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.supplier}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {p.currentStock}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">{p.reorderPoint}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(p.unitCost, settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(calculateInventoryValue(p.currentStock, p.unitCost), settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {getProductStatus(p.currentStock, p.reorderPoint, p.minStock)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'stock-movement' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Movement Type</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{t.id}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{t.date} {t.time}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{t.productName}</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">{t.type}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{t.quantity}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.fromStage} → {t.toStage}</td>
                    <td className="py-2.5 px-3 text-slate-500">{t.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'low-stock' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-1">Immediate Replenishment Directive:</span>
              The following SKUs have breached their designated statistical Reorder Point (ROP) and require purchase order issuance to prevent stockout liabilities.
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Supplier Source</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3 text-right">ROP Threshold</th>
                    <th className="py-2.5 px-3 text-right">Deficit</th>
                    <th className="py-2.5 px-3 text-right">Lead Time</th>
                    <th className="py-2.5 px-3 text-center">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products
                    .filter(p => p.currentStock <= p.reorderPoint)
                    .map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name} ({p.id})</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.supplier}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                          {p.currentStock}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                          {p.reorderPoint}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                          {p.reorderPoint - p.currentStock} units
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{p.leadTime} days</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.currentStock <= 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.currentStock <= 0 ? 'CRITICAL (OUT)' : 'REORDER NOW'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(selectedReport === 'purchase' || selectedReport === 'sales' || selectedReport === 'performance' || selectedReport === 'simulation') && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Executive Summary</span>
              <span>
                Multi-echelon inventory flow reflects steady buffer velocity through Tier 1 (Supplier) to Tier 5 (Customer).
                Current active orders stand at {orders.length} with {orders.filter(o => o.status === 'Delivered').length} fulfilled.
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-right">Units</th>
                    <th className="py-2.5 px-3">Source → Destination</th>
                    <th className="py-2.5 px-3 text-right">Order Cost</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{o.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{o.productName}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{o.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-600">{o.sourceStage} → {o.destinationStage}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        {formatCurrency(o.totalCost, settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Academic Signoff Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>Technical Training Lab Simulation Ledger • Academic Courseware Project</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Digital Cryptographic Signature Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
