import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Download, CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { importCsv, getImportHistory, downloadErrorReport } from '../services/csvService';
import LoadingSpinner from '../components/common/LoadingSpinner';

function CsvImportPage() {
  const [file, setFile] = useState(null);
  const [operator, setOperator] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await getImportHistory();
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load import history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !operator.trim()) return;

    try {
      setImporting(true);
      setError(null);
      setResult(null);
      const res = await importCsv(file, operator.trim());
      setResult(res.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setOperator('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) : '—';

  const statusColors = {
    SUCCESS: 'bg-emerald-950/80 text-emerald-400 border border-emerald-900',
    PARTIAL: 'bg-amber-950/80 text-amber-400 border border-amber-900',
    FAILED: 'bg-rose-950/80 text-rose-400 border border-rose-900',
  };

  return (
    <div className="min-h-screen p-4 sm:p-6  select-none">
      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-900/60 p-2.5 rounded-lg">
            <Upload className="text-emerald-400" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">
              CSV Batch Import
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Upload stock transaction files for bulk processing.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Upload Form */}
        <div className="space-y-5">

          {/* Format Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={14} /> Expected CSV Format
            </h3>
            <pre className="text-xs text-emerald-400 font-mono bg-slate-800/40 rounded-lg p-3 overflow-x-auto">
              {`sku,transactionType,quantity
MED-PARA-500,SALE,10
MED-AMOX-250,RESTOCK,50
SURG-GLOVE-L,ADJUSTMENT_ADD,25`}
            </pre>
            <p className="text-xs text-slate-500 mt-2">
              Supported types:{' '}
              <span className="font-mono text-slate-400">
                RESTOCK · SALE · ADJUSTMENT_ADD · ADJUSTMENT_SUBTRACT
              </span>
            </p>
          </div>

          {/* Upload Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Upload File
            </h3>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${file
                ? 'border-emerald-700 bg-emerald-950/20'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/20'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div>
                  <FileText className="mx-auto text-emerald-400 mb-2" size={28} />
                  <p className="text-emerald-400 font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto text-slate-500 mb-2" size={28} />
                  <p className="text-slate-400 text-sm font-medium">
                    Drop CSV file here or click to browse
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Max 10MB · .csv only</p>
                </div>
              )}
            </div>

            {/* Operator */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Operator Name *
              </label>
              <input
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <p className="text-xs text-slate-600 mt-1">
                Recorded against every transaction in this import.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2 flex items-center gap-2">
                <XCircle size={16} /> {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={importing || !file || !operator.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition"
              >
                {importing ? 'Importing...' : '📥 Import CSV'}
              </button>
              {(file || result) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg text-sm transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Import Result */}
          {result && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Import Result</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${statusColors[result.status]}`}>
                  {result.status}
                </span>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total</p>
                  <p className="text-xl font-bold font-mono text-slate-200">
                    {result.totalRowsProcessed}
                  </p>
                </div>
                <div className="bg-emerald-950/30 rounded-lg p-3 text-center border border-emerald-900/40">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Success</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">
                    {result.successCount}
                  </p>
                </div>
                <div className="bg-rose-950/30 rounded-lg p-3 text-center border border-rose-900/40">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Failed</p>
                  <p className="text-xl font-bold font-mono text-rose-400">
                    {result.failureCount}
                  </p>
                </div>
              </div>

              {/* Row Errors */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={12} /> Row Errors
                    </p>
                    <button
                      onClick={() => downloadErrorReport(result.importJobId)}
                      type="button"
                      className="text-xs text-emerald-400 hover:underline font-mono flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    >
                      <Download size={12} /> Download Report
                    </button>

                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <div
                        key={i}
                        className="bg-rose-950/20 border border-rose-900/40 rounded-lg px-3 py-2 text-xs"
                      >
                        <span className="text-rose-400 font-mono font-bold">
                          Row {err.rowNumber}
                        </span>
                        <span className="text-slate-500 mx-2">·</span>
                        <span className="text-slate-400 font-mono">{err.sku}</span>
                        <span className="text-slate-500 mx-2">·</span>
                        <span className="text-slate-300">{err.errorMessage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success State */}
              {result.status === 'SUCCESS' && (
                <div className="flex items-center gap-2 text-sm text-emerald-400 mt-2">
                  <CheckCircle2 size={16} />
                  All rows imported successfully.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Import History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Import History
          </h3>

          {historyLoading ? (
            <LoadingSpinner />
          ) : history.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No imports yet.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {history.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-800/40 border border-slate-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm truncate max-w-[180px]">
                        {job.filename}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        by {job.uploadedBy}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono shrink-0 ${statusColors[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="text-center">
                      <p className="text-slate-500">Total</p>
                      <p className="font-mono font-bold text-slate-300">{job.totalRows}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">OK</p>
                      <p className="font-mono font-bold text-emerald-400">{job.successRows}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">Failed</p>
                      <p className="font-mono font-bold text-rose-400">{job.failedRows}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">
                      {formatDate(job.uploadedAt)}
                    </span>
                    {job.failedRows > 0 && (
                      <button
                        onClick={() => downloadErrorReport(job.id)}
                        type="button"
                        className="text-emerald-400 hover:underline font-mono flex items-center gap-1 bg-transparent border-none cursor-pointer"
                      >
                        <Download size={12} /> Errors
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CsvImportPage;