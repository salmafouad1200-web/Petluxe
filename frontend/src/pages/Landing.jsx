import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  BrainCircuit, 
  MapPin, 
  ShoppingBag, 
  Users, 
  Check, 
  ArrowRight,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { number: '15k+', label: 'Animaux Choyés' },
    { number: '99.2%', label: 'Diagnostics Précis' },
    { number: '500+', label: 'Vétérinaires Agréés' },
    { number: '4.9/5', label: 'Satisfaction Client' },
  ];

  const features = [
    {
      title: 'Santé IA Prédictive',
      desc: 'Téléversez une photo de votre animal pour identifier sa race, son âge estimé et recevoir des conseils alimentaires.',
      icon: BrainCircuit,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Réservations Immédiates',
      desc: 'Trouvez un vétérinaire qualifié à proximité grâce à notre carte interactive Leaflet et réservez des créneaux en direct.',
      icon: MapPin,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Marketplace Premium',
      desc: 'Découvrez notre sélection de nourriture bio, d\'accessoires luxueux et de soins approuvés par nos vétérinaires.',
      icon: ShoppingBag,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Réseau Social Canin & Félin',
      desc: 'Partagez les aventures de vos compagnons, aimez des publications et échangez avec une communauté bienveillante.',
      icon: Users,
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const faqs = [
    {
      q: 'Comment fonctionne l\'analyse IA de PetLuxe ?',
      a: 'Notre IA utilise des modèles avancés de vision par ordinateur pour analyser les photos de vos animaux. Elle estime l\'espèce, la race, l\'âge visuel et génère des conseils nutritionnels et de santé spécifiques basés sur les standards vétérinaires.',
    },
    {
      q: 'La réservation de rendez-vous est-elle gratuite ?',
      a: 'Oui, la recherche et la réservation de créneaux avec nos cliniques partenaires sont entièrement gratuites pour les utilisateurs. Les tarifs des consultations sont affichés en toute transparence lors de la réservation.',
    },
    {
      q: 'Puis-je utiliser PetLuxe pour n\'importe quel animal ?',
      a: 'Absolument. Nous supportons les chiens, les chats, et les Nouveaux Animaux de Compagnie (NAC) comme les lapins, furets, cochons d\'Inde ou reptiles.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-md flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-bold">P</span>
          <span className="text-xl font-bold tracking-tight text-slate-800">Pet<span className="text-secondary font-black">Luxe</span></span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Fonctionnalités</a>
          <a href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Tarifs</a>
          <a href="#faq" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">FAQ</a>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">Connexion</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-xl hover:bg-secondary-hover shadow-md shadow-secondary/15 transition-all">Créer un compte</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold mb-6 animate-pulse"
        >
          <Sparkles size={12} />
          <span>Plateforme intelligente PFE V1.0</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-tight"
        >
          Prenez soin de vos compagnons avec <span className="bg-gradient-to-r from-primary via-secondary to-blue-500 bg-clip-text text-transparent">l'Intelligence Artificielle</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed"
        >
          PetLuxe regroupe le suivi santé IA, la prise de rendez-vous vétérinaire simplifiée, une boutique premium et un espace communautaire en une seule interface moderne.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register" className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-secondary rounded-2xl hover:bg-secondary-hover shadow-lg shadow-secondary/25 transition-all">
            Essayer gratuitement
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
            Découvrir les services
          </a>
        </motion.div>

        {/* Decorative Grid Image mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-4 shadow-2xl glow-secondary"
        >
          <img 
            src="/images/petluxe_animals_hero.png" 
            alt="PetLuxe App Preview" 
            className="w-full h-[350px] md:h-[500px] object-cover rounded-2xl border border-slate-100"
          />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <h3 className="text-3xl md:text-5xl font-black text-secondary">{stat.number}</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Tout ce dont votre compagnon a besoin</h2>
          <p className="text-slate-500 mt-4">Une panoplie d'outils interconnectés conçus par des passionnés et validés par des experts vétérinaires.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                whileHover={{ y: -5 }}
                key={i} 
                className="glass rounded-3xl p-8 hover:shadow-xl transition-all flex gap-5 border border-slate-100"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-md`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{feat.title}</h3>
                  <p className="text-slate-500 mt-3 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pricing / Plan Section */}
      <section id="pricing" className="py-20 bg-slate-100/60 border-y border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Un tarif simple et transparent</h2>
            <p className="text-slate-500 mt-4">Toutes les fonctionnalités de base gratuites. Formule premium pour les analyses IA illimitées.</p>
          </div>

          <div className="inline-block max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-left shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">PFE Spécial</div>
            <h3 className="text-2xl font-bold text-slate-800">PetLuxe Pro</h3>
            <p className="text-slate-400 text-sm mt-1">L'accès complet et illimité.</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-950">9.99 €</span>
              <span className="text-slate-500 text-sm">/ mois</span>
            </div>
            
            <ul className="mt-8 space-y-4">
              {['Animaux enregistrés illimités', 'Historiques médicaux & Rappels vaccinaux', 'Scans IA illimités avec détections précises', 'Assistant Vétérinaire IA 24h/24', 'Wishlist marketplace & Livraison prioritaire', 'Exportations PDF et rapports de santé'].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <Link to="/register" className="mt-8 block w-full py-4 text-center text-sm font-bold text-white bg-secondary rounded-2xl hover:bg-secondary-hover shadow-md shadow-secondary/15 transition-all">
              Commencer l'essai gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Questions fréquentes</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="p-6 pt-0 border-t border-slate-50 text-sm leading-relaxed text-slate-500">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-bold">P</span>
            <span className="text-xl font-bold tracking-tight text-white">Pet<span className="text-secondary font-black">Luxe</span></span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#pricing" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#faq" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <p className="text-center text-xs text-slate-600 mt-8">© 2026 PetLuxe. Fait avec passion dans le cadre d'un Projet de Fin d'Études (PFE).</p>
      </footer>
    </div>
  );
};

export default Landing;
