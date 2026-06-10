import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  PlusCircle, 
  FileText, 
  Calendar, 
  Activity, 
  Scale, 
  CalendarDays,
  FileSpreadsheet,
  X,
  Upload,
  User,
  AlertCircle,
  Camera,
  Dog
} from 'lucide-react';

import { compressImage } from '../utils/imageCompression';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Chien');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState('Mâle');
  const [vaccines, setVaccines] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [addError, setAddError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Medical Record & Document Form states
  const [medDate, setMedDate] = useState('');
  const [medType, setMedType] = useState('Consultation');
  const [medDesc, setMedDesc] = useState('');
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState(null);

  const fetchPets = async () => {
    try {
      const res = await api.get('/pets');
      setPets(res.data);
      if (selectedPet) {
        const updated = res.data.find(p => p.id === selectedPet.id);
        setSelectedPet(updated || null);
      }
    } catch (err) {
      // Fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.8);
        setPhotoFile(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setAddError("Erreur lors de la compression de l'image.");
      }
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    setAddError(null);

    if (!name || !breed || !age || !weight) {
      setAddError('Veuillez remplir tous les champs requis.');
      return;
    }

    setActionLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('species', species);
    formData.append('breed', breed);
    formData.append('age', age);
    formData.append('weight', weight);
    formData.append('sex', sex);
    if (vaccines) formData.append('vaccines', JSON.stringify(vaccines.split(',').map(v => v.trim())));
    if (photoFile) formData.append('photo', photoFile);

    try {
      await api.post('/pets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsAddModalOpen(false);
      resetAddForm();
      fetchPets();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetAddForm = () => {
    setName('');
    setSpecies('Chien');
    setBreed('');
    setAge('');
    setWeight('');
    setSex('Mâle');
    setVaccines('');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Voulez-vous vraiment retirer cet animal ?')) return;
    try {
      await api.delete(`/pets/${id}`);
      setSelectedPet(null);
      fetchPets();
    } catch (err) {
      // Fail silently
    }
  };

  const handleAddMedical = async (e) => {
    e.preventDefault();
    if (!medDate || !medDesc) return;
    try {
      const res = await api.post(`/pets/${selectedPet.id}/medical`, {
        date: medDate,
        type: medType,
        description: medDesc
      });
      setSelectedPet(res.data);
      setMedDate('');
      setMedDesc('');
      fetchPets();
    } catch (err) {
      // Fail silently
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docName || !docFile) return;

    const formData = new FormData();
    formData.append('name', docName);
    formData.append('document', docFile);

    try {
      const res = await api.post(`/pets/${selectedPet.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedPet(res.data);
      setDocName('');
      setDocFile(null);
      fetchPets();
    } catch (err) {
      // Fail silently
    }
  };

  return (
    <DashboardLayout title="Gestion des Animaux">
      
      {/* Upper header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Mes Compagnons</h3>
          <p className="text-sm text-slate-400 mt-1">Gérez le carnet de santé, les vaccins et les comptes rendus médicaux.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-white hover:bg-secondary-hover shadow-md shadow-secondary/15 transition-all"
        >
          <Plus size={18} />
          Ajouter un Animal
        </button>
      </div>

      {/* Main View Area */}
      {loading ? (
        <SkeletonLoader type="card" count={2} />
      ) : pets.length === 0 ? (
        <EmptyState 
          icon={Dog}
          title="Aucun animal enregistré"
          message="Commencez par ajouter votre premier chien, chat ou NAC afin de pouvoir utiliser le suivi médical et le module IA."
          actionText="Ajouter mon compagnon"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left list of pets */}
          <div className="lg:col-span-1 space-y-4">
            {pets.map((pet) => (
              <div 
                key={pet.id} 
                onClick={() => setSelectedPet(pet)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedPet?.id === pet.id 
                    ? 'border-secondary bg-secondary/5 shadow-sm' 
                    : 'border-slate-200/60 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={pet.photo} 
                    alt={pet.name} 
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="text-base font-bold text-slate-800">{pet.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{pet.species} • {pet.breed}</p>
                  </div>
                </div>
                <span className={`h-2 w-2 rounded-full ${selectedPet?.id === pet.id ? 'bg-secondary' : 'bg-transparent'}`}></span>
              </div>
            ))}
          </div>

          {/* Right pet details profile panel */}
          <div className="lg:col-span-2">
            {selectedPet ? (
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
                
                {/* Header card details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                  <div className="flex items-center gap-5">
                    <img 
                      src={selectedPet.photo} 
                      alt={selectedPet.name} 
                      className="h-20 w-20 rounded-3xl object-cover border border-slate-100"
                    />
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-800">{selectedPet.name}</h3>
                      <p className="text-sm font-semibold text-slate-400 mt-1">{selectedPet.species} • {selectedPet.breed}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button 
                      onClick={() => handleDeletePet(selectedPet.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Retirer l'animal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Grid metrics stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Âge', value: `${selectedPet.age} ans`, icon: CalendarDays },
                    { label: 'Poids', value: `${selectedPet.weight} kg`, icon: Scale },
                    { label: 'Sexe', value: selectedPet.sex, icon: User },
                  ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center flex flex-col items-center gap-1">
                        <Icon size={16} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                        <span className="text-sm font-extrabold text-slate-800">{m.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Vaccines List */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Calendrier Vaccinal</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPet.vaccines && selectedPet.vaccines.length > 0 ? (
                      selectedPet.vaccines.map((v, idx) => (
                        <span key={idx} className="inline-flex rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-xs font-semibold text-blue-600">
                          {v}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Aucun vaccin enregistré.</p>
                    )}
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Historique Médical</h4>
                  
                  {/* Medical history timeline */}
                  <div className="space-y-4 mb-6">
                    {selectedPet.medical_history && selectedPet.medical_history.length > 0 ? (
                      selectedPet.medical_history.map((record, idx) => (
                        <div key={idx} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 py-1.5 relative">
                          <span className="absolute -left-1.5 top-2.5 h-3 w-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{record.type}</span>
                              <span className="text-[10px] font-medium text-slate-400">{record.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{record.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Aucun rapport médical disponible.</p>
                    )}
                  </div>

                  {/* Add history form */}
                  <form onSubmit={handleAddMedical} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-3">Enregistrer un événement</span>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input 
                        type="date"
                        value={medDate}
                        onChange={(e) => setMedDate(e.target.value)}
                        className="rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-secondary bg-white"
                        required
                      />
                      <select
                        value={medType}
                        onChange={(e) => setMedType(e.target.value)}
                        className="rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-secondary bg-white font-medium text-slate-600"
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Vaccination">Vaccination</option>
                        <option value="Chirurgie">Chirurgie</option>
                        <option value="Traitement">Traitement</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Description de la visite (ex: Rappel vaccin de rage effecté, entorse soignée)"
                      value={medDesc}
                      onChange={(e) => setMedDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-secondary bg-white h-16 resize-none mb-3"
                      required
                    ></textarea>
                    <button 
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      Ajouter à l'historique
                    </button>
                  </form>
                </div>

                {/* Documents attachments */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Documents & Rapports</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {selectedPet.documents && selectedPet.documents.length > 0 ? (
                      selectedPet.documents.map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <FileText size={18} className="text-slate-400" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.name}</p>
                            <span className="text-[9px] text-slate-400 font-medium">{doc.uploaded_at || 'Just now'}</span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Aucun fichier joint.</p>
                    )}
                  </div>

                  {/* Add document form */}
                  <form onSubmit={handleUploadDoc} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-3">Téléverser un rapport PDF / Radio</span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text"
                        placeholder="Nom du document (ex: Carnet Rage PDF)"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-secondary bg-white flex-1"
                        required
                      />
                      <div className="flex gap-2">
                        <label className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-150 p-2.5 text-xs cursor-pointer bg-white text-slate-600 font-semibold flex-1">
                          <Upload size={14} />
                          {docFile ? 'Fichier sélectionné' : 'Parcourir'}
                          <input 
                            type="file"
                            onChange={(e) => setDocFile(e.target.files[0])}
                            accept="application/pdf,image/*"
                            className="hidden"
                            required
                          />
                        </label>
                        <button 
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-xs font-bold text-white transition-colors"
                        >
                          Envoyer
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

              </div>
            ) : (
              <div className="bg-slate-100/50 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                <Dog size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">Sélectionnez un animal dans la liste pour voir sa fiche de santé</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Pet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in duration-200 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ajouter un nouveau compagnon</h3>
            
            {addError && (
              <div className="mb-4 flex gap-3 items-start rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddPet} className="space-y-4">
              
              {/* Photo Input preview */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className="h-20 w-20 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Pet Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Dog size={28} className="text-slate-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-secondary hover:bg-secondary-hover text-white flex items-center justify-center cursor-pointer shadow-md ring-2 ring-white transition-all">
                    <Camera size={12} />
                    <input 
                      type="file" 
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="hidden" 
                    />
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Photo</span>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nom de l'animal</label>
                <input 
                  type="text"
                  placeholder="Max, Minette, Cléo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white"
                  required
                />
              </div>

              {/* Species & Breed */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Espèce</label>
                  <select 
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white font-medium text-slate-700"
                  >
                    <option value="Chien">Chien</option>
                    <option value="Chat">Chat</option>
                    <option value="Nac">Nouveau Animaux (NAC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Race</label>
                  <input 
                    type="text"
                    placeholder="Labrador, Siamois, Lapin..."
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white"
                    required
                  />
                </div>
              </div>

              {/* Age, Weight, Sex */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Âge (ans)</label>
                  <input 
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Poids (kg)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Sexe</label>
                  <select 
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white font-medium text-slate-700"
                  >
                    <option value="Mâle">Mâle</option>
                    <option value="Femelle">Femelle</option>
                  </select>
                </div>
              </div>

              {/* Vaccines */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vaccins (Séparés par des virgules)</label>
                <input 
                  type="text"
                  placeholder="Rage, Coryza, Typhus"
                  value={vaccines}
                  onChange={(e) => setVaccines(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary bg-white"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-secondary hover:bg-secondary-hover rounded-xl shadow-md shadow-secondary/15 transition-all flex items-center justify-center"
                >
                  {actionLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Pets;
