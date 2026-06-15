import { useEffect, useState } from 'react';
import { AlertTriangle, History, CheckCircle2 } from 'lucide-react';
import { getOpenAlerts } from '../services/alertService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ResolveAlertModal from '../components/alerts/ResolveAlertModal';
import AlertHistoryModal from '../components/alerts/AlertHistoryModal';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [resolveTarget, setResolveTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOpenAlerts();
      setAlerts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    }) : '—';

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen text-slate-100 -m-6 p-4 sm:p-6  select-none">
      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-rose-950/60 border border-rose-900/60 p-2.5 rounded-lg">
            <AlertTriangle className="text-rose-400" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">Stock Alerts</h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Active low-stock notifications requiring action.
            </p>
          </div>
        </div>
      </header>

      {/* Open Alerts */}
      {alerts.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl py-16 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={36} />
          <p className="text-slate-300 font-semibold">All clear — no open alerts</p>
          <p className="text-sm text-slate-500 mt-1">Every product is above its low-stock threshold.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((a) => {
            const severity = a.currentStock <= a.threshold * 0.5 ? 'critical' : 'low';
            return (
              <div
                key={a.id}
                className={`bg-slate-900 border rounded-xl p-5 shadow-xl ${
                  severity === 'critical' ? 'border-rose-900/60' : 'border-amber-900/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-wider ${
                      severity === 'critical'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-900'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-900'
                    }`}
                  >
                    {severity === 'critical' ? '🔴 Critical' : '🟡 Low Stock'}
                  </span>
                  <button
                    onClick={() => setHistoryTarget({ id: a.productId, name: a.productName })}
                    title="View History"
                    className="text-slate-500 hover:text-emerald-400 transition"
                  >
                    <History size={16} />
                  </button>
                </div>

                <h3 className="text-white font-bold text-base mb-0.5">{a.productName}</h3>
                <p className="text-xs text-slate-500 font-mono mb-3">{a.productSku}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-slate-800/40 rounded-lg p-2.5">
                    <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">Current Stock</p>
                    <p className="font-mono font-bold text-rose-400 text-base">{a.currentStock}</p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-2.5">
                    <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">Threshold</p>
                    <p className="font-mono font-bold text-slate-300 text-base">{a.threshold}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-1">
                  <span className="text-slate-600">Category:</span> {a.categoryName}
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  <span className="text-slate-600">Supplier:</span> {a.supplierName}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pt-3 border-t border-slate-800">
                  <span>Opened</span>
                  <span className="font-mono">{formatDate(a.createdAt)}</span>
                </div>

                <button
                  onClick={() => setResolveTarget(a)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 rounded-lg transition"
                >
                  Resolve Alert
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {resolveTarget && (
        <ResolveAlertModal
          alert={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onSuccess={() => { setResolveTarget(null); fetchAlerts(); }}
        />
      )}

      {historyTarget && (
        <AlertHistoryModal
          productId={historyTarget.id}
          productName={historyTarget.name}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}

export default AlertsPage;