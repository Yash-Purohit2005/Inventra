import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Package, Truck, Mail, Phone, MapPin } from 'lucide-react';
import { getSuppliers, deleteSupplier } from '../services/supplierService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SupplierFormModal from '../components/suppliers/SupplierFormModal';
import SupplierProductsModal from '../components/suppliers/SupplierProductsModal';

function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate supplier');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className=" p-4 sm:p-6">

      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-900/60 p-2.5 rounded-lg">
            <Truck className="text-emerald-400" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">
              Suppliers
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Manage vendor and supply chain contacts.
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditSupplier(null); setShowForm(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-md"
        >
          <Plus size={16} /> Add Supplier
        </button>
      </header>

      {/* Supplier Cards Grid */}
      {suppliers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
          <Truck className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-slate-400 font-medium">No suppliers yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Add your first supplier to link products to vendors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl hover:border-slate-700 transition"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="bg-emerald-950/60 border border-emerald-900/60 p-2 rounded-lg">
                  <Truck className="text-emerald-400" size={18} />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.isActive
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-900'
                  }`}
                >
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-white font-bold text-base mb-3">{s.name}</h3>

              {/* Contact Details */}
              <div className="space-y-1.5 mb-4">
                {s.contactPerson && (
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-slate-600">👤</span> {s.contactPerson}
                  </p>
                )}
                {s.contactEmail && (
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Mail size={11} className="text-slate-600" /> {s.contactEmail}
                  </p>
                )}
                {s.contactPhone && (
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Phone size={11} className="text-slate-600" /> {s.contactPhone}
                  </p>
                )}
                {s.address && (
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <MapPin size={11} className="text-slate-600" /> {s.address}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => setViewSupplier(s)}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <Package size={13} /> View Products
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditSupplier(s); setShowForm(true); }}
                    className="text-slate-500 hover:text-blue-400 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 transition"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="text-slate-500 hover:text-rose-400 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <SupplierFormModal
          supplier={editSupplier}
          onClose={() => { setShowForm(false); setEditSupplier(null); }}
          onSuccess={() => { setShowForm(false); setEditSupplier(null); fetchSuppliers(); }}
        />
      )}

      {viewSupplier && (
        <SupplierProductsModal
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
        />
      )}
    </div>
  );
}

export default SupplierPage;