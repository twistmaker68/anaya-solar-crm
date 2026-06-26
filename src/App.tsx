import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./components/Login";

import { Sidebar } from "./components/Layout/Sidebar";
import { Header } from "./components/Layout/Header";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Agents } from "./components/Agents/Agents";
import { Leads } from "./components/Leads/Leads";
import { Customers } from "./components/Customers/Customers";
import { Payments } from "./components/Payments/Payments";
import { Installations } from "./components/Installations/Installations";
import { Reports } from "./components/Reports/Reports";
import { WhatsApp } from "./components/WhatsApp/WhatsApp";
import EnterpriseModules from "./components/CRM/EnterpriseModules";
import QuotationModule from "./components/CRM/QuotationModule";

function App() {

  const [session, setSession] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState("dashboard");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {

      setSession(data.session);

    });

    const {

      data: { subscription },

    } = supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session);

    });

    return () => subscription.unsubscribe();

  }, []);

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent).detail as { page?: string } | undefined;
      if (detail?.page) {
        setCurrentPage(detail.page);
      }
    };

    window.addEventListener('crm-navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('crm-navigate', handleNavigate as EventListener);
  }, []);

  if (!session) {

    return <Login />;

  }

  const renderPage = () => {

    switch (currentPage) {

      case "dashboard":

        return <Dashboard />;

      case "agents":

        return <Agents />;

      case "leads":

        return <Leads />;

      case "customers":

        return <Customers />;

      case "payments":

        return <Payments />;

      case "installations":

        return <Installations />;

      case "reports":

        return <Reports />;

      case "whatsapp":

        return <WhatsApp />;

      case "enterprise":

        return <EnterpriseModules />;

      case "quotations":

        return <QuotationModule />;

      default:

        return <Dashboard />;

    }

  };

  return (

    <div className="min-h-screen bg-slate-100">

      <Sidebar

        currentPage={currentPage}

        onNavigate={setCurrentPage}

      />

      <Header

        sidebarCollapsed={sidebarCollapsed}

        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}

      />

      <main

        className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? "pl-20" : "pl-64"

          }`}

      >

        <div className="p-6">

          <div className="flex justify-end mb-5">

            <button

              onClick={() => supabase.auth.signOut()}

              className="bg-red-500 text-white px-4 py-2 rounded"

            >

              Logout

            </button>

          </div>

          {renderPage()}

        </div>

      </main>

    </div>

  );

}

export default App;