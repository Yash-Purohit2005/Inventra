import { AlertTriangle } from 'lucide-react';

function TopLowStockList({ products }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Top Low Stock Items
      </h3>
      {products.length === 0 ? (
        <p className="text-sm text-slate-400">No low stock items 🎉</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.sku}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <div>
                  <p className="font-medium text-slate-800">{p.productName}</p>
                  <p className="text-xs text-slate-400">{p.sku}</p>
                </div>
              </div>
              <span className="font-semibold text-red-600">
                {p.currentStock} / {p.threshold}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TopLowStockList;