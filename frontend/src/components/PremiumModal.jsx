import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, X, CreditCard, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PremiumModal = ({ isOpen, onClose, feature = "cette fonctionnalité" }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { fetchProfile } = useAuth();

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock payment API call
      await api.post('/subscription/checkout', {
        plan: 'pro_monthly',
        payment_method: 'mock_card'
      });
      
      setSuccess(true);
      // Refresh user profile to get the new is_pro status
      await fetchProfile();
      
      // Close after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError("Le paiement simulé a échoué. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors z-10"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={100} />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-16 w-16 bg-gradient-to-tr from-secondary to-blue-400 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-secondary/30 transform rotate-3">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-black text-white">PetLuxe Pro</h2>
              <p className="text-indigo-200 text-sm mt-2 font-medium">Débloquez {feature}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {success ? (
              <div className="text-center py-6">
                <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Bienvenue en Pro !</h3>
                <p className="text-sm text-slate-500 mt-2">Votre compte a été mis à niveau avec succès. Vous avez désormais accès à toutes les fonctionnalités premium.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {['Analyses IA illimitées', 'Assistant Vétérinaire 24/7', 'Historique médical complet', 'Export PDF prioritaire'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-indigo-50 text-secondary flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 relative">
                  <div className="absolute -top-3 right-4 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Simulation PFE</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-800">Total à payer</span>
                    <span className="text-lg font-black text-slate-900">9.99 €<span className="text-xs font-normal text-slate-500">/mois</span></span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Il s'agit d'un environnement de test. Aucun prélèvement réel ne sera effectué sur votre carte.</p>
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Traitement en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard size={18} />
                      Simuler le paiement
                    </span>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <ShieldCheck size={12} /> Paiement fictif sécurisé (Mode Test)
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PremiumModal;
