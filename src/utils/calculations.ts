import { Product, ProductStatus } from '../types';

/**
 * Inventory Value = Current Stock × Unit Cost
 */
export function calculateInventoryValue(currentStock: number, unitCost: number): number {
  return Math.max(0, currentStock) * unitCost;
}

/**
 * Determine product status based on stock thresholds
 */
export function getProductStatus(currentStock: number, reorderPoint: number, minStock: number): ProductStatus {
  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock <= minStock) return 'Critical';
  if (currentStock <= reorderPoint) return 'Low Stock';
  return 'In Stock';
}

/**
 * Reorder Point = (Average Demand During Lead Time) + Safety Stock
 * Average Demand During Lead Time = Daily Demand × Lead Time (days)
 */
export function calculateReorderPoint(dailyDemand: number, leadTimeDays: number, safetyStock: number): number {
  const demandDuringLeadTime = dailyDemand * leadTimeDays;
  return Math.round(demandDuringLeadTime + safetyStock);
}

/**
 * Statistical Safety Stock = Z × standardDeviation × sqrt(LeadTime)
 * Z-score for common service levels: 90% -> 1.28, 95% -> 1.65, 99% -> 2.33
 */
export function calculateStatisticalSafetyStock(
  stdDevDemand: number,
  leadTimeDays: number,
  serviceLevelZ: number = 1.65
): number {
  return Math.round(serviceLevelZ * stdDevDemand * Math.sqrt(leadTimeDays));
}

/**
 * Holding Cost = Average Inventory × Holding Cost per Unit
 */
export function calculateHoldingCost(averageInventory: number, holdingCostPerUnit: number): number {
  return Math.max(0, averageInventory) * holdingCostPerUnit;
}

/**
 * Inventory Turnover = Cost of Goods Sold (COGS) / Average Inventory
 */
export function calculateInventoryTurnover(cogs: number, averageInventory: number): number {
  if (averageInventory <= 0) return 0;
  return Number((cogs / averageInventory).toFixed(2));
}

/**
 * Customer Service Level = (Successfully Fulfilled Orders / Total Orders) × 100
 */
export function calculateServiceLevel(fulfilledOrders: number, totalOrders: number): number {
  if (totalOrders <= 0) return 100;
  return Number(((fulfilledOrders / totalOrders) * 100).toFixed(1));
}

/**
 * Economic Order Quantity (EOQ) = sqrt((2 × Annual Demand × Order Cost) / Annual Holding Cost per unit)
 */
export function calculateEOQ(annualDemand: number, orderingCost: number, annualHoldingCostPerUnit: number): number {
  if (annualHoldingCostPerUnit <= 0) return 0;
  return Math.round(Math.sqrt((2 * annualDemand * orderingCost) / annualHoldingCostPerUnit));
}

/**
 * Overall Supply Chain Efficiency Score (0 - 100)
 * Evaluates Service Level, Stockout Rate, Lead Time Performance, and Inventory Turnover
 */
export function calculateSupplyChainEfficiency(
  serviceLevel: number,
  stockoutRate: number,
  avgLeadTime: number,
  inventoryTurnover: number
): number {
  const serviceScore = Math.min(100, serviceLevel) * 0.4;
  const stockoutScore = Math.max(0, 100 - stockoutRate * 3) * 0.25;
  const leadTimeScore = Math.max(0, 100 - (avgLeadTime - 3) * 8) * 0.15;
  const turnoverScore = Math.min(100, (inventoryTurnover / 8) * 100) * 0.2;

  const total = Math.round(serviceScore + stockoutScore + leadTimeScore + turnoverScore);
  return Math.max(10, Math.min(99, total));
}

/**
 * Bullwhip ratio = Variance of Orders / Variance of Demand
 */
export function calculateBullwhipRatio(ordersSeries: number[], demandSeries: number[]): number {
  if (ordersSeries.length < 2 || demandSeries.length < 2) return 1.0;
  
  const variance = (arr: number[]) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (arr.length - 1);
  };

  const varOrders = variance(ordersSeries);
  const varDemand = variance(demandSeries);

  if (varDemand <= 0.001) return 1.15;
  return Number((varOrders / varDemand).toFixed(2));
}

/**
 * Currency Formatter
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
