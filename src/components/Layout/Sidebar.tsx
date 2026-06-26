import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  CreditCard,
  Wrench,
  FileText,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'leads', label: 'Leads', icon: UserPlus },
  { id: 'customers', label: 'Customers', icon: Building2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'installations', label: 'Installations', icon: Wrench },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'enterprise', label: 'Enterprise', icon: ShieldCheck },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Sun className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg leading-tight">ANAYA SOLAR</h1>
              <p className="text-xs text-slate-400">Solutions CRM</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 shadow-lg border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
              {!collapsed && (
                <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
            <p className="text-xs text-slate-400 mb-2">Powered by</p>
            <p className="font-semibold text-amber-400">ANAYA SOLAR</p>
            <p className="text-xs text-slate-500 mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}
