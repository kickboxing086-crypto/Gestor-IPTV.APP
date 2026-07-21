import { Link, useParams } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoreSettingsBySlug } from '../lib/store';
import defaultLogo from '../assets/images/app_logo_1784678188597.jpg';

export default function Header() {
  const { storeSlug } = useParams();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Gestor IPTV');

  useEffect(() => {
    const settings = getStoreSettingsBySlug(storeSlug);
    if (settings) {
      if (settings.storeName) setStoreName(settings.storeName);
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

  return (
    <header className="w-full py-4 sm:py-6 text-center bg-black/20 border-b border-white/5 backdrop-blur-md relative flex flex-col items-center px-4">
      <Link to={storeSlug ? `/${storeSlug}` : '/'} className="flex flex-col items-center gap-3 transition-transform hover:scale-105">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt={storeName} 
            className="h-12 sm:h-16 w-auto rounded-xl object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
            referrerPolicy="no-referrer"
          />
        )}
        <h1 className="text-xl sm:text-4xl font-bold tracking-tight uppercase drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <span className="text-white">{storeName}</span>
        </h1>
      </Link>
      
      <div className="mt-4 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
        <Link 
          to={storeSlug ? `/${storeSlug}/novidades` : '/novidades'} 
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-colors border border-blue-500/20 text-xs font-medium backdrop-blur-sm min-w-[120px]"
        >
          <Bell className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '2s' }} />
          <span>Novidades</span>
        </Link>
        <Link 
          to={storeSlug ? `/${storeSlug}/status` : '/status'} 
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-800/80 px-3 py-2 rounded-lg transition-colors border border-white/10 text-xs font-medium backdrop-blur-sm min-w-[120px]"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Consultar</span>
        </Link>
      </div>
    </header>
  );
}
