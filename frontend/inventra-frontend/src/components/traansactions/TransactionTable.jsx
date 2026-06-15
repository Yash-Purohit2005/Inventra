import React from 'react';

export default function TransactionTable({ transactions, loading, onRowProductClick }) {
  if (loading) {
    return <div className="text-center py-20 text-slate-400 font-medium">Querying database ledger hooks...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-lg">
        No historical logs found matching selection criteria.
      </div>
    );
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'RESTOCK':
      case 'ADJUSTMENT_ADD':
        return { badge: 'bg-emerald-950/80 text-emerald-400 border border-emerald-900', text: 'text-emerald-400', prefix: '+' };
      case 'SALE':
      case 'ADJUSTMENT_SUBTRACT':
        return { badge: 'bg-rose-950/80 text-rose-400 border border-rose-900', text: 'text-rose-400', prefix: '-' };
      case 'INITIAL':
        return { badge: 'bg-blue-950/80 text-blue-400 border border-blue-900', text: 'text-blue-400', prefix: '' };
      default:
        return { badge: 'bg-slate-800 text-slate-400 border border-slate-700', text: 'text-slate-300', prefix: '±' };
    }
  };

  return (
     <>
      {/* Mobile — card layout */}
      <div className="space-y-3 sm:hidden">
        {transactions.map((tx) => {
          const styles = getTypeStyle(tx.type);
          return (
            <div key={tx.id} className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div
                  onClick={() => onRowProductClick && onRowProductClick(tx)}
                  className={`text-white font-semibold text-sm ${onRowProductClick ? 'cursor-pointer hover:text-emerald-400 underline decoration-dashed decoration-slate-600' : ''}`}
                >
                  {tx.productName}
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${styles.badge}`}>
                  {tx.type}
                </span>
              </div>

              <div className="text-xs text-slate-500 font-mono mb-3">
                {tx.productSku} <span className="text-slate-700 mx-1">|</span> ID: {tx.productId}
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{formatTimestamp(tx.createdAt)}</span>
                <span className={`font-mono font-bold text-base ${styles.text}`}>
                  {styles.prefix}{tx.quantity}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-mono">#{tx.id}</span>
                <span className="text-slate-300 font-mono truncate max-w-[150px]">
                  {tx.performedBy || 'SYSTEM'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop — table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">TX ID</th>
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Product Name</th>
              <th className="pb-3">Transaction Type</th>
              <th className="pb-3 text-right">Quantity</th>
              <th className="pb-3 pl-6">Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm font-medium">
            {transactions.map((tx) => {
              const styles = getTypeStyle(tx.type);
              return (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition group">
                  <td className="py-3.5 pl-2 font-mono text-slate-500 text-xs">#{tx.id}</td>
                  <td className="py-3.5 text-xs text-slate-400 font-normal whitespace-nowrap">{formatTimestamp(tx.createdAt)}</td>
                  <td className="py-3.5">
                    <div
                      onClick={() => onRowProductClick && onRowProductClick(tx)}
                      className={`text-white font-semibold tracking-wide text-sm ${onRowProductClick ? 'cursor-pointer hover:text-emerald-400 underline decoration-dashed decoration-slate-600' : ''}`}
                    >
                      {tx.productName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {tx.productSku} <span className="text-slate-700 mx-1">|</span> ID: {tx.productId}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${styles.badge}`}>{tx.type}</span>
                  </td>
                  <td className={`py-3.5 text-right font-mono font-bold text-base ${styles.text}`}>{styles.prefix}{tx.quantity}</td>
                  <td className="py-3.5 pl-6 text-slate-300 font-mono text-xs max-w-[120px] truncate">{tx.performedBy || 'SYSTEM'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}