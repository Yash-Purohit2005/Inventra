import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Search, X, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StockBadge from '../components/common/StockBadge';
import ProductFormModal from '../components/products/ProductFormModal';
import StockAdjustModal from '../components/products/StockAdjustModal';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySku,
} from '../services/productService';
import { getCategories } from '../services/categoryService';
import { getSuppliers } from '../services/supplierService';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search state variables
  const [skuSearchInput, setSkuSearchInput] = useState('');
  const [isFilteredBySku, setIsFilteredBySku] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);

  useEffect(() => {
    if (!isFilteredBySku) {
      fetchData();
    }
  }, [page, isFilteredBySku]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes, supRes] = await Promise.all([
        getProducts(page, 10),
        getCategories(),
        getSuppliers(),
      ]);
      setProducts(prodRes.data.content);
      setTotalPages(prodRes.data.totalPages);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSkuSearchSubmit = async (e) => {
    e.preventDefault();
    const rawInput = skuSearchInput ? skuSearchInput.trim() : '';
    if (!rawInput) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductBySku(rawInput);
      
      if (response && response.data) {
        setProducts([response.data]); 
        setTotalPages(1);
        setPage(0);
        setIsFilteredBySku(true);
      } else {
        setError(`No product data returned for SKU: "${rawInput}"`);
        setProducts([]);
        setIsFilteredBySku(true);
      }
    } catch (err) {
      console.error("SKU Search Error caught:", err);
      setIsFilteredBySku(true); 
      setProducts([]); 
      setTotalPages(1);

      if (err.response && err.response.status === 404) {
        setError(`No product found matching SKU: "${rawInput}"`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('A network error occurred while connecting to the inventory service.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSkuSearchInput('');
    setIsFilteredBySku(false);
    setError(null);
  };
  
  const handleSave = async (payload, id) => {
    if (id) {
      await updateProduct(id, payload);
    } else {
      await createProduct(payload);
    }
    setShowForm(false);
    setEditProduct(null);
    if (isFilteredBySku) {
      handleClearSearch();
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? This can be reversed later.`)) return;
    try {
      await deleteProduct(id);
      if (isFilteredBySku) {
        handleClearSearch();
      } else {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-4 sm:p-6 select-none">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">
            Product Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage master inventory stock items, tracking metrics, and supplier records.</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-md"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Toolbar / Search Section */}
      <div className="   mb-6">
        <form onSubmit={handleSkuSearchSubmit} className="relative max-w-xl flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Enter exact SKU and hit Enter..."
              value={skuSearchInput}
              onChange={(e) => setSkuSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {skuSearchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium rounded-lg transition"
          >
            Search
          </button>
        </form>

        {isFilteredBySku && (
          <div className="flex items-center gap-2 mt-3 text-xs text-amber-400 font-mono bg-amber-950/30 border border-amber-900/50 px-3 py-1.5 rounded-md w-max">
            
            <button onClick={handleClearSearch} className="underline hover:text-amber-300 font-bold ml-1 flex items-center gap-1">
              <ArrowLeft size={12} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Output Frame */}
      {error && (
        <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl">
          <ErrorMessage message={error} />
          {isFilteredBySku && (
            <button onClick={handleClearSearch} className="text-xs text-emerald-400 hover:underline mt-2 font-semibold block font-mono">
              &larr; Return to main catalog
            </button>
          )}
        </div>
      )}

<div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl max-w-full w-full ">
  {/* Added w-full to the overflow container to anchor the horizontal scrollbar within this box only */}
  <div className="overflow-x-auto w-full">
    <table className="w-full text-left border-collapse text-sm block md:table ">
      <thead className="hidden md:table-header-group">
        <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <th className="pb-3 pl-2">SKU</th>
          <th className="pb-3 pr-1">Product Name</th>
          <th className="pb-3 pr-1">Category</th>
          <th className="pb-3 pr-1">Supplier</th>
          <th className="pb-3 pr-1">Price</th>
          <th className="pb-3 pr-1">Stock</th>
          <th className="pb-3 pr-1">Status</th>
          <th className="pb-3 text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/60 font-medium block gap-x-12 gap-y-12  md:table-row-group ">
        {products.length === 0 ? (
          <tr className="block md:table-row">
            <td colSpan="8" className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg block md:table-cell">
              No registry data records available to display in this snapshot.
            </td>
          </tr>
        ) : (
          products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-800/40 md:bg-transparent transition group flex flex-col md:table-row py-4 md:py-0 mb-3 md:mb-0  border-b border-slate-700/50  md:border-b-0 shadow-lg md:shadow-none last:border-b-0 space-y-2 md:space-y-0">
              
              {/* SKU Label */}
              <td className="py-0.5 md:py-4 pl-2 font-mono text-xs text-emerald-400 font-bold flex md:table-cell items-center justify-between before:content-['SKU'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <span>{p.sku}</span>
              </td>
              
              {/* Identification Spec Name */}
              <td className="py-0.5 md:py-4 pl-2 md:pl-0 text-white font-semibold tracking-wide flex md:table-cell items-center justify-between before:content-['Product'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <span>{p.name}</span>
              </td>
              
              {/* Category */}
              <td className="py-0.5 md:py-4 pl-2 md:pl-0 text-slate-400 font-normal flex md:table-cell items-center justify-between before:content-['Category'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <span>{p.categoryName || '—'}</span>
              </td>
              
              {/* Supplier */}
              <td className="py-0.5 md:py-4 pl-2 md:pl-0 text-slate-400 font-normal flex md:table-cell items-center justify-between before:content-['Supplier'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <span>{p.supplierName || '—'}</span>
              </td>
              
              {/* Currency Unit Valuation */}
              <td className="py-0.5 md:py-4 pl-2 md:pl-0 font-mono text-slate-300 flex md:table-cell items-center justify-between before:content-['Price'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <span>₹{p.price}</span>
              </td>
              
              {/* Stock Metrics */}
              <td className="py-0.5 md:py-4 pl-2 md:pl-0 font-mono font-bold text-base text-slate-200 flex md:table-cell items-center justify-between before:content-['Stock'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <span>{p.currentStock}</span>
              </td>
              
              {/* Status Hook */}
              <td className="py-0.5 md:py-4 pl-2 md:pl-0 flex md:table-cell items-center justify-between before:content-['Status'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <StockBadge currentStock={p.currentStock} threshold={p.lowStockThreshold} />
              </td>
              
              {/* Row Controls */}
              <td className="pt-2 pb-0.5 md:py-4 text-right pr-2 flex md:table-cell items-center justify-between md:justify-end before:content-['Actions'] before:text-[10px] before:uppercase before:tracking-wider before:text-slate-500 md:before:hidden">
                <div className="flex items-center justify-end gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => setAdjustProduct(p)}
                    title="Adjust Stock"
                    className="text-slate-500 hover:text-emerald-400 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 transition"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    onClick={() => { setEditProduct(p); setShowForm(true); }}
                    title="Edit Specification"
                    className="text-slate-500 hover:text-blue-400 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 transition"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Deactivate Element"
                    className="text-slate-500 hover:text-rose-400 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))
          
        )}
        
      </tbody>
    </table>
    
  </div>

        {/* View Layout Footer Navigation Block */}
        {!isFilteredBySku && totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Product Form Modal Hook Overlays */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}

      {/* Stock Adjust Modal Delta Window Overlays */}
      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSuccess={() => { setAdjustProduct(null); isFilteredBySku ? handleClearSearch() : fetchData(); }}
        />
      )}
    </div>
  );
}

export default ProductsPage;