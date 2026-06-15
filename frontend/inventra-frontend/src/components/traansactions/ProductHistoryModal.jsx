import React, { useState, useEffect } from 'react';
import { getProductHistory } from '../../services/transactionService';
import TransactionTable from './TransactionTable';

export default function ProductHistoryModal({ productId, productName, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadIsolatedLogs = async () => {
    setLoading(true);
    try {
      const response = await getProductHistory(productId, page, 10);
      setTransactions(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (productId) loadIsolatedLogs(); }, [productId, page]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800 text-emerald-400 border border-slate-700 rounded">ID: #{productId}</span>
            <h3 className="text-lg font-bold text-white mt-1">Product Audit: <span className="text-emerald-400">{productName}</span></h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md text-xs">✕ Close</button>
        </div>
        <div className="p-6 overflow-y-auto bg-slate-900/40">
          <TransactionTable transactions={transactions} loading={loading} />
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 disabled:opacity-30">← Back</button>
          <span className="text-slate-500 font-mono">Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 disabled:opacity-30">Next →</button>
        </div>
      </div>
    </div>
  );
}