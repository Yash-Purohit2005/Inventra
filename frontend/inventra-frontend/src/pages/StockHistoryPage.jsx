import React, { useState, useEffect } from 'react';
import TransactionTable from '../components/traansactions/TransactionTable';
import AdvancedFilters from '../components/traansactions/AdvanceFilters';
import ProductHistoryModal from '../components/traansactions/ProductHistoryModal';
import { getFilteredTransactions, getExportCsvUrl } from '../services/transactionService';

export default function StockHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalToken, setModalToken] = useState(null);
  
  const [filters, setFilters] = useState({ productId: '', type: '', startDate: '', endDate: '' });

  const loadDataGrid = async (appliedFilters = filters) => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(Object.entries(appliedFilters).filter(([_, v]) => v !== ''));
      const response = await getFilteredTransactions(cleanParams, page, 15);
      setTransactions(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Ledger acquisition failed:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => { loadDataGrid(); }, [page, filters]);

  return (
    <div className="min-h-screen text-slate-100 font-sans p-4 sm:p-6  select-none">
      
      {/* Top Deck Action Header Bar */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">Stock History</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">System activity stream and historic transactional audit trails.</p>
        </div>
        <button 
          onClick={() => window.location.href = getExportCsvUrl(filters)} 
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg transition shadow-md text-sm text-center"
        >
          📥 Export CSV Ledger
        </button>
      </header>

      {/* Main Core View Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sticky Filters Column panel */}
        <div className="lg:col-span-1">
          <AdvancedFilters 
            filters={filters} 
            setFilters={setFilters} 
            onApply={() => { setPage(0) }} 
            onClear={() => { 
              const cleared = { productId: '', type: '', startDate: '', endDate: '' }; 
              setFilters(cleared); 
              setPage(0); 
            }} 
          />
        </div>

        {/* Massive Primary Logs Layout Grid Panel */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl min-h-[600px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold text-white tracking-wider uppercase text-slate-400">System Activity Stream</h2>
              <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded text-xs font-mono">
                Page {page + 1} of {totalPages}
              </span>
            </div>

            <TransactionTable 
              transactions={transactions} 
              loading={loading} 
              onRowProductClick={(tx) => setModalToken({ id: tx.productId, name: tx.productName })} 
            />
          </div>

          {/* Table Data View Segment Footer Navigation Controller Block */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800 text-sm">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)} 
              className="bg-slate-800 text-slate-200 px-4 py-1.5 rounded-lg font-semibold border border-slate-700 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              ← Previous
            </button>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)} 
              className="bg-slate-800 text-slate-200 px-4 py-1.5 rounded-lg font-semibold border border-slate-700 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              Next →
            </button>
          </div>
        </div>

      </div>

      {/* On-demand Overlay Portal Triggered by Row Selection Interaction Events */}
      {modalToken && (
        <ProductHistoryModal 
          productId={modalToken.id} 
          productName={modalToken.name} 
          onClose={() => setModalToken(null)} 
        />
      )}
    </div>
  );
}