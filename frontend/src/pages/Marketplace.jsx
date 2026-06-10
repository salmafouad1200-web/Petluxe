import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { 
  Search, ShoppingCart, Heart, Star, Filter, Package, 
  ShoppingBag, Truck, Check, X, Plus, Minus, AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Tous les produits' },
  { value: 'food', label: 'Alimentation' },
  { value: 'accessories', label: 'Accessoires' },
  { value: 'healthcare', label: 'Santé' },
  { value: 'toys', label: 'Jouets' },
];

import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const Marketplace = () => {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, wishlist, toggleWishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [view, setView] = useState('catalog'); // 'catalog' | 'cart' | 'checkout' | 'success'
  const [added, setAdded] = useState({});

  // Checkout form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search, category, sort } });
      setProducts(res.data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  useEffect(() => { 
    const timer = setTimeout(() => {
      fetchProducts(); 
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress || !phone) { setCheckoutError('Veuillez remplir tous les champs.'); return; }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      await api.post('/orders', {
        items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address: shippingAddress,
        phone,
        payment_method: paymentMethod,
      });
      clearCart();
      setView('success');
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Erreur lors du paiement.');
    } finally { setCheckoutLoading(false); }
  };

  // ===== VIEWS =====

  if (view === 'success') return (
    <DashboardLayout title="Marketplace">
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mb-6">
          <Check size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Commande Confirmée !</h2>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          Merci pour votre achat ! Votre colis sera expédié dans les 24h. Vous recevrez une notification de suivi.
        </p>
        <button onClick={() => setView('catalog')} className="mt-8 px-8 py-3.5 bg-secondary text-white text-sm font-bold rounded-2xl hover:bg-secondary-hover shadow-md shadow-secondary/15 transition-all">
          Continuer mes achats
        </button>
      </div>
    </DashboardLayout>
  );

  if (view === 'checkout') return (
    <DashboardLayout title="Finaliser la commande">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setView('cart')} className="mb-6 text-xs font-bold text-secondary flex items-center gap-1 hover:underline">← Retour au panier</button>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-5">Livraison & Paiement</h3>
            {checkoutError && (
              <div className="mb-4 flex gap-2 items-start rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /><span>{checkoutError}</span>
              </div>
            )}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Adresse de livraison</label>
                <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="75 Rue de Rivoli, 75001 Paris" className="w-full rounded-xl border border-slate-200 p-3 text-sm h-20 resize-none focus:outline-none focus:border-secondary" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-secondary" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Méthode de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  {['card','paypal','cash'].map(m => (
                    <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`py-3 rounded-xl border text-xs font-bold capitalize transition-all ${paymentMethod === m ? 'border-secondary bg-secondary/5 text-secondary' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      {m === 'card' ? '💳 Carte' : m === 'paypal' ? '🅿️ PayPal' : '💵 Espèces'}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={checkoutLoading} className="w-full py-4 bg-secondary hover:bg-secondary-hover text-white font-bold text-sm rounded-2xl shadow-md shadow-secondary/15 flex items-center justify-center gap-2 transition-all mt-4">
                <span className="flex items-center gap-2">
                  {checkoutLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{checkoutLoading ? "Traitement..." : "Confirmer la commande"}</span>
                </span>
              </button>
            </form>
          </div>
          <div className="md:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm h-fit space-y-3">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Récapitulatif</h4>
            {cartItems.map(item => (
              <div key={item.product_id} className="flex justify-between text-xs text-slate-600 font-medium">
                <span className="truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                <span className="font-bold">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-800">
              <span>Total</span><span>{cartTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  if (view === 'cart') return (
    <DashboardLayout title="Mon Panier">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setView('catalog')} className="mb-6 text-xs font-bold text-secondary flex items-center gap-1 hover:underline">← Continuer mes achats</button>
        {cartItems.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
            <ShoppingCart size={40} className="text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-700">Votre panier est vide</h4>
            <button onClick={() => setView('catalog')} className="mt-6 px-6 py-3 bg-secondary text-white text-sm font-bold rounded-2xl hover:bg-secondary-hover transition-all">Découvrir la boutique</button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.product_id} className="flex gap-4 bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover border border-slate-100" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                  <p className="text-sm font-extrabold text-secondary mt-1">{item.price.toFixed(2)} €</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item.product_id)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={15} /></button>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"><Minus size={12} /></button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div><p className="text-xs text-slate-400 font-semibold">Total commande</p><p className="text-2xl font-black text-slate-800 mt-0.5">{cartTotal.toFixed(2)} €</p></div>
              <button onClick={() => setView('checkout')} className="px-6 py-3.5 bg-secondary text-white text-sm font-bold rounded-2xl hover:bg-secondary-hover shadow-md shadow-secondary/15 transition-all flex items-center gap-2"><Truck size={16} />Passer commande</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Marketplace">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="w-full rounded-2xl border border-slate-200 py-3.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white" />
          </div>
          <button type="submit" className="px-5 py-3.5 bg-secondary text-white text-sm font-bold rounded-2xl hover:bg-secondary-hover shadow-md shadow-secondary/15 transition-all">Chercher</button>
        </form>
        <button onClick={() => setView('cart')} className="relative flex items-center gap-2 px-5 py-3.5 border border-slate-200 rounded-2xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <ShoppingCart size={16} className="text-slate-500" />
          Panier
          {cartItems.length > 0 && <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white ring-2 ring-white">{cartItems.reduce((s,i) => s+i.quantity, 0)}</span>}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === cat.value ? 'bg-secondary text-white shadow-md shadow-secondary/15' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {cat.label}
          </button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)} className="ml-auto shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 bg-white focus:outline-none focus:border-secondary">
          <option value="">Trier par...</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <SkeletonLoader type="card" count={4} />
      ) : products.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="Aucun produit trouvé"
          message="Il n'y a pas de produits correspondants à votre recherche. Essayez d'autres mots-clés ou filtres."
          actionText="Effacer la recherche"
          onAction={() => {
            setSearch('');
            setCategory('');
            setSort('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const inWishlist = wishlist.some(w => w.id === product.id);
            const isAdded = added[product.id];
            return (
              <div key={product.id} className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
                <div className="relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => toggleWishlist(product)} className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm transition-all ${inWishlist ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                    <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-600 capitalize">{product.category === 'food' ? 'Alimentation' : product.category === 'accessories' ? 'Accessoires' : product.category === 'healthcare' ? 'Santé' : 'Jouets'}</span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{product.name}</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={11} className="text-amber-400" fill="currentColor" />
                    <span className="text-[10px] font-bold text-slate-500">{product.rating} ({product.reviews_count})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-lg font-extrabold text-slate-800">{product.price.toFixed(2)} €</span>
                    <button onClick={() => handleAddToCart(product)} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex-1 ${isAdded ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-secondary text-white hover:bg-secondary-hover shadow-secondary/15'}`}>
                      <span className="flex items-center gap-1.5">
                        {isAdded ? <Check size={12} /> : <ShoppingCart size={12} />}
                        <span>{isAdded ? "Ajouté" : "Ajouter"}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Marketplace;
