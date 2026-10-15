import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw
} from 'lucide-react';
import { formatNumber } from '../../utils/calculations';

export const ShipmentsView: React.FC = () => {
  const { shipments, advanceShipment, setActiveTab } = useApp();

  const activeInTransit = shipments.filter(s => s.status === 'In Transit' || s.status === 'Delayed');
  const deliveredShipments = shipments.filter(s => s.status === 'Delivered');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Transit & Freight Logistics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Shipments Tracking</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor physical freight moving between supply chain tiers. Advance shipments to simulate dock delivery.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('orders')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
        >
          <span>View Source Orders</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Shipments Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Active Shipments In Route ({activeInTransit.length})
        </h3>

        {activeInTransit.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No active shipments currently on the road. Dispatch orders from the Orders page!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInTransit.map(shp => (
              <div
                key={shp.id}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-xs">{shp.id}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{shp.trackingNumber}</span>
                      </div>
                    </div>
                    <Badge status={shp.status} size="sm" />
                  </div>

                  <div className="space-y-1 mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">{shp.productName}</h4>
                    <p className="text-xs text-slate-600">
                      Payload Quantity:{' '}
                      <span className="font-bold font-mono text-slate-900">
                        {formatNumber(shp.quantity)} units
                      </span>
                    </p>
                  </div>

                  {/* Route Visualizer */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <div>
                        <div className="text-[10px] text-slate-400">Origin</div>
                        <div className="font-semibold text-slate-800">{shp.sourceStage}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[10px] text-slate-400 font-mono mb-0.5">
                        {shp.progressPercent}% in transit
                      </span>
                      <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${shp.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <div className="text-[10px] text-slate-400">Destination</div>
                        <div className="font-semibold text-slate-800">{shp.destinationStage}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
                    <div>
                      Carrier: <span className="font-medium text-slate-800">{shp.carrier}</span>
                    </div>
                    <div className="text-right">
                      ETA: <span className="font-mono font-medium text-slate-800">{shp.estimatedArrival}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Order Ref: {shp.orderId}</span>
                  <button
                    onClick={() => advanceShipment(shp.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Advance Freight ({shp.progressPercent < 70 ? '+35%' : 'Complete'})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Shipments Ledger */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Delivered Shipments History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Shipment ID</th>
                <th className="py-2.5 px-3">Tracking</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Carrier</th>
                <th className="py-2.5 px-3">Arrival Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveredShipments.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.id}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{s.trackingNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{s.productName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatNumber(s.quantity)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.sourceStage} → {s.destinationStage}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{s.carrier}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{s.estimatedArrival}</td>
                  <td className="py-2.5 px-3">
                    <Badge status="Delivered" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
