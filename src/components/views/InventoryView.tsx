import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  getProductStatus,
  calculateInventoryValue,
  calculateReorderPoint,
  formatCurrency,
  formatNumber
} from '../../utils/calculations';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    setActiveTab,
    setSelectedProductId
  } = useApp();

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Product>('currentStock');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [activeEditingProduct, setActiveEditingProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [stockReason, setStockReason] = useState<string>('Manual stock adjustment');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mechanical Components',
    supplier: '',
    unitCost: 50,
    sellingPrice: 90,
    currentStock: 100,
    minStock: 25,
    reorderPoint: 60,
    maxStock: 300,
    leadTime: 5,
    safetyStock: 20,
    holdingCostPerDay: 0.2,
    dailyDemand: 8,
    description: ''
  });

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

        const status = getProductStatus(p.currentStock, p.reorderPoint, p.minStock);
        const matchesStatus = selectedStatusFilter === 'All' || status === selectedStatusFilter;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [products, searchQuery, selectedCategory, selectedStatusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: 'Mechanical Components',
      supplier: 'Precision Components Ltd',
      unitCost: 50,
      sellingPrice: 90,
      currentStock: 100,
      minStock: 25,
      reorderPoint: calculateReorderPoint(8, 5, 20),
      maxStock: 300,
      leadTime: 5,
      safetyStock: 20,
      holdingCostPerDay: 0.2,
      dailyDemand: 8,
      description: 'Industrial grade technical component'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setActiveEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      supplier: p.supplier,
      unitCost: p.unitCost,
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      reorderPoint: p.reorderPoint,
      maxStock: p.maxStock,
      leadTime: p.leadTime,
      safetyStock: p.safetyStock,
      holdingCostPerDay: p.holdingCostPerDay,
      dailyDemand: p.dailyDemand,
      description: p.description
    });
    setIsEditModalOpen(true);
  };

  const handleOpenStockModal = (p: Product) => {
    setActiveEditingProduct(p);
    setStockDelta(20);
    setStockReason('Lab inventory calibration');
    setIsStockModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      ...formData,
      stageInventory: {
        Supplier: formData.currentStock * 2,
        Manufacturer: Math.round(formData.currentStock * 1.2),
        Distributor: formData.currentStock,
        Retailer: formData.currentStock,
        Customer: Math.round(formData.currentStock * 0.8)
      },
      stageCapacity: {
        Supplier: formData.maxStock * 2,
        Manufacturer: Math.round(formData.maxStock * 1.5),
        Distributor: formData.maxStock,
        Retailer: formData.maxStock,
        Customer: formData.maxStock
      }
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingProduct) return;
    updateProduct(activeEditingProduct.id, formData);
    setIsEditModalOpen(false);
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingProduct) return;
    updateStock(
      activeEditingProduct.id,
      stockDelta,
      'Retailer',
      stockReason,
      stockDelta > 0 ? 'Purchase' : 'Adjustment'
    );
    setIsStockModalOpen(false);
  };

  const handleExportCSV = () => {
    const rows = products.map(p => {
      const status = getProductStatus(p.currentStock, p.reorderPoint, p.minStock);
      const val = calculateInventoryValue(p.currentStock, p.unitCost);
      return {
        'Product ID': p.id,
        'Product Name': p.name,
        Category: p.category,
        Supplier: p.supplier,
        'Current Stock': p.currentStock,
        'Min Stock': p.minStock,
        'Reorder Point': p.reorderPoint,
        'Max Stock': p.maxStock,
        'Lead Time (Days)': p.leadTime,
        'Unit Cost': p.unitCost,
        'Inventory Value': val,
        Status: status
      };
    });
    exportToCSV('Inventory_Catalog_Report', rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>SKU Directory & Operational Master</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage engineering inventory items, thresholds, reorder points, lead times, and valuations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, supplier, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Status: All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Supplier</th>
                <th
                  onClick={() => handleSort('currentStock')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Min Stock</th>
                <th
                  onClick={() => handleSort('reorderPoint')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Reorder Point</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Max Stock</th>
                <th
                  onClick={() => handleSort('unitCost')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Unit Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Inventory Value</th>
                <th className="py-3 px-3 text-center">Lead Time</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-xs text-slate-400">
                    No products matched your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const status = getProductStatus(p.currentStock, p.reorderPoint, p.minStock);
                  const inventoryValue = calculateInventoryValue(p.currentStock, p.unitCost);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{p.id}</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setActiveTab('products');
                          }}
                          className="font-semibold text-blue-600 hover:text-blue-800 text-left hover:underline cursor-pointer"
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.category}</td>
                      <td className="py-3 px-3 text-slate-500 max-w-[140px] truncate" title={p.supplier}>
                        {p.supplier}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatNumber(p.currentStock)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">{p.minStock}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-amber-700 bg-amber-50/30">
                        {p.reorderPoint}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">{p.maxStock}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(p.unitCost, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inventoryValue, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {p.leadTime}d
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge status={status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Adjust stock button */}
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            title="Quick Stock Adjustment"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          {/* Details button */}
                          <button
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setActiveTab('products');
                            }}
                            title="View Product History & Details"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product Parameters"
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product ${p.name} (${p.id})?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Delete SKU"
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Engineering SKU"
        subtitle="Configure item specs, reorder threshold, and lead time"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Servo Motor 400W"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Cost ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.unitCost}
                  onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.sellingPrice}
                  onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentStock}
                  onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  required
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Demand
                </label>
                <input
                  type="number"
                  required
                  value={formData.dailyDemand}
                  onChange={e => {
                    const d = Number(e.target.value);
                    const rop = calculateReorderPoint(d, formData.leadTime, formData.safetyStock);
                    setFormData({ ...formData, dailyDemand: d, reorderPoint: rop });
                  }}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  required
                  value={formData.leadTime}
                  onChange={e => {
                    const lt = Number(e.target.value);
                    const rop = calculateReorderPoint(formData.dailyDemand, lt, formData.safetyStock);
                    setFormData({ ...formData, leadTime: lt, reorderPoint: rop });
                  }}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Safety Stock
                </label>
                <input
                  type="number"
                  required
                  value={formData.safetyStock}
                  onChange={e => {
                    const ss = Number(e.target.value);
                    const rop = calculateReorderPoint(formData.dailyDemand, formData.leadTime, ss);
                    setFormData({ ...formData, safetyStock: ss, reorderPoint: rop });
                  }}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Auto Reorder Point (ROP)
                </label>
                <input
                  type="number"
                  required
                  value={formData.reorderPoint}
                  onChange={e => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-300 bg-blue-50/50 font-bold font-mono text-blue-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Warehouse Stock
                </label>
                <input
                  type="number"
                  required
                  value={formData.maxStock}
                  onChange={e => setFormData({ ...formData, maxStock: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Holding Cost ($/unit/day)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.holdingCostPerDay}
                  onChange={e => setFormData({ ...formData, holdingCostPerDay: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${activeEditingProduct?.name || 'Product'}`}
        subtitle={`SKU ID: ${activeEditingProduct?.id}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.unitCost}
                  onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.sellingPrice}
                  onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock</label>
                <input
                  type="number"
                  required
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Point</label>
                <input
                  type="number"
                  required
                  value={formData.reorderPoint}
                  onChange={e => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                <input
                  type="number"
                  required
                  value={formData.leadTime}
                  onChange={e => setFormData({ ...formData, leadTime: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Stock</label>
                <input
                  type="number"
                  required
                  value={formData.safetyStock}
                  onChange={e => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm cursor-pointer"
            >
              Update Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Stock Adjustment Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock for ${activeEditingProduct?.name || ''}`}
        subtitle={`Current Retailer stock: ${activeEditingProduct?.currentStock} units`}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity Delta (+ to restock, - to deduct)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStockDelta(prev => prev - 10)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <MinusCircle className="w-5 h-5 text-rose-500" />
              </button>
              <input
                type="number"
                value={stockDelta}
                onChange={e => setStockDelta(Number(e.target.value))}
                className="flex-1 text-center font-mono font-bold text-sm p-2 rounded-lg border border-slate-300"
                required
              />
              <button
                type="button"
                onClick={() => setStockDelta(prev => prev + 10)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <PlusCircle className="w-5 h-5 text-emerald-500" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 text-center">
              New Projected Stock:{' '}
              <span className="font-bold text-slate-800 font-mono">
                {Math.max(0, (activeEditingProduct?.currentStock || 0) + stockDelta)} units
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Reason / Transaction Note
            </label>
            <input
              type="text"
              required
              value={stockReason}
              onChange={e => setStockReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm cursor-pointer"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
