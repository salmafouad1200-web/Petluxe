import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Lock, Camera, Save, AlertCircle, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password && password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (password) { formData.append('password', password); formData.append('password_confirmation', passwordConfirmation); }
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setPassword(''); setPasswordConfirmation('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Mon Profil">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
          {/* Cover gradient banner */}
          <div className="h-28 bg-gradient-to-r from-primary to-secondary relative">
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl"></div>
          </div>

          {/* Avatar + basic info header */}
          <div className="px-8 pb-2 -mt-8 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative group w-fit">
              <div className="h-20 w-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100">
                <img src={avatarPreview || user?.avatar} alt={user?.name} className="h-full w-full object-cover" />
              </div>
              <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-secondary text-white flex items-center justify-center cursor-pointer shadow ring-2 ring-white hover:bg-secondary-hover transition-colors">
                <Camera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="pb-2">
              <h3 className="text-xl font-extrabold text-slate-800">{user?.name}</h3>
              <span className={`inline-flex mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : user?.role === 'veterinarian' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="px-8 pb-8 pt-4">
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Modifier mes informations</h4>

              {error && (
                <div className="mb-5 flex gap-2 items-start rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-5 flex gap-2 items-center rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-600 border border-emerald-100">
                  <Check size={14} /><span>Profil mis à jour avec succès !</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nom Complet</label>
                    <div className="relative"><User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-secondary bg-white" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Adresse Email</label>
                    <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-secondary bg-white" required />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Téléphone</label>
                  <div className="relative"><Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-secondary bg-white" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Changer le mot de passe (optionnel)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Nouveau mot de passe</label>
                      <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-secondary bg-white placeholder-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Confirmation</label>
                      <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-secondary bg-white placeholder-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3.5 bg-secondary hover:bg-secondary-hover text-white text-sm font-bold rounded-2xl shadow-md shadow-secondary/15 transition-all">
                    {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Save size={15} />}
                    Sauvegarder les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
