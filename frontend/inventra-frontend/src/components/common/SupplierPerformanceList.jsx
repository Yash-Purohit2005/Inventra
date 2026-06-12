function SupplierPerformanceList({ suppliers }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Supplier Performance
      </h3>
      <div className="space-y-3">
        {suppliers.map((s) => (
          <div key={s.supplierName} className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-slate-800">{s.supplierName}</span>
              <span className="text-slate-500">{s.alertRate}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: s.alertRate }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {s.lowStockCount} of {s.totalProducts} products low
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupplierPerformanceList;