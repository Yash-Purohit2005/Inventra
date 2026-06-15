import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAlertsByProduct } from '../../services/alertService';
import LoadingSpinner from '../common/LoadingSpinner';

function AlertHistoryModal({ productId, productName, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlertsByProduct(productId)
      .then((res) => setAlerts(res.data))
      .finally(() => setLoading(false));
  }, [productId]);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            Alert History — <span className="text-emerald-400">{productName}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {loading ? (
            <LoadingSpinner />
          ) : alerts.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No alert history for this product.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        a.status === 'OPEN'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-900'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                      }`}
                    >
                      {a.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Stock {a.currentStock} / Threshold {a.threshold}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Created: {formatDate(a.createdAt)}</p>
                    {a.status === 'RESOLVED' && (
                      <>
                        <p>Resolved: {formatDate(a.resolvedAt)}</p>
                        <p>Resolved By: <span className="text-slate-300 font-mono">{a.resolvedBy}</span></p>
                      </>
                    )}
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

export default AlertHistoryModal;