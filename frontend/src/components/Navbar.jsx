import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, Bell, ShoppingCart, User, LogOut, Check } from 'lucide-react';

const Navbar = ({ onMenuOpen, pageTitle }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { cartCount } = useCart();
  const { user: currentUser, logout: currentLogout } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 px-6 backdrop-blur-md">
      {/* Left section: Sidebar trigger & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuOpen}
          className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 lg:text-2xl">{pageTitle}</h2>
      </div>

      {/* Right section: Actions (Cart, Notifications, Profile) */}
      <div className="flex items-center gap-3">
        {/* Cart */}
        <Link 
          to="/marketplace/cart" 
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-150 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-secondary hover:underline font-medium"
                  >
                    Tout lire
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">Aucune notification</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`flex gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-slate-50/50' : ''}`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${!n.is_read ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>{n.title}</span>
                          {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed truncate">{n.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:ring-2 hover:ring-secondary/20 transition-all overflow-hidden"
          >
            <img 
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
              alt="avatar" 
              className="h-full w-full object-cover"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-150 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Connecté en tant que</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm font-semibold text-slate-700 truncate">{currentUser?.name}</p>
                  {currentUser?.is_pro && (
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                      PRO
                    </span>
                  )}
                </div>
              </div>
              <div className="py-1">
                <Link 
                  to="/profile" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User size={15} />
                  Mon Profil
                </Link>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    currentLogout();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
