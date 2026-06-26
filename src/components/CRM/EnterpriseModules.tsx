import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Building2, ShieldCheck, History, UserPlus, Save, Plus } from 'lucide-react';
import {
  addAuditLog,
  loadAuditLogs,
  loadCompanyProfile,
  loadUsers,
  saveCompanyProfile,
  saveUsers,
  type AuditEntry,
  type CompanyProfile,
  type CRMUser,
} from '../../lib/crmStorage';

const roleOptions = ['Admin', 'Sales Manager', 'Sales Executive', 'Finance', 'Operations'];
const departmentOptions = ['Sales', 'Operations', 'Finance', 'Support'];
const statusOptions = ['Active', 'Disabled', 'Locked', 'Resigned'];

export default function EnterpriseModules() {
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [profile, setProfile] = useState<CompanyProfile>(loadCompanyProfile());
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Sales Executive',
    department: 'Sales',
    branch: 'Head Office',
    status: 'Active' as CRMUser['status'],
  });

  useEffect(() => {
    const existingUsers = loadUsers();
    if (existingUsers.length) {
      setUsers(existingUsers);
    } else {
      const seeded: CRMUser[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@anaya.com',
          role: 'Admin',
          status: 'Active',
          department: 'Operations',
          branch: 'Head Office',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Nisha Rao',
          email: 'nisha@anaya.com',
          role: 'Sales Manager',
          status: 'Active',
          department: 'Sales',
          branch: 'Mumbai',
          createdAt: new Date().toISOString(),
        },
      ];
      setUsers(seeded);
      saveUsers(seeded);
    }
    setAuditLogs(loadAuditLogs());
  }, []);

  const stats = useMemo(() => ({
    activeUsers: users.filter((u) => u.status === 'Active').length,
    totalUsers: users.length,
    recentActions: auditLogs.slice(0, 5).length,
  }), [users, auditLogs]);

  const handleSaveProfile = () => {
    saveCompanyProfile(profile);
    addAuditLog('System', 'Company profile updated');
    setAuditLogs(loadAuditLogs());
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: CRMUser = {
      id: crypto.randomUUID(),
      ...newUser,
      createdAt: new Date().toISOString(),
    };
    const nextUsers = [user, ...users];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    addAuditLog(newUser.name, 'Created CRM user');
    setAuditLogs(loadAuditLogs());
    setNewUser({
      name: '',
      email: '',
      role: 'Sales Executive',
      department: 'Sales',
      branch: 'Head Office',
      status: 'Active',
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const nextUsers = users.filter((user) => user.id !== userId);
    setUsers(nextUsers);
    saveUsers(nextUsers);
    addAuditLog(userName, 'Deleted CRM user');
    setAuditLogs(loadAuditLogs());
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Enterprise CRM</p>
            <h1 className="mt-2 text-3xl font-semibold">Operations hub for your solar business</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Manage users, company profile, and activity logs from one place while keeping the existing CRM flow intact.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Today</p>
            <p className="mt-1 text-xl font-semibold">{stats.activeUsers} active users</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600"><UserPlus size={18} /></div>
            <div>
              <p className="text-sm text-slate-500">Total users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600"><ShieldCheck size={18} /></div>
            <div>
              <p className="text-sm text-slate-500">Active accounts</p>
              <p className="text-2xl font-semibold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-600"><History size={18} /></div>
            <div>
              <p className="text-sm text-slate-500">Recent activities</p>
              <p className="text-2xl font-semibold">{stats.recentActions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="text-orange-500" size={18} />
            <h2 className="text-lg font-semibold">User management</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {['name', 'email', 'role', 'department', 'branch', 'status'].map((field) => (
              <div key={field}>
                <label className="mb-1 block text-sm text-slate-600 capitalize">{field}</label>
                {field === 'role' ? (
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field === 'department' ? (
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field === 'status' ? (
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value as CRMUser['status'] })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <input
                    value={newUser[field as keyof typeof newUser]}
                    onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder={field === 'name' ? 'Full name' : 'Email address'}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateUser}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus size={16} /> Add user
          </button>

          <div className="mt-6 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div>
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email} • {user.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">{user.status}</span>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="text-orange-500" size={18} />
              <h2 className="text-lg font-semibold">Company profile</h2>
            </div>
            <div className="grid gap-3">
              <input value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Company Name" />
              <input value={profile.brandName} onChange={(e) => setProfile({ ...profile, brandName: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Brand Name" />
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Email" />
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Phone" />
              <input value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="GSTIN" />
              <input value={profile.pan} onChange={(e) => setProfile({ ...profile, pan: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="PAN" />
              <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Address" />
              <textarea value={profile.bankDetails} onChange={(e) => setProfile({ ...profile, bankDetails: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Bank details" rows={3} />
              <textarea value={profile.termsAndConditions} onChange={(e) => setProfile({ ...profile, termsAndConditions: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Terms & conditions" rows={3} />
              <textarea value={profile.warranty} onChange={(e) => setProfile({ ...profile, warranty: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Warranty" rows={2} />
              <textarea value={profile.signature} onChange={(e) => setProfile({ ...profile, signature: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Authorized signature" rows={2} />
            </div>
            <button onClick={handleSaveProfile} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              <Save size={16} /> Save profile
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <History className="text-orange-500" size={18} />
              <h2 className="text-lg font-semibold">Audit trail</h2>
            </div>
            <div className="space-y-2">
              {auditLogs.slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">{entry.action}</p>
                  <p>{entry.user} • {new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
