import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Search, Filter } from 'lucide-react';
import { db } from '../../lib/db';
import type { Agent } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const roleOptions = [
  { value: 'sales', label: 'Sales Executive' },
  { value: 'technician', label: 'Technician' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Administrator' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>(db.getAgents());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales' as Agent['role'],
    status: 'active' as Agent['status'],
    monthlyLeads: 30,
    monthlySales: 300000,
  });

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.phone.includes(searchQuery);
    const matchesRole = filterRole === 'all' || agent.role === filterRole;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenModal = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        role: agent.role,
        status: agent.status,
        monthlyLeads: agent.targets.monthlyLeads,
        monthlySales: agent.targets.monthlySales,
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'sales',
        status: 'active',
        monthlyLeads: 30,
        monthlySales: 300000,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const agentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      targets: {
        monthlyLeads: formData.monthlyLeads,
        monthlySales: formData.monthlySales,
      },
    };

    if (editingAgent) {
      const updated = db.updateAgent(editingAgent.id, agentData);
      if (updated) {
        setAgents(db.getAgents());
      }
    } else {
      const newAgent = db.createAgent(agentData);
      setAgents([...agents, newAgent]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      db.deleteAgent(id);
      setAgents(agents.filter((a) => a.id !== id));
    }
  };

  const getRoleColor = (role: Agent['role']) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-700',
      technician: 'bg-orange-100 text-orange-700',
      manager: 'bg-purple-100 text-purple-700',
      admin: 'bg-emerald-100 text-emerald-700',
    };
    return colors[role];
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
          <h1 className="text-2xl font-bold text-slate-800">Agent Management</h1>
          <p className="text-slate-500">Manage your sales and technical team</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Agent
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">All Roles</option>
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Agent
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Contact
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Targets
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                  Joined
                </th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                        {agent.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{agent.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {agent.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        {agent.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${getRoleColor(
                        agent.role
                      )}`}
                    >
                      {agent.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        agent.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-slate-600">
                        Leads: <span className="font-semibold">{agent.targets.monthlyLeads}</span>
                      </p>
                      <p className="text-slate-600">
                        Sales:{' '}
                        <span className="font-semibold">
                          ₹{(agent.targets.monthlySales / 100000).toFixed(1)}L
                        </span>
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {formatDate(agent.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(agent)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No agents found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgent ? 'Edit Agent' : 'Add New Agent'}
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
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as Agent['role'] })
              }
              options={roleOptions}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Agent['status'] })
              }
              options={statusOptions}
            />
            <Input
              label="Monthly Leads Target"
              type="number"
              value={formData.monthlyLeads}
              onChange={(e) =>
                setFormData({ ...formData, monthlyLeads: parseInt(e.target.value) || 0 })
              }
            />
            <Input
              label="Monthly Sales Target (₹)"
              type="number"
              value={formData.monthlySales}
              onChange={(e) =>
                setFormData({ ...formData, monthlySales: parseInt(e.target.value) || 0 })
              }
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
              {editingAgent ? 'Update Agent' : 'Add Agent'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
