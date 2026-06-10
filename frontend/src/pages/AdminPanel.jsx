import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import {
  Users, ShoppingBag, Dog, TrendingUp, Download, Trash2,
  ShieldAlert, BarChart2, PieChart, RefreshCw, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444'];

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [roleUpdating, setRoleUpdating] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users')]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/admin/export/orders', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'orders_export.csv'; a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {}
  };

  const handleRoleChange = async (userId, role) => {
    setRoleUpdating(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {}
    finally { setRoleUpdating(null); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur et toutes ses données ?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {}
  };

  const metricCards = stats ? [
    { label: 'Utilisateurs', value: stats.metrics.total_users, icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Animaux', value: stats.metrics.total_pets, icon: Dog, color: 'bg-purple-500/10 text-purple-600' },
    { label: 'Commandes', value: stats.metrics.total_orders, icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'Revenu Total', value: `${stats.metrics.total_revenue} €`, icon: TrendingUp, color: 'bg-amber-500/10 text-amber-600' },
  ] : [];

  const TABS = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'orders', label: 'Commandes' },
  ];

  return (
    <DashboardLayout title="Administration">
      {/* Tab navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-secondary text-white shadow-md shadow-secondary/15' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {tab.label}
          </button>
        ))}
        <button onClick={fetchStats} className="ml-auto flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all shrink-0">
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-100"></div>)}
        </div>
      ) : (
        <>
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1">{m.value}</h4>
                      </div>
                      <div className={`h-12 w-12 rounded-2xl ${m.color} flex items-center justify-center`}>
                        <Icon size={20} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart: Sales trend */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5"><BarChart2 size={15} className="text-slate-400" /> Ventes (7 derniers jours)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats?.sales_chart || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} formatter={(v) => [`${v} €`, 'Ventes']} />
                      <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} fill="url(#colorSales)" dot={{ r: 3, fill: '#2563EB' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart: Category breakdown */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5"><PieChart size={15} className="text-slate-400" /> Catégories</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie data={stats?.category_chart || []} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                        {(stats?.category_chart || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-sm font-bold text-slate-800">Commandes Récentes</h4>
                  <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors">
                    <Download size={13} /> Exporter CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="pb-3">ID</th><th className="pb-3">Client</th><th className="pb-3">Total</th><th className="pb-3">Statut</th><th className="pb-3">Date</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {(stats?.recent_orders || []).map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-bold text-slate-600">#{order.id}</td>
                          <td className="py-3 font-semibold text-slate-700">{order.user?.name || 'N/A'}</td>
                          <td className="py-3 font-extrabold text-slate-800">{order.total_price?.toFixed(2)} €</td>
                          <td className="py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{order.status}</span></td>
                          <td className="py-3 text-slate-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS TAB ===== */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-5">Gestion des Utilisateurs ({users.length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="pb-3">Utilisateur</th><th className="pb-3">Email</th><th className="pb-3">Rôle</th><th className="pb-3">Inscrit le</th><th className="pb-3">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-xl object-cover border border-slate-100" />
                            <span className="font-bold text-slate-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500">{u.email}</td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            disabled={roleUpdating === u.id}
                            className={`rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold bg-white capitalize focus:outline-none focus:border-secondary transition-all ${u.role === 'admin' ? 'text-red-600 bg-red-50' : u.role === 'veterinarian' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="veterinarian">veterinarian</option>
                          </select>
                        </td>
                        <td className="py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="py-3">
                          <button onClick={() => handleDeleteUser(u.id)} className="h-7 w-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== ORDERS TAB ===== */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold text-slate-800">Toutes les Commandes</h4>
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors">
                  <Download size={13} /> Exporter CSV
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {Object.entries(stats?.orders_by_status || {}).map(([status, count]) => (
                  <div key={status} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                    <p className="text-lg font-black text-slate-800">{count}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 capitalize">{status}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium text-center py-6">Les détails complets des commandes sont disponibles via l'export CSV ci-dessus.</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminPanel;
