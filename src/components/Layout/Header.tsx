import { Bell, Search, User, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function Header({ sidebarCollapsed, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, customers, payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="h-8 w-px bg-slate-200" />

          <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
