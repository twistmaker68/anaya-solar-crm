import type { Agent, Lead, Customer, Payment, Installation, WhatsAppLog, DashboardMetrics } from '../types';

const STORAGE_KEYS = {
  agents: 'anaya_agents',
  leads: 'anaya_leads',
  customers: 'anaya_customers',
  payments: 'anaya_payments',
  installations: 'anaya_installations',
  whatsappLogs: 'anaya_whatsapp_logs',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function initializeSampleData() {
  const existingAgents = getFromStorage<Agent>(STORAGE_KEYS.agents);
  if (existingAgents.length === 0) {
    const sampleAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'Rahul Sharma',
        email: 'rahul@anayasolar.com',
        phone: '+91 98765 43210',
        role: 'manager',
        status: 'active',
        targets: { monthlyLeads: 50, monthlySales: 500000 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'agent-2',
        name: 'Priya Patel',
        email: 'priya@anayasolar.com',
        phone: '+91 98765 43211',
        role: 'sales',
        status: 'active',
        targets: { monthlyLeads: 30, monthlySales: 300000 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'agent-3',
        name: 'Amit Kumar',
        email: 'amit@anayasolar.com',
        phone: '+91 98765 43212',
        role: 'technician',
        status: 'active',
        targets: { monthlyLeads: 0, monthlySales: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setToStorage(STORAGE_KEYS.agents, sampleAgents);

    const sampleLeads: Lead[] = [
      {
        id: 'lead-1',
        name: 'Vikram Mehta',
        email: 'vikram@gmail.com',
        phone: '+91 99887 76655',
        address: '42, Green Park Colony, Jaipur, Rajasthan 302001',
        source: 'website',
        status: 'survey-scheduled',
        assignedAgentId: 'agent-2',
        requirements: {
          roofType: 'RCC',
          monthlyBill: 5000,
          propertyType: 'residential',
          preferredCapacity: 5,
        },
        notes: 'Looking for 5kW system for residential property. High intent.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lead-2',
        name: 'Suresh Gupta',
        email: 'suresh@company.com',
        phone: '+91 88776 65544',
        address: 'Industrial Area, Phase 2, Ajmer, Rajasthan 305001',
        source: 'referral',
        status: 'quoted',
        assignedAgentId: 'agent-2',
        requirements: {
          roofType: 'Metal Shed',
          monthlyBill: 25000,
          propertyType: 'industrial',
          preferredCapacity: 25,
        },
        notes: 'Industrial client, referred by existing customer',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lead-3',
        name: 'Anita Sharma',
        email: 'anita.s@gmail.com',
        phone: '+91 77665 54433',
        address: '15, Gandhi Nagar, Delhi 110031',
        source: 'campaign',
        status: 'new',
        assignedAgentId: 'agent-2',
        requirements: {
          roofType: 'RCC',
          monthlyBill: 3500,
          propertyType: 'residential',
          preferredCapacity: 3,
        },
        notes: 'From Facebook campaign. Needs callback',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setToStorage(STORAGE_KEYS.leads, sampleLeads);

    const sampleCustomers: Customer[] = [
      {
        id: 'cust-1',
        leadId: 'lead-old-1',
        name: 'Rajesh Agarwal',
        email: 'rajesh@business.com',
        phone: '+91 99112 23344',
        address: 'Shop No 15, Main Market, Kota, Rajasthan 324001',
        installationAddress: 'Same as above',
        systemCapacity: 10,
        contractValue: 650000,
        assignedAgentId: 'agent-2',
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-2',
        leadId: 'lead-old-2',
        name: 'Meera Developers',
        email: 'info@meeradevelopers.com',
        phone: '+91 88221 12233',
        address: 'Tower A, Complex, Udaipur, Rajasthan 313001',
        installationAddress: 'Same as above',
        systemCapacity: 50,
        contractValue: 3200000,
        assignedAgentId: 'agent-2',
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setToStorage(STORAGE_KEYS.customers, sampleCustomers);

    const samplePayments: Payment[] = [
      {
        id: 'pay-1',
        customerId: 'cust-1',
        amount: 200000,
        method: 'bank-transfer',
        status: 'received',
        type: 'advance',
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '30% advance payment received',
        receiptNumber: 'RCP-2024-001',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pay-2',
        customerId: 'cust-1',
        amount: 200000,
        method: 'bank-transfer',
        status: 'received',
        type: 'milestone',
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Installation milestone payment',
        receiptNumber: 'RCP-2024-002',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pay-3',
        customerId: 'cust-1',
        amount: 250000,
        method: 'cheque',
        status: 'pending',
        type: 'final',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: null,
        notes: 'Final payment pending handover',
        receiptNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pay-4',
        customerId: 'cust-2',
        amount: 1000000,
        method: 'bank-transfer',
        status: 'received',
        type: 'advance',
        dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Advance payment for commercial project',
        receiptNumber: 'RCP-2024-003',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setToStorage(STORAGE_KEYS.payments, samplePayments);

    const sampleInstallations: Installation[] = [
      {
        id: 'inst-1',
        customerId: 'cust-1',
        status: 'installation-in-progress',
        surveyDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        surveyNotes: 'South facing roof, good sunlight exposure. No shading issues.',
        designApprovedDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        materialDispatchDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        installationStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        installationEndDate: null,
        handoverDate: null,
        assignedTechnicians: ['agent-3'],
        systemDetails: {
          panels: 20,
          inverterCapacity: '10kW',
          mountingStructure: 'RCC',
          batteryBackup: true,
          batteryCapacity: '5kWh',
        },
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inst-2',
        customerId: 'cust-2',
        status: 'design-approved',
        surveyDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        surveyNotes: 'Large commercial rooftop. Multiple sections. Need structural assessment.',
        designApprovedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        materialDispatchDate: null,
        installationStartDate: null,
        installationEndDate: null,
        handoverDate: null,
        assignedTechnicians: ['agent-3'],
        systemDetails: {
          panels: 100,
          inverterCapacity: '50kW',
          mountingStructure: 'RCC Ballasted',
          batteryBackup: false,
        },
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setToStorage(STORAGE_KEYS.installations, sampleInstallations);
  }
}

// Initialize sample data on first load
if (typeof window !== 'undefined') {
  initializeSampleData();
}

export const db = {
  // Agents
  getAgents: (): Agent[] => getFromStorage<Agent>(STORAGE_KEYS.agents),
  getAgent: (id: string): Agent | undefined => getFromStorage<Agent>(STORAGE_KEYS.agents).find(a => a.id === id),
  createAgent: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Agent => {
    const agents = getFromStorage<Agent>(STORAGE_KEYS.agents);
    const agent: Agent = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.agents, [...agents, agent]);
    return agent;
  },
  updateAgent: (id: string, data: Partial<Agent>): Agent | null => {
    const agents = getFromStorage<Agent>(STORAGE_KEYS.agents);
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    agents[index] = { ...agents[index], ...data, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.agents, agents);
    return agents[index];
  },
  deleteAgent: (id: string): boolean => {
    const agents = getFromStorage<Agent>(STORAGE_KEYS.agents);
    const filtered = agents.filter(a => a.id !== id);
    if (filtered.length === agents.length) return false;
    setToStorage(STORAGE_KEYS.agents, filtered);
    return true;
  },

  // Leads
  getLeads: (): Lead[] => getFromStorage<Lead>(STORAGE_KEYS.leads),
  getLead: (id: string): Lead | undefined => getFromStorage<Lead>(STORAGE_KEYS.leads).find(l => l.id === id),
  createLead: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const leads = getFromStorage<Lead>(STORAGE_KEYS.leads);
    const lead: Lead = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.leads, [...leads, lead]);
    return lead;
  },
  updateLead: (id: string, data: Partial<Lead>): Lead | null => {
    const leads = getFromStorage<Lead>(STORAGE_KEYS.leads);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return null;
    leads[index] = { ...leads[index], ...data, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.leads, leads);
    return leads[index];
  },
  deleteLead: (id: string): boolean => {
    const leads = getFromStorage<Lead>(STORAGE_KEYS.leads);
    const filtered = leads.filter(l => l.id !== id);
    if (filtered.length === leads.length) return false;
    setToStorage(STORAGE_KEYS.leads, filtered);
    return true;
  },

  // Customers
  getCustomers: (): Customer[] => getFromStorage<Customer>(STORAGE_KEYS.customers),
  getCustomer: (id: string): Customer | undefined => getFromStorage<Customer>(STORAGE_KEYS.customers).find(c => c.id === id),
  createCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.customers);
    const customer: Customer = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.customers, [...customers, customer]);
    return customer;
  },
  updateCustomer: (id: string, data: Partial<Customer>): Customer | null => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.customers);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...data, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.customers, customers);
    return customers[index];
  },
  deleteCustomer: (id: string): boolean => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.customers);
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length === customers.length) return false;
    setToStorage(STORAGE_KEYS.customers, filtered);
    return true;
  },

  // Payments
  getPayments: (): Payment[] => getFromStorage<Payment>(STORAGE_KEYS.payments),
  getPayment: (id: string): Payment | undefined => getFromStorage<Payment>(STORAGE_KEYS.payments).find(p => p.id === id),
  getPaymentsByCustomer: (customerId: string): Payment[] => getFromStorage<Payment>(STORAGE_KEYS.payments).filter(p => p.customerId === customerId),
  createPayment: (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment => {
    const payments = getFromStorage<Payment>(STORAGE_KEYS.payments);
    const payment: Payment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.payments, [...payments, payment]);
    return payment;
  },
  updatePayment: (id: string, data: Partial<Payment>): Payment | null => {
    const payments = getFromStorage<Payment>(STORAGE_KEYS.payments);
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return null;
    payments[index] = { ...payments[index], ...data, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.payments, payments);
    return payments[index];
  },
  deletePayment: (id: string): boolean => {
    const payments = getFromStorage<Payment>(STORAGE_KEYS.payments);
    const filtered = payments.filter(p => p.id !== id);
    if (filtered.length === payments.length) return false;
    setToStorage(STORAGE_KEYS.payments, filtered);
    return true;
  },

  // Installations
  getInstallations: (): Installation[] => getFromStorage<Installation>(STORAGE_KEYS.installations),
  getInstallation: (id: string): Installation | undefined => getFromStorage<Installation>(STORAGE_KEYS.installations).find(i => i.id === id),
  getInstallationByCustomer: (customerId: string): Installation | undefined => getFromStorage<Installation>(STORAGE_KEYS.installations).find(i => i.customerId === customerId),
  createInstallation: (data: Omit<Installation, 'id' | 'createdAt' | 'updatedAt'>): Installation => {
    const installations = getFromStorage<Installation>(STORAGE_KEYS.installations);
    const installation: Installation = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.installations, [...installations, installation]);
    return installation;
  },
  updateInstallation: (id: string, data: Partial<Installation>): Installation | null => {
    const installations = getFromStorage<Installation>(STORAGE_KEYS.installations);
    const index = installations.findIndex(i => i.id === id);
    if (index === -1) return null;
    installations[index] = { ...installations[index], ...data, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.installations, installations);
    return installations[index];
  },
  deleteInstallation: (id: string): boolean => {
    const installations = getFromStorage<Installation>(STORAGE_KEYS.installations);
    const filtered = installations.filter(i => i.id !== id);
    if (filtered.length === installations.length) return false;
    setToStorage(STORAGE_KEYS.installations, filtered);
    return true;
  },

  // WhatsApp Logs
  getWhatsAppLogs: (): WhatsAppLog[] => getFromStorage<WhatsAppLog>(STORAGE_KEYS.whatsappLogs),
  createWhatsAppLog: (data: Omit<WhatsAppLog, 'id' | 'sentAt'>): WhatsAppLog => {
    const logs = getFromStorage<WhatsAppLog>(STORAGE_KEYS.whatsappLogs);
    const log: WhatsAppLog = {
      ...data,
      id: generateId(),
      sentAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.whatsappLogs, [...logs, log]);
    return log;
  },

  // Dashboard Metrics
  getDashboardMetrics: (): DashboardMetrics => {
    const leads = getFromStorage<Lead>(STORAGE_KEYS.leads);
    const customers = getFromStorage<Customer>(STORAGE_KEYS.customers);
    const payments = getFromStorage<Payment>(STORAGE_KEYS.payments);
    const installations = getFromStorage<Installation>(STORAGE_KEYS.installations);
    const agents = getFromStorage<Agent>(STORAGE_KEYS.agents);

    const today = new Date().toDateString();
    const newLeadsToday = leads.filter(l => new Date(l.createdAt).toDateString() === today).length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const leadConversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;

    const receivedPayments = payments.filter(p => p.status === 'received');
    const totalRevenue = receivedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

    const activeInstallations = installations.filter(
      i => !['completed', 'handed-over'].includes(i.status)
    ).length;

    const agentPerformance = agents
      .filter(a => a.role === 'sales')
      .map(agent => {
        const agentLeads = leads.filter(l => l.assignedAgentId === agent.id);
        const agentCustomers = customers.filter(c => c.assignedAgentId === agent.id);
        const agentRevenue = payments
          .filter(p => {
            const customer = customers.find(c => c.id === p.customerId);
            return customer?.assignedAgentId === agent.id && p.status === 'received';
          })
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          agentId: agent.id,
          agentName: agent.name,
          leads: agentLeads.length,
          conversions: agentCustomers.length,
          revenue: agentRevenue,
        };
      });

    return {
      totalLeads: leads.length,
      newLeadsToday,
      leadConversionRate,
      totalCustomers: customers.length,
      activeInstallations,
      totalRevenue,
      pendingPayments,
      agentPerformance,
    };
  },

  // Report Data
  getLeadsReport: (startDate: string, endDate: string) => {
    const leads = getFromStorage<Lead>(STORAGE_KEYS.leads).filter(l => {
      const date = new Date(l.createdAt);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const byStatus = leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { leads, byStatus, bySource, total: leads.length };
  },

  getPaymentsReport: (startDate: string, endDate: string) => {
    const payments = getFromStorage<Payment>(STORAGE_KEYS.payments).filter(p => {
      const date = new Date(p.paidDate || p.dueDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const customers = getFromStorage<Customer>(STORAGE_KEYS.customers);

    const byStatus = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalReceived = payments
      .filter(p => p.status === 'received')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return { payments, customers, byStatus, byMethod, totalReceived, totalPending };
  },

  getInstallationsReport: () => {
    const installations = getFromStorage<Installation>(STORAGE_KEYS.installations);
    const customers = getFromStorage<Customer>(STORAGE_KEYS.customers);

    const byStatus = installations.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCapacity = installations.reduce((sum, i) => {
      const customer = customers.find(c => c.id === i.customerId);
      return sum + (customer?.systemCapacity || 0);
    }, 0);

    return { installations, customers, byStatus, totalCapacity };
  },
};
