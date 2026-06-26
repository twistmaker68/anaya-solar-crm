import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, CheckCircle2, History, Download, Share2, Printer, PenSquare, Copy, ShieldCheck, Trash2 } from 'lucide-react';
import { db } from '../../lib/db';
import type { Lead } from '../../types';
import {
  addAuditLog,
  loadAuditLogs,
  loadCompanyProfile,
  loadQuotations,
  saveQuotations,
  type AuditEntry,
  type CompanyProfile,
  type Quotation,
  type QuotationItem,
} from '../../lib/crmStorage';

const templates = ['Standard', 'Premium', 'Residential'] as const;
const statuses = ['Draft', 'Pending Approval', 'Approved', 'Accepted', 'Rejected', 'Converted'] as const;

const makeBlankItem = (): QuotationItem => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
});

export default function QuotationModule() {
  const [profile, setProfile] = useState<CompanyProfile>(loadCompanyProfile());
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeQuote, setActiveQuote] = useState<Quotation | null>(null);
  const [draft, setDraft] = useState<Quotation | null>(null);
  const [leadOptions, setLeadOptions] = useState<Lead[]>(db.getLeads());

  useEffect(() => {
    const stored = loadQuotations();
    setQuotations(stored.length ? stored : []);
    setAuditLogs(loadAuditLogs());
    setProfile(loadCompanyProfile());
    setLeadOptions(db.getLeads());
  }, []);

  useEffect(() => {
    if (!activeQuote && quotations[0]) {
      setActiveQuote(quotations[0]);
    }
  }, [activeQuote, quotations]);

  const filteredQuotes = useMemo(() => quotations.filter((quote) => {
    const matchesSearch = [quote.quoteNumber, quote.customerName, quote.projectName, quote.status].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [quotations, search, statusFilter]);

  const stats = useMemo(() => ({
    total: quotations.length,
    approved: quotations.filter((q) => q.status === 'Approved' || q.status === 'Accepted').length,
    pending: quotations.filter((q) => q.status === 'Pending Approval').length,
    accepted: quotations.filter((q) => q.status === 'Accepted').length,
  }), [quotations]);

  const subtotal = (quote: Quotation) => quote.items.reduce((sum, item) => sum + (item.amount > 0 ? item.amount : item.quantity * item.unitPrice), 0);
  const discountedSubtotal = (quote: Quotation) => subtotal(quote) - (subtotal(quote) * (quote.discountPercent / 100));
  const taxable = (quote: Quotation) => discountedSubtotal(quote) + quote.installationCharges;
  const totalAmount = (quote: Quotation) => taxable(quote) + (taxable(quote) * (quote.gstRate / 100));
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  useEffect(() => {
    const handleCreateFromLead = (event: Event) => {
      const lead = (event as CustomEvent).detail as Lead | undefined;
      if (!lead) return;
      const now = new Date().toISOString();
      const newQuote: Quotation = {
        id: crypto.randomUUID(),
        leadId: lead.id,
        quoteNumber: `QTN-${String(quotations.length + 1).padStart(3, '0')}`,
        customerName: lead.name,
        customerEmail: lead.email,
        customerPhone: lead.phone,
        projectName: `${lead.name} - ${lead.requirements.propertyType} Solar`,
        status: 'Draft',
        template: 'Standard',
        validityDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        createdAt: now,
        updatedAt: now,
        createdBy: 'Sales Executive',
        approvedBy: '',
        version: 1,
        versionHistory: [{ version: 1, note: 'Created from lead', updatedAt: now, updatedBy: 'System' }],
        items: [makeBlankItem()],
        discountPercent: 0,
        gstRate: 5,
        subsidyAmount: 0,
        installationCharges: 0,
        paymentSchedule: '50% advance and 50% on installation',
        attachments: '',
        notes: `Lead source: ${lead.source}`,
        termsAndConditions: profile.termsAndConditions,
        warranty: profile.warranty,
        customerSignature: '',
        isLocked: false,
      };
      const next = [newQuote, ...quotations];
      setQuotations(next);
      saveQuotations(next);
      setDraft(newQuote);
      setActiveQuote(newQuote);
      addAuditLog('System', `Created quotation from lead ${lead.name}`);
      setAuditLogs(loadAuditLogs());
      db.updateLead(lead.id, { status: 'quoted' });
      setLeadOptions(db.getLeads());
    };

    window.addEventListener('crm-create-quotation', handleCreateFromLead as EventListener);
    return () => window.removeEventListener('crm-create-quotation', handleCreateFromLead as EventListener);
  }, [profile, quotations]);

  const buildPrintableHtml = (quote: Quotation) => {
    const safeCompanyName = profile.companyName || 'Company';
    const safeAddress = profile.address || 'Address';
    const safeGstin = profile.gstin || 'GSTIN';
    const safeBank = profile.bankDetails || 'Bank details to be updated';
    const safeTerms = quote.termsAndConditions || profile.termsAndConditions || 'Terms and conditions apply';
    const safeWarranty = quote.warranty || profile.warranty || 'Warranty terms to be confirmed';
    const safeSignature = profile.signature || 'Authorized Signature';
    const logoMarkup = profile.logoUrl ? `<img src="${profile.logoUrl}" alt="Company logo" style="max-height:56px;max-width:180px;" />` : `<div style="font-size:18px;font-weight:bold;">${safeCompanyName}</div>`;
    const computedSubtotal = subtotal(quote);
    const computedDiscounted = discountedSubtotal(quote);
    const computedTaxable = taxable(quote);
    const computedTotal = totalAmount(quote);

    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${quote.quoteNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            .totals { margin-top: 12px; float: right; width: 280px; }
            .box { border: 1px solid #e5e7eb; padding: 12px; margin-top: 16px; border-radius: 8px; }
            @media print { body { margin: 0; } .no-print { display:none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              ${logoMarkup}
              <p>${safeAddress}</p>
              <p>GSTIN: ${safeGstin}</p>
            </div>
            <div>
              <h3>Quotation</h3>
              <p>${quote.quoteNumber}</p>
              <p>Date: ${new Date(quote.createdAt).toLocaleDateString()}</p>
              <p>Valid till: ${quote.validityDate}</p>
            </div>
          </div>
          <div class="box">
            <p><strong>Customer:</strong> ${quote.customerName}</p>
            <p><strong>Project:</strong> ${quote.projectName}</p>
            <p><strong>Email:</strong> ${quote.customerEmail}</p>
            <p><strong>Phone:</strong> ${quote.customerPhone}</p>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${quote.items.map((item) => `<tr><td>${item.name}</td><td>${item.description}</td><td>${item.quantity}</td><td>${formatCurrency(item.unitPrice)}</td><td>${formatCurrency(item.amount > 0 ? item.amount : item.quantity * item.unitPrice)}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: ${formatCurrency(computedSubtotal)}</p>
            <p>Discount: ${quote.discountPercent}%</p>
            <p>Discounted subtotal: ${formatCurrency(computedDiscounted)}</p>
            <p>Installation charges: ${formatCurrency(quote.installationCharges)}</p>
            <p>Subsidy: ${formatCurrency(quote.subsidyAmount)}</p>
            <p>GST: ${quote.gstRate}%</p>
            <p><strong>Total: ${formatCurrency(computedTotal)}</strong></p>
          </div>
          <div style="clear: both;" class="box">
            <p><strong>Payment schedule:</strong> ${quote.paymentSchedule}</p>
            <p><strong>Bank details:</strong> ${safeBank}</p>
            <p><strong>Terms & conditions:</strong> ${safeTerms}</p>
            <p><strong>Warranty:</strong> ${safeWarranty}</p>
          </div>
          <div class="box">
            <p><strong>Authorized signature:</strong> ${safeSignature}</p>
            <p><strong>Customer signature:</strong> ${quote.customerSignature || '________________'}</p>
          </div>
        </body>
      </html>`;
  };

  const handleGenerateAndPreview = (quote: Quotation) => {
    const previewWindow = window.open('', '_blank', 'width=1000,height=800');
    if (previewWindow) {
      previewWindow.document.write(buildPrintableHtml(quote));
      previewWindow.document.close();
      previewWindow.focus();
      setTimeout(() => previewWindow.print(), 300);
    }
    addAuditLog('System', `Generated quotation ${quote.quoteNumber}`);
    setAuditLogs(loadAuditLogs());
  };

  const handleShareQuotation = (quote: Quotation, mode: 'whatsapp' | 'email') => {
    const text = `Quotation ${quote.quoteNumber} for ${quote.customerName}. Project: ${quote.projectName}. Total: ${formatCurrency(totalAmount(quote))}`;
    if (mode === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`mailto:${quote.customerEmail || ''}?subject=${encodeURIComponent(`Quotation ${quote.quoteNumber}`)}&body=${encodeURIComponent(text)}`, '_blank');
    }
    addAuditLog('System', `Shared quotation ${quote.quoteNumber} via ${mode}`);
    setAuditLogs(loadAuditLogs());
  };

  const saveQuote = (quote: Quotation) => {
    const next = quotations.some((q) => q.id === quote.id)
      ? quotations.map((q) => q.id === quote.id ? { ...quote, updatedAt: new Date().toISOString() } : q)
      : [quote, ...quotations];
    setQuotations(next);
    saveQuotations(next);
    addAuditLog('System', `Saved quotation ${quote.quoteNumber}`);
    setAuditLogs(loadAuditLogs());
    setActiveQuote(quote);
  };

  const createQuote = () => {
    const now = new Date().toISOString();
    const newQuote: Quotation = {
      id: crypto.randomUUID(),
      quoteNumber: `QTN-${String(quotations.length + 1).padStart(3, '0')}`,
      customerName: 'New Customer',
      customerEmail: '',
      customerPhone: '',
      projectName: 'New Solar Project',
      status: 'Draft',
      template: 'Standard',
      validityDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
      createdBy: 'Sales Executive',
      approvedBy: '',
      version: 1,
      versionHistory: [{ version: 1, note: 'Created', updatedAt: now, updatedBy: 'Sales Executive' }],
      items: [makeBlankItem()],
      discountPercent: 0,
      gstRate: 5,
      subsidyAmount: 0,
      installationCharges: 0,
      paymentSchedule: '50% advance and 50% on installation',
      attachments: '',
      notes: '',
      termsAndConditions: profile.termsAndConditions,
      warranty: profile.warranty,
      customerSignature: '',
      isLocked: false,
    };
    setDraft(newQuote);
    setActiveQuote(newQuote);
    saveQuote(newQuote);
  };

  const updateDraft = (changes: Partial<Quotation>) => {
    if (!draft) return;
    const updated = { ...draft, ...changes };
    setDraft(updated);
    setActiveQuote(updated);
  };

  const submitForApproval = () => {
    if (!draft) return;
    const updated = { ...draft, status: 'Pending Approval' as const, isLocked: false };
    setDraft(updated);
    saveQuote(updated);
    addAuditLog('System', `Submitted quotation ${updated.quoteNumber} for approval`);
    setAuditLogs(loadAuditLogs());
  };

  const approveQuote = () => {
    if (!draft) return;
    const updated = { ...draft, status: 'Approved' as const, isLocked: true };
    setDraft(updated);
    saveQuote(updated);
    addAuditLog('System', `Approved quotation ${updated.quoteNumber}`);
    setAuditLogs(loadAuditLogs());
  };

  const acceptQuote = () => {
    if (!draft) return;
    const updated = { ...draft, status: 'Accepted' as const, isLocked: true };
    setDraft(updated);
    saveQuote(updated);
    addAuditLog('System', `Accepted quotation ${updated.quoteNumber}`);
    setAuditLogs(loadAuditLogs());
  };

  const duplicateQuote = (quote: Quotation) => {
    const cloned: Quotation = {
      ...quote,
      id: crypto.randomUUID(),
      quoteNumber: `${quote.quoteNumber}-COPY`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      versionHistory: [{ version: 1, note: 'Duplicated', updatedAt: new Date().toISOString(), updatedBy: 'System' }],
      isLocked: false,
    };
    const next = [cloned, ...quotations];
    setQuotations(next);
    saveQuotations(next);
    addAuditLog('System', `Duplicated quotation ${quote.quoteNumber}`);
    setAuditLogs(loadAuditLogs());
    setDraft(cloned);
    setActiveQuote(cloned);
  };

  const deleteQuote = (quoteId: string, quoteNumber: string) => {
    const next = quotations.filter((quote) => quote.id !== quoteId);
    setQuotations(next);
    saveQuotations(next);
    addAuditLog('System', `Deleted quotation ${quoteNumber}`);
    setAuditLogs(loadAuditLogs());
    if (draft?.id === quoteId) {
      setDraft(null);
    }
    if (activeQuote?.id === quoteId) {
      setActiveQuote(next[0] ?? null);
    }
  };

  const addItem = () => {
    if (!draft) return;
    const updated = { ...draft, items: [...draft.items, makeBlankItem()] };
    setDraft(updated);
    setActiveQuote(updated);
  };

  const updateItem = (itemId: string, changes: Partial<QuotationItem>) => {
    if (!draft) return;
    const updated = {
      ...draft,
      items: draft.items.map((item) => (item.id === itemId ? { ...item, ...changes } : item)),
    };
    setDraft(updated);
    setActiveQuote(updated);
  };

  const currentQuote = draft ?? activeQuote;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Quotation Management</p>
            <h1 className="mt-2 text-3xl font-semibold">Create polished solar quotations with approval and delivery workflows</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-200">Auto-fill your company branding, manage approvals, support versioning, duplicate and share quotations, and convert accepted bids into projects or orders.</p>
          </div>
          <button onClick={createQuote} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600">
            <Plus size={16} /> New quotation
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Total quotations</p><p className="text-2xl font-semibold">{stats.total}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Pending approval</p><p className="text-2xl font-semibold">{stats.pending}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Approved</p><p className="text-2xl font-semibold">{stats.approved}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Accepted</p><p className="text-2xl font-semibold">{stats.accepted}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="text-orange-500" size={18} /><h2 className="text-lg font-semibold">Quotation list</h2></div>
            <div className="flex gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="All">All</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{quote.quoteNumber}</p>
                    <p className="text-sm text-slate-500">{quote.customerName} • {quote.projectName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">{quote.status}</span>
                    <button onClick={() => { setDraft(quote); setActiveQuote(quote); }} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Open</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => duplicateQuote(quote)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs"><Copy size={12} /> Duplicate</button>
                  <button onClick={() => deleteQuote(quote.id, quote.quoteNumber)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"><Trash2 size={12} /> Delete</button>
                  <button onClick={() => handleGenerateAndPreview(quote)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs"><Printer size={12} /> Generate & Print</button>
                  <button onClick={() => handleShareQuotation(quote, 'whatsapp')} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs"><Share2 size={12} /> WhatsApp</button>
                  <button onClick={() => handleShareQuotation(quote, 'email')} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs"><Download size={12} /> Email</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><PenSquare className="text-orange-500" size={18} /><h2 className="text-lg font-semibold">Quotation editor</h2></div>
            {currentQuote && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600">Version {currentQuote.version}</span>}
          </div>
          {currentQuote ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><label className="mb-1 block text-sm text-slate-600">Quote number</label><input value={currentQuote.quoteNumber} onChange={(e) => updateDraft({ quoteNumber: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Template</label><select value={currentQuote.template} onChange={(e) => updateDraft({ template: e.target.value as Quotation['template'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2">{templates.map((template) => <option key={template} value={template}>{template}</option>)}</select></div>
                <div><label className="mb-1 block text-sm text-slate-600">Customer</label><select value={currentQuote.leadId || ''} onChange={(e) => {
                  const selectedLead = leadOptions.find((lead) => lead.id === e.target.value);
                  if (selectedLead) {
                    updateDraft({
                      leadId: selectedLead.id,
                      customerName: selectedLead.name,
                      customerEmail: selectedLead.email,
                      customerPhone: selectedLead.phone,
                      projectName: `${selectedLead.name} - ${selectedLead.requirements.propertyType} Solar`,
                      notes: `Lead source: ${selectedLead.source}`,
                    });
                  }
                }} className="w-full rounded-lg border border-slate-300 px-3 py-2">{leadOptions.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} • {lead.phone}</option>)}</select></div>
                <div><label className="mb-1 block text-sm text-slate-600">Project</label><input value={currentQuote.projectName} onChange={(e) => updateDraft({ projectName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Email</label><input value={currentQuote.customerEmail} onChange={(e) => updateDraft({ customerEmail: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Phone</label><input value={currentQuote.customerPhone} onChange={(e) => updateDraft({ customerPhone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Validity date</label><input type="date" value={currentQuote.validityDate} onChange={(e) => updateDraft({ validityDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Status</label><select value={currentQuote.status} onChange={(e) => updateDraft({ status: e.target.value as Quotation['status'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-slate-800">Lead / customer linkage</h3></div>
                <div className="flex gap-2">
                  <select
                    value={currentQuote.leadId || ''}
                    onChange={(e) => {
                      const selectedLead = leadOptions.find((lead) => lead.id === e.target.value);
                      if (selectedLead) {
                        updateDraft({
                          leadId: selectedLead.id,
                          customerName: selectedLead.name,
                          customerEmail: selectedLead.email,
                          customerPhone: selectedLead.phone,
                          projectName: `${selectedLead.name} - ${selectedLead.requirements.propertyType} Solar`,
                          notes: `Lead source: ${selectedLead.source}`,
                        });
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select a lead</option>
                    {leadOptions.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} • {lead.phone}</option>)}
                  </select>
                  <button onClick={() => {
                    const selectedLead = leadOptions.find((lead) => lead.id === currentQuote.leadId);
                    if (selectedLead) {
                      window.dispatchEvent(new CustomEvent('crm-navigate', { detail: { page: 'quotations' } }));
                      window.dispatchEvent(new CustomEvent('crm-create-quotation', { detail: selectedLead }));
                    }
                  }} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Create from lead</button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-slate-800">Items</h3><button onClick={addItem} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Add item</button></div>
                <div className="space-y-2">
                  {currentQuote.items.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-5">
                      <input value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} placeholder="Item" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                      <input value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Description" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })} className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                      <input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })} className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                      <input type="number" value={item.amount} onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) })} placeholder="Amount" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div><label className="mb-1 block text-sm text-slate-600">Discount (%)</label><input type="number" value={currentQuote.discountPercent} onChange={(e) => updateDraft({ discountPercent: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">GST rate</label><select value={currentQuote.gstRate} onChange={(e) => updateDraft({ gstRate: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2">{[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></div>
                <div><label className="mb-1 block text-sm text-slate-600">Subsidy amount</label><input type="number" value={currentQuote.subsidyAmount} onChange={(e) => updateDraft({ subsidyAmount: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Installation charges</label><input type="number" value={currentQuote.installationCharges} onChange={(e) => updateDraft({ installationCharges: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              </div>

              <div><label className="mb-1 block text-sm text-slate-600">Payment schedule</label><textarea value={currentQuote.paymentSchedule} onChange={(e) => updateDraft({ paymentSchedule: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label className="mb-1 block text-sm text-slate-600">Attachments</label><input value={currentQuote.attachments} onChange={(e) => updateDraft({ attachments: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label className="mb-1 block text-sm text-slate-600">Customer signature</label><input value={currentQuote.customerSignature} onChange={(e) => updateDraft({ customerSignature: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label className="mb-1 block text-sm text-slate-600">Notes</label><textarea value={currentQuote.notes} onChange={(e) => updateDraft({ notes: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-2 font-semibold text-slate-800">Auto-filled company details</h3>
                <p className="text-sm text-slate-600">{profile.companyName} • {profile.gstin} • {profile.address}</p>
                <p className="mt-1 text-sm text-slate-600">Bank: {profile.bankDetails || 'Add bank details in company profile'}</p>
                <p className="mt-1 text-sm text-slate-600">Warranty: {profile.warranty || 'Add warranty terms in company profile'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => saveQuote(currentQuote)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save</button>
                <button onClick={() => handleGenerateAndPreview(currentQuote)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white">Generate quotation</button>
                <button onClick={() => handleShareQuotation(currentQuote, 'whatsapp')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><Share2 size={14} className="mr-1 inline" />WhatsApp</button>
                <button onClick={() => handleShareQuotation(currentQuote, 'email')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><Download size={14} className="mr-1 inline" />Email</button>
                <button onClick={submitForApproval} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white">Submit for approval</button>
                <button onClick={approveQuote} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Approve</button>
                <button onClick={acceptQuote} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white">Accept</button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 mb-2"><ShieldCheck className="text-orange-500" size={16} /><h3 className="font-semibold text-slate-800">Quote summary</h3></div>
                <p className="text-sm text-slate-600">Subtotal: ₹{subtotal(currentQuote).toFixed(2)}</p>
                <p className="text-sm text-slate-600">Discount: {currentQuote.discountPercent}%</p>
                <p className="text-sm text-slate-600">GST: {currentQuote.gstRate}%</p>
                <p className="text-sm text-slate-600">Total: ₹{totalAmount(currentQuote).toFixed(2)}</p>
              </div>
            </div>
          ) : <p className="text-sm text-slate-500">Create a quotation to get started.</p>}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><History className="text-orange-500" size={18} /><h2 className="text-lg font-semibold">Version history</h2></div>
          <div className="space-y-2">
            {currentQuote?.versionHistory.map((entry) => (
              <div key={`${entry.version}-${entry.updatedAt}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <p className="font-medium text-slate-800">Version {entry.version}: {entry.note}</p>
                <p>{entry.updatedBy} • {new Date(entry.updatedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="text-orange-500" size={18} /><h2 className="text-lg font-semibold">Audit trail</h2></div>
          <div className="space-y-2">
            {auditLogs.slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{entry.action}</p>
                <p>{entry.user} • {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
