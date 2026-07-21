import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { DeviceType, DEFAULT_PLANS } from '../types';
import { getStoreSettingsBySlug } from '../lib/store';
import { addSubscription } from '../lib/store';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const AndroidIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-8 h-8 mb-2 ${active ? 'text-[#3DDC84] animate-pulse' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.525 9.775l1.642-2.842a.599.599 0 10-1.033-.6l-1.666 2.892C15.016 8.525 13.55 8.1 12 8.1s-3.016.425-4.467 1.125L5.867 6.333a.6.6 0 10-1.033.6l1.642 2.842C3.592 11.458 1.633 14.475 1.5 18h21c-.133-3.525-2.092-6.542-4.975-8.225zM8.075 15.35a1.12 1.12 0 110-2.24 1.12 1.12 0 010 2.24zm7.85 0a1.12 1.12 0 110-2.24 1.12 1.12 0 010 2.24z"/>
  </svg>
);

const AppleIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-8 h-8 mb-2 ${active ? 'text-white animate-pulse' : 'text-slate-500'}`} viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const RokuIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-8 h-8 mb-2 ${active ? 'text-[#662C91] animate-pulse' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3" ry="3"/>
    <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" stroke="none" fill="currentColor" fontSize="7" fontWeight="bold" fontFamily="sans-serif">ROKU</text>
  </svg>
);

const TvBoxIcon = ({ active }: { active: boolean }) => (
   <svg className={`w-8 h-8 mb-2 ${active ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="14" width="18" height="6" rx="2" ry="2" />
    <path d="M12 14v-4" />
    <path d="M8 10h8" />
    <circle cx="18" cy="17" r="1" fill="currentColor" />
   </svg>
);

const MonitorIcon = ({ active }: { active: boolean }) => (
  <Monitor className={`w-8 h-8 mb-2 ${active ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
);

export default function Checkout() {
  const { storeSlug } = useParams();
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [settings, setSettings] = useState<any>(null);

  React.useEffect(() => {
    const s = getStoreSettingsBySlug(storeSlug);
    if (s) {
      setSettings(s);
      setPlans(s.plans.length > 0 ? s.plans : DEFAULT_PLANS);
      document.documentElement.style.setProperty('--primary-color', s.primaryColor || '#3b82f6');
    } else {
      setPlans(DEFAULT_PLANS);
    }
    setLoading(false);
  }, [storeSlug]);

  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const plan = [...plans, ...DEFAULT_PLANS].find(p => p.id === planId);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    deviceType: 'Celular (ANDROID)' as DeviceType,
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!plan) {
    return <Navigate to={storeSlug ? `/${storeSlug}` : '/'} />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      if (value.length > 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      }
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sub = addSubscription({
      planId: plan.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      deviceType: formData.deviceType
    }, settings?.tenantEmail);

    navigate(`/${storeSlug}/success/${sub.id}`);
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 md:py-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link to={storeSlug ? `/${storeSlug}` : '/'} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar aos planos</span>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl"
      >
        <div className="mb-8 pb-8 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-2">Finalizar Pedido</h2>
          <p className="text-slate-400">Preencha seus dados para liberar seu acesso.</p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800"
          >
            <div>
              <span className="block text-sm text-slate-500 mb-1">Plano Selecionado</span>
              <span className="font-medium text-white">{plan.name}</span>
            </div>
            <div className="text-right">
              <span className="block text-sm text-slate-500 mb-1">Valor</span>
              <span className="font-bold text-primary">R$ {plan.price.toString().replace('.', ',')}</span>
            </div>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-300">
                Nome
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-300">
                Sobrenome <span className="text-slate-500 text-xs ml-1">(Opcional)</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
              Telefone (WhatsApp)
            </label>
            <div className="absolute top-0 right-0">
               <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                 Sua Chave de Acesso
               </span>
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Onde você vai assistir? Escolha o dispositivo:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { id: 'Televisão (ANDROID)', icon: AndroidIcon, label: 'TV (Android)', activeColor: 'border-[#3DDC84] bg-[#3DDC84]/10 shadow-[#3DDC84]/20' },
                { id: 'Televisão (ROKU)', icon: RokuIcon, label: 'TV (Roku)', activeColor: 'border-[#662C91] bg-[#662C91]/10 shadow-[#662C91]/20' },
                { id: 'Celular (ANDROID)', icon: AndroidIcon, label: 'Celular (Android)', activeColor: 'border-[#3DDC84] bg-[#3DDC84]/10 shadow-[#3DDC84]/20' },
                { id: 'iOS', icon: AppleIcon, label: 'iPhone (iOS)', activeColor: 'border-white bg-white/10 shadow-white/20' },
                { id: 'Tablet (ANDROID)', icon: AndroidIcon, label: 'Tablet (Android)', activeColor: 'border-[#3DDC84] bg-[#3DDC84]/10 shadow-[#3DDC84]/20' },
                { id: 'iPad', icon: AppleIcon, label: 'iPad', activeColor: 'border-white bg-white/10 shadow-white/20' },
                { id: 'TV Box', icon: TvBoxIcon, label: 'TV Box', activeColor: 'border-primary bg-primary/10 shadow-primary/20' },
                { id: 'Notebook / Computador', icon: MonitorIcon, label: 'PC / Notebook', activeColor: 'border-cyan-400 bg-cyan-400/10 shadow-cyan-400/20' },
              ].map((device) => {
                const isActive = formData.deviceType === device.id;
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    key={device.id}
                    onClick={() => setFormData(prev => ({ ...prev, deviceType: device.id as any }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                      isActive
                        ? `${device.activeColor} scale-105 shadow-lg`
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <device.icon active={isActive} />
                    <span className={`text-xs text-center font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {device.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primary hover:opacity-90 text-white font-medium py-4 px-6 rounded-xl transition-all focus:ring-4 focus:ring-primary/30 outline-none shadow-lg shadow-primary/20"
            >
              Ir para o Pagamento
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
