import { useEffect, useState } from 'react';
import { Package, AlertTriangle, IndianRupee, Bell } from 'lucide-react';
import SummaryCard from '../components/common/SummaryCard';
import StockMovementChart from '../components/charts/StockMovementChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TopLowStockList from '../components/common/TopLowStockList';
import SupplierPerformanceList from '../components/common/SupplierPerformanceList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  getDashboardSummary,
  getTopLowStock,
  getStockMovements,
  getCategoryDistribution,
  getSupplierPerformance,
} from '../services/dashboardService';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topLowStock, setTopLowStock] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, lowStockRes, movementsRes, categoryRes, supplierRes] =
        await Promise.all([
          getDashboardSummary(),
          getTopLowStock(),
          getStockMovements(),
          getCategoryDistribution(),
          getSupplierPerformance(),
        ]);

      setSummary(summaryRes.data);
      setTopLowStock(lowStockRes.data);
      setStockMovements(movementsRes.data);
      setCategoryData(categoryRes.data);
      setSupplierData(supplierRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;



  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Products"
          value={summary.totalProducts}
          icon={Package}
          color="blue"
        />
        <SummaryCard
          title="Below Threshold"
          value={summary.productsBelowThreshold}
          icon={AlertTriangle}
          color="amber"
        />
        <SummaryCard
          title="Today's Sales"
          value={`₹${summary.totalSalesToday}`}
          icon={IndianRupee}
          color="green"
        />
        <SummaryCard
          title="Open Alerts"
          value={summary.activeAlerts}
          icon={Bell}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StockMovementChart data={stockMovements} />
        <TopLowStockList products={topLowStock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryPieChart data={categoryData} />
        <SupplierPerformanceList suppliers={supplierData} />
      </div>
    </div>
  );
}

export default DashboardPage;