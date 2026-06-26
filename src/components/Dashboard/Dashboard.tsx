import { useState } from 'react';
import {
  Users,
  UserPlus,
  Building2,
  CreditCard,
  Wrench,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { db } from '../../lib/db';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, change, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-slate-400 text-sm">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Dashboard() {
  const metrics = db.getDashboardMetrics();
  const leads = db.getLeads();
  const customers = db.getCustomers();
  const payments = db.getPayments();
  const installations = db.getInstallations();

  const recentLeads = leads.slice(-5).reverse();
  const recentPayments = payments.filter(p => p.status === 'received').slice(-5).reverse();
  const activeInstallations = installations.filter(
    i => !['completed', 'handed-over'].includes(i.status)
  );

  const leadStatusData = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentMethodData = payments
    .filter(p => p.status === 'received')
    .reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
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
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's your solar business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={metrics.totalLeads}
          change={12}
          icon={<UserPlus className="w-5 h-5 text-white" />}
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={8}
          icon={<CreditCard className="w-5 h-5 text-white" />}
          iconBg="bg-gradient-to-br from-emerald-500 to-green-500"
        />
        <StatCard
          title="Active Installations"
          value={metrics.activeInstallations}
          icon={<Wrench className="w-5 h-5 text-white" />}
          iconBg="bg-gradient-to-br from-orange-500 to-amber-500"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(metrics.pendingPayments)}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          iconBg="bg-gradient-to-br from-red-500 to-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Lead Pipeline</h2>
            <span className="text-sm text-slate-500">All leads by status</span>
          </div>

          <div className="space-y-3">
            {Object.entries(leadStatusData).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${getStatusColor(
                      status
                    )}`}
                  >
                    {status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{
                        width: `${(count / leads.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Agent Performance</h2>
            <span className="text-sm text-slate-500">This month</span>
          </div>

          <div className="space-y-4">
            {metrics.agentPerformance.map((agent) => (
              <div
                key={agent.agentId}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                  {agent.agentName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{agent.agentName}</p>
                  <p className="text-sm text-slate-500">
                    {agent.leads} leads / {agent.conversions} conversions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(agent.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Leads</h2>
            <span className="text-sm text-slate-500">Latest 5 leads</span>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.phone}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {lead.status.replace('-', ' ')}
                </span>
                <span className="text-sm text-slate-400">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Quick Stats</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50">
              <div>
                <p className="text-sm text-blue-600">New Leads Today</p>
                <p className="text-2xl font-bold text-blue-700">
                  {metrics.newLeadsToday}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50">
              <div>
                <p className="text-sm text-emerald-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {metrics.leadConversionRate}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50">
              <div>
                <p className="text-sm text-orange-600">Total Customers</p>
                <p className="text-2xl font-bold text-orange-700">
                  {metrics.totalCustomers}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Active Installations</h2>
            <span className="text-sm text-slate-500">{activeInstallations.length} ongoing</span>
          </div>

          <div className="space-y-3">
            {activeInstallations.slice(0, 4).map((installation) => {
              const customer = customers.find(c => c.id === installation.customerId);
              return (
                <div
                  key={installation.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      {customer?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {installation.systemDetails.panels} panels -{' '}
                      {installation.systemDetails.inverterCapacity}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700">
                    {installation.status.replace('-', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Payment Collection</h2>
            <span className="text-sm text-slate-500">By method</span>
          </div>

          <div className="space-y-3">
            {Object.entries(paymentMethodData).map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-slate-700 capitalize">{method.replace('-', ' ')}</span>
                <span className="font-bold text-slate-800">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Total Collected</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(metrics.totalRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
