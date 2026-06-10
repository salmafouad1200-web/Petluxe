import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Search, 
  Star, 
  Phone, 
  Calendar, 
  X, 
  Check, 
  AlertCircle,
  Dog
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

// Setup custom styled SVG Marker to avoid default Leaflet asset bugs in Vite
const createCustomMarker = (color) => {
  return new L.DivIcon({
    html: `<div class="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-md border-2 border-${color} animate-in fade-in zoom-in duration-300">
             <div class="h-4.5 w-4.5 rounded-full bg-${color} flex items-center justify-center text-white">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-2.5 w-2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
           </div>`,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const blueMarkerIcon = createCustomMarker('blue');

// Helper component to center map on coordinates
const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
};

const Veterinarians = () => {
  const [vets, setVets] = useState([]);
  const [pets, setPets] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([33.5731, -7.5898]); // Default Casablanca center

  // Booking Modal State
  const [bookingVet, setBookingVet] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchVets = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = {
        city: searchCity,
        specialty: searchSpecialty,
        max_price: maxPrice,
        min_rating: minRating,
        is_emergency_available: isEmergency ? 1 : 0,
        offers_online_consultation: isOnline ? 1 : 0,
        page: currentPage,
      };
      const response = await api.get('/veterinarians', { params });
      
      const dataList = response.data.data || response.data; // Handle paginated or raw
      setVets(dataList);
      
      if (response.data.last_page) {
        setTotalPages(response.data.last_page);
        setPage(response.data.current_page);
      }

      if (dataList.length > 0) {
        setMapCenter([dataList[0].latitude, dataList[0].longitude]);
      } else {
        // Fallback center to Morocco when no results
        setMapCenter([31.7917, -7.0926]);
      }
    } catch (err) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVets(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCity, searchSpecialty, maxPrice, minRating, isEmergency, isOnline]);

  useEffect(() => {
    api.get('/pets')
      .then(res => {
        setPets(res.data);
        if (res.data.length > 0) setSelectedPetId(res.data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVets(1);
  };

  const openBookingModal = (vet) => {
    setBookingVet(vet);
    setBookingDate('');
    setBookingTime('');
    setBookingNotes('');
    setBookingSuccess(false);
    setBookingError(null);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedPetId || !bookingDate || !bookingTime) {
      setBookingError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      await api.post('/appointments', {
        veterinarian_id: bookingVet.id,
        pet_id: selectedPetId,
        date: bookingDate,
        time: bookingTime,
        notes: bookingNotes
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingVet(null);
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <DashboardLayout title="Trouver un Vétérinaire">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch h-[calc(100vh-12rem)]">
        
        {/* Left Column (1/3): Search, filters, and list results */}
        <div className="lg:col-span-1 flex flex-col h-full bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm overflow-hidden">
          
          {/* Advanced Search Form */}
          <form onSubmit={handleSearch} className="mb-5 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search size={16} />
                </span>
                <input 
                  type="text"
                  placeholder="Ville (ex: Rabat)..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
                />
              </div>
              <input 
                type="text"
                placeholder="Spécialité, clinique ou adresse (ex: Abdelmoumen)..."
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                className="w-1/2 rounded-xl border border-slate-200 py-2.5 px-3 text-xs placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)} className="rounded border-slate-300 text-secondary focus:ring-secondary" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">Urgence 24/7</span>
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase">Prix max: {maxPrice}MAD</span>
                <input type="range" min="50" max="500" step="10" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-16 accent-secondary" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase">Note min: {minRating}</span>
                <input type="range" min="0" max="5" step="1" value={minRating} onChange={e => setMinRating(e.target.value)} className="w-16 accent-secondary" />
              </div>
            </div>
          </form>

          {/* Vets list scroll container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <SkeletonLoader type="list" count={4} />
            ) : vets.length === 0 ? (
              <EmptyState 
                icon={X}
                title="Aucun vétérinaire trouvé"
                message="Nous n'avons trouvé aucun résultat correspondant à vos critères de recherche. Essayez de modifier la ville ou les filtres."
                actionText="Réinitialiser les filtres"
                onAction={() => {
                  setSearchCity('');
                  setSearchSpecialty('');
                  setIsEmergency(false);
                  setMinRating(0);
                  setMaxPrice(500);
                }}
              />
            ) : (
              <>
                {vets.map((vet) => (
                  <div 
                    key={vet.id}
                    onClick={() => setMapCenter([vet.latitude, vet.longitude])}
                    className="p-4 border border-slate-100 hover:border-slate-200 rounded-2xl bg-slate-50/20 hover:bg-slate-50/50 cursor-pointer transition-all space-y-3 relative group"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        {vet.profile_image ? (
                            <img src={vet.profile_image} alt={vet.name} className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                <Dog size={20} className="text-slate-400" />
                            </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-secondary transition-colors">{vet.user?.name}</h4>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Star size={10} fill="currentColor" />
                              {vet.rating}
                            </span>
                          </div>
                          <h5 className="text-[11px] font-bold text-slate-600 mt-0.5">{vet.clinic_name}</h5>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{vet.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {vet.address}, {vet.city}</p>
                        <p className="text-xs text-slate-500 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {vet.phone}</span>
                          <span className="font-bold text-slate-700">{vet.consultation_price} €</span>
                        </p>
                      </div>

                      <div className="mt-2 flex gap-1 flex-wrap">
                        {vet.is_emergency_available && <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Urgence 24/7</span>}
                        {vet.offers_online_consultation && <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Visio</span>}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid recentering map
                        openBookingModal(vet);
                      }}
                      className="w-full py-2.5 text-center bg-secondary hover:bg-secondary-hover text-[11px] font-bold text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <Calendar size={12} />
                      Prendre Rendez-vous
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button 
                  disabled={page === 1}
                  onClick={() => fetchVets(page - 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="px-3 py-1 text-xs font-bold text-slate-800 flex items-center">{page} / {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => fetchVets(page + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (2/3): Leaflet map */}
        <div className="lg:col-span-2 h-full rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm bg-slate-100 relative">
          <MapContainer key={`map-${vets.length}`} center={mapCenter} zoom={13} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {vets.map((vet) => (
              <Marker 
                key={vet.id}
                position={[vet.latitude, vet.longitude]}
                icon={blueMarkerIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 max-w-[200px]">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-800 leading-snug">{vet.user?.name}</h5>
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500 bg-amber-50 px-1 rounded-sm"><Star size={8} fill="currentColor" />{vet.rating}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{vet.clinic_name}</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed flex items-center gap-1"><Phone size={9} /> {vet.phone}</p>
                    <button
                      onClick={() => openBookingModal(vet)}
                      className="mt-1 w-full py-1 text-center bg-secondary hover:bg-secondary text-white text-[9px] font-bold rounded-lg"
                    >
                      Prendre RDV
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            <RecenterMap coords={mapCenter} />
          </MapContainer>
        </div>

      </div>

      {/* Appointment Booking Modal */}
      {bookingVet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in duration-200 relative">
            <button 
              onClick={() => setBookingVet(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-850 mb-1">Prendre rendez-vous</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">Clinique : {bookingVet.clinic_name}</p>
            
            {bookingSuccess ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Rendez-vous Demandé !</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">Votre demande de rendez-vous a bien été envoyée au vétérinaire. Vous recevrez une notification de confirmation sous peu.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                
                {bookingError && (
                  <div className="flex gap-2 items-start rounded-xl bg-red-50 p-3 text-[11px] font-semibold text-red-600 border border-red-100">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Pet select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Choisir l'animal</label>
                  {pets.length === 0 ? (
                    <div className="flex gap-2 items-center rounded-xl bg-amber-50 p-3 text-[10px] font-semibold text-amber-700 border border-amber-100">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>Vous devez d'abord enregistrer un animal dans l'onglet "Mes Animaux".</span>
                    </div>
                  ) : (
                    <select
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-secondary bg-white font-medium text-slate-700"
                      required
                    >
                      {pets.map(pet => (
                        <option key={pet.id} value={pet.id}>{pet.name} ({pet.breed})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date souhaitée</label>
                  <input 
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-secondary bg-white font-semibold text-slate-700"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Time select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Créneau disponible</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-secondary bg-white font-semibold text-slate-700"
                    required
                  >
                    <option value="">Sélectionner un horaire...</option>
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes pour le vétérinaire</label>
                  <textarea 
                    placeholder="Symptômes, rappels de vaccins ou conseils spécifiques..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-secondary bg-white h-20 resize-none"
                  ></textarea>
                </div>

                {/* Confirm buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setBookingVet(null)}
                    className="flex-1 py-3 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={pets.length === 0 || bookingLoading}
                    className="flex-1 py-3 text-xs font-bold text-white bg-secondary hover:bg-secondary-hover rounded-xl shadow-md shadow-secondary/15 transition-all flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Confirmer le RDV'
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Veterinarians;
