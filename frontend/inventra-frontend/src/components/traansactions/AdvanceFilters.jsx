import React from 'react';

export default function AdvancedFilters({ filters, setFilters, onApply, onClear }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl sticky top-6">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">🔍 Audit Parameters</h2>
      <form onSubmit={(e) => { e.preventDefault(); onApply(); }} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Database ID</label>
          <input type="number" placeholder="Direct ID match" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition" value={filters.productId} onChange={e => setFilters({...filters, productId: e.target.value})} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Action Category</label>
          <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
            <option value="">All Transactions</option>
            <option value="INITIAL">INITIAL</option>
            <option value="RESTOCK">RESTOCK</option>
            <option value="SALE">SALE</option>
            <option value="ADJUSTMENT_ADD">ADJUSTMENT ADD</option>
            <option value="ADJUSTMENT_SUBTRACT">ADJUSTMENT SUBTRACT</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
            <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-emerald-500 scheme-dark" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
            <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-emerald-500 scheme-dark" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
        </div>
        <div className="pt-2 space-y-2">
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-semibold transition shadow-md">Query Records</button>
          <button type="button" onClick={onClear} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 py-1.5 rounded-lg text-xs font-medium transition">Reset Layout</button>
        </div>
      </form>
    </div>
  );
}