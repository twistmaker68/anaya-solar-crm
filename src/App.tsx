import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Agents } from './components/Agents/Agents';
import { Leads } from './components/Leads/Leads';
import { Customers } from './components/Customers/Customers';
import { Payments } from './components/Payments/Payments';
import { Installations } from './components/Installations/Installations';
import { Reports } from './components/Reports/Reports';
import { WhatsApp } from './components/WhatsApp/WhatsApp';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'agents':
        return <Agents />;
      case 'leads':
        return <Leads />;
      case 'customers':
        return <Customers />;
      case 'payments':
        return <Payments />;
      case 'installations':
        return <Installations />;
      case 'reports':
        return <Reports />;
      case 'whatsapp':
        return <WhatsApp />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="p-6">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
