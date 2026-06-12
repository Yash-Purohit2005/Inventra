import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Search, X } from 'lucide-react';
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
  getProductBySku, // 1. Ensure this is imported from your service
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

  // Automatically load the standard paginated catalog ONLY if we aren't looking at a single SKU result
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
      // If we successfully find the product, put it in the table array
      setProducts([response.data]); 
      setTotalPages(1);
      setPage(0);
      setIsFilteredBySku(true);
    } else {
      // Fallback if response is successful but data body is empty
      setError(`No product data returned for SKU: "${rawInput}"`);
      setProducts([]);
      setIsFilteredBySku(true);
    }
  } catch (err) {
    console.error("SKU Search Error caught:", err);
    
    // Crucial: Set this to true anyway so the UI knows we are in a "searched" view state
    setIsFilteredBySku(true); 
    setProducts([]); // Clear the table so it shows "No records to display"
    setTotalPages(1);

    // Dynamic error handling based on server response
    if (err.response && err.response.status === 404) {
      setError(`No product found matching SKU: "${rawInput}"`);
    } else if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
    } else {
      setError('An network error occurred while connecting to the inventory service.');
    }
  } finally {
    setLoading(false);
  }
};

  // 3. Clear the search overlay and restore your normal catalog
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
  if (loading && products.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>



      <form onSubmit={handleSkuSearchSubmit} className="mb-4 relative max-w-md flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Enter exact SKU and hit Enter..."
            value={skuSearchInput}
            onChange={(e) => setSkuSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm bg-white text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />

          {skuSearchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
          {isFilteredBySku && (
            <button onClick={handleClearSearch} className="text-xs text-blue-600 hover:underline mt-1 font-semibold block">
              ← go back
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                  No records to display.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.categoryName}</td>
                  <td className="px-4 py-3 text-slate-500">{p.supplierName}</td>
                  <td className="px-4 py-3 text-slate-600">₹{p.price}</td>
                  <td className="px-4 py-3 text-slate-800 font-semibold">{p.currentStock}</td>
                  <td className="px-4 py-3">
                    <StockBadge currentStock={p.currentStock} threshold={p.lowStockThreshold} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAdjustProduct(p)}
                        title="Adjust Stock"
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => { setEditProduct(p); setShowForm(true); }}
                        title="Edit"
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Deactivate"
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Hide the pagination numbers if we are showing a single SKU search result */}
      {!isFilteredBySku && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}

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