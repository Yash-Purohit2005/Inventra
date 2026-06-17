import { useEffect, useState } from 'react';
import { X, Package } from 'lucide-react';
import { getProductsBySupplier } from '../../services/supplierService';
import LoadingSpinner from '../common/LoadingSpinner';
import StockBadge from '../common/StockBadge';

function SupplierProductsModal({ supplier, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductsBySupplier(supplier.id)
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [supplier.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">{supplier.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Products from this supplier</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-slate-500 text-sm">No products from this supplier.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-slate-800/40 border border-slate-800 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 font-mono">₹{p.price}</span>
                    <span className="font-semibold text-slate-200">{p.currentStock} units</span>
                    <StockBadge
                      currentStock={p.currentStock}
                      threshold={p.lowStockThreshold}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierProductsModal;