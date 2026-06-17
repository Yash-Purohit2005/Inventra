import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Package, Tags } from 'lucide-react';
import { getCategories, deleteCategory } from '../services/categoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import CategoryProductsModal from '../components/categories/CategoryProductsModal';

function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [viewCategory, setViewCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Deactivate "${name}"?`)) return;
        try {
            await deleteCategory(id);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to deactivate category');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="p-4 sm:p-6">

            {/* Header */}
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-950/60 border border-emerald-900/60 p-2.5 rounded-lg">
                        <Tags className="text-emerald-400" size={22} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">
                            Categories
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 font-medium">
                            Manage product classification groups.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditCategory(null); setShowForm(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-md"
                >
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {/* Category Cards Grid */}
            {categories.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
                    <Tags className="mx-auto text-slate-600 mb-3" size={36} />
                    <p className="text-slate-400 font-medium">No categories yet.</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Add your first category to start organizing products.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl hover:border-slate-700 transition"
                        >
                            {/* Icon + Name */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="bg-emerald-950/60 border border-emerald-900/60 p-2 rounded-lg">
                                    <Tags className="text-emerald-400" size={18} />
                                </div>
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                        }`}
                                >
                                    {c.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-base mb-1">{c.name}</h3>
                            <p className="text-xs text-slate-500 mb-4 min-h-[32px] line-clamp-2">
                                {c.description || 'No description provided.'}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                <button
                                    onClick={() => setViewCategory(c)}
                                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                                >
                                    <Package size={13} /> View Products
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditCategory(c); setShowForm(true); }}
                                        className="text-slate-500 hover:text-blue-400 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 transition"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id, c.name)}
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
                <CategoryFormModal
                    category={editCategory}
                    onClose={() => { setShowForm(false); setEditCategory(null); }}
                    onSuccess={() => { setShowForm(false); setEditCategory(null); fetchCategories(); }}
                />
            )}

            {viewCategory && (
                <CategoryProductsModal
                    category={viewCategory}
                    onClose={() => setViewCategory(null)}
                />
            )}
        </div>
    );
}

export default CategoryPage;