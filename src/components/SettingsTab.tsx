import React, { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '../lib/store';
import { StoreSettings, Plan } from '../types';
import { Save, Plus, Trash2, Copy, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';

import CustomSelect from './CustomSelect';

export default function SettingsTab({ settings: initialSettings, onSave }: { settings: StoreSettings, onSave: (settings: StoreSettings) => void }) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({});
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
        plans: [...settings.plans, { id: newId, name: 'Novo Plano', price: 29.90, durationMonths: 1 }]
      });
    }
  };

  const addTestPlan = () => {
    if (settings) {
      const hasTest = settings.plans.some(p => p.id === 'teste');
      if (hasTest) {
        showToast('O Plano de Teste já está cadastrado!', 'info');
        return;
      }
      setSettings({
        ...settings,
        plans: [{ id: 'teste', name: 'Teste Grátis 4 Horas', price: 0, durationMonths: 0 }, ...settings.plans]
      });
      showToast('Plano de Teste Grátis adicionado!', 'success');
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
            <CustomSelect
              label="Cor de Fundo (Tema)"
              value={settings.backgroundColor}
              onChange={val => setSettings({...settings, backgroundColor: val})}
              options={[
                { value: 'bg-slate-950', label: 'Slate Escuro (Padrão)', badge: 'Padrão' },
                { value: 'bg-gray-950', label: 'Cinza Escuro' },
                { value: 'bg-zinc-950', label: 'Zinco Escuro' },
                { value: 'bg-neutral-950', label: 'Neutro Escuro' },
                { value: 'bg-stone-950', label: 'Pedra Escuro' },
                { value: 'bg-blue-950', label: 'Azul Escuro', badge: 'Especial' },
                { value: 'bg-purple-950', label: 'Roxo Escuro' },
                { value: 'bg-black', label: 'Preto Absoluto' },
              ]}
            />
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
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain p-2" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x200/0f172a/38bdf8?text=Logo+Invalida';
                      }}
                    />
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

          <div className="md:col-span-2 space-y-2 border-t border-slate-800 pt-6 mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-400">Banner de Promoção (Destacado no Início)</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-slate-300">Ativo</span>
                <input 
                  type="checkbox"
                  checked={settings.isPromotionalBannerActive || false}
                  onChange={e => setSettings({...settings, isPromotionalBannerActive: e.target.checked})}
                  className="w-4 h-4 text-blue-500 bg-slate-950 border-slate-700 rounded focus:ring-blue-500"
                />
              </label>
            </div>
            <textarea 
              value={settings.promotionalBannerText || ''} 
              onChange={e => setSettings({...settings, promotionalBannerText: e.target.value})} 
              className={`w-full bg-slate-950 border ${settings.isPromotionalBannerActive ? 'border-yellow-500/50' : 'border-slate-800'} rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 h-20 transition-all`}
              placeholder="Ex: PROMOÇÃO DE FIM DE ANO! Assine o plano Anual com 50% de desconto."
            />
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Planos, Degustação (Teste) e Vantagens
          </h3>
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTestPlan} 
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs rounded-lg transition-all shadow-lg shadow-blue-600/20 font-bold"
            >
              <Plus className="w-4 h-4" /> Plano de Teste (Degustação)
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addPlan} 
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs rounded-lg transition-all shadow-lg shadow-emerald-600/20 font-bold"
            >
              <Plus className="w-4 h-4" /> Novo Plano
            </motion.button>
          </div>
        </div>
        
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {settings.plans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 p-5 border border-slate-800 rounded-xl bg-slate-950/60 shadow-lg relative group hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nome do Plano</label>
                        {plan.id === 'teste' && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                            TESTE GRÁTIS
                          </span>
                        )}
                      </div>
                      <input type="text" value={plan.name} onChange={e => updatePlan(index, 'name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all font-medium" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valor R$ (Vírgula aceita)</label>
                      <input 
                        type="text" 
                        inputMode="decimal"
                        value={priceInputs[index] !== undefined ? priceInputs[index] : (plan.price === 0 ? '0,00' : plan.price.toString().replace('.', ','))} 
                        onChange={e => {
                          const rawVal = e.target.value;
                          setPriceInputs(prev => ({ ...prev, [index]: rawVal }));
                          const normalized = rawVal.replace(',', '.').trim();
                          const parsed = parseFloat(normalized);
                          updatePlan(index, 'price', rawVal === '' || isNaN(parsed) ? 0 : parsed);
                        }} 
                        placeholder="Ex: 29,90 ou 0,00"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Duração (Meses - 0 para Teste)</label>
                      <input 
                        type="text" 
                        value={plan.durationMonths === undefined ? '' : plan.durationMonths} 
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || !isNaN(parseInt(val))) {
                            updatePlan(index, 'durationMonths', val === '' ? 0 : parseInt(val));
                          }
                        }} 
                        placeholder="1"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removePlan(index)} 
                    className="text-red-400 hover:text-red-300 p-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-xl transition-colors shrink-0 self-end sm:self-center"
                    title="Excluir Plano"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* CEO Customizable Advantages (Vantagens do Plano) */}
                <div className="space-y-1 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Vantagens do Plano (1 por linha)
                    </label>
                    <span className="text-[10px] text-slate-500">Opcional - Deixe em branco para usar o padrão</span>
                  </div>
                  <textarea
                    rows={3}
                    value={(plan.features || []).join('\n')}
                    onChange={e => {
                      const lines = e.target.value.split('\n');
                      updatePlan(index, 'features', lines);
                    }}
                    placeholder={`Ex:\nQualidade 4K / FHD\nCanais ao vivo, Filmes e Séries\nSem fidelidade ou multas\nSuporte Premium 24h`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all font-sans leading-relaxed"
                  />
                </div>
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
