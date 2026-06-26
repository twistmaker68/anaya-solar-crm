import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Search, Filter, MessageCircle, MapPin, Calendar, FileText } from 'lucide-react';
import { db } from '../../lib/db';
import type { Lead } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'survey-scheduled', label: 'Survey Scheduled' },
  { value: 'survey-done', label: 'Survey Done' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const propertyTypeOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
];

const roofTypeOptions = [
  { value: 'RCC', label: 'RCC (Reinforced Concrete)' },
  { value: 'Metal Shed', label: 'Metal Shed' },
  { value: 'Tiled', label: 'Tiled Roof' },
  { value: 'Asbestos', label: 'Asbestos Sheet' },
  { value: 'Other', label: 'Other' },
];

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>(db.getLeads());
  const agents = db.getAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    source: 'website' as Lead['source'],
    status: 'new' as Lead['status'],
    assignedAgentId: '',
    roofType: 'RCC',
    monthlyBill: 0,
    propertyType: 'residential' as Lead['requirements']['propertyType'],
    preferredCapacity: 5,
    notes: '',
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        source: lead.source,
        status: lead.status,
        assignedAgentId: lead.assignedAgentId,
        roofType: lead.requirements.roofType,
        monthlyBill: lead.requirements.monthlyBill,
        propertyType: lead.requirements.propertyType,
        preferredCapacity: lead.requirements.preferredCapacity,
        notes: lead.notes,
      });
    } else {
      setEditingLead(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        source: 'website',
        status: 'new',
        assignedAgentId: agents.find((a) => a.role === 'sales')?.id || '',
        roofType: 'RCC',
        monthlyBill: 0,
        propertyType: 'residential',
        preferredCapacity: 5,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const leadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      source: formData.source,
      status: formData.status,
      assignedAgentId: formData.assignedAgentId,
      requirements: {
        roofType: formData.roofType,
        monthlyBill: formData.monthlyBill,
        propertyType: formData.propertyType,
        preferredCapacity: formData.preferredCapacity,
      },
      notes: formData.notes,
    };

    if (editingLead) {
      const updated = db.updateLead(editingLead.id, leadData);
      if (updated) {
        setLeads(db.getLeads());
      }
    } else {
      const newLead = db.createLead(leadData);
      setLeads([...leads, newLead]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      db.deleteLead(id);
      setLeads(leads.filter((l) => l.id !== id));
    }
  };

  const handleWhatsApp = (lead: Lead) => {
    setSelectedLead(lead);
    setWhatsappMessage(
      `Hello ${lead.name},\n\nThank you for your interest in ANAYA SOLAR SOLUTIONS. We would love to discuss your solar installation requirements.\n\nBest regards,\nANAYA SOLAR Team`
    );
    setWhatsappModalOpen(true);
  };

  const sendWhatsApp = () => {
    if (selectedLead) {
      const cleanPhone = selectedLead.phone.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
      db.createWhatsAppLog({
        entityType: 'lead',
        entityId: selectedLead.id,
        phone: selectedLead.phone,
        message: whatsappMessage,
        template: 'custom',
        status: 'sent',
      });
      setWhatsappModalOpen(false);
    }
  };

  const handleCreateQuotation = (lead: Lead) => {
    window.dispatchEvent(new CustomEvent('crm-create-quotation', { detail: lead }));
    window.dispatchEvent(new CustomEvent('crm-navigate', { detail: { page: 'quotations' } }));
  };

  const getStatusColor = (status: Lead['status']) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-purple-100 text-purple-700',
      'survey-scheduled': 'bg-orange-100 text-orange-700',
      'survey-done': 'bg-teal-100 text-teal-700',
      quoted: 'bg-yellow-100 text-yellow-700',
      negotiating: 'bg-indigo-100 text-indigo-700',
      converted: 'bg-emerald-100 text-emerald-700',
      lost: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lead Management</h1>
          <p className="text-slate-500">Track and manage all your potential customers</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">All Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">All Sources</option>
              {sourceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredLeads.map((lead) => {
            const agent = agents.find((a) => a.id === lead.assignedAgentId);
            return (
              <div
                key={lead.id}
                className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{lead.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {lead.address.substring(0, 40)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status.replace('-', ' ')}
                        </span>
                        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                          {lead.source}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lead.requirements.preferredCapacity}kW |{' '}
                          {lead.requirements.propertyType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {agent && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                            {agent.name.charAt(0)}
                          </div>
                          <span className="text-slate-600">{agent.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCreateQuotation(lead)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleWhatsApp(lead)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenModal(lead)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lead.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No leads found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Select
              label="Source"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value as Lead['source'] })
              }
              options={sourceOptions}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Lead['status'] })
              }
              options={statusOptions}
            />
            <Select
              label="Assigned Agent"
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
              options={[
                { value: '', label: 'Select Agent' },
                ...agents
                  .filter((a) => a.role === 'sales')
                  .map((a) => ({ value: a.id, label: a.name })),
              ]}
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Roof Type"
                value={formData.roofType}
                onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                options={roofTypeOptions}
              />
              <Select
                label="Property Type"
                value={formData.propertyType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    propertyType: e.target.value as Lead['requirements']['propertyType'],
                  })
                }
                options={propertyTypeOptions}
              />
              <Input
                label="Monthly Bill (₹)"
                type="number"
                value={formData.monthlyBill}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyBill: parseInt(e.target.value) || 0 })
                }
              />
              <Input
                label="Preferred Capacity (kW)"
                type="number"
                value={formData.preferredCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredCapacity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingLead ? 'Update Lead' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        title="Send WhatsApp Message"
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <strong>To:</strong> {selectedLead?.name} ({selectedLead?.phone})
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Message
            </label>
            <textarea
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWhatsappModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={sendWhatsApp}>
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
