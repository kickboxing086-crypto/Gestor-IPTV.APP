import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubscriptions } from '../lib/store';
import { Subscription } from '../types';
import { getStoreSettingsBySlug } from '../lib/store';
import { CheckCircle, MessageCircle, Copy, Check, Info, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { generatePixPayload } from '../lib/pix';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';

import { DEFAULT_PLANS } from '../types';

export default function Success() {
  const { storeSlug, subscriptionId } = useParams();
  const { showToast } = useToast();
  const [plans, setPlans] = React.useState<any[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const s = getStoreSettingsBySlug(storeSlug);
    if (s) {
      setSettings(s);
      setPlans(s.plans.length > 0 ? s.plans : DEFAULT_PLANS);
    } else {
      setPlans(DEFAULT_PLANS);
    }
  }, [storeSlug]);

  const pixKey = settings?.pixKey || "a8d6dde8-33ae-45c8-b88a-5023cc204a55";

  useEffect(() => {
    if (settings) {
      const subs = getSubscriptions(settings.tenantEmail);
      const found = subs.find(s => s.id === subscriptionId);
      if (found) {
        setSub(found);
        localStorage.setItem('my_last_phone', found.phone);
      }
    }
  }, [subscriptionId, settings]);

  const plan = [...plans, ...DEFAULT_PLANS].find(p => p?.id === sub?.planId);
  const pixPayload = sub && plan ? generatePixPayload(pixKey, plan.price) : "";

  const handleCopyPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload);
      setCopiedPix(true);
      showToast('Código PIX copiado com sucesso!', 'success');
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  if (!sub) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Pedido não encontrado.</p>
      </div>
    );
  }

  const WHATSAPP_NUMBER = settings?.whatsappNumber || "5584999857391";
  const STORE_NAME = settings?.storeName || "Minha Loja";
  
  const textTest = `👋 Olá! Vim pelo site *${STORE_NAME}*.\n\n🎁 *Gostaria de liberar meu TESTE VIP DE 4 HORAS!*\n\n👤 *Nome:* ${sub.firstName} ${sub.lastName}\n📱 *Telefone:* ${sub.phone}\n📺 *Dispositivo:* ${sub.deviceType}\n🔑 *Código de Acesso:* ${sub.protocolCode}\n\nℹ️ *Vim pelo site e quero assinar o plano ${plan?.name}.*`;
  
  const textPaid = `👋 Olá! Vim pelo site *${STORE_NAME}*.\n\n✅ *Realizei o pedido do plano ${plan?.name}!*\n\n👤 *Nome:* ${sub.firstName} ${sub.lastName}\n📱 *Telefone:* ${sub.phone}\n📺 *Dispositivo:* ${sub.deviceType}\n🔑 *Código de Acesso:* ${sub.protocolCode}\n\nℹ️ *Vim pelo site e quero assinar este plano. Já estou com o comprovante em mãos!*`;
  
  const finalWhatsappLink = plan?.id === 'teste' 
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textTest)}`
    : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textPaid)}`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-8 h-8 text-primary" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Pedido Registrado!</h2>
        <p className="text-slate-400 mb-8">
          Seus dados foram salvos. Para liberar seu acesso e realizar o pagamento, chame no WhatsApp clicando no botão abaixo.
        </p>

        <div className="bg-slate-950 rounded-xl p-4 mb-6 text-left border border-slate-800 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 text-sm">Cliente</span>
            <span className="text-white text-sm">{sub.firstName} {sub.lastName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 text-sm">Plano</span>
            <span className="text-white text-sm">{plan?.name} (R$ {plan?.price.toString().replace('.', ',')})</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 text-sm">Telefone</span>
            <span className="text-white text-sm font-mono">{sub.phone}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
            <span className="text-slate-500 text-sm">Código de Acesso</span>
            <span className="text-primary font-mono font-bold tracking-wider">{sub.protocolCode}</span>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-left shadow-inner">
           <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-100 font-medium text-sm mb-1">Acompanhe seu Pedido!</p>
                <p className="text-blue-300 text-xs leading-relaxed">
                  Utilize o seu <strong>número de telefone (WhatsApp)</strong> que foi cadastrado para acessar a área de <strong>Consultar Assinatura</strong> no nosso site. Lá você pode conferir os dados de acesso e a validade.
                </p>
              </div>
           </div>
        </div>

        {plan?.id !== 'teste' && (
          <div className="bg-slate-950 rounded-xl p-6 mb-8 border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-emerald-500/5">
             <div className="absolute -top-10 -right-10 p-4 opacity-10 pointer-events-none">
                <QrCode className="w-48 h-48 text-emerald-400" />
             </div>
             <div className="flex items-center gap-2 mb-4 relative z-10 border-b border-emerald-500/20 pb-4">
                <QrCode className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-white font-bold text-lg">Pagamento via PIX</h3>
                  <p className="text-emerald-400 text-sm">Escaneie o QR Code ou copie o código.</p>
                </div>
             </div>
             
             <div className="relative z-10 flex flex-col items-center mb-6">
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/50 mb-4 inline-block">
                  <QRCode value={pixPayload} size={180} level="M" />
                </div>
                <div className="text-center">
                  <span className="text-slate-400 text-sm block mb-1">Valor do Plano:</span>
                  <span className="text-2xl font-bold text-white">R$ {plan?.price.toString().replace('.', ',')}</span>
                </div>
             </div>

             <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-100 text-sm mb-3">Escaneie usando a câmera do seu banco, ou se preferir, copie o código Copia e Cola abaixo:</p>
                <button
                   onClick={handleCopyPix}
                   className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/50"
                >
                   {copiedPix ? (
                     <>
                      <Check className="w-5 h-5" /> 
                      Código Copiado!
                     </>
                   ) : (
                     <>
                      <Copy className="w-5 h-5" /> 
                      Copiar PIX Copia e Cola
                     </>
                   )}
                </button>
             </div>
             
             <div className="mt-5 relative z-10 text-center text-xs text-slate-500">
               ⚠️ A chave Pix não é exibida por motivos de segurança. Cole diretamente no app do seu banco. Após o pagamento, não esqueça de clicar no botão do WhatsApp abaixo!
             </div>
          </div>
        )}

        <a
          href={finalWhatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-4 px-6 rounded-xl transition-all mb-4 focus:ring-4 focus:ring-[#25D366]/30 outline-none"
        >
          <MessageCircle className="w-5 h-5" />
          Finalizar no WhatsApp
        </a>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={storeSlug ? `/${storeSlug}/status` : '/status'} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-3 px-4 rounded-xl transition-colors border border-slate-700 text-center">
            Ver Status
          </Link>
          <Link to={storeSlug ? `/${storeSlug}` : '/'} className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-sm font-medium py-3 px-4 rounded-xl transition-colors border border-slate-800 text-center">
            Página Inicial
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
