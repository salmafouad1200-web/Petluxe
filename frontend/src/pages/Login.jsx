import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [view, setView] = useState('login'); // 'login' | 'forgot'

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast?.error('Veuillez entrer votre adresse email.');
      return;
    }
    toast?.success(`Lien de réinitialisation envoyé à ${email}`);
    setView('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (view === 'forgot') return handleForgotSubmit(e);

    setLocalError(null);

    if (!email || !password) {
      setLocalError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 md:bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] md:from-slate-100 md:via-slate-50 md:to-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-xl shadow-lg shadow-secondary/15 glow-secondary mb-4">P</Link>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ravi de vous revoir</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Connectez-vous pour accéder à votre espace PetLuxe</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8 shadow-xl border border-slate-100">
          {localError && (
            <div className="mb-6 flex gap-3 items-start rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Adresse Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Field (Only in Login view) */}
            {view === 'login' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mot de passe</label>
                  <button type="button" onClick={() => setView('forgot')} className="text-xs font-semibold text-secondary hover:underline">Oublié ?</button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 py-3.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                    required={view === 'login'}
                  />
                </div>
              </div>
            )}

            {/* Remember Me Toggle (Only in Login view) */}
            {view === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-lg border-slate-300 text-secondary focus:ring-secondary/20 transition-all"
                  />
                  <span className="text-xs font-medium text-slate-500 select-none">Se souvenir de moi</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-bold text-white bg-secondary rounded-2xl hover:bg-secondary-hover shadow-lg shadow-secondary/15 transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{view === 'login' ? 'Se connecter' : 'Envoyer le lien'}</span>
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
            {view === 'forgot' && (
              <div className="text-center mt-3">
                <button type="button" onClick={() => setView('login')} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Retour à la connexion</button>
              </div>
            )}
          </form>

          {/* Seed credentials helpful alert */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Comptes de test (Seeders)</span>
            <div className="text-xs text-slate-500 bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1 align-middle">
              <p><strong>Admin :</strong> admin@petluxe.com | password123</p>
              <p><strong>Membre :</strong> user@petluxe.com | password123</p>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Nouveau sur PetLuxe ?{' '}
          <Link to="/register" className="font-semibold text-secondary hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
