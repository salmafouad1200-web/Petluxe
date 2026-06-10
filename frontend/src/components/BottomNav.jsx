import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, PawPrint, ShoppingCart, MessageSquare } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const BottomNav = () => {
  const { cartCount } = useCart();

  const navItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Animaux', path: '/pets', icon: PawPrint },
    { name: 'Assistant IA', path: '/ai-analysis', icon: Sparkles, highlight: true },
    { name: 'Boutique', path: '/marketplace', icon: ShoppingCart, badge: cartCount },
    { name: 'Communauté', path: '/community', icon: MessageSquare },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-16 h-12 transition-all ${
                  isActive ? 'text-secondary' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${isActive && item.highlight ? 'bg-secondary text-white shadow-md shadow-secondary/30' : ''}`}>
                    <Icon size={item.highlight && isActive ? 18 : 20} className={isActive && item.highlight ? '' : (isActive ? 'stroke-[2.5px]' : '')} />
                    
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-medium mt-1 truncate w-full text-center ${isActive ? 'font-bold' : ''}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
