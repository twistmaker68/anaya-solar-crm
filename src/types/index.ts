export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'sales' | 'technician' | 'manager' | 'admin';
  status: 'active' | 'inactive';
  targets: {
    monthlyLeads: number;
    monthlySales: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  source: 'website' | 'referral' | 'walk-in' | 'campaign' | 'whatsapp' | 'other';
  status: 'new' | 'contacted' | 'survey-scheduled' | 'survey-done' | 'quoted' | 'negotiating' | 'converted' | 'lost';
  assignedAgentId: string;
  requirements: {
    roofType: string;
    monthlyBill: number;
    propertyType: 'residential' | 'commercial' | 'industrial';
    preferredCapacity: number;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  leadId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  installationAddress: string;
  systemCapacity: number;
  contractValue: number;
  assignedAgentId: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'bank-transfer' | 'upi' | 'cheque' | 'card';
  status: 'pending' | 'received' | 'bounced' | 'refunded';
  type: 'advance' | 'milestone' | 'final';
  dueDate: string;
  paidDate: string | null;
  notes: string;
  receiptNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installation {
  id: string;
  customerId: string;
  status: 'not-started' | 'survey-completed' | 'design-approved' | 'material-dispatched' | 'installation-in-progress' | 'completed' | 'handed-over';
  surveyDate: string;
  surveyNotes: string;
  designApprovedDate: string | null;
  materialDispatchDate: string | null;
  installationStartDate: string | null;
  installationEndDate: string | null;
  handoverDate: string | null;
  assignedTechnicians: string[];
  systemDetails: {
    panels: number;
    inverterCapacity: string;
    mountingStructure: string;
    batteryBackup: boolean;
    batteryCapacity?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppLog {
  id: string;
  entityType: 'lead' | 'customer';
  entityId: string;
  phone: string;
  message: string;
  template: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeadsToday: number;
  leadConversionRate: number;
  totalCustomers: number;
  activeInstallations: number;
  totalRevenue: number;
  pendingPayments: number;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    leads: number;
    conversions: number;
    revenue: number;
  }>;
}
