import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getStoreSettingsBySlug, getDefaultPlanFeatures } from '../lib/store';
import { Check, MessageCircle } from 'lucide-react';
import { DEFAULT_PLANS } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState("5584999857391");
  const [instagram, setInstagram] = useState("");
  const [promoBanner, setPromoBanner] = useState<{ active: boolean; text: string }>({ active: false, text: '' });

  useEffect(() => {
    const settings = getStoreSettingsBySlug(storeSlug);
    if (settings) {
      setPlans(settings.plans.length > 0 ? settings.plans : DEFAULT_PLANS);
      if (settings.whatsappNumber) setWhatsapp(settings.whatsappNumber);
      if (settings.instagramUrl) setInstagram(settings.instagramUrl);
      if (settings.isPromotionalBannerActive && settings.promotionalBannerText) {
        setPromoBanner({ active: true, text: settings.promotionalBannerText });
      }
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor || '#3b82f6');
    } else {
      setPlans(DEFAULT_PLANS);
    }
  }, [storeSlug]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
      <AnimatePresence>
        {promoBanner.active && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl mb-12 p-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-xl shadow-orange-500/20"
          >
            <div className="bg-slate-950/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 text-center border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black uppercase tracking-widest py-1 px-4 rounded-full mb-4 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                Promoção Especial
              </div>
              <p className="text-white text-lg sm:text-2xl font-bold leading-relaxed relative z-10 whitespace-pre-line">
                {promoBanner.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: promoBanner.active ? 0.2 : 0 }}
        className="text-center max-w-2xl mb-16"
      >
        <h2 className="text-3xl md:text-5xl leading-tight font-extrabold text-white mb-6">
          O melhor do entretenimento <br/>
          <span className="text-primary">na sua tela</span>
        </h2>
        <p className="text-slate-400 text-base md:text-xl px-2 mb-10">
          Filmes, séries, esportes e canais ao vivo. Escolha o plano ideal para você e assista de onde quiser com máxima qualidade.
        </p>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="inline-block p-[1px] rounded-2xl bg-gradient-to-r from-primary to-primary/50 shadow-xl shadow-primary/20"
        >
          <div className="bg-slate-900 px-8 py-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Novo
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Teste Grátis por 4 Horas</h3>
              <p className="text-slate-400 text-sm">Experimente toda a nossa grade liberada sem nenhum compromisso. Solicite agora mesmo!</p>
            </div>
            <Link 
              to={`/${storeSlug}/checkout/teste`}
              className="shrink-0 inline-flex items-center gap-2 bg-primary hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-all focus:ring-4 focus:ring-primary/30 outline-none hover:scale-105 active:scale-95"
            >
              Solicitar Teste
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
        {plans.filter(p => p.id !== 'teste').map((plan, index) => {
          const isTrimestral = plan.id === "trimestral";
          return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index, ease: [0.23, 1, 0.32, 1] }}
          >
            <Link 
              to={`/${storeSlug || 'elitestream'}/checkout/${plan.id}`}
              className={`h-full relative flex flex-col bg-slate-900 border rounded-2xl p-6 md:p-8 transition-all shadow-xl shadow-black/50 group ${
                isTrimestral ? "border-primary scale-100 sm:scale-105 md:scale-110 z-10 shadow-primary/20" : "border-slate-800 hover:border-primary/50"
              }`}
            >
              {isTrimestral && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg shadow-primary/30 whitespace-nowrap">
                     Melhor Custo-Benefício 
                  </span>
                </div>
              )}
              
              <div className="mb-6 mt-2">
                <h3 className={`text-xl font-medium md:mb-2 transition-colors ${isTrimestral ? 'text-primary font-bold uppercase tracking-wider' : 'text-slate-300 group-hover:text-primary'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-semibold ${isTrimestral ? 'text-primary/70' : 'text-slate-500'}`}>R$</span>
                  <span className="text-4xl md:text-5xl font-bold text-white">{plan.price.toString().replace('.', ',')}</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3.5 flex-1">
                {(plan.features && plan.features.length > 0
                  ? plan.features
                  : getDefaultPlanFeatures(plan.id, plan.durationMonths)
                ).map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm font-medium">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className={`w-full text-center font-medium py-3 px-6 rounded-xl transition-all outline-none bg-primary hover:opacity-90 text-white focus:ring-4 focus:ring-primary/30 shadow-lg shadow-primary/10 group-hover:scale-[1.02] active:scale-95`}>
                Assinar Agora
              </div>
            </Link>
          </motion.div>
        )})}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-24 text-center"
      >
        <h3 className="text-xl font-medium text-slate-300 mb-6">Ficou com alguma dúvida?</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-3 px-8 rounded-full transition-colors shadow-lg shadow-[#25D366]/20 focus:ring-4 focus:ring-[#25D366]/30 outline-none"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
          </motion.a>

          {instagram && (
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white font-medium py-3 px-8 rounded-full transition-all shadow-lg shadow-purple-500/20 focus:ring-4 focus:ring-purple-500/30 outline-none"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.246-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.246-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.428.065-2.528.291-3.418 1.181-.89.89-1.116 1.99-1.181 3.418-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.065 1.428.291 2.528 1.181 3.418.89.89 1.99 1.116 3.418 1.181 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.428-.065 2.528-.291 3.418-1.181.89-.89 1.116-1.99 1.181-3.418.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.065-1.428-.291-2.528-1.181-3.418-.89-.89-1.99-1.116-3.418-1.181-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </motion.a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
