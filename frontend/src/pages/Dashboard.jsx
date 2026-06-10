import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Dog, 
  Calendar, 
  AlertCircle, 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { notifications, fetchNotifications } = useNotifications();

  const [petsCount, setPetsCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [petsRes, apptRes, orderRes] = await Promise.all([
          api.get('/pets'),
          api.get('/appointments'),
          api.get('/orders')
        ]);
        setPetsCount(petsRes.data.length);
        setAppointments(apptRes.data.slice(0, 3)); // show first 3
        setOrdersCount(orderRes.data.length);
      } catch (err) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const upcomingAppts = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

  return (
    <DashboardLayout title="Tableau de bord">
      {/* Welcome Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-lg glow-secondary">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 right-1/4 h-24 w-24 translate-y-12 rounded-full bg-white/5 blur-lg"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Bonjour, {user?.name} !</h3>
            <p className="text-blue-100/90 text-sm mt-2 max-w-xl">
              Bienvenue sur votre espace PetLuxe. Suivez la santé de vos compagnons, gérez vos commandes et accédez aux analyses IA en un clic.
            </p>
          </div>
          <Link to="/ai-analysis" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-50 transition-all shrink-0">
            <Sparkles size={16} />
            Lancer un Scan IA
          </Link>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Mes Animaux', count: petsCount, icon: Dog, color: 'bg-blue-500/10 text-blue-600', link: '/pets' },
          { label: 'Rendez-vous', count: upcomingAppts.length, icon: Calendar, color: 'bg-amber-500/10 text-amber-600', link: '/appointments' },
          { label: 'Commandes Marketplace', count: ordersCount, icon: ShoppingBag, color: 'bg-emerald-500/10 text-emerald-600', link: '/marketplace' },
          { label: 'Alertes Actives', count: notifications.filter(n => !n.is_read).length, icon: AlertCircle, color: 'bg-rose-500/10 text-rose-600', link: '/notifications' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={i} 
              to={stat.link}
              className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : stat.count}</h4>
              </div>
              <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon size={20} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Left Lists, Right Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming appointments list */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-slate-500" />
                Rendez-vous à venir
              </h3>
              <Link to="/appointments" className="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
                Gérer
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-100"></div>
                <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-100"></div>
              </div>
            ) : upcomingAppts.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-sm text-slate-400 font-medium">Aucun rendez-vous de prévu</p>
                <Link to="/veterinarians" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary bg-secondary/5 px-3 py-1.5 rounded-lg">
                  Prendre rendez-vous
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppts.map((appt) => (
                  <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm">
                        {appt.pet?.name ? appt.pet.name[0] : '🐾'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{appt.veterinarian?.clinic_name || 'Cabinet Vétérinaire'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Consultation pour {appt.pet?.name || 'animal'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-slate-800">{new Date(appt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{appt.time}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <AlertCircle size={18} className="text-slate-500" />
              Notifications récentes
            </h3>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className={`p-4 rounded-2xl border border-slate-50 flex gap-3 ${!notif.is_read ? 'bg-slate-50/70' : ''}`}>
                  <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${
                    notif.type === 'order' ? 'bg-emerald-500/10 text-emerald-600' : (notif.type === 'appointment' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600')
                  }`}>
                    <Activity size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{notif.content}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">Aucun message pour le moment</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Shortcuts & Daily tips) */}
        <div className="space-y-8">
          
          {/* Quick actions box */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Raccourcis rapides</h3>
            <div className="space-y-3">
              <Link to="/pets" className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group font-semibold text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <Dog size={16} className="text-slate-400" />
                  Ajouter un animal
                </span>
                <Plus size={16} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link to="/veterinarians" className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group font-semibold text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  Prendre rendez-vous
                </span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link to="/marketplace" className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group font-semibold text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-slate-400" />
                  Visiter la boutique
                </span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Daily Advice Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md glow-accent mb-4">
              <Sparkles size={16} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Conseil Santé du Jour</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Pour préserver l'hygiène bucco-dentaire de votre chien, n'attendez pas la formation de tartre. Donnez-lui des jouets à mâcher ou brossez-lui les dents une fois par semaine avec un dentifrice canin adapté.
            </p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
