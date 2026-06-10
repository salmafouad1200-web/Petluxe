import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Dog, 
  BrainCircuit, 
  MessageSquare, 
  MapPin, 
  ShoppingBag, 
  Users, 
  ShieldAlert, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, role: ['user', 'admin', 'veterinarian'] },
    { name: 'Mes Animaux', path: '/pets', icon: Dog, role: ['user', 'admin'] },
    { name: 'Analyse IA', path: '/ai-analysis', icon: BrainCircuit, role: ['user', 'admin'] },
    { name: 'Assistant IA', path: '/ai-chat', icon: MessageSquare, role: ['user', 'admin'] },
    { name: 'Trouver un Véto', path: '/veterinarians', icon: MapPin, role: ['user', 'admin', 'veterinarian'] },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag, role: ['user', 'admin', 'veterinarian'] },
    { name: 'Communauté', path: '/community', icon: Users, role: ['user', 'admin', 'veterinarian'] },
    { name: 'Administration', path: '/admin', icon: ShieldAlert, role: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.role.includes(user?.role));

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-bold text-lg glow-secondary">P</span>
            <span className="text-xl font-bold tracking-tight text-slate-800">Pet<span className="text-secondary font-black">Luxe</span></span>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-50">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="h-10 w-10 rounded-full object-cover border border-slate-200"
            />
            <div className="overflow-hidden">
              <h4 className="truncate text-sm font-semibold text-slate-700">{user?.name}</h4>
              <span className="inline-flex rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-600">
                {user?.role === 'admin' ? 'Admin' : (user?.role === 'veterinarian' ? 'Vétérinaire' : 'Membre')}
              </span>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-secondary text-white shadow-md shadow-secondary/20 font-semibold scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
