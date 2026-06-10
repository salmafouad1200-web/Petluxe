import React from 'react';
import { PackageOpen, Sparkles } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "Aucun élément trouvé", 
  message = "Il n'y a rien à afficher ici pour le moment.",
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-hover text-white rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all"
        >
          <Sparkles size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
