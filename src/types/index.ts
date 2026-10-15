export type StageType = 'Supplier' | 'Manufacturer' | 'Distributor' | 'Retailer' | 'Customer';

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Critical' | 'Out of Stock';

export type OrderStatus = 'Pending' | 'Processing' | 'In Transit' | 'Delivered' | 'Delayed' | 'Cancelled';

export type TransactionType = 'Purchase' | 'Production' | 'Transfer' | 'Sale' | 'Return' | 'Adjustment';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType = 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'reorder_required' 
  | 'delayed_shipment' 
  | 'excess_inventory' 
  | 'high_holding_cost';

export type UserRole = 'student' | 'instructor' | 'operator' | 'researcher';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  role: UserRole;
  station: string;
  avatarText: string;
}

export interface StageInventory {
  stage: StageType;
  stock: number;
  capacity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  unitCost: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  maxStock: number;
  leadTime: number; // in days
  safetyStock: number;
  holdingCostPerDay: number;
  dailyDemand: number;
  description: string;
  stageInventory: Record<StageType, number>;
  stageCapacity: Record<StageType, number>;
  historicalStock: { day: string; stock: number }[];
  demandHistory: { day: string; demand: number }[];
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  sourceStage: StageType;
  destinationStage: StageType;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: OrderStatus;
  notes?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  sourceStage: StageType;
  destinationStage: StageType;
  carrier: string;
  trackingNumber: string;
  departureDate: string;
  estimatedArrival: string;
  progressPercent: number;
  status: 'In Transit' | 'Delivered' | 'Delayed' | 'Dispatched';
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  unitCost: number;
  fromStage: StageType | 'External';
  toStage: StageType | 'External';
  user: string;
  status: 'Completed' | 'Pending' | 'Reversed';
  notes: string;
}

export interface SupplyChainAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  stage?: StageType;
  date: string;
  isRead: boolean;
  actionLabel?: string;
  actionType?: 'reorder' | 'transfer' | 'view';
}

export interface SimulationParams {
  productId: string;
  initialInventory: number;
  customerDemand: number;
  demandPattern: 'steady' | 'spike_30' | 'fluctuating' | 'seasonal';
  productionQuantity: number;
  orderQuantity: number;
  reorderPoint: number;
  leadTime: number;
  holdingCostPerUnit: number;
  stockoutCostPerUnit: number;
  durationDays: number;
}

export interface SimulationDailyResult {
  day: number;
  customerDemand: number;
  customerReceived: number;
  stockoutQty: number;
  stageStock: Record<StageType, number>;
  ordersInPipeline: number;
  holdingCostDay: number;
  stockoutCostDay: number;
  cumulativeCost: number;
  notes?: string;
}

export interface SimulationResult {
  params: SimulationParams;
  dailyResults: SimulationDailyResult[];
  totalDemand: number;
  totalFulfilled: number;
  totalStockouts: number;
  serviceLevel: number;
  totalHoldingCost: number;
  totalStockoutCost: number;
  totalSupplyChainCost: number;
  bullwhipRatio: number;
  peakInventory: number;
  minInventory: number;
  recommendations: string[];
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  reorderRule: 'simple' | 'statistical';
  holdingCostRatePct: number; // annual % e.g. 20%
  stockoutPenaltyMultiplier: number;
  autoReorderEnabled: boolean;
  leadTimeSafetyMultiplier: number;
  notificationPreferences: {
    lowStock: boolean;
    stockout: boolean;
    excessInventory: boolean;
    delayedShipment: boolean;
  };
}

export type ActiveTab = 
  | 'dashboard'
  | 'supply-chain'
  | 'inventory'
  | 'products'
  | 'orders'
  | 'shipments'
  | 'transactions'
  | 'demand-analysis'
  | 'simulation'
  | 'reorder-point'
  | 'analytics'
  | 'alerts'
  | 'reports'
  | 'training-mode'
  | 'settings';
