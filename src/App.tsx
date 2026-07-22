import { BrowserRouter as Router, Routes, Route, Outlet, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStoreSettings, getStoreSettingsBySlug } from './lib/store';
import Header from './components/Header';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Status from './pages/Status';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import News from './pages/News';
import { motion, AnimatePresence } from 'motion/react';

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

function Layout() {
  const { storeSlug } = useParams();
  const [bgColor, setBgColor] = useState('bg-slate-950');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [footerText, setFooterText] = useState('© 2026 Todos os direitos reservados.');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    const settings = getStoreSettingsBySlug(storeSlug);
    if (settings) {
      if (settings.backgroundColor) setBgColor(settings.backgroundColor);
      if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
      if (settings.footerText) setFooterText(settings.footerText);
      setInstagram(settings.instagramUrl || '');
    } else {
      setBgColor('bg-slate-950');
      setPrimaryColor('#3b82f6');
      setInstagram('');
    }
  }, [storeSlug]);

  return (
    <div className={`min-h-screen ${bgColor} text-slate-50 font-sans flex flex-col`} style={{ '--primary': primaryColor } as any}>
      <style>
        {`
          :root {
            --primary-color: ${primaryColor};
          }
          .text-primary { color: var(--primary-color); }
          .bg-primary { background-color: var(--primary-color); }
          .border-primary { border-color: var(--primary-color); }
          .ring-primary { --tw-ring-color: var(--primary-color); }
        `}
      </style>
      <Header />
      <main className="flex-1 flex flex-col">
        <AnimatedOutlet />
      </main>
      <footer className="py-8 text-center text-slate-500 text-sm flex flex-col items-center gap-4 border-t border-white/5 bg-black/10">
        {instagram && (
          <a 
            href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.246-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.246-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.428.065-2.528.291-3.418 1.181-.89.89-1.116 1.99-1.181 3.418-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.065 1.428.291 2.528 1.181 3.418.89.89 1.99 1.116 3.418 1.181 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.428-.065 2.528-.291 3.418-1.181.89-.89 1.116-1.99 1.181-3.418.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.065-1.428-.291-2.528-1.181-3.418-.89-.89-1.99-1.116-3.418-1.181-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span>Seguir no Instagram</span>
          </a>
        )}
        <p>{footerText}</p>
        <Link to="/login/administrador/entrar/gestor" className="text-slate-500 hover:text-primary transition-colors text-xs font-medium flex items-center gap-1 mt-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Painel Administrador
        </Link>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/login/administrador/entrar/gestor" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/:storeSlug" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="checkout/:planId" element={<Checkout />} />
          <Route path="success/:subscriptionId" element={<Success />} />
          <Route path="status" element={<Status />} />
          <Route path="novidades" element={<News />} />
        </Route>
        <Route path="/" element={<Navigate to="/elitestream" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login/administrador/entrar/gestor" replace />} />
        <Route path="/admin" element={<Navigate to="/login/administrador/entrar/gestor" replace />} />
      </Routes>

    </Router>
  );
}

