import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  History,
  Bell,
  Upload,
  Tags,
  Truck,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/stock-history', label: 'Stock History', icon: History },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/csv-import', label: 'CSV Import', icon: Upload },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
];

function Sidebar({ onNavigate }) {
  return (
    <aside className="w-64 shrink-0 sticky top-0 bg-slate-900 text-slate-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">🏭 Inventra</h1>
        <p className="text-xs text-slate-400 mt-1">Warehouse Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;