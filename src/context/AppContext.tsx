import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  Order,
  Shipment,
  Transaction,
  SupplyChainAlert,
  AppSettings,
  ActiveTab,
  StageType,
  OrderStatus,
  TransactionType,
  User,
  UserRole
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SHIPMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_SETTINGS
} from '../data/initialData';
import { calculateReorderPoint } from '../utils/calculations';

export const DEMO_USERS: User[] = [
  {
    id: 'USR-01',
    name: 'Alex Vance',
    username: 'alex_vance',
    email: 'student@lab.edu',
    password: 'lab2026',
    role: 'student',
    station: 'Station #04',
    avatarText: 'AV'
  },
  {
    id: 'USR-02',
    name: 'Prof. Miller',
    username: 'prof_miller',
    email: 'instructor@lab.edu',
    password: 'admin2026',
    role: 'instructor',
    station: 'Faculty Terminal',
    avatarText: 'PM'
  },
  {
    id: 'USR-03',
    name: 'Marcus Chen',
    username: 'marcus_chen',
    email: 'operator@chain.org',
    password: 'operator2026',
    role: 'operator',
    station: 'Logistics Control Desk',
    avatarText: 'MC'
  }
];

interface AppContextType {
  products: Product[];
  orders: Order[];
  shipments: Shipment[];
  transactions: Transaction[];
  alerts: SupplyChainAlert[];
  settings: AppSettings;
  activeTab: ActiveTab;
  selectedProductId: string | null;
  selectedStage: StageType | null;
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  currentUser: User | null;
  registeredUsers: User[];

