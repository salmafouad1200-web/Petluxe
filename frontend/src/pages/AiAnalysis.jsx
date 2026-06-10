import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Activity, 
  BrainCircuit, 
  BookOpen, 
  HeartPulse, 
  TrendingUp, 
  History, 
  AlertCircle 
} from 'lucide-react';
import { compressImage } from '../utils/imageCompression';

const AiAnalysis = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load pets and past analyses
    api.get('/pets').then(res => setPets(res.data)).catch(() => {});
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/analyses');
      setHistory(res.data);
    } catch (err) {
      // Fail silently
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1024, 0.8);
        setPhotoFile(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
          setResult(null); // Clear previous results
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setError("Erreur lors de la préparation de l'image.");
      }
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!photoFile) return;

    setScanning(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('photo', photoFile);
    if (selectedPetId) {
      formData.append('pet_id', selectedPetId);
    }

    try {
      const response = await api.post('/analyses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'analyse par l\'IA.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <DashboardLayout title="Intelligence Artificielle">
      
      {/* Page Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800">Vision Lab IA</h3>
        <p className="text-sm text-slate-400 mt-1">Détectez instantanément l'espèce, la race, l'âge visuel et générez des recommandations de santé.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Image Uploader Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Analyse de Photo</h4>
            
            {error && (
              <div className="mb-4 flex gap-3 items-start rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              
              {/* Pet selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Associer à un animal (Optionnel)</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-secondary bg-white font-medium text-slate-700"
                >
                  <option value="">Sélectionner un animal...</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.breed})</option>
                  ))}
                </select>
              </div>

              {/* Photo dropzone */}
              <div className="flex flex-col items-center">
                {photoPreview ? (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                    <img src={photoPreview} alt="Upload preview" className="w-full h-full object-cover" />
                    
                    {/* Glowing scanning laser beam */}
                    {scanning && (
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent shadow-[0_0_15px_#2563eb] animate-[bounce_2s_infinite] z-10"></div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer flex flex-col items-center gap-1.5 text-white font-bold text-xs">
                        <Camera size={20} />
                        Modifier la photo
                        <input type="file" onChange={handlePhotoChange} accept="image/*" className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">Choisir un fichier</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Formats supportés: JPG, PNG (Max. 4 Mo)</p>
                    </div>
                    <input type="file" onChange={handlePhotoChange} accept="image/*" className="hidden" />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={!photoFile || scanning}
                className="w-full py-4 rounded-xl bg-secondary hover:bg-secondary-hover disabled:bg-slate-150 text-white text-xs font-bold transition-all shadow-md shadow-secondary/15 flex items-center justify-center gap-2"
              >
                <span className="flex items-center justify-center gap-2">
                  {scanning ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>{scanning ? "Analyse en cours..." : "Lancer l'analyse IA"}</span>
                </span>
              </button>

            </form>
          </div>
        </div>

        {/* Right Columns (2/3 width on desktop): Analysis Details / History */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              {/* Scan summary details */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Résultat de l'Analyse</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Généré par PetLuxe Vision IA</p>
                </div>
              </div>

              {/* Detected Specs tags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Espèce', value: result.animal_type || result.species },
                  { label: 'Race', value: result.breed },
                  { label: 'Fiabilité', value: result.confidence ? `${(result.confidence * 100).toFixed(0)}%` : 'N/A' },
                  { label: 'Poids Est.', value: result.weight_estimation || 'N/A' },
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Behavior & Personality */}
              {(result.personality_traits || result.behavior_analysis) && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} /> Traits & Comportement
                  </h4>
                  {result.personality_traits && (
                    <div className="flex gap-2 mb-3">
                      {result.personality_traits.map((t, idx) => (
                        <span key={idx} className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md">{t}</span>
                      ))}
                    </div>
                  )}
                  {result.behavior_analysis && (
                    <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
                      "{result.behavior_analysis}"
                    </p>
                  )}
                </div>
              )}

              {/* Tips lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Health tips */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3 text-blue-600">
                    <HeartPulse size={14} />
                    Observations de Santé
                  </h4>
                  <ul className="space-y-2.5">
                    {(result.health_observations || result.health_tips || []).map((t, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 font-medium leading-relaxed">
                        <span className="h-5 w-5 shrink-0 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-[10px]">{idx + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nutrition tips */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3 text-amber-600">
                    <BookOpen size={14} />
                    Conseils Alimentaires
                  </h4>
                  <ul className="space-y-2.5">
                    {(result.nutrition_recommendations || result.diet_tips || []).map((t, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 font-medium leading-relaxed">
                        <span className="h-5 w-5 shrink-0 rounded-lg bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-[10px]">{idx + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-100/40 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
              <Sparkles size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">Téléversez une photo à gauche pour lancer le diagnostic intelligent.</p>
            </div>
          )}

          {/* Past History Logs */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <History size={16} className="text-slate-500" />
              Historique des Scans
            </h4>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">Aucune analyse historique trouvée.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((h) => (
                  <div 
                    key={h.id} 
                    onClick={() => setResult(h)}
                    className="flex gap-3 p-3 border border-slate-100 rounded-2xl hover:border-slate-200 bg-slate-50/20 cursor-pointer transition-all hover:bg-slate-50/50"
                  >
                    <img src={h.photo} alt="Scan preview" className="h-14 w-14 rounded-xl object-cover border border-slate-100" />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-800">{h.breed}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{h.animal_type || h.species} • {h.age_estimation}</p>
                      <span className="text-[9px] text-slate-400 block mt-1">{new Date(h.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </DashboardLayout>
  );
};

export default AiAnalysis;
