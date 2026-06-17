import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

function ProductFormModal({ product, categories, suppliers, onClose, onSave }) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    currentStock: '',
    lowStockThreshold: '',
    categoryId: '',
    supplierId: '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        price: product.price,
        lowStockThreshold: product.lowStockThreshold,
        categoryId: categories.find(c => c.name === product.categoryName)?.id || '',
        supplierId: suppliers.find(s => s.name === product.supplierName)?.id || '',
        currentStock: product.currentStock,
      });
    }
  }, [product, categories, suppliers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = isEdit
        ? {
          name: form.name,
          price: parseFloat(form.price),
          lowStockThreshold: parseInt(form.lowStockThreshold),
          categoryId: parseInt(form.categoryId),
          supplierId: parseInt(form.supplierId),
        }
        : {
          sku: form.sku,
          name: form.name,
          price: parseFloat(form.price),
          currentStock: parseInt(form.currentStock),
          lowStockThreshold: parseInt(form.lowStockThreshold),
          categoryId: parseInt(form.categoryId),
          supplierId: parseInt(form.supplierId),
        };

      await onSave(payload, product?.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Product' : 'Add New Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SKU *</label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Price *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="" className="bg-slate-800 text-slate-500">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Supplier *</label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="" className="text-slate-500">Select</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Initial Stock *</label>
              <input
                type="number"
                name="currentStock"
                value={form.currentStock}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Low Stock Threshold *</label>
          <input
            type="number"
            name="lowStockThreshold"
            value={form.lowStockThreshold}
            onChange={handleChange}
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
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductFormModal;