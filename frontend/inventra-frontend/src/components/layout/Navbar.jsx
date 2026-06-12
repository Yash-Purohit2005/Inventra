import { Menu } from 'lucide-react';

function Navbar({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:text-slate-900"
        >
          <Menu size={24} />
        </button>
        {/* TODO: Replace with logged-in user's name from JWT after Spring Security */}
        <span className="hidden sm:inline text-sm text-slate-600">
         Welcome, Manager Yash !
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
       
        <button className="text-sm font-medium text-red-600 hover:text-red-700">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;