  // Authentication & Account Creation
  login: (user: User) => void;
  logout: () => void;
  registerAccount: (userData: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    role: UserRole;
    station: string;
  }) => User;
  verifyLogin: (
    identifier: string,
    passwordInput?: string
  ) => { success: boolean; message?: string; user?: User };
  loginWithoutPassword: (emailOrIdOrName: string) => boolean;
  updateUserPassword: (userId: string, newPassword: string) => void;
  deleteAccount: (userId: string) => void;
  
  // Navigation & selection
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedProductId: (id: string | null) => void;
  setSelectedStage: (stage: StageType | null) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;

  // Product management
  addProduct: (product: Omit<Product, 'id' | 'historicalStock' | 'demandHistory'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (
    productId: string,
    delta: number,
    stage: StageType,
    reason: string,
    txnType?: TransactionType
  ) => void;

  // Order & shipment management
  createOrder: (order: Omit<Order, 'id'>) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceShipment: (shipmentId: string) => void;
  createShipmentFromOrder: (orderId: string, carrier?: string) => void;

  // Transactions & alerts
  addTransaction: (txn: Omit<Transaction, 'id' | 'date' | 'time'>) => void;
  markAlertRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;

  // Settings & Reset
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
  runQuickDemandShockDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ic_lab_products_v1',
  ORDERS: 'ic_lab_orders_v1',
  SHIPMENTS: 'ic_lab_shipments_v1',
  TRANSACTIONS: 'ic_lab_transactions_v1',
  ALERTS: 'ic_lab_alerts_v1',
  SETTINGS: 'ic_lab_settings_v1',
  CURRENT_USER: 'ic_lab_current_user_v1',
  USERS: 'ic_lab_registered_users_v1'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    return saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [alerts, setAlerts] = useState<SupplyChainAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!saved) return DEMO_USERS;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((u: User) => ({
        ...u,
        username: u.username || u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
      }));
    } catch {
      return DEMO_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string | null>('PRD-101');
  const [selectedStage, setSelectedStage] = useState<StageType | null>('Retailer');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const generateAvatarText = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.trim().slice(0, 2) || 'US').toUpperCase();
  };

  const registerAccount = (data: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    role: UserRole;
    station: string;
  }): User => {
    const fallbackUsername =
      data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') ||
      data.name.toLowerCase().replace(/\s+/g, '_');
    const cleanUsername = (data.username?.trim() || fallbackUsername)
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '');
    const cleanPassword =
      data.password && data.password.trim().length > 0 ? data.password.trim() : undefined;

    const newUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email.trim().toLowerCase(),
      password: cleanPassword,
      role: data.role,
      station: data.station.trim() || 'Station #05',
      avatarText: generateAvatarText(data.name)
    };
    setRegisteredUsers(prev => [
      newUser,
      ...prev.filter(
        u =>
          u.email.toLowerCase() !== newUser.email &&
          (!u.username || u.username.toLowerCase() !== newUser.username)
      )
    ]);
    setCurrentUser(newUser);
    if (cleanPassword) {
      showToast(`Account created for @${newUser.username}! Password set successfully.`, 'success');
    } else {
      showToast(`Account created for @${newUser.username}! Password-free access enabled.`, 'success');
    }
    return newUser;
  };

  const verifyLogin = (
    identifier: string,
    passwordInput?: string
  ): { success: boolean; message?: string; user?: User } => {
    const query = identifier.trim().toLowerCase();
    if (!query) {
      return { success: false, message: 'Please enter a username or email address.' };
    }

    const found = registeredUsers.find(
      u =>
        (u.username && u.username.toLowerCase() === query) ||
        u.email.toLowerCase() === query ||
        u.id.toLowerCase() === query ||
        u.name.toLowerCase() === query
    );

    if (!found) {
      return {
        success: false,
        message: `No account found for "${identifier}". Please check username/email or sign up.`
      };
    }

    // Check if account has a password set
    if (found.password && found.password.length > 0) {
      if (!passwordInput || passwordInput.trim().length === 0) {
        return {
          success: false,
          message: `Account "@${found.username || found.name}" is password protected. Please enter your password.`
        };
      }
      if (passwordInput !== found.password) {
        return {
          success: false,
          message: `Incorrect password for user "${found.username || found.name}". Please enter the correct password.`
        };
      }
    }

    setCurrentUser(found);
    const authNote = found.password ? 'Verified with password' : 'Password-free access';
    showToast(`Welcome back, ${found.name}! (${authNote})`, 'success');
    return { success: true, user: found };
  };

  const loginWithoutPassword = (emailOrIdOrName: string): boolean => {
    const query = emailOrIdOrName.trim().toLowerCase();
    const found = registeredUsers.find(
      u =>
        (u.username && u.username.toLowerCase() === query) ||
        u.email.toLowerCase() === query ||
        u.id.toLowerCase() === query ||
        u.name.toLowerCase() === query
    );
    if (found) {
      if (found.password && found.password.length > 0) {
        showToast(
          `User "@${found.username || found.name}" requires a password. Please enter the password to log in.`,
          'warning'
        );
        return false;
      }
      setCurrentUser(found);
      showToast(`Welcome back, ${found.name}! Passwordless access granted to ${found.station}`, 'success');
      return true;
    }
    return false;
  };

  const updateUserPassword = (userId: string, newPassword: string) => {
    const cleanPwd = newPassword.trim().length > 0 ? newPassword.trim() : undefined;
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: cleanPwd } : u))
    );
    setCurrentUser(prev => (prev && prev.id === userId ? { ...prev, password: cleanPwd } : prev));
    if (cleanPwd) {
      showToast('Password updated! Your new password is now required for your username.', 'success');
    } else {
      showToast('Password removed. Password-free instant login enabled for this account.', 'info');
    }
  };

  const deleteAccount = (userId: string) => {
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    showToast('Account removed from registered station list', 'info');
  };

  const login = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! Connected to ${user.station}`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Signed out successfully', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  const addTransaction = (txn: Omit<Transaction, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTxn: Transaction = {
      ...txn,
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      time: timeStr
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  const addProduct = (item: Omit<Product, 'id' | 'historicalStock' | 'demandHistory'>) => {
    const newId = `PRD-${100 + products.length + 1}`;
    const calculatedRop = calculateReorderPoint(item.dailyDemand, item.leadTime, item.safetyStock);

    const newProduct: Product = {
      ...item,
      id: newId,
      reorderPoint: item.reorderPoint || calculatedRop,
      historicalStock: [
        { day: 'Day 1', stock: item.currentStock + 40 },
        { day: 'Day 2', stock: item.currentStock + 30 },
        { day: 'Day 3', stock: item.currentStock + 25 },
        { day: 'Day 4', stock: item.currentStock + 15 },
        { day: 'Day 5', stock: item.currentStock + 10 },
        { day: 'Day 6', stock: item.currentStock + 5 },
        { day: 'Day 7', stock: item.currentStock }
      ],
      demandHistory: [
        { day: 'Mon', demand: Math.round(item.dailyDemand * 0.9) },
        { day: 'Tue', demand: Math.round(item.dailyDemand * 1.1) },
        { day: 'Wed', demand: Math.round(item.dailyDemand * 1.0) },
        { day: 'Thu', demand: Math.round(item.dailyDemand * 1.2) },
        { day: 'Fri', demand: Math.round(item.dailyDemand * 1.3) },
        { day: 'Sat', demand: Math.round(item.dailyDemand * 0.5) },
        { day: 'Sun', demand: Math.round(item.dailyDemand * 0.3) }
      ]
    };

    setProducts(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added successfully!`, 'success');

    addTransaction({
      productId: newId,
      productName: newProduct.name,
      type: 'Adjustment',
      quantity: newProduct.currentStock,
      unitCost: newProduct.unitCost,
      fromStage: 'External',
      toStage: 'Retailer',
      user: currentUser?.name || 'Instructor / Admin',
      status: 'Completed',
      notes: 'Initial catalogue onboarding'
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        if (updates.dailyDemand !== undefined || updates.leadTime !== undefined || updates.safetyStock !== undefined) {
          updated.reorderPoint = calculateReorderPoint(
            updated.dailyDemand,
            updated.leadTime,
            updated.safetyStock
          );
        }
        return updated;
      })
    );
    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    const item = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Deleted product ${item?.name || id}`, 'info');
  };

  const updateStock = (
    productId: string,
    delta: number,
    stage: StageType = 'Retailer',
    reason: string = 'Stock adjustment',
    txnType: TransactionType = 'Adjustment'
  ) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;

        const currentStageStock = prod.stageInventory[stage] ?? 0;
        const newStageStock = Math.max(0, currentStageStock + delta);
        const newStageInventory = {
          ...prod.stageInventory,
          [stage]: newStageStock
        };

        // If adjusting Retailer, update currentStock as well
        const newCurrentStock = stage === 'Retailer' ? newStageStock : prod.currentStock;

        return {
          ...prod,
          currentStock: newCurrentStock,
          stageInventory: newStageInventory,
          historicalStock: [
            ...prod.historicalStock.slice(1),
            { day: `Day ${prod.historicalStock.length + 1}`, stock: newCurrentStock }
          ]
        };
      })
    );

    const targetProduct = products.find(p => p.id === productId);
    if (targetProduct) {
      addTransaction({
        productId,
        productName: targetProduct.name,
        type: txnType,
        quantity: Math.abs(delta),
        unitCost: targetProduct.unitCost,
        fromStage: delta < 0 ? stage : 'External',
        toStage: delta > 0 ? stage : 'External',
        user: currentUser?.name || 'Technical Lab User',
        status: 'Completed',
        notes: reason
      });
      showToast(
        `Updated ${targetProduct.name} at ${stage} by ${delta > 0 ? '+' : ''}${delta} units`,
        delta >= 0 ? 'success' : 'warning'
      );
    }
  };

  const createOrder = (orderData: Omit<Order, 'id'>): string => {
    const newId = `ORD-${Math.floor(7000 + Math.random() * 2000)}`;
    const newOrder: Order = {
      ...orderData,
      id: newId
    };
    setOrders(prev => [newOrder, ...prev]);

    addTransaction({
      productId: orderData.productId,
      productName: orderData.productName,
      type: 'Transfer',
      quantity: orderData.quantity,
      unitCost: orderData.unitCost,
      fromStage: orderData.sourceStage,
      toStage: orderData.destinationStage,
      user: currentUser?.name || 'Order Desk',
      status: 'Pending',
      notes: `Order ${newId} initiated`
    });

    showToast(`Order ${newId} placed successfully!`, 'success');
    return newId;
  };

  const createShipmentFromOrder = (orderId: string, carrier: string = 'TransLogix Logistics') => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    const shipmentId = `SHP-${Math.floor(8000 + Math.random() * 1900)}`;
    const departure = new Date().toISOString().split('T')[0];
    const arrivalDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newShipment: Shipment = {
      id: shipmentId,
      orderId: ord.id,
      productName: ord.productName,
      quantity: ord.quantity,
      sourceStage: ord.sourceStage,
      destinationStage: ord.destinationStage,
      carrier,
      trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}-EXP`,
      departureDate: departure,
      estimatedArrival: arrivalDate,
      progressPercent: 15,
      status: 'In Transit'
    };

    setShipments(prev => [newShipment, ...prev]);
    updateOrderStatus(orderId, 'In Transit');
    showToast(`Shipment ${shipmentId} dispatched for Order ${orderId}!`, 'info');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        const updated: Order = {
          ...ord,
          status,
          ...(status === 'Delivered' ? { actualDelivery: new Date().toISOString().split('T')[0] } : {})
        };

        if (status === 'Delivered') {
          // Add stock to destination stage and reduce from source stage
          updateStock(
            ord.productId,
            ord.quantity,
            ord.destinationStage,
            `Delivery fulfillment for ${orderId}`,
            'Transfer'
          );
        }

        return updated;
      })
    );
    showToast(`Order ${orderId} marked as ${status}`, 'info');
  };

  const advanceShipment = (shipmentId: string) => {
    setShipments(prev =>
      prev.map(shp => {
        if (shp.id !== shipmentId) return shp;
        const nextProgress = Math.min(100, shp.progressPercent + 35);
        const isNowDelivered = nextProgress >= 100;
        const newStatus = isNowDelivered ? 'Delivered' : shp.status;

        if (isNowDelivered) {
          updateOrderStatus(shp.orderId, 'Delivered');
          showToast(`Shipment ${shipmentId} reached destination and delivered!`, 'success');
        } else {
          showToast(`Shipment ${shipmentId} transit progress: ${nextProgress}%`, 'info');
        }

        return {
          ...shp,
          progressPercent: nextProgress,
          status: newStatus
        };
      })
    );
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Alert dismissed', 'info');
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    showToast('All alerts cleared', 'info');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Lab configuration settings saved', 'success');
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SHIPMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    localStorage.removeItem(STORAGE_KEYS.USERS);
    setRegisteredUsers(DEMO_USERS);

    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setShipments(INITIAL_SHIPMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAlerts(INITIAL_ALERTS);
    setSettings(INITIAL_SETTINGS);
    setSelectedProductId('PRD-101');
    setSelectedStage('Retailer');
    showToast('Reset application to original Technical Training Lab baseline', 'info');
  };

  // Requirement #18: Demonstration Scenario - Customer demand increases suddenly by 30%
  const runQuickDemandShockDemo = () => {
    setActiveTab('simulation');
    showToast('Simulating Sudden +30% Customer Demand Shock scenario across supply chain...', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        shipments,
        transactions,
        alerts,
        settings,
        activeTab,
        selectedProductId,
        selectedStage,
        toast,
        currentUser,
        registeredUsers,
        login,
        logout,
        registerAccount,
        verifyLogin,
        loginWithoutPassword,
        updateUserPassword,
        deleteAccount,
        setActiveTab,
        setSelectedProductId,
        setSelectedStage,
        showToast,
        hideToast,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        createOrder,
        updateOrderStatus,
        advanceShipment,
        createShipmentFromOrder,
        addTransaction,
        markAlertRead,
        dismissAlert,
        clearAllAlerts,
        updateSettings,
        resetToDefaults,
        runQuickDemandShockDemo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
