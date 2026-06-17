import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import StockHistory from './pages/StockHistoryPage';
import AlertsPage from './pages/AlertsPage';
import CsvImportPage from './pages/csvImportPage';
import CategoryPage from './pages/CategoryPage';
import SupplierPage from './pages/SupplierPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/stock-history" element={<StockHistory />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/csv-import" element={<CsvImportPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/suppliers" element={<SupplierPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;