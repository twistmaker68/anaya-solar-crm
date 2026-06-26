import { useState, useEffect } from 'react';
import { FileText, Calendar, Download, TrendingUp, Users, CreditCard, Zap, BarChart3 } from 'lucide-react';
import { db } from '../../lib/db';

type ReportType = 'leads' | 'payments' | 'installations' | 'agents';

export function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('leads');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const reportTabs = [
    { id: 'leads', label: 'Lead Report', icon: Users },
    { id: 'payments', label: 'Payment Report', icon: CreditCard },
    { id: 'installations', label: 'Installation Report', icon: Zap },
    { id: 'agents', label: 'Agent Performance', icon: BarChart3 },
  ];

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

  const LeadsReport = () => {
    const report = db.getLeadsReport(dateRange.start, dateRange.end);
    const { byStatus, bySource, leads, total } = report;

    const statusColors: Record<string, string> = {
      new: 'bg-blue-500',
      contacted: 'bg-purple-500',
      'survey-scheduled': 'bg-orange-500',
      'survey-done': 'bg-teal-500',
      quoted: 'bg-yellow-500',
      negotiating: 'bg-indigo-500',
      converted: 'bg-emerald-500',
      lost: 'bg-red-500',
    };

    const sourceColors: Record<string, string> = {
      website: 'bg-blue-500',
      referral: 'bg-emerald-500',
      'walk-in': 'bg-purple-500',
      campaign: 'bg-orange-500',
      whatsapp: 'bg-green-500',
      other: 'bg-slate-500',
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total Leads</p>
            <p className="text-3xl font-bold text-slate-800">{total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Conversion Rate</p>
            <p className="text-3xl font-bold text-emerald-600">
              {total > 0 ? Math.round(((byStatus['converted'] || 0) / total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Lost Leads</p>
            <p className="text-3xl font-bold text-red-600">{byStatus['lost'] || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Leads by Status</h3>
            <div className="space-y-3">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-slate-600 capitalize">
                    {status.replace('-', ' ')}
                  </div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status] || 'bg-slate-400'} rounded-full transition-all`}
                      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-semibold text-slate-700">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Leads by Source</h3>
            <div className="space-y-3">
              {Object.entries(bySource).map(([source, count]) => (
                <div key={source} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-slate-600 capitalize">
                    {source.replace('-', ' ')}
                  </div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sourceColors[source] || 'bg-slate-400'} rounded-full transition-all`}
                      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-semibold text-slate-700">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Lead Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Source</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Capacity</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 10).map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium text-slate-800">{lead.name}</td>
                    <td className="py-3 px-4 text-slate-600 capitalize">{lead.source}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{lead.requirements.preferredCapacity}kW</td>
                    <td className="py-3 px-4 text-slate-500 text-sm">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const PaymentsReport = () => {
    const report = db.getPaymentsReport(dateRange.start, dateRange.end);
    const { byStatus, byMethod, totalReceived, totalPending, payments, customers } = report;

    const methodColors: Record<string, string> = {
      cash: 'bg-emerald-500',
      'bank-transfer': 'bg-blue-500',
      upi: 'bg-purple-500',
      cheque: 'bg-orange-500',
      card: 'bg-pink-500',
    };

    const totalMethods = Object.values(byMethod).reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total Received</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total Pending</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Collection Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalReceived + totalPending > 0
                ? Math.round((totalReceived / (totalReceived + totalPending)) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-slate-800">{payments.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Payments by Method</h3>
            <div className="space-y-3">
              {Object.entries(byMethod).map(([method, amount]) => (
                <div key={method} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-slate-600 capitalize">
                    {method.replace('-', ' ')}
                  </div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${methodColors[method] || 'bg-slate-400'} rounded-full transition-all`}
                      style={{ width: `${totalMethods > 0 ? (amount / totalMethods) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-24 text-right font-semibold text-slate-700">
                    {formatCurrency(amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Payment Status</h3>
            <div className="space-y-4">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 capitalize">{status}</span>
                  <span className="font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Payment Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Customer</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Method</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Type</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((payment) => {
                  const customer = customers.find((c) => c.id === payment.customerId);
                  return (
                    <tr key={payment.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {customer?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {payment.method.replace('-', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">{payment.type}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === 'received'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-sm">
                        {formatDate(payment.paidDate || payment.dueDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const InstallationsReport = () => {
    const report = db.getInstallationsReport();
    const { byStatus, installations, customers, totalCapacity } = report;

    const statusColors: Record<string, string> = {
      'not-started': 'bg-slate-500',
      'survey-completed': 'bg-blue-500',
      'design-approved': 'bg-purple-500',
      'material-dispatched': 'bg-orange-500',
      'installation-in-progress': 'bg-amber-500',
      completed: 'bg-teal-500',
      'handed-over': 'bg-emerald-500',
    };

    const total = installations.length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total Installations</p>
            <p className="text-3xl font-bold text-slate-800">{total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total Capacity</p>
            <p className="text-3xl font-bold text-blue-600">{totalCapacity}kW</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Active Projects</p>
            <p className="text-3xl font-bold text-orange-600">
              {total - (byStatus['handed-over'] || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Completed</p>
            <p className="text-3xl font-bold text-emerald-600">{byStatus['handed-over'] || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Installation Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className="w-40 text-sm text-slate-600 capitalize">
                  {status.replace(/-/g, ' ')}
                </div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[status] || 'bg-slate-400'} rounded-full transition-all`}
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-12 text-right font-semibold text-slate-700">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Installation Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Customer</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                    Capacity
                  </th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Panels</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">
                    Inverter
                  </th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {installations.map((inst) => {
                  const customer = customers.find((c) => c.id === inst.customerId);
                  return (
                    <tr key={inst.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {customer?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{customer?.systemCapacity || 0}kW</td>
                      <td className="py-3 px-4 text-slate-600">{inst.systemDetails.panels}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {inst.systemDetails.inverterCapacity}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                          {inst.status.replace(/-/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const AgentPerformance = () => {
    const metrics = db.getDashboardMetrics();
    const agents = db.getAgents();

    return (
      <div className="space-y-6">
        {metrics.agentPerformance.map((agent) => (
          <div key={agent.agentId} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                  {agent.agentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800">{agent.agentName}</h3>
                  <p className="text-slate-500">Sales Executive</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(agent.revenue)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total Leads</p>
                <p className="text-2xl font-bold text-slate-800">{agent.leads}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Conversions</p>
                <p className="text-2xl font-bold text-emerald-600">{agent.conversions}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {agent.leads > 0 ? Math.round((agent.conversions / agent.leads) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500">Business insights and performance metrics</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-wrap gap-2">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeReport === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-slate-600">Report Period:</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {activeReport === 'leads' && <LeadsReport />}
      {activeReport === 'payments' && <PaymentsReport />}
      {activeReport === 'installations' && <InstallationsReport />}
      {activeReport === 'agents' && <AgentPerformance />}
    </div>
  );
}
