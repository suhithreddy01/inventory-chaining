# Inventory Chaining – Technical Training Lab
> *"Understanding the Flow | Managing the Stock | Building an Efficient Supply Chain"*

An educational, interactive, multi-echelon inventory and supply chain simulation application built for engineering students and Technical Training Labs.

---

## 🎯 Purpose & Overview
In modern supply chain engineering, inventory movement is a series of sequentially chained echelons:
$$\text{Supplier} \longrightarrow \text{Manufacturer} \longrightarrow \text{Distributor} \longrightarrow \text{Retailer} \longrightarrow \text{Customer}$$

This application simulates the dynamics of multi-tier inventory pipelines, demonstrating how:
- Variations in customer demand trigger upstream order amplification (**The Bullwhip Effect**)
- **Lead times** delay replenishment and necessitate buffer buffers
- **Reorder Points (ROP)** and **Safety Stock (SS)** mitigate stockout liabilities
- **Holding costs** (storage, capital cost, obsolescence) balance against **stockout penalties** (lost sales and customer attrition)

---

## 🚀 Key Modules & Capabilities

1. **Authentication & Passwordless Station Access**
   - Two seamless modes: **Sign In** and **Create Account**.
   - **Password-Free Access**: Select any saved station or type your name/email and click *"Sign In Without Password"* to access the lab instantly.
   - **Account Creation (No Password Required)**: Create custom accounts with Full Name, Email/ID, Academic Role (*Student, Instructor, Operator, Researcher*), and Station Name.
   - Pre-configured demo stations: *Alex Vance (Student, Station #04)*, *Prof. Miller (Instructor)*, and *Marcus Chen (Operator)*.
   - Header profile badge with 1-click **Sign Out** to switch stations.

2. **Dashboard**
   - 9 Primary KPI Cards: Total Inventory, Inventory Value, Below ROP Alerts, Pending Orders, Active Stockouts, Average Lead Time, Holding Cost/day, Customer Demand, and Overall Supply Chain Efficiency (0–100%).
   - Dynamic charts: Demand vs Supply (7-Day trend), Inventory distribution by echelon, Weekly inflow vs outflow stock movement, and active critical alerts feed.

2. **Supply Chain Flow**
   - Interactive 5-tier pipeline diagram with moving flow indicators: `Supplier → Manufacturer → Distributor → Retailer → Customer`.
   - Node inspection displaying: Current stock, Incoming orders, Outgoing orders, Buffer capacity utilization %, Stock value, Lead time latency, and recent transactions.
   - Interactive inter-stage transfer dispatcher.

3. **Inventory Management**
   - SKU Master Table: Product ID, Product Name, Category, Supplier, Current Stock, Min Stock, Reorder Point, Max Stock, Unit Cost, Total Inventory Value, Lead Time, and Status.
   - Dynamic status badges: *In Stock*, *Low Stock*, *Critical*, *Out of Stock*.
   - Add SKU modal, Edit SKU modal, Delete SKU, Quick Stock Adjustment modal (+ / -), Multi-parameter search, Category filter, Status filter, and Column sorting.
   - Direct CSV catalogue export.

4. **Product Details Deep Dive**
   - Multi-echelon stock levels across all 5 tiers.
   - Historical stock trend chart.
   - Weekly demand profile bar chart.
   - Inflow purchase history table and customer sales fulfillment ledger.
   - One-click restock PO generation.

5. **Order Management**
   - Full lifecycle order tracking: `Pending` → `Processing` → `In Transit` → `Delivered` (or `Delayed` / `Cancelled`).
   - Create New Order modal with auto-calculated total cost and delivery ETA based on vendor lead times.
   - One-click dispatch to tracked shipments and dock receiving fulfillment.

6. **Shipments Tracking**
   - Real-time in-transit freight cards with visual progress bars (0% → 100%).
   - Carrier details, tracking numbers, departure and ETA stamps, and step-wise freight advancement.

7. **Supply Chain Simulation (Lab Core)**
   - Configurable parameters: Initial Inventory, Daily Demand, Demand Pattern (Steady, Sudden +30% Shock, Fluctuating Wave, Seasonal Peak), Production Batch Size, Order Quantity (Lot Size / EOQ), Reorder Point, Lead Time, Holding Cost, Stockout Penalty, and Duration (14–45 days).
   - Step-by-step animated playback controller (Play, Pause, Step Next Day, Timeline Scrubber, Speed 1.0x / 1.5x / 2.5x).
   - Real-time 5-tier visual node status during each day of the simulation.
   - Outcome Analytics: Customer Service Level (Fill Rate %), Total Stockouts, Cumulative Holding Costs, Total Stockout Penalties, Overall Chain Cost, and Bullwhip Amplification Ratio ($x$).
   - Demonstration Scenario: Pre-configured **+30% sudden customer demand shock** illustrating bullwhip distortion.

8. **Reorder Point (ROP) Management**
   - Interactive live formula calculator:
     $$\text{ROP} = (\text{Daily Demand} \times \text{Lead Time}) + \text{Safety Stock}$$
   - Sliders for Daily Demand ($d$), Lead Time ($L$), and Safety Stock ($SS$) with live visual inventory spectrum gauge (Safety buffer vs ROP window vs Healthy capacity).

9. **Demand Management & Analysis**
   - Daily, Weekly, and Monthly demand breakdowns.
   - Key statistical measures: Average Demand, Maximum Peak Surge, and Trend Velocity.
   - Interactive Demand Shock Injector to test immediate recalibrations.

10. **Performance Analytics**
    - Multi-criteria diagnostics: Inventory Turnover ($\text{COGS} / \bar{I}$), Stockout Rate, Average Inventory, Daily Holding Cost, Order Fulfillment Rate, Average Lead Time, Service Level, and Composite Supply Chain Efficiency Index.
    - Turnover velocity chart and echelon latency breakdown.

11. **Alerts & Exception Monitor**
    - Autonomous triggers for Low Stock, Zero Stockouts, ROP Breaches, Delayed Freights, Excess Inventory, and High Holding Cost liabilities.
    - Quick action buttons to expedite orders or adjust balances.

12. **Audit Transactions Ledger**
    - Sequential chronological log of all Purchases, Production runs, Transfers, Sales, Returns, and Adjustments.
    - Manual transaction recording tool and CSV download.

13. **Formal Reports Section**
    - 7 Formatted Lab Reports:
      1. Inventory Status Report
      2. Stock Movement Report
      3. Purchase Orders Report
      4. Sales Fulfillment Report
      5. Low Stock Exception Report
      6. Supply Chain Performance Report
      7. Lab Simulation Run Report
    - Clean printer-friendly academic format (`Print / Save as PDF`) and CSV exports.

14. **Training Mode & Educational Portal**
    - Clear definitions and mathematical formulations for: *Inventory*, *Inventory Chaining*, *Reorder Point*, *Safety Stock*, *Lead Time*, *Holding Cost*, *Stockout*, and *Inventory Turnover*.
    - Step-by-step guided pipeline walkthrough through all 5 echelons.
    - Interactive student knowledge check quiz with automated grading and explanations.

15. **Settings & Configuration**
    - Currency selection ($, €, £, ₹, ¥).
    - Statistical Z-score vs deterministic ROP rules.
    - Lead-time safety buffer multipliers.
    - Notification preferences.
    - Reset to baseline lab defaults button.

---

## 🛠️ Tech Stack & Architecture
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom responsive dashboard styling
- **Icons**: Lucide React
- **Data Persistence**: LocalStorage with state synchronization and lab baseline reset
- **Calculations Engine**: Rigorous supply chain formulas implemented in TypeScript (`src/utils/calculations.ts`)
- **Exporting**: In-browser dynamic CSV generation and CSS `@media print` formatted PDF generation

---

## ⚡ Quick Start Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://127.0.0.1:5173/`

3. **Production Build**:
   ```bash
   npm run build
   ```

---

*Inventory Chaining – Technical Training Lab | Academic Project*
