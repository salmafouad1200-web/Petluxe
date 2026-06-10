import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, ArrowRight, Camera, Mail, Phone, Lock, User } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== passwordConfirmation) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setLoading(true);

    // Prepare multipart form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    formData.append('password', password);
    formData.append('password_confirmation', passwordConfirmation);
    if (avatar) formData.append('avatar', avatar);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Erreur lors de l\'inscription.');
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
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rejoindre PetLuxe</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Créez votre espace premium pour le soin de votre animal</p>
        </div>

        {/* Register Card */}
        <div className="glass rounded-3xl p-8 shadow-xl border border-slate-100">
          {localError && (
            <div className="mb-6 flex gap-3 items-start rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Avatar Upload Container */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="h-24 w-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User size={36} className="text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-secondary hover:bg-secondary-hover text-white flex items-center justify-center cursor-pointer shadow-md ring-2 ring-white transition-all">
                  <Camera size={14} />
                  <input 
                    type="file" 
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden" 
                  />
                </label>
              </div>
              <span className="text-xs text-slate-400 font-semibold mt-2.5">Avatar (Optionnel)</span>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nom Complet</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={16} />
                </span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Adresse Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@exemple.com"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Téléphone (Optionnel)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Phone size={16} />
                </span>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirmation</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-bold text-white bg-secondary rounded-2xl hover:bg-secondary-hover shadow-lg shadow-secondary/15 transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Créer un compte</span>
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Link to Login */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-secondary hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
