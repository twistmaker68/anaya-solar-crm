import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, CreditCard, Calendar, CheckCircle, Clock, XCircle, ArrowDownUp } from 'lucide-react';
import { db } from '../../lib/db';
import type { Payment } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const methodOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'received', label: 'Received' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'refunded', label: 'Refunded' },
];

const typeOptions = [
  { value: 'advance', label: 'Advance Payment' },
  { value: 'milestone', label: 'Milestone Payment' },
  { value: 'final', label: 'Final Payment' },
];

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>(db.getPayments());
  const customers = db.getCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    method: 'bank-transfer' as Payment['method'],
    status: 'pending' as Payment['status'],
    type: 'advance' as Payment['type'],
    dueDate: '',
    paidDate: '',
    notes: '',
    receiptNumber: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPayments = payments
    .filter((payment) => {
      const customer = customers.find((c) => c.id === payment.customerId);
      const matchesSearch =
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.amount.toString().includes(searchQuery);
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesType = filterType === 'all' || payment.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });

  const totals = {
    received: payments
      .filter((p) => p.status === 'received')
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
    overdue: payments
      .filter((p) => p.status === 'pending' && new Date(p.dueDate) < new Date())
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        customerId: payment.customerId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        type: payment.type,
        dueDate: payment.dueDate.split('T')[0],
        paidDate: payment.paidDate ? payment.paidDate.split('T')[0] : '',
        notes: payment.notes,
        receiptNumber: payment.receiptNumber,
      });
    } else {
      setEditingPayment(null);
      setFormData({
        customerId: customers[0]?.id || '',
        amount: 0,
        method: 'bank-transfer',
        status: 'pending',
        type: 'advance',
        dueDate: new Date().toISOString().split('T')[0],
        paidDate: '',
        notes: '',
        receiptNumber: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      customerId: formData.customerId,
      amount: formData.amount,
      method: formData.method,
      status: formData.status,
      type: formData.type,
      dueDate: new Date(formData.dueDate).toISOString(),
      paidDate: formData.paidDate ? new Date(formData.paidDate).toISOString() : null,
      notes: formData.notes,
      receiptNumber: formData.receiptNumber,
    };

    if (editingPayment) {
      const updated = db.updatePayment(editingPayment.id, paymentData);
      if (updated) {
        setPayments(db.getPayments());
      }
    } else {
      const newPayment = db.createPayment(paymentData);
      setPayments([...payments, newPayment]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      db.deletePayment(id);
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'bounced':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      received: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      bounced: 'bg-red-100 text-red-700 border-red-200',
      refunded: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[status];
  };

  const generateReceiptNumber = () => {
    const year = new Date().getFullYear();
    const count = payments.length + 1;
    return `RCP-${year}-${count.toString().padStart(4, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment Tracking</h1>
          <p className="text-slate-500">Manage customer payments and dues</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Received</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(totals.received)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(totals.pending)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Overdue</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(totals.overdue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Payments</p>
              <p className="text-xl font-bold text-blue-600">{payments.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">All Types</option>
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowDownUp className="w-4 h-4" />
              {sortBy === 'date' ? 'By Date' : 'By Amount'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Method
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Receipt
                </th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const customer = customers.find((c) => c.id === payment.customerId);
                const isOverdue =
                  payment.status === 'pending' && new Date(payment.dueDate) < new Date();

                return (
                  <tr
                    key={payment.id}
                    className={`border-b border-slate-100 transition-colors ${
                      isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          {customer?.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {customer?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {customer?.systemCapacity}kW system
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-lg text-slate-800">
                        {formatCurrency(payment.amount)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 capitalize">
                        {payment.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-700 capitalize">
                        {payment.method.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-700'}>
                          {formatDate(payment.dueDate)}
                        </span>
                      </div>
                      {payment.paidDate && (
                        <p className="text-xs text-emerald-600 mt-1">
                          Paid: {formatDate(payment.paidDate)}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-600 font-mono text-sm">
                        {payment.receiptNumber || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(payment)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
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

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No payments found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? 'Edit Payment' : 'Add New Payment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              options={[
                { value: '', label: 'Select Customer' },
                ...customers.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.systemCapacity}kW)`,
                })),
              ]}
              required
            />
            <Input
              label="Amount (₹)"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              required
            />
            <Select
              label="Payment Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as Payment['type'] })
              }
              options={typeOptions}
            />
            <Select
              label="Payment Method"
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value as Payment['method'] })
              }
              options={methodOptions}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Payment['status'] })
              }
              options={statusOptions}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            <Input
              label="Paid Date"
              type="date"
              value={formData.paidDate}
              onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
            />
            <Input
              label="Receipt Number"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              placeholder={generateReceiptNumber()}
            />
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
              {editingPayment ? 'Update Payment' : 'Add Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
