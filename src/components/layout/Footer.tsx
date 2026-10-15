import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 py-4 px-6 text-center text-xs text-slate-500 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium text-slate-600">
          Inventory Chaining – Technical Training Lab | Academic Project
        </p>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>Supplier → Manufacturer → Distributor → Retailer → Customer</span>
          <span>•</span>
          <span>College Engineering Edition</span>
        </div>
      </div>
    </footer>
  );
};
