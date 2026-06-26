import { useState } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Calendar, Users, Zap, Battery, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { db } from '../../lib/db';
import type { Installation } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const statusOptions = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'survey-completed', label: 'Survey Completed' },
  { value: 'design-approved', label: 'Design Approved' },
  { value: 'material-dispatched', label: 'Material Dispatched' },
  { value: 'installation-in-progress', label: 'Installation In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'handed-over', label: 'Handed Over' },
];

const mountingOptions = [
  { value: 'RCC', label: 'RCC Mounting' },
  { value: 'RCC Ballasted', label: 'RCC Ballasted' },
  { value: 'Metal Shed', label: 'Metal Shed' },
  { value: 'Ground Mount', label: 'Ground Mount' },
];

export function Installations() {
  const [installations, setInstallations] = useState<Installation[]>(db.getInstallations());
  const customers = db.getCustomers();
  const agents = db.getAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'not-started' as Installation['status'],
    surveyDate: '',
    surveyNotes: '',
    designApprovedDate: '',
    materialDispatchDate: '',
    installationStartDate: '',
    installationEndDate: '',
    handoverDate: '',
    assignedTechnicians: [] as string[],
    panels: 0,
    inverterCapacity: '',
    mountingStructure: 'RCC',
    batteryBackup: false,
    batteryCapacity: '',
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredInstallations = installations.filter((inst) => {
    const customer = customers.find((c) => c.id === inst.customerId);
    const matchesSearch =
      customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.status.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inst.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusProgress = (status: Installation['status']) => {
    const stages = [
      'not-started',
      'survey-completed',
      'design-approved',
      'material-dispatched',
      'installation-in-progress',
      'completed',
      'handed-over',
    ];
    const currentIndex = stages.indexOf(status);
    return ((currentIndex) / (stages.length - 1)) * 100;
  };

  const getStatusColor = (status: Installation['status']) => {
    const colors = {
      'not-started': 'bg-slate-100 text-slate-700',
      'survey-completed': 'bg-blue-100 text-blue-700',
      'design-approved': 'bg-purple-100 text-purple-700',
      'material-dispatched': 'bg-orange-100 text-orange-700',
      'installation-in-progress': 'bg-amber-100 text-amber-700',
      'completed': 'bg-teal-100 text-teal-700',
      'handed-over': 'bg-emerald-100 text-emerald-700',
    };
    return colors[status];
  };

  const getStatusIcon = (status: Installation['status']) => {
    if (status === 'handed-over') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'not-started') return <AlertCircle className="w-5 h-5 text-slate-400" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  const handleOpenModal = (installation?: Installation) => {
    if (installation) {
      setEditingInstallation(installation);
      setFormData({
        customerId: installation.customerId,
        status: installation.status,
        surveyDate: installation.surveyDate.split('T')[0],
        surveyNotes: installation.surveyNotes,
        designApprovedDate: installation.designApprovedDate?.split('T')[0] || '',
        materialDispatchDate: installation.materialDispatchDate?.split('T')[0] || '',
        installationStartDate: installation.installationStartDate?.split('T')[0] || '',
        installationEndDate: installation.installationEndDate?.split('T')[0] || '',
        handoverDate: installation.handoverDate?.split('T')[0] || '',
        assignedTechnicians: installation.assignedTechnicians,
        panels: installation.systemDetails.panels,
        inverterCapacity: installation.systemDetails.inverterCapacity,
        mountingStructure: installation.systemDetails.mountingStructure,
        batteryBackup: installation.systemDetails.batteryBackup,
        batteryCapacity: installation.systemDetails.batteryCapacity || '',
      });
    } else {
      setEditingInstallation(null);
      setFormData({
        customerId: customers[0]?.id || '',
        status: 'not-started',
        surveyDate: '',
        surveyNotes: '',
        designApprovedDate: '',
        materialDispatchDate: '',
        installationStartDate: '',
        installationEndDate: '',
        handoverDate: '',
        assignedTechnicians: [],
        panels: 0,
        inverterCapacity: '',
        mountingStructure: 'RCC',
        batteryBackup: false,
        batteryCapacity: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const installationData = {
      customerId: formData.customerId,
      status: formData.status,
      surveyDate: formData.surveyDate ? new Date(formData.surveyDate).toISOString() : new Date().toISOString(),
      surveyNotes: formData.surveyNotes,
      designApprovedDate: formData.designApprovedDate ? new Date(formData.designApprovedDate).toISOString() : null,
      materialDispatchDate: formData.materialDispatchDate ? new Date(formData.materialDispatchDate).toISOString() : null,
      installationStartDate: formData.installationStartDate ? new Date(formData.installationStartDate).toISOString() : null,
      installationEndDate: formData.installationEndDate ? new Date(formData.installationEndDate).toISOString() : null,
      handoverDate: formData.handoverDate ? new Date(formData.handoverDate).toISOString() : null,
      assignedTechnicians: formData.assignedTechnicians,
      systemDetails: {
        panels: formData.panels,
        inverterCapacity: formData.inverterCapacity,
        mountingStructure: formData.mountingStructure,
        batteryBackup: formData.batteryBackup,
        batteryCapacity: formData.batteryCapacity || undefined,
      },
    };

    if (editingInstallation) {
      const updated = db.updateInstallation(editingInstallation.id, installationData);
      if (updated) {
        setInstallations(db.getInstallations());
      }
    } else {
      const newInstallation = db.createInstallation(installationData);
      setInstallations([...installations, newInstallation]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this installation record?')) {
      db.deleteInstallation(id);
      setInstallations(installations.filter((i) => i.id !== id));
    }
  };

  const activeCount = installations.filter(
    (i) => !['completed', 'handed-over'].includes(i.status)
  ).length;

  const totalCapacity = installations.reduce((sum, i) => {
    const customer = customers.find((c) => c.id === i.customerId);
    return sum + (customer?.systemCapacity || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Installation Tracking</h1>
          <p className="text-slate-500">Monitor and manage solar installations</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Installation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Projects</p>
              <p className="text-xl font-bold text-orange-600">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-xl font-bold text-emerald-600">
                {installations.filter((i) => i.status === 'handed-over').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Capacity</p>
              <p className="text-xl font-bold text-blue-600">{totalCapacity} kW</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <MapPin className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-xl font-bold text-slate-600">{installations.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search installations..."
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
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredInstallations.map((installation) => {
            const customer = customers.find((c) => c.id === installation.customerId);
            const progress = getStatusProgress(installation.status);
            const technicians = installation.assignedTechnicians
              .map((id) => agents.find((a) => a.id === id)?.name)
              .filter(Boolean);

            return (
              <div
                key={installation.id}
                className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      {getStatusIcon(installation.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {customer?.name || 'Unknown Customer'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {customer?.address?.substring(0, 50)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                        installation.status
                      )}`}
                    >
                      {installation.status.replace(/-/g, ' ')}
                    </span>
                    <button
                      onClick={() => handleOpenModal(installation)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(installation.id)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Panels</p>
                    <p className="font-semibold text-slate-800">
                      {installation.systemDetails.panels}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Inverter</p>
                    <p className="font-semibold text-slate-800">
                      {installation.systemDetails.inverterCapacity}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Survey Date</p>
                    <p className="font-semibold text-slate-800">
                      {formatDate(installation.surveyDate)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Technicians</p>
                    <p className="font-semibold text-slate-800">
                      {technicians.length > 0 ? technicians.join(', ') : 'Not assigned'}
                    </p>
                  </div>
                </div>

                {installation.systemDetails.batteryBackup && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">
                      Battery Backup: {installation.systemDetails.batteryCapacity}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredInstallations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No installations found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstallation ? 'Edit Installation' : 'Add New Installation'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Installation['status'],
                })
              }
              options={statusOptions}
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Survey Date"
                type="date"
                value={formData.surveyDate}
                onChange={(e) => setFormData({ ...formData, surveyDate: e.target.value })}
              />
              <Input
                label="Design Approved"
                type="date"
                value={formData.designApprovedDate}
                onChange={(e) =>
                  setFormData({ ...formData, designApprovedDate: e.target.value })
                }
              />
              <Input
                label="Material Dispatched"
                type="date"
                value={formData.materialDispatchDate}
                onChange={(e) =>
                  setFormData({ ...formData, materialDispatchDate: e.target.value })
                }
              />
              <Input
                label="Installation Start"
                type="date"
                value={formData.installationStartDate}
                onChange={(e) =>
                  setFormData({ ...formData, installationStartDate: e.target.value })
                }
              />
              <Input
                label="Installation End"
                type="date"
                value={formData.installationEndDate}
                onChange={(e) =>
                  setFormData({ ...formData, installationEndDate: e.target.value })
                }
              />
              <Input
                label="Handover Date"
                type="date"
                value={formData.handoverDate}
                onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">System Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Number of Panels"
                type="number"
                value={formData.panels}
                onChange={(e) =>
                  setFormData({ ...formData, panels: parseInt(e.target.value) || 0 })
                }
              />
              <Input
                label="Inverter Capacity"
                value={formData.inverterCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, inverterCapacity: e.target.value })
                }
                placeholder="e.g., 10kW"
              />
              <Select
                label="Mounting Structure"
                value={formData.mountingStructure}
                onChange={(e) =>
                  setFormData({ ...formData, mountingStructure: e.target.value })
                }
                options={mountingOptions}
              />
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.batteryBackup}
                    onChange={(e) =>
                      setFormData({ ...formData, batteryBackup: e.target.checked })
                    }
                    className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-slate-700">Battery Backup</span>
                </label>
              </div>
              {formData.batteryBackup && (
                <Input
                  label="Battery Capacity"
                  value={formData.batteryCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, batteryCapacity: e.target.value })
                  }
                  placeholder="e.g., 5kWh"
                />
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Assigned Technicians</h3>
            <div className="flex flex-wrap gap-2">
              {agents
                .filter((a) => a.role === 'technician')
                .map((agent) => (
                  <label
                    key={agent.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                      formData.assignedTechnicians.includes(agent.id)
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedTechnicians.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            assignedTechnicians: [...formData.assignedTechnicians, agent.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            assignedTechnicians: formData.assignedTechnicians.filter(
                              (id) => id !== agent.id
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-slate-700">{agent.name}</span>
                  </label>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Survey Notes
            </label>
            <textarea
              value={formData.surveyNotes}
              onChange={(e) => setFormData({ ...formData, surveyNotes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="Notes from site survey..."
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
              {editingInstallation ? 'Update Installation' : 'Add Installation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
