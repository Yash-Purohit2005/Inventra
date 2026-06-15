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
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-500">
          Current Stock: <span className="font-semibold text-slate-800">{product.currentStock} units</span>
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Transaction Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <label
                key={t}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm text-slate-800 cursor-pointer transition-colors ${
                  type === t ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={(e) => setType(e.target.value)}
                  className="accent-blue-600"
                />
                <span className="text-slate-800">{t.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Operator *</label>
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            required
            className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {saving ? 'Processing...' : 'Confirm Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StockAdjustModal;