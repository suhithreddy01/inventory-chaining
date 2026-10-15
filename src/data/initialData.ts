import { Product, Order, Shipment, Transaction, SupplyChainAlert, AppSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PRD-101',
    name: 'Industrial Bearing',
    category: 'Mechanical Components',
    supplier: 'Apex Precision Bearings Ltd.',
    unitCost: 45.0,
    sellingPrice: 85.0,
    currentStock: 140,
    minStock: 50,
    reorderPoint: 120, // Low stock alert triggered!
    maxStock: 500,
    leadTime: 5,
    safetyStock: 40,
    holdingCostPerDay: 0.12,
    dailyDemand: 16,
    description: 'Heavy-duty chrome-steel sealed ball bearing for high-speed industrial electric motors and rotary drives.',
    stageInventory: {
      Supplier: 450,
      Manufacturer: 210,
      Distributor: 180,
      Retailer: 140,
      Customer: 320
    },
    stageCapacity: {
      Supplier: 1000,
      Manufacturer: 600,
      Distributor: 500,
      Retailer: 300,
      Customer: 400
    },
    historicalStock: [
      { day: 'Day 1', stock: 260 },
      { day: 'Day 2', stock: 245 },
      { day: 'Day 3', stock: 220 },
      { day: 'Day 4', stock: 205 },
      { day: 'Day 5', stock: 185 },
      { day: 'Day 6', stock: 160 },
      { day: 'Day 7', stock: 140 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 15 },
      { day: 'Tue', demand: 18 },
      { day: 'Wed', demand: 14 },
      { day: 'Thu', demand: 19 },
      { day: 'Fri', demand: 22 },
      { day: 'Sat', demand: 12 },
      { day: 'Sun', demand: 10 }
    ]
  },
  {
    id: 'PRD-102',
    name: 'Steel Rod (Grade 304)',
    category: 'Raw Materials',
    supplier: 'Global Metallics & Alloys',
    unitCost: 28.5,
    sellingPrice: 52.0,
    currentStock: 320,
    minStock: 100,
    reorderPoint: 200,
    maxStock: 800,
    leadTime: 7,
    safetyStock: 60,
    holdingCostPerDay: 0.08,
    dailyDemand: 20,
    description: 'Stainless steel cylindrical structural rod, high tensile strength for precision CNC machining and frames.',
    stageInventory: {
      Supplier: 800,
      Manufacturer: 450,
      Distributor: 380,
      Retailer: 320,
      Customer: 500
    },
    stageCapacity: {
      Supplier: 1500,
      Manufacturer: 800,
      Distributor: 600,
      Retailer: 500,
      Customer: 600
    },
    historicalStock: [
      { day: 'Day 1', stock: 410 },
      { day: 'Day 2', stock: 390 },
      { day: 'Day 3', stock: 375 },
      { day: 'Day 4', stock: 350 },
      { day: 'Day 5', stock: 335 },
      { day: 'Day 6', stock: 320 },
      { day: 'Day 7', stock: 320 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 22 },
      { day: 'Tue', demand: 19 },
      { day: 'Wed', demand: 24 },
      { day: 'Thu', demand: 21 },
      { day: 'Fri', demand: 25 },
      { day: 'Sat', demand: 14 },
      { day: 'Sun', demand: 8 }
    ]
  },
  {
    id: 'PRD-103',
    name: 'Electric Motor (3-Phase 5HP)',
    category: 'Electromechanical',
    supplier: 'VoltMax Industrial Drives',
    unitCost: 220.0,
    sellingPrice: 380.0,
    currentStock: 18,
    minStock: 15,
    reorderPoint: 35, // Critical / low stock!
    maxStock: 120,
    leadTime: 10,
    safetyStock: 15,
    holdingCostPerDay: 0.75,
    dailyDemand: 3,
    description: 'High efficiency induction motor, 380V/50Hz TEFC cast iron housing for conveyors, pumps, and factory automated machinery.',
    stageInventory: {
      Supplier: 90,
      Manufacturer: 40,
      Distributor: 25,
      Retailer: 18,
      Customer: 45
    },
    stageCapacity: {
      Supplier: 250,
      Manufacturer: 150,
      Distributor: 100,
      Retailer: 50,
      Customer: 80
    },
    historicalStock: [
      { day: 'Day 1', stock: 36 },
      { day: 'Day 2', stock: 32 },
      { day: 'Day 3', stock: 29 },
      { day: 'Day 4', stock: 24 },
      { day: 'Day 5', stock: 22 },
      { day: 'Day 6', stock: 20 },
      { day: 'Day 7', stock: 18 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 4 },
      { day: 'Tue', demand: 3 },
      { day: 'Wed', demand: 5 },
      { day: 'Thu', demand: 2 },
      { day: 'Fri', demand: 4 },
      { day: 'Sat', demand: 1 },
      { day: 'Sun', demand: 1 }
    ]
  },
  {
    id: 'PRD-104',
    name: 'Gear Assembly (Planetary 20:1)',
    category: 'Mechanical Components',
    supplier: 'Titan Gearworks & Transmissions',
    unitCost: 140.0,
    sellingPrice: 260.0,
    currentStock: 0, // Stockout alert!
    minStock: 20,
    reorderPoint: 45,
    maxStock: 150,
    leadTime: 8,
    safetyStock: 20,
    holdingCostPerDay: 0.45,
    dailyDemand: 4,
    description: 'Precision low-backlash planetary reduction gearbox for robotics, servo drives, and heavy torque transmission.',
    stageInventory: {
      Supplier: 110,
      Manufacturer: 55,
      Distributor: 15,
      Retailer: 0, // Stockout at Retailer!
      Customer: 60
    },
    stageCapacity: {
      Supplier: 300,
      Manufacturer: 200,
      Distributor: 120,
      Retailer: 60,
      Customer: 90
    },
    historicalStock: [
      { day: 'Day 1', stock: 24 },
      { day: 'Day 2', stock: 18 },
      { day: 'Day 3', stock: 12 },
      { day: 'Day 4', stock: 8 },
      { day: 'Day 5', stock: 4 },
      { day: 'Day 6', stock: 2 },
      { day: 'Day 7', stock: 0 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 5 },
      { day: 'Tue', demand: 6 },
      { day: 'Wed', demand: 4 },
      { day: 'Thu', demand: 5 },
      { day: 'Fri', demand: 7 },
      { day: 'Sat', demand: 2 },
      { day: 'Sun', demand: 0 }
    ]
  },
  {
    id: 'PRD-105',
    name: 'PLC Control Panel Unit',
    category: 'Automation & Controls',
    supplier: 'LogicFlow Automation Systems',
    unitCost: 480.0,
    sellingPrice: 890.0,
    currentStock: 42,
    minStock: 10,
    reorderPoint: 25,
    maxStock: 80,
    leadTime: 12,
    safetyStock: 10,
    holdingCostPerDay: 1.40,
    dailyDemand: 2,
    description: 'Programmable modular logic controller enclosure with integrated HMI touch display, I/O modules, and Modbus TCP.',
    stageInventory: {
      Supplier: 65,
      Manufacturer: 35,
      Distributor: 28,
      Retailer: 42,
      Customer: 30
    },
    stageCapacity: {
      Supplier: 150,
      Manufacturer: 100,
      Distributor: 80,
      Retailer: 60,
      Customer: 50
    },
    historicalStock: [
      { day: 'Day 1', stock: 48 },
      { day: 'Day 2', stock: 46 },
      { day: 'Day 3', stock: 45 },
      { day: 'Day 4', stock: 44 },
      { day: 'Day 5', stock: 43 },
      { day: 'Day 6', stock: 42 },
      { day: 'Day 7', stock: 42 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 2 },
      { day: 'Tue', demand: 3 },
      { day: 'Wed', demand: 1 },
      { day: 'Thu', demand: 2 },
      { day: 'Fri', demand: 3 },
      { day: 'Sat', demand: 1 },
      { day: 'Sun', demand: 0 }
    ]
  },
  {
    id: 'PRD-106',
    name: 'Hydraulic Pump (Variable Vane)',
    category: 'Hydraulics & Fluid Power',
    supplier: 'HydroDynamics Fluid Engineering',
    unitCost: 310.0,
    sellingPrice: 540.0,
    currentStock: 25,
    minStock: 12,
    reorderPoint: 30, // Low stock alert!
    maxStock: 100,
    leadTime: 9,
    safetyStock: 12,
    holdingCostPerDay: 0.95,
    dailyDemand: 3,
    description: 'Pressure-compensated industrial hydraulic pump, 250 bar rated for stamping presses, injection molding, and heavy lifters.',
    stageInventory: {
      Supplier: 85,
      Manufacturer: 45,
      Distributor: 30,
      Retailer: 25,
      Customer: 35
    },
    stageCapacity: {
      Supplier: 200,
      Manufacturer: 120,
      Distributor: 80,
      Retailer: 50,
      Customer: 60
    },
    historicalStock: [
      { day: 'Day 1', stock: 38 },
      { day: 'Day 2', stock: 35 },
      { day: 'Day 3', stock: 31 },
      { day: 'Day 4', stock: 29 },
      { day: 'Day 5', stock: 28 },
      { day: 'Day 6', stock: 26 },
      { day: 'Day 7', stock: 25 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 3 },
      { day: 'Tue', demand: 4 },
      { day: 'Wed', demand: 2 },
      { day: 'Thu', demand: 4 },
      { day: 'Fri', demand: 5 },
      { day: 'Sat', demand: 1 },
      { day: 'Sun', demand: 1 }
    ]
  },
  {
    id: 'PRD-107',
    name: 'Pneumatic Solenoid Valve Bank',
    category: 'Pneumatics',
    supplier: 'AeroFluidic Automation Corp',
    unitCost: 75.0,
    sellingPrice: 145.0,
    currentStock: 110,
    minStock: 40,
    reorderPoint: 90,
    maxStock: 350,
    leadTime: 6,
    safetyStock: 35,
    holdingCostPerDay: 0.22,
    dailyDemand: 10,
    description: '5/2 way multi-station solenoid valve manifold with 24VDC coils, LED status indicators, and silencers.',
    stageInventory: {
      Supplier: 320,
      Manufacturer: 160,
      Distributor: 120,
      Retailer: 110,
      Customer: 180
    },
    stageCapacity: {
      Supplier: 600,
      Manufacturer: 400,
      Distributor: 300,
      Retailer: 200,
      Customer: 250
    },
    historicalStock: [
      { day: 'Day 1', stock: 155 },
      { day: 'Day 2', stock: 145 },
      { day: 'Day 3', stock: 138 },
      { day: 'Day 4', stock: 126 },
      { day: 'Day 5', stock: 120 },
      { day: 'Day 6', stock: 115 },
      { day: 'Day 7', stock: 110 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 11 },
      { day: 'Tue', demand: 14 },
      { day: 'Wed', demand: 9 },
      { day: 'Thu', demand: 12 },
      { day: 'Fri', demand: 15 },
      { day: 'Sat', demand: 8 },
      { day: 'Sun', demand: 5 }
    ]
  },
  {
    id: 'PRD-108',
    name: 'Composite Fiber Sheet (3mm)',
    category: 'Raw Materials',
    supplier: 'AeroCarbon Materials Inc.',
    unitCost: 95.0,
    sellingPrice: 180.0,
    currentStock: 65,
    minStock: 25,
    reorderPoint: 55,
    maxStock: 220,
    leadTime: 8,
    safetyStock: 20,
    holdingCostPerDay: 0.30,
    dailyDemand: 5,
    description: 'High-modulus carbon-fiber prepreg laminated plate for aerospace and lightweight industrial robotic arms.',
    stageInventory: {
      Supplier: 210,
      Manufacturer: 95,
      Distributor: 70,
      Retailer: 65,
      Customer: 90
    },
    stageCapacity: {
      Supplier: 500,
      Manufacturer: 300,
      Distributor: 200,
      Retailer: 150,
      Customer: 200
    },
    historicalStock: [
      { day: 'Day 1', stock: 85 },
      { day: 'Day 2', stock: 80 },
      { day: 'Day 3', stock: 78 },
      { day: 'Day 4', stock: 72 },
      { day: 'Day 5', stock: 70 },
      { day: 'Day 6', stock: 68 },
      { day: 'Day 7', stock: 65 }
    ],
    demandHistory: [
      { day: 'Mon', demand: 6 },
      { day: 'Tue', demand: 5 },
      { day: 'Wed', demand: 7 },
      { day: 'Thu', demand: 4 },
      { day: 'Fri', demand: 6 },
      { day: 'Sat', demand: 3 },
      { day: 'Sun', demand: 2 }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-7011',
    productId: 'PRD-104',
    productName: 'Gear Assembly (Planetary 20:1)',
    quantity: 50,
    unitCost: 140.0,
    totalCost: 7000.0,
    sourceStage: 'Distributor',
    destinationStage: 'Retailer',
    orderDate: '2026-09-20',
    expectedDelivery: '2026-09-25',
    status: 'In Transit',
    notes: 'Urgent restocking order due to retailer stockout.'
  },
  {
    id: 'ORD-7012',
    productId: 'PRD-101',
    productName: 'Industrial Bearing',
    quantity: 100,
    unitCost: 45.0,
    totalCost: 4500.0,
    sourceStage: 'Manufacturer',
    destinationStage: 'Distributor',
    orderDate: '2026-09-21',
    expectedDelivery: '2026-09-26',
    status: 'Processing',
    notes: 'Batch replenishment to maintain buffer stocks.'
  },
  {
    id: 'ORD-7013',
    productId: 'PRD-103',
    productName: 'Electric Motor (3-Phase 5HP)',
    quantity: 20,
    unitCost: 220.0,
    totalCost: 4400.0,
    sourceStage: 'Supplier',
    destinationStage: 'Manufacturer',
    orderDate: '2026-09-18',
    expectedDelivery: '2026-09-28',
    status: 'In Transit',
    notes: 'Components procurement for assembly line production.'
  },
  {
    id: 'ORD-7014',
    productId: 'PRD-106',
    productName: 'Hydraulic Pump (Variable Vane)',
    quantity: 15,
    unitCost: 310.0,
    totalCost: 4650.0,
    sourceStage: 'Distributor',
    destinationStage: 'Retailer',
    orderDate: '2026-09-22',
    expectedDelivery: '2026-09-27',
    status: 'Pending',
    notes: 'Stock dropped below reorder threshold.'
  },
  {
    id: 'ORD-7015',
    productId: 'PRD-102',
    productName: 'Steel Rod (Grade 304)',
    quantity: 150,
    unitCost: 28.5,
    totalCost: 4275.0,
    sourceStage: 'Retailer',
    destinationStage: 'Customer',
    orderDate: '2026-09-19',
    expectedDelivery: '2026-09-22',
    actualDelivery: '2026-09-22',
    status: 'Delivered',
    notes: 'Delivered to Metro Automation Workshop.'
  },
  {
    id: 'ORD-7016',
    productId: 'PRD-105',
    productName: 'PLC Control Panel Unit',
    quantity: 10,
    unitCost: 480.0,
    totalCost: 4800.0,
    sourceStage: 'Manufacturer',
    destinationStage: 'Distributor',
    orderDate: '2026-09-15',
    expectedDelivery: '2026-09-22',
    status: 'Delayed',
    notes: 'Delayed due to microchip inspection backlog.'
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-8801',
    orderId: 'ORD-7011',
    productName: 'Gear Assembly (Planetary 20:1)',
    quantity: 50,
    sourceStage: 'Distributor',
    destinationStage: 'Retailer',
    carrier: 'TransLogix Express Logistics',
    trackingNumber: 'TRK-992381-EX',
    departureDate: '2026-09-21',
    estimatedArrival: '2026-09-25',
    progressPercent: 78,
    status: 'In Transit'
  },
  {
    id: 'SHP-8802',
    orderId: 'ORD-7013',
    productName: 'Electric Motor (3-Phase 5HP)',
    quantity: 20,
    sourceStage: 'Supplier',
    destinationStage: 'Manufacturer',
    carrier: 'HeavyFreight Freightliners',
    trackingNumber: 'TRK-449102-HF',
    departureDate: '2026-09-19',
    estimatedArrival: '2026-09-28',
    progressPercent: 52,
    status: 'In Transit'
  },
  {
    id: 'SHP-8803',
    orderId: 'ORD-7016',
    productName: 'PLC Control Panel Unit',
    quantity: 10,
    sourceStage: 'Manufacturer',
    destinationStage: 'Distributor',
    carrier: 'Apex Cargo Couriers',
    trackingNumber: 'TRK-331094-AC',
    departureDate: '2026-09-16',
    estimatedArrival: '2026-09-22',
    progressPercent: 65,
    status: 'Delayed'
  },
  {
    id: 'SHP-8804',
    orderId: 'ORD-7015',
    productName: 'Steel Rod (Grade 304)',
    quantity: 150,
    sourceStage: 'Retailer',
    destinationStage: 'Customer',
    carrier: 'Local Metro Delivery Van',
    trackingNumber: 'TRK-109282-LM',
    departureDate: '2026-09-21',
    estimatedArrival: '2026-09-22',
    progressPercent: 100,
    status: 'Delivered'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9041',
    date: '2026-09-24',
    time: '09:30 AM',
    productId: 'PRD-101',
    productName: 'Industrial Bearing',
    type: 'Sale',
    quantity: 16,
    unitCost: 85.0,
    fromStage: 'Retailer',
    toStage: 'Customer',
    user: 'Prof. Miller (Lab Demo)',
    status: 'Completed',
    notes: 'Fulfilled daily industrial maintenance order'
  },
  {
    id: 'TXN-9042',
    date: '2026-09-23',
    time: '04:15 PM',
    productId: 'PRD-102',
    productName: 'Steel Rod (Grade 304)',
    type: 'Transfer',
    quantity: 60,
    unitCost: 28.5,
    fromStage: 'Distributor',
    toStage: 'Retailer',
    user: 'Supply Chain Analyst',
    status: 'Completed',
    notes: 'Standard replenishment shipment received'
  },
  {
    id: 'TXN-9043',
    date: '2026-09-23',
    time: '01:45 PM',
    productId: 'PRD-104',
    productName: 'Gear Assembly (Planetary 20:1)',
    type: 'Sale',
    quantity: 8,
    unitCost: 260.0,
    fromStage: 'Retailer',
    toStage: 'Customer',
    user: 'Store Desk',
    status: 'Completed',
    notes: 'Depleted remaining store inventory - stockout triggered'
  },
  {
    id: 'TXN-9044',
    date: '2026-09-22',
    time: '11:00 AM',
    productId: 'PRD-105',
    productName: 'PLC Control Panel Unit',
    type: 'Production',
    quantity: 15,
    unitCost: 480.0,
    fromStage: 'Manufacturer',
    toStage: 'Manufacturer',
    user: 'Assembly Line A',
    status: 'Completed',
    notes: 'Final quality testing and burn-in passed'
  },
  {
    id: 'TXN-9045',
    date: '2026-09-21',
    time: '02:20 PM',
    productId: 'PRD-103',
    productName: 'Electric Motor (3-Phase 5HP)',
    type: 'Purchase',
    quantity: 20,
    unitCost: 220.0,
    fromStage: 'Supplier',
    toStage: 'Manufacturer',
    user: 'Procurement Specialist',
    status: 'Completed',
    notes: 'PO issued to VoltMax Industrial Drives'
  },
  {
    id: 'TXN-9046',
    date: '2026-09-20',
    time: '10:10 AM',
    productId: 'PRD-106',
    productName: 'Hydraulic Pump (Variable Vane)',
    type: 'Adjustment',
    quantity: -2,
    unitCost: 310.0,
    fromStage: 'Retailer',
    toStage: 'External',
    user: 'Quality Inspector',
    status: 'Completed',
    notes: 'Warehouse audit calibration - damaged casing write-off'
  }
];

