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
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock *</label>
              <input
                type="number"
                name="currentStock"
                value={form.currentStock}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold *</label>
          <input
            type="number"
            name="lowStockThreshold"
            value={form.lowStockThreshold}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductFormModal;