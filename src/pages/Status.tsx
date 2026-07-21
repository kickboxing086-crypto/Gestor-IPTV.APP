import React, { useState, useEffect } from 'react';
import { getSubscriptionByPhone, formatDeviceType, getSubscriptionByProtocol } from '../lib/store';
import { Subscription, DEFAULT_PLANS } from '../types';
import { getStoreSettingsBySlug } from '../lib/store';
import { Search, AlertCircle, Calendar, ArrowLeft } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Status() {
  const { storeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = React.useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const settings = getStoreSettingsBySlug(storeSlug);
    if (settings) {
      setPlans(settings.plans);
      setStoreSettings(settings);
    }
  }, [storeSlug]);

  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Subscription | null>(null);
  const [error, setError] = useState('');

  // Auto-search if a phone is saved locally OR if code is in URL
  useEffect(() => {
    if (!storeSettings) return;

    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      const sub = getSubscriptionByProtocol(codeFromUrl, storeSettings.tenantEmail);
      if (sub) {
        setResult(sub);
        setPhone(''); // Clear phone if searching by code
        return;
      }
    }

    const saved = localStorage.getItem('my_last_phone');
    if (saved) {
      setPhone(saved);
      const sub = getSubscriptionByPhone(saved, storeSettings.tenantEmail);
      if (sub) {
        setResult(sub);
      }
    }
  }, [searchParams, storeSettings]);

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
    
    setPhone(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if it's a protocol code (6 alphanumeric chars)
    const isProtocol = phone.length === 6 && /^[a-z0-9]+$/i.test(phone);
    
    if (isProtocol) {
      const sub = getSubscriptionByProtocol(phone, storeSettings?.tenantEmail);
      if (sub) {
        setResult(sub);
        return;
      }
    }

    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      setError('Informe seu WhatsApp com DDD ou o Código de Acesso de 6 dígitos.');
      setResult(null);
      return;
    }
    
    const sub = getSubscriptionByPhone(phone, storeSettings?.tenantEmail);
    if (sub) {
      setResult(sub);
      localStorage.setItem('my_last_phone', phone);
    } else {
      setResult(null);
      setError('Assinatura não encontrada. Verifique se digitou corretamente o número ou código.');
    }
  };

  const getStatusDisplay = (status: Subscription['status']) => {
    switch (status) {
      case 'active': return <span className="text-green-400 font-medium">Ativo</span>;
      case 'trial': return <span className="text-blue-400 font-medium">Teste VIP Liberado</span>;
      case 'pending_payment': return <span className="text-yellow-400 font-medium">Aguardando Pagamento</span>;
      case 'cancelled': return <span className="text-red-400 font-medium">Cancelado</span>;
    }
  };

  const calculateDaysLeft = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const end = new Date(expiresAt);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-red-400 font-bold">Expirado</span>;
    if (diffDays === 0) return <span className="text-yellow-400 font-bold">Expira Hoje!</span>;
    return <span className="text-green-400 font-bold">{diffDays} dias restantes</span>;
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 md:py-12 flex flex-col items-center relative">
      <div className="w-full mb-8">
        <Link to={storeSlug ? `/${storeSlug}` : '/'} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Consultar Assinatura</h2>
        <p className="text-slate-400">Acompanhe a situação do seu plano e os dias restantes.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSearch} 
        className="w-full relative mb-8"
      >
        <input
          type="text"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp ou Código"
          className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-6 pr-16 md:pr-32 py-4 font-mono text-center text-xl tracking-widest text-white focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-primary hover:opacity-90 text-white font-medium px-4 md:px-6 rounded-xl transition-colors flex items-center justify-center"
        >
          <Search className="w-5 h-5" />
        </button>
      </motion.form>
      <p className="text-[10px] text-slate-600 mb-8 uppercase tracking-widest text-center">
        Digite seu número com DDD ou seu código de 6 dígitos
      </p>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6 overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            key={result.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl"
          >
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Detalhes da Assinatura</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-sm mb-1 sm:mb-0">Cliente</span>
                <span className="text-white font-medium">{result.firstName} {result.lastName}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-sm mb-1 sm:mb-0">Situação atual</span>
                <div className="text-lg">{getStatusDisplay(result.status)}</div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-sm mb-1 sm:mb-0">Tipo de Plano</span>
                <span className="text-white font-medium">
                  {[...plans, ...DEFAULT_PLANS].find(p => p.id === result.planId)?.name || 'Desconhecido'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-950 rounded-xl border border-primary/20 bg-primary/5">
                <span className="text-slate-400 text-sm mb-1 sm:mb-0 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Vencimento
                </span>
                <div className="text-right">
                  {result.expiresAt ? (
                    <>
                      <div className="text-white">{new Date(result.expiresAt).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs mt-1">{calculateDaysLeft(result.expiresAt)}</div>
                    </>
                  ) : (
                    <span className="text-slate-500 italic">Aguardando ativação</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-sm mb-1 sm:mb-0">Código de Acesso</span>
                <span className="text-primary font-mono font-bold tracking-wider">{result.protocolCode}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-sm mb-1 sm:mb-0">Dispositivo</span>
                <span className="text-white">{formatDeviceType(result.deviceType)}</span>
              </div>

              {(result.status === 'active' || result.status === 'trial') && (
                <div className="mt-8 space-y-4">
                  {(result.deviceCredentials && result.deviceCredentials.length > 0 
                    ? result.deviceCredentials 
                    : [{
                        deviceType: result.deviceType,
                        appName: result.appName,
                        username: result.appUsername,
                        password: result.appPassword,
                        url: result.appUrl,
                        code: result.appCode,
                        mac: result.appMac
                      }]
                  ).map((cred, idx) => {
                    const hasAnyCreds = cred.appName || cred.username || cred.url || cred.code || cred.password || cred.mac || cred.name;
                    if (!hasAnyCreds) return null;

                    const isRoku = cred.deviceType.includes('ROKU');
                    
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4 sm:p-6 shadow-lg shadow-emerald-500/5"
                      >
                        <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                          CREDENCIAL - {cred.deviceType}
                        </h4>
                        
                        <div className="grid gap-3">
                          {cred.appName && (
                            <div className="bg-slate-950 rounded-lg p-3 flex flex-col mb-3 border border-slate-800">
                              <span className="text-xs text-slate-500 mb-1">Aplicativo</span>
                              <span className="text-white font-medium text-sm">{cred.appName}</span>
                            </div>
                          )}

                          {cred.name && (
                            <div className="bg-slate-950 rounded-lg p-3 flex flex-col mb-3 border border-slate-800">
                              <span className="text-xs text-slate-500 mb-1">Nome</span>
                              <span className="text-white font-medium text-sm select-all">{cred.name}</span>
                            </div>
                          )}

                          {isRoku && cred.code && (
                            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3 flex flex-col mb-3 shadow-inner">
                              <span className="text-xs text-emerald-500 font-semibold mb-1 uppercase">Código de Acesso</span>
                              <span className="text-emerald-400 font-mono select-all text-xl font-bold tracking-widest">{cred.code}</span>
                            </div>
                          )}
                          
                          {cred.url && (
                            <div className="bg-slate-950 rounded-lg p-3 flex flex-col border border-slate-800">
                              <span className="text-xs text-slate-500 mb-1">URL (Servidor)</span>
                              <span className="text-white font-mono break-all text-sm select-all">{cred.url}</span>
                            </div>
                          )}
                          
                          {(cred.username || cred.password) && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-950 rounded-lg p-3 flex flex-col border border-slate-800">
                                <span className="text-xs text-slate-500 mb-1">Usuário</span>
                                <span className="text-white font-mono select-all text-sm">{cred.username || '-'}</span>
                              </div>
                              <div className="bg-slate-950 rounded-lg p-3 flex flex-col border border-slate-800">
                                <span className="text-xs text-slate-500 mb-1">Senha</span>
                                <span className="text-white font-mono select-all text-sm">{cred.password || '-'}</span>
                              </div>
                            </div>
                          )}
                          
                          {cred.mac && (
                            <div className="bg-slate-950 rounded-lg p-3 flex flex-col border border-slate-800">
                              <span className="text-xs text-slate-500 mb-1">MAC Address</span>
                              <span className="text-white font-mono text-sm uppercase select-all">{cred.mac}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
