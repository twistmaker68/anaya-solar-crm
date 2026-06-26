export interface CRMUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Disabled' | 'Locked' | 'Resigned';
  department: string;
  branch: string;
  createdAt: string;
}

export interface CompanyProfile {
  companyName: string;
  brandName: string;
  logoUrl: string;
  gstin: string;
  pan: string;
  cin: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  email: string;
  phone: string;
  website: string;
  bankDetails: string;
  termsAndConditions: string;
  warranty: string;
  signature: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  discount: number;
}

export interface Quotation {
  id: string;
  leadId?: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectName: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Accepted' | 'Rejected' | 'Converted';
  template: 'Standard' | 'Premium' | 'Residential';
  validityDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy: string;
  version: number;
  versionHistory: Array<{ version: number; note: string; updatedAt: string; updatedBy: string }>;
  items: QuotationItem[];
  discountPercent: number;
  gstRate: number;
  subsidyAmount: number;
  installationCharges: number;
  paymentSchedule: string;
  attachments: string;
  notes: string;
  termsAndConditions: string;
  warranty: string;
  customerSignature: string;
  isLocked: boolean;
}

const USERS_KEY = 'anaya-crm-users';
const PROFILE_KEY = 'anaya-crm-company-profile';
const AUDIT_KEY = 'anaya-crm-audit';
const QUOTATIONS_KEY = 'anaya-crm-quotations';

export function loadUsers(): CRMUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: CRMUser[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadCompanyProfile(): CompanyProfile {
  if (typeof window === 'undefined') {
    return {
      companyName: 'Anaya Solar CRM',
      brandName: 'Anaya Solar',
      logoUrl: '',
      gstin: '',
      pan: '',
      cin: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      email: '',
      phone: '',
      website: '',
      bankDetails: '',
      termsAndConditions: '',
      warranty: '',
      signature: '',
    };
  }
  try {
    const stored = window.localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : {
      companyName: 'Anaya Solar CRM',
      brandName: 'Anaya Solar',
      logoUrl: '',
      gstin: '',
      pan: '',
      cin: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      email: '',
      phone: '',
      website: '',
      bankDetails: '',
      termsAndConditions: '',
      warranty: '',
      signature: '',
    };
  } catch {
    return {
      companyName: 'Anaya Solar CRM',
      brandName: 'Anaya Solar',
      logoUrl: '',
      gstin: '',
      pan: '',
      cin: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      email: '',
      phone: '',
      website: '',
      bankDetails: '',
      termsAndConditions: '',
      warranty: '',
      signature: '',
    };
  }
}

export function saveCompanyProfile(profile: CompanyProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadAuditLogs(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(AUDIT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveAuditLogs(logs: AuditEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

export function addAuditLog(user: string, action: string) {
  const logs = loadAuditLogs();
  logs.unshift({ id: crypto.randomUUID(), user, action, createdAt: new Date().toISOString() });
  saveAuditLogs(logs.slice(0, 50));
}

export function loadQuotations(): Quotation[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(QUOTATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveQuotations(quotations: Quotation[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
}
