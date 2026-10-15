import React from 'react';
import { ProductStatus, OrderStatus, AlertSeverity } from '../../types';

interface BadgeProps {
  status: ProductStatus | OrderStatus | AlertSeverity | string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  // Product status
  if (status === 'In Stock') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (status === 'Low Stock') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'Critical') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (status === 'Out of Stock') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  // Order status
  else if (status === 'Delivered' || status === 'Completed') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (status === 'In Transit') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === 'Processing') {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (status === 'Pending') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'Delayed') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (status === 'Cancelled') {
    colorClasses = 'bg-slate-100 text-slate-500 border-slate-200';
  }
  // Alert severity
  else if (status === 'critical') {
    colorClasses = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (status === 'warning') {
    colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (status === 'info') {
    colorClasses = 'bg-blue-100 text-blue-800 border-blue-300';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClasses} ${sizeClasses} transition-colors`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};
