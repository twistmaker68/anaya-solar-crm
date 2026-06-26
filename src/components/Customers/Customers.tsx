import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Search, Building2, Zap, MessageCircle, Eye } from 'lucide-react';
import { db } from '../../lib/db';
import type { Customer } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(db.getCustomers());
  const agents = db.getAgents();
  const payments = db.getPayments();
  const installations = db.getInstallations();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    installationAddress: '',
    systemCapacity: 5,
    contractValue: 0,
    assignedAgentId: '',
    status: 'active' as Customer['status'],
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        installationAddress: customer.installationAddress,
        systemCapacity: customer.systemCapacity,
        contractValue: customer.contractValue,
        assignedAgentId: customer.assignedAgentId,
        status: customer.status,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        installationAddress: '',
        systemCapacity: 5,
        contractValue: 0,
        assignedAgentId: agents.find((a) => a.role === 'sales')?.id || '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      installationAddress: formData.installationAddress,
      systemCapacity: formData.systemCapacity,
      contractValue: formData.contractValue,
      assignedAgentId: formData.assignedAgentId,
      leadId: '',
      status: formData.status,
    };

    if (editingCustomer) {
      const updated = db.updateCustomer(editingCustomer.id, customerData);
      if (updated) {
        setCustomers(db.getCustomers());
      }
    } else {
      const newCustomer = db.createCustomer(customerData);
      setCustomers([...customers, newCustomer]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      db.deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const handleWhatsApp = (customer: Customer) => {
    setSelectedCustomer(customer);
    setWhatsappMessage(
      `Hello ${customer.name},\n\nThank you for choosing ANAYA SOLAR SOLUTIONS for your solar installation. We're here to help you with any questions.\n\nBest regards,\nANAYA SOLAR Team`
    );
    setWhatsappModalOpen(true);
  };

  const sendWhatsApp = () => {
    if (selectedCustomer) {
      const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
      db.createWhatsAppLog({
        entityType: 'customer',
        entityId: selectedCustomer.id,
        phone: selectedCustomer.phone,
        message: whatsappMessage,
        template: 'custom',
        status: 'sent',
      });
      setWhatsappModalOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCustomerPaymentStatus = (customerId: string) => {
    const customerPayments = payments.filter((p) => p.customerId === customerId);
    const totalContract =
      customers.find((c) => c.id === customerId)?.contractValue || 0;
    const totalPaid = customerPayments
      .filter((p) => p.status === 'received')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = customerPayments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const percentage = totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0;
    return { totalPaid, pending, percentage };
  };

  const getCustomerInstallation = (customerId: string) => {
    return installations.find((i) => i.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
          <p className="text-slate-500">Manage your solar system customers</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm">Total Customers</p>
          <p className="text-2xl font-bold text-slate-800">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm">Active Customers</p>
          <p className="text-2xl font-bold text-emerald-600">
            {customers.filter((c) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-600">
            {customers.reduce((sum, c) => sum + c.systemCapacity, 0)} kW
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm">Total Contract Value</p>
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(customers.reduce((sum, c) => sum + c.contractValue, 0))}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  System Details
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Contract Value
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Payment Status
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Installation
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const paymentStatus = getCustomerPaymentStatus(customer.id);
                const installation = getCustomerInstallation(customer.id);
                const agent = agents.find((a) => a.id === customer.assignedAgentId);

                return (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-800">
                          {customer.systemCapacity}kW
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {agent?.name && `By ${agent.name}`}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(customer.contractValue)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full max-w-[120px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">{paymentStatus.percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                            style={{ width: `${paymentStatus.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatCurrency(paymentStatus.pending)} pending
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {installation ? (
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            installation.status === 'handed-over'
                              ? 'bg-emerald-100 text-emerald-700'
                              : installation.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {installation.status.replace('-', ' ')}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">Not started</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          customer.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleWhatsApp(customer)}
                          className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(customer)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No customers found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              label="Assigned Agent"
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
              options={[
                { value: '', label: 'Select Agent' },
                ...agents.map((a) => ({ value: a.id, label: `${a.name} (${a.role})` })),
              ]}
            />
            <Input
              label="System Capacity (kW)"
              type="number"
              value={formData.systemCapacity}
              onChange={(e) =>
                setFormData({ ...formData, systemCapacity: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Contract Value (₹)"
              type="number"
              value={formData.contractValue}
              onChange={(e) =>
                setFormData({ ...formData, contractValue: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <Input
            label="Billing Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="Installation Address"
            value={formData.installationAddress}
            onChange={(e) => setFormData({ ...formData, installationAddress: e.target.value })}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as Customer['status'] })
            }
            options={statusOptions}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold text-2xl">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedCustomer.name}
                </h3>
                <p className="text-slate-500">Customer since {formatDate(selectedCustomer.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-semibold text-slate-800">{selectedCustomer.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-semibold text-slate-800">{selectedCustomer.phone}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">System Capacity</p>
                <p className="font-semibold text-slate-800">{selectedCustomer.systemCapacity} kW</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Contract Value</p>
                <p className="font-semibold text-slate-800">
                  {formatCurrency(selectedCustomer.contractValue)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Address</p>
              <p className="font-semibold text-slate-800">{selectedCustomer.address}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Payment History</h4>
              <div className="space-y-2">
                {db.getPaymentsByCustomer(selectedCustomer.id).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {payment.type} - {payment.method}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.status === 'received'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
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
              <strong>To:</strong> {selectedCustomer?.name} ({selectedCustomer?.phone})
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
