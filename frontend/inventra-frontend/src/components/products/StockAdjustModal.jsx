import { useState } from 'react';
import Modal from '../common/Modal';
import { adjustStock } from '../../services/transactionService';

const TYPES = ['RESTOCK', 'SALE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUBTRACT'];

function StockAdjustModal({ product, onClose, onSuccess }) {
  const [type, setType] = useState('RESTOCK');
  const [quantity, setQuantity] = useState('');
  const [operator, setOperator] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await adjustStock({
        sku: product.sku,
        quantity: parseInt(quantity),
        type,
        operator,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Adjust Stock — ${product.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-400">
          Current Stock: <span className="font-semibold text-slate-400">{product.currentStock} units</span>
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transaction Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <label
                key={t}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${type === t
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400'
                  }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={(e) => setType(e.target.value)}
                  className="accent-emerald-500"
                />
                <span >{t.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Quantity *</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Operator *</label>
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
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
            {saving ? 'Processing...' : 'Confirm Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StockAdjustModal;