import { useState } from 'react';
import { X } from 'lucide-react';
import { resolveAlert } from '../../services/alertService';

function ResolveAlertModal({ alert, onClose, onSuccess }) {
  const [resolvedBy, setResolvedBy] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await resolveAlert(alert.productId, resolvedBy.trim());
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Resolve Alert</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
            <p className="text-white font-semibold text-sm">{alert.productName}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{alert.productSku}</p>
            <p className="text-xs text-amber-400 mt-2 font-mono">
              Stock: {alert.currentStock} / Threshold: {alert.threshold}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Resolved By *
            </label>
            <input
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              required
              placeholder="Your name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 transition"
            >
              {saving ? 'Resolving...' : 'Mark as Resolved'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResolveAlertModal;