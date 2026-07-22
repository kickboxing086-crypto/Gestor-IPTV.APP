import { Link, useParams } from 'react-router-dom';
import { Search, Bell, Menu, X, Home, Zap, ShieldCheck, MessageCircle, Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoreSettingsBySlug } from '../lib/store';
import defaultLogo from '../assets/images/app_logo_1784678188597.jpg';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const { storeSlug } = useParams();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Gestor IPTV');
  const [whatsappNumber, setWhatsappNumber] = useState('5584999857391');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const settings = getStoreSettingsBySlug(storeSlug);
    if (settings) {
      if (settings.storeName) setStoreName(settings.storeName);
      if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
      if (settings.logoUrl) {
        setLogoUrl(settings.logoUrl);
      } else {
        setLogoUrl(defaultLogo);
      }
    } else {
      setStoreName('Minha Loja');
      setLogoUrl(defaultLogo);
    }
  }, [storeSlug]);

  const slugPath = storeSlug ? `/${storeSlug}` : '/gestor';

  return (
    <>
      <header className="w-full py-4 sm:py-6 text-center bg-slate-950/80 border-b border-white/10 backdrop-blur-xl relative flex flex-col items-center px-4 z-40 shadow-2xl">
        {/* Upper Left Luxury Bars (Hamburger Button) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 sm:p-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 rounded-2xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center group"
            title="Abrir Menu VIP"
          >
            <Menu className="w-6 h-6 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
          </motion.button>
          
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full shadow-inner">
            <Crown className="w-3 h-3 text-amber-400" /> VIP MENU
          </span>
        </div>

        {/* Center Store Title and Logo */}
        <Link to={slugPath} className="flex flex-col items-center gap-2 transition-transform hover:scale-105 my-1 sm:my-0">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt={storeName} 
              className="h-11 sm:h-16 w-auto rounded-xl object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] border border-white/10" 
              referrerPolicy="no-referrer"
            />
          )}
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight uppercase flex items-center gap-2">
            <span className="bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              {storeName}
            </span>
          </h1>
        </Link>
        
        {/* Right side quick links */}
        <div className="mt-3 sm:mt-0 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 flex items-center justify-center gap-2 w-full sm:w-auto">
          <Link 
            to={`${slugPath}/novidades`} 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-3.5 py-2 rounded-xl transition-colors border border-blue-500/30 text-xs font-bold backdrop-blur-md min-w-[110px]"
          >
            <Bell className="w-4 h-4 text-blue-400 animate-bounce" style={{ animationDuration: '2s' }} />
            <span>Novidades</span>
          </Link>
          <Link 
            to={`${slugPath}/status`} 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-colors border border-white/15 text-xs font-bold backdrop-blur-md min-w-[110px]"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Consultar</span>
          </Link>
        </div>
      </header>

      {/* Upper-Left Luxury Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Side Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] bg-slate-950 border-r border-amber-500/20 h-full flex flex-col p-6 shadow-2xl z-10 overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-900 transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Drawer Luxury Header */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800/80 mt-2">
                <div className="p-1 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-500 mb-3 shadow-xl shadow-amber-500/20">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={storeName}
                      className="h-16 w-16 object-contain rounded-xl bg-slate-950 p-1"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" /> LUXURY STREAMING
                </span>
                <h3 className="text-xl font-black text-white">{storeName}</h3>
                <p className="text-xs text-slate-400 mt-1">Menu de Navegação VIP</p>
              </div>

              {/* Navigation Links */}
              <div className="py-6 space-y-2 flex-1">
                <Link
                  to={slugPath}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-800 transition-all hover:border-amber-500/30 group"
                >
                  <Home className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Início / Planos VIP</span>
                </Link>

                <Link
                  to={`${slugPath}/checkout/teste`}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/30 transition-all hover:scale-[1.02] group"
                >
                  <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>Solicitar Teste Grátis</span>
                </Link>

                <Link
                  to={`${slugPath}/status`}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-800 transition-all hover:border-emerald-500/30 group"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Área do Cliente (Consultar)</span>
                </Link>

                <Link
                  to={`${slugPath}/novidades`}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-800 transition-all hover:border-blue-500/30 group"
                >
                  <Bell className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Novidades & Lançamentos</span>
                </Link>

                <div className="pt-4 border-t border-slate-800/80">
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] font-bold text-sm border border-[#25D366]/30 transition-all shadow-lg shadow-[#25D366]/10"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <span>Atendimento WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* CEO Access Footer */}
              <div className="pt-4 border-t border-slate-800">
                <Link
                  to="/login/administrador/entrar/gestor"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-amber-400 transition-colors font-medium py-2"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Painel do CEO Lojista</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
