import React, { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '../lib/store';
import { StoreSettings, Plan } from '../types';
import { Save, Plus, Trash2, Copy, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsTab({ settings: initialSettings, onSave }: { settings: StoreSettings, onSave: (settings: StoreSettings) => void }) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);
  
  const handleSave = () => {
    onSave(settings);
    showToast('Configurações salvas com sucesso!', 'success');
  };
  
  const addPlan = () => {
    if (settings) {
      const newId = `plan_${Math.random().toString(36).substring(2, 7)}`;
      setSettings({
        ...settings,
        plans: [...settings.plans, { id: newId, name: 'Novo Plano', price: 0, durationMonths: 1 }]
      });
    }
  };

  const updatePlan = (index: number, key: keyof Plan, value: any) => {
    if (settings) {
      const newPlans = [...settings.plans];
      newPlans[index] = { ...newPlans[index], [key]: value };
      setSettings({ ...settings, plans: newPlans });
    }
  };

  const removePlan = (index: number) => {
    if (settings) {
      const newPlans = [...settings.plans];
      newPlans.splice(index, 1);
      setSettings({ ...settings, plans: newPlans });
    }
  };

  const copyLink = () => {
    if (settings) {
      const url = `${window.location.origin}/${settings.storeSlug}`;
      navigator.clipboard.writeText(url);
      showToast('Link da loja copiado!', 'success');
    }
  }

  if (!initialSettings) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          Loja e Personalização
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Nome da Loja</label>
            <input type="text" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Link de Compartilhamento (Slug)</label>
            <div className="flex gap-2">
              <input type="text" value={settings.storeSlug} onChange={e => setSettings({...settings, storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all active:scale-95" title="Copiar Link">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Cor de Fundo (Tailwind Class)</label>
            <select value={settings.backgroundColor} onChange={e => setSettings({...settings, backgroundColor: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
              <option value="bg-slate-950">Slate Escuro (Padrão)</option>
              <option value="bg-gray-950">Cinza Escuro</option>
              <option value="bg-zinc-950">Zinco Escuro</option>
              <option value="bg-neutral-950">Neutro Escuro</option>
              <option value="bg-stone-950">Pedra Escuro</option>
              <option value="bg-blue-950">Azul Escuro</option>
              <option value="bg-purple-950">Roxo Escuro</option>
              <option value="bg-black">Preto Absoluto</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">WhatsApp do CEO (ex: 5584999857391)</label>
            <input type="text" value={settings.whatsappNumber || ''} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Chave PIX (Para Pagamentos)</label>
            <input type="text" value={settings.pixKey || ''} onChange={e => setSettings({...settings, pixKey: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Email de Suporte</label>
            <input type="email" value={settings.supportEmail || ''} onChange={e => setSettings({...settings, supportEmail: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Logo da Loja</label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.logoUrl || ''} 
                  onChange={e => setSettings({...settings, logoUrl: e.target.value})} 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                  placeholder="URL da imagem ou faça upload..." 
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-700 transition-all active:scale-95"
                  title="Upload de Imagem"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  id="logo-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSettings({...settings, logoUrl: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <AnimatePresence>
                {settings.logoUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full h-24 rounded-xl border border-slate-800 overflow-hidden bg-white/5 flex items-center justify-center relative group"
                  >
                    <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                    <button 
                      onClick={() => setSettings({...settings, logoUrl: ''})}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Cor Principal do Tema</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={settings.primaryColor || '#3b82f6'} 
                onChange={e => setSettings({...settings, primaryColor: e.target.value})} 
                className="h-10 w-12 bg-slate-950 border border-slate-800 rounded p-1 cursor-pointer transition-transform active:scale-95"
              />
              <input 
                type="text" 
                value={settings.primaryColor || '#3b82f6'} 
                onChange={e => setSettings({...settings, primaryColor: e.target.value})} 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500/50"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Instagram da Loja (URL)</label>
            <input 
              type="text" 
              value={settings.instagramUrl || ''} 
              onChange={e => setSettings({...settings, instagramUrl: e.target.value})} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
              placeholder="https://instagram.com/sualoja"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">PIN de Administrador</label>
            <input type="password" value={settings.pinCode || ''} onChange={e => setSettings({...settings, pinCode: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" maxLength={4} placeholder="Ex: 1234" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-slate-400">Mensagem de Boas-vindas</label>
            <textarea value={settings.welcomeMessage || ''} onChange={e => setSettings({...settings, welcomeMessage: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 transition-all" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-slate-400">Texto do Rodapé</label>
            <input type="text" value={settings.footerText || ''} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/20 font-bold"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Planos e Preços
          </h3>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addPlan} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm rounded-lg transition-all shadow-lg shadow-emerald-600/20 font-bold"
          >
            <Plus className="w-4 h-4" /> Novo Plano
          </motion.button>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {settings.plans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-800 rounded-lg bg-slate-950/50 items-start sm:items-center group hover:border-slate-700 transition-colors shadow-inner"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome</label>
                    <input type="text" value={plan.name} onChange={e => updatePlan(index, 'name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">R$</label>
                    <input 
                      type="text" 
                      value={plan.price === 0 ? '' : plan.price} 
                      onChange={e => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || !isNaN(parseFloat(val))) {
                          updatePlan(index, 'price', val === '' ? 0 : parseFloat(val));
                        }
                      }} 
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Meses</label>
                    <input 
                      type="text" 
                      value={plan.durationMonths === 0 ? '' : plan.durationMonths} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || !isNaN(parseInt(val))) {
                          updatePlan(index, 'durationMonths', val === '' ? 0 : parseInt(val));
                        }
                      }} 
                      placeholder="1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" 
                    />
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removePlan(index)} 
                  className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-8 flex justify-end">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 font-bold"
          >
            <Save className="w-5 h-5" /> Salvar Alterações nos Planos
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