export const INITIAL_ALERTS: SupplyChainAlert[] = [
  {
    id: 'ALT-101',
    type: 'out_of_stock',
    severity: 'critical',
    title: 'Zero Stock Level Alert',
    message: 'Gear Assembly (Planetary 20:1) is completely out of stock at Retailer stage. 8 customer backorders pending!',
    productId: 'PRD-104',
    productName: 'Gear Assembly (Planetary 20:1)',
    stage: 'Retailer',
    date: '2026-09-24 08:30 AM',
    isRead: false,
    actionLabel: 'Expedite Order ORD-7011',
    actionType: 'reorder'
  },
  {
    id: 'ALT-102',
    type: 'reorder_required',
    severity: 'warning',
    title: 'Reorder Point Breached',
    message: 'Industrial Bearing (Current: 140 units) has dropped below the reorder point of 120 units. Lead time is 5 days.',
    productId: 'PRD-101',
    productName: 'Industrial Bearing',
    stage: 'Retailer',
    date: '2026-09-24 09:15 AM',
    isRead: false,
    actionLabel: 'Generate Replenishment Order',
    actionType: 'reorder'
  },
  {
    id: 'ALT-103',
    type: 'delayed_shipment',
    severity: 'warning',
    title: 'Shipment Delayed in Transit',
    message: 'Shipment SHP-8803 (PLC Control Panel Unit) from Manufacturer to Distributor is delayed by 2 days.',
    productId: 'PRD-105',
    productName: 'PLC Control Panel Unit',
    stage: 'Distributor',
    date: '2026-09-23 05:00 PM',
    isRead: false,
    actionLabel: 'View Tracking Info',
    actionType: 'view'
  },
  {
    id: 'ALT-104',
    type: 'low_stock',
    severity: 'critical',
    title: 'Safety Stock Warning',
    message: 'Electric Motor (3-Phase 5HP) is at 18 units, dangerously close to minimum stock of 15 units.',
    productId: 'PRD-103',
    productName: 'Electric Motor (3-Phase 5HP)',
    stage: 'Retailer',
    date: '2026-09-23 02:45 PM',
    isRead: false,
    actionLabel: 'Reorder from Distributor',
    actionType: 'reorder'
  },
  {
    id: 'ALT-105',
    type: 'high_holding_cost',
    severity: 'info',
    title: 'Holding Cost Accumulation',
    message: 'High inventory at Supplier stage for Steel Rods (800 units) accumulating $64.00/day holding costs.',
    productId: 'PRD-102',
    productName: 'Steel Rod (Grade 304)',
    stage: 'Supplier',
    date: '2026-09-22 11:30 AM',
    isRead: true,
    actionLabel: 'Optimize Buffer',
    actionType: 'view'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  currency: 'USD',
  currencySymbol: '$',
  reorderRule: 'statistical',
  holdingCostRatePct: 18.0,
  stockoutPenaltyMultiplier: 2.5,
  autoReorderEnabled: true,
  leadTimeSafetyMultiplier: 1.25,
  notificationPreferences: {
    lowStock: true,
    stockout: true,
    excessInventory: true,
    delayedShipment: true
  }
};
