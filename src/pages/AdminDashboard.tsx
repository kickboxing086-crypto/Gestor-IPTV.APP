import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getSubscriptions, updateSubscriptionAdmin, formatDeviceType, addSubscription, deleteSubscription, getNews, addNews, updateNews, deleteNews, updateStoreSettings } from '../lib/store';
import { Subscription, DeviceType, NewsItem } from '../types';
import { DEFAULT_PLANS } from '../types';
import SettingsTab from "../components/SettingsTab";
import { getStoreSettings } from "../lib/store";
import { StoreSettings } from "../types";
import { LogOut, Search, User, Calendar, Save, Plus, X, Trash2, Image as ImageIcon, Share2, Copy, Check, ChevronDown, ChevronUp, Clock, TrendingUp, DollarSign, Users, AlertCircle, BarChart3, PieChart as PieChartIcon, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import CustomSelect from '../components/CustomSelect';
import { Plan } from '../types';
import gestorLogo from '../assets/images/app_logo_gestor_1784140597832.jpg';

// Helper function to guarantee that 'Teste' is always present in plan lists
const getAvailablePlans = (settingsPlans?: Plan[]): Plan[] => {
  const currentPlans = (settingsPlans && settingsPlans.length > 0) ? [...settingsPlans] : [...DEFAULT_PLANS];
  const hasTrial = currentPlans.some(p => p.id === 'teste' || p.name.toLowerCase().includes('teste'));
  if (!hasTrial) {
    return [
      { id: 'teste', name: 'Teste (Degustação)', price: 0, durationMonths: 0 },
      ...currentPlans
    ];
  }
  return currentPlans;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isAuthenticated] = useState(() => localStorage.getItem('admin_auth') === 'true');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [lastCreatedSub, setLastCreatedSub] = useState<Subscription | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'news' | 'settings' | 'stats'>('stats');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'pending_payment' | 'cancelled'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit states
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlanId, setEditPlanId] = useState('');
  const [editStatus, setEditStatus] = useState<Subscription['status']>('active');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editCustomPrice, setEditCustomPrice] = useState<string>('');
  const [editCredentials, setEditCredentials] = useState<Record<string, {username?: string, password?: string}>>({});

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsImage, setNewNewsImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    deviceType: 'Televisão (ANDROID)' as DeviceType,
    planId: 'teste',
    status: 'active' as Subscription['status'],
    expiresAt: '',
    customPrice: '' as string,
  });

  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [newCredentials, setNewCredentials] = useState<Record<string, any>>({});

  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const [viewingClient, setViewingClient] = useState<Subscription | null>(null);
  const [isEditingPriceInModal, setIsEditingPriceInModal] = useState(false);
  const [modalEditPrice, setModalEditPrice] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login/administrador/entrar/gestor');
      return;
    }
    const settings = getStoreSettings();
    setStoreSettings(settings);
    setSubscriptions(getSubscriptions().reverse());
    setNews(getNews().reverse());

    // Initialize planId to the first available plan
    const availablePlans = getAvailablePlans(settings.plans);
    if (availablePlans.length > 0) {
      setNewClient(prev => ({ ...prev, planId: availablePlans[0].id }));
    }
  }, [isAuthenticated, navigate]);

  // Statistics calculations
  const stats = React.useMemo(() => {
    const plans = getAvailablePlans(storeSettings?.plans);
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const trialSubs = subscriptions.filter(s => s.status === 'trial' || s.planId === 'teste');
    
    // Revenue calculations
    const monthlyRevenue = activeSubs.reduce((acc, sub) => {
      if (sub.customPrice !== undefined) return acc + sub.customPrice;
      const plan = plans.find(p => p.id === sub.planId);
      return acc + (plan?.price || 0);
    }, 0);

    // Users status
    const activeCount = activeSubs.length;
    const expiredCount = subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').length;
    const trialCount = trialSubs.length;
    
    // Expiring soon (7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoonCount = activeSubs.filter(s => {
      if (!s.expiresAt) return false;
      const expiry = new Date(s.expiresAt);
      return expiry <= sevenDaysFromNow && expiry >= new Date();
    }).length;

    // Plan distribution for chart
    const planDistribution = plans.map(plan => {
      const planSubs = subscriptions.filter(s => s.planId === plan.id || (plan.id === 'teste' && s.status === 'trial'));
      const revenue = planSubs.filter(s => s.status === 'active').reduce((acc, sub) => acc + (sub.customPrice !== undefined ? sub.customPrice : plan.price), 0);
      return {
        name: plan.name,
        count: planSubs.length,
        revenue
      };
    }).filter(p => p.count > 0);

    return {
      monthlyRevenue,
      activeCount,
      expiredCount,
      trialCount,
      expiringSoonCount,
      planDistribution
    };
  }, [subscriptions, storeSettings]);

  if (!isAuthenticated) {
    return <Navigate to="/login/administrador/entrar/gestor" />;
  }

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    updateStoreSettings(newSettings);
    setStoreSettings(newSettings);
    localStorage.setItem('tenant_storeName', newSettings.storeName);
  };

  const copyStoreLink = () => {
    if (storeSettings) {
      const url = `${window.location.origin}/${storeSettings.storeSlug}`;
      navigator.clipboard.writeText(url);
      showToast('Link da sua loja copiado!', 'success');
    }
  };

  const copyClientLink = (protocolCode: string) => {
    if (storeSettings) {
      const url = `${window.location.origin}/${storeSettings.storeSlug}/status?code=${protocolCode}`;
      navigator.clipboard.writeText(url);
      showToast('Link do cliente copiado!', 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/login/administrador/entrar/gestor');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNewsImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isConfirmingDeleteNews, setIsConfirmingDeleteNews] = useState<string | null>(null);

  const handleStartEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewNewsTitle(item.title);
    setNewNewsContent(item.content);
    setNewNewsImage(item.imageUrl || '');
    setIsAddingNews(true);
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle || !newNewsContent) return;
    
    if (editingNewsId) {
      updateNews(editingNewsId, {
        title: newNewsTitle,
        content: newNewsContent,
        imageUrl: newNewsImage || undefined,
      });
      showToast('Novidade atualizada com sucesso!', 'success');
      setEditingNewsId(null);
    } else {
      addNews({
        title: newNewsTitle,
        content: newNewsContent,
        imageUrl: newNewsImage || undefined,
      });
      showToast('Novidade adicionada com sucesso!', 'success');
    }
    
    setNews(getNews().reverse());
    setIsAddingNews(false);
    setNewNewsTitle('');
    setNewNewsContent('');
    setNewNewsImage('');
  };

  const handleDeleteNews = (id: string) => {
    setIsConfirmingDeleteNews(id);
  };

  const confirmDeleteNews = () => {
    if (isConfirmingDeleteNews) {
      deleteNews(isConfirmingDeleteNews);
      setNews(getNews().reverse());
      setIsConfirmingDeleteNews(null);
      showToast('Novidade excluída com sucesso.', 'success');
    }
  };

  const handleStartEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setEditFirstName(sub.firstName);
    setEditLastName(sub.lastName || '');
    setEditPhone(sub.phone);
    setEditPlanId(sub.planId);
    setEditStatus(sub.status);
    setEditExpiresAt(sub.expiresAt ? new Date(sub.expiresAt).toISOString().split('T')[0] : '');
    setEditCustomPrice(sub.customPrice !== undefined ? sub.customPrice.toString().replace('.', ',') : '');
    
    // Convert old single-credential layout to new deviceCredentials mapping layout if needed
    const creds: Record<string, any> = {};
    if (sub.deviceCredentials && sub.deviceCredentials.length > 0) {
      sub.deviceCredentials.forEach(dc => {
        creds[dc.deviceType] = { ...dc };
      });
    } else {
      sub.deviceType.split(' + ').forEach(dt => {
        creds[dt] = {
          appName: sub.appName || '',
          username: sub.appUsername || '',
          password: sub.appPassword || '',
          url: sub.appUrl || '',
          mac: sub.appMac || '',
          code: sub.appCode || '',
        };
      });
    }
    setEditCredentials(creds);
  };

  const handleSaveEdit = (id: string) => {
    const dcs = Object.entries(editCredentials).map(([dt, doc]) => ({
      deviceType: dt,
      ...(doc as any)
    }));

    updateSubscriptionAdmin(id, {
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
      planId: editPlanId,
      status: editStatus,
      customPrice: editCustomPrice ? parseFloat(editCustomPrice.replace(',', '.')) : undefined,
      expiresAt: editExpiresAt ? new Date(editExpiresAt + 'T12:00:00').toISOString() : undefined,
      deviceCredentials: dcs,
    });
    setEditingId(null);
    setSubscriptions(getSubscriptions().reverse());
  };

  const handleDeleteClient = (id: string) => {
    setIsConfirmingDelete(id);
  };

  const confirmDelete = () => {
    if (isConfirmingDelete) {
      deleteSubscription(isConfirmingDelete);
      setSubscriptions(getSubscriptions().reverse());
      setIsConfirmingDelete(null);
      showToast('Cliente excluído com sucesso.', 'success');
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDevices.length === 0) {
      showToast("Selecione pelo menos um dispositivo.", 'error');
      return;
    }
    if (selectedDevices.length > 2) {
      showToast("Selecione no máximo 2 dispositivos.", 'error');
      return;
    }
    
    const dcs = selectedDevices.map(dt => ({
      deviceType: dt,
      ...(newCredentials[dt] || {})
    }));

    const sub = addSubscription({
      ...newClient,
      customPrice: newClient.customPrice ? parseFloat(newClient.customPrice.replace(',', '.')) : undefined,
      deviceType: selectedDevices.join(' + ') as DeviceType,
      deviceCredentials: dcs,
      expiresAt: newClient.expiresAt 
        ? new Date(newClient.expiresAt + 'T12:00:00').toISOString() 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSubscriptions(getSubscriptions().reverse());
    setIsAddingClient(false);
    setLastCreatedSub(sub);
    setSelectedDevices([]);
    setNewCredentials({});
    setNewClient({
      firstName: '',
      lastName: '',
      phone: '',
      deviceType: 'Televisão (ANDROID)',
      planId: 'teste',
      status: 'active',
      expiresAt: '',
      customPrice: '',
    });
  };



  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active': return <span className="bg-green-500/10 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full border border-green-500/20">Ativo</span>;
      case 'trial': return <span className="bg-blue-500/10 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-500/20">Teste</span>;
      case 'pending_payment': return <span className="bg-yellow-500/10 text-yellow-400 text-xs font-medium px-2.5 py-1 rounded-full border border-yellow-500/20">Pendente</span>;
      case 'cancelled': return <span className="bg-red-500/10 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full border border-red-500/20">Cancelado</span>;
    }
  };

  const filteredSubs = subscriptions.filter(sub => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      sub.firstName?.toLowerCase().includes(searchLower) || 
      sub.lastName?.toLowerCase().includes(searchLower) ||
      sub.phone?.includes(searchTerm) ||
      (sub.protocolCode && sub.protocolCode.toLowerCase().includes(searchLower));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'trial' ? (sub.status === 'trial' || sub.planId === 'teste') :
      statusFilter === 'cancelled' ? (sub.status === 'cancelled' || sub.status === 'expired') :
      sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredSubscriptions = filteredSubs;

  const storeName = localStorage.getItem('tenant_storeName') || 'Minha Loja';

  return (
    <div className={`flex-1 w-full min-h-screen ${storeSettings?.backgroundColor || 'bg-slate-950'} pb-8`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto px-4 py-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl overflow-hidden border border-blue-500/20 flex items-center justify-center">
              <img 
                src={storeSettings?.logoUrl || gestorLogo} 
                alt="Gestor Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = gestorLogo;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Gestor <span className="text-blue-500">IPTV</span></h2>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <h3 className="text-lg font-medium text-slate-300">{storeName}</h3>
                <button 
                  onClick={copyStoreLink}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg transition-colors border border-emerald-500/20"
                  title="Copiar Link da Loja"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-400 text-sm">Painel Administrativo do Lojista</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 flex-shrink-0">
              {['stats', 'clients', 'news', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap z-10 ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-slate-800 rounded-md -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab === 'stats' ? 'Dashboard' : tab === 'clients' ? 'Clientes' : tab === 'news' ? 'Novidades' : 'Ajustes'}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeTab === 'clients' && (
                <button
                  onClick={() => setIsAddingClient(!isAddingClient)}
                  className="inline-flex items-center gap-2 text-white bg-primary hover:opacity-90 px-3 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20 text-xs font-medium whitespace-nowrap"
                >
                  {isAddingClient ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Novo</span>
                </button>
              )}
              {activeTab === 'news' && (
                <button
                  onClick={() => setIsAddingNews(!isAddingNews)}
                  className="inline-flex items-center gap-2 text-white bg-primary hover:opacity-90 px-3 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20 text-xs font-medium whitespace-nowrap"
                >
                  {isAddingNews ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Novo</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors border border-slate-800 text-xs font-medium whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">Mensal</span>
                  </div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Receita Estimada</h4>
                  <p className="text-2xl font-bold text-white">R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Baseado em planos ativos
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full">Total</span>
                  </div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Clientes Ativos</h4>
                  <p className="text-2xl font-bold text-white">{stats.activeCount}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Assinaturas vigentes no momento</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setActiveTab('clients');
                    setStatusFilter('trial');
                  }}
                  className="bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer border border-amber-500/30 hover:border-amber-500/60 transition-all p-6 rounded-2xl shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">Degustação</span>
                  </div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Clientes em Teste</h4>
                  <p className="text-3xl font-black text-amber-400">{stats.trialCount}</p>
                  <p className="text-[10px] text-amber-300/80 mt-2 font-medium flex items-center justify-between">
                    <span>Acessando lista de teste</span>
                    <span className="underline font-bold">Ver lista →</span>
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    setActiveTab('clients');
                    setStatusFilter('cancelled');
                  }}
                  className="bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer border border-slate-800 hover:border-slate-700 transition-all p-6 rounded-2xl shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full">Inativos</span>
                  </div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Expirados / Cancelados</h4>
                  <p className="text-2xl font-bold text-white">{stats.expiredCount}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium flex items-center justify-between">
                    <span>{stats.expiringSoonCount} vencendo em 7 dias</span>
                    <span className="underline font-bold">Ver todos →</span>
                  </p>
                </motion.div>
              </div>

              {/* Charts & Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" /> Distribuição por Planos
                    </h4>
                  </div>
                  <div className="h-64 w-full">
                    {stats.planDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.planDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `R$${value}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid #1e293b',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={40}>
                            {stats.planDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                        Sem dados suficientes para gerar gráfico.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-5 h-5 text-emerald-500" /> Saúde do Negócio
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-300">Taxa de Conversão</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {subscriptions.length > 0 ? ((stats.activeCount / subscriptions.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-slate-300">Ticket Médio</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        R$ {stats.activeCount > 0 ? (stats.monthlyRevenue / stats.activeCount).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-slate-300">Planos Únicos</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {stats.planDistribution.length}
                      </span>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Dica do Gestor</p>
                      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-[11px] text-blue-400 leading-relaxed">
                        Mantenha o foco em converter os {stats.trialCount} usuários em teste para planos pagos para aumentar sua receita mensal.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && storeSettings && (
            <SettingsTab settings={storeSettings} onSave={handleUpdateSettings} />
          )}

          {activeTab === 'clients' && (
            <>
              {lastCreatedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
                  >
                    <div className="p-4 border-b border-slate-800 bg-emerald-500/10 flex justify-between items-center">
                      <h3 className="font-semibold text-emerald-400">Cliente Adicionado com Sucesso!</h3>
                      <button onClick={() => setLastCreatedSub(null)} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-400 text-sm mb-4">Envie a mensagem abaixo para o cliente:</p>
                      
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap mb-6 relative shadow-inner">
                        {(() => {
                          const STORE_NAME = storeSettings?.storeName || "Elite Streaming";
                          const statusLink = `${window.location.origin}/${storeSettings?.storeSlug}/status?code=${lastCreatedSub.protocolCode}`;
                          const msg = `👋 Olá *${lastCreatedSub.firstName}*! Seu acesso ao *${STORE_NAME}* foi liberado!\n\n` +
                            `👤 *Nome:* ${lastCreatedSub.firstName} ${lastCreatedSub.lastName || ''}\n` +
                            `📺 *Plano:* ${getAvailablePlans(storeSettings?.plans).find(p => p.id === lastCreatedSub.planId)?.name}\n` +
                            `📱 *Dispositivo:* ${lastCreatedSub.deviceType}\n` +
                            `🔑 *Código de Acesso:* ${lastCreatedSub.protocolCode}\n\n` +
                            `🔗 *Acesse seu painel aqui:*\n${statusLink}\n\n` +
                            `No painel acima você encontra os dados de login e data de vencimento. Seja bem-vindo! 🚀`;
                          return msg;
                        })()}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const STORE_NAME = storeSettings?.storeName || "Elite Streaming";
                            const statusLink = `${window.location.origin}/${storeSettings?.storeSlug}/status?code=${lastCreatedSub.protocolCode}`;
                            const msg = `👋 Olá *${lastCreatedSub.firstName}*! Seu acesso ao *${STORE_NAME}* foi liberado!\n\n` +
                              `👤 *Nome:* ${lastCreatedSub.firstName} ${lastCreatedSub.lastName || ''}\n` +
                              `📺 *Plano:* ${getAvailablePlans(storeSettings?.plans).find(p => p.id === lastCreatedSub.planId)?.name}\n` +
                              `📱 *Dispositivo:* ${lastCreatedSub.deviceType}\n` +
                              `🔑 *Código de Acesso:* ${lastCreatedSub.protocolCode}\n\n` +
                              `🔗 *Acesse seu painel aqui:*\n${statusLink}\n\n` +
                              `No painel acima você encontra os dados de login e data de vencimento. Seja bem-vindo! 🚀`;
                            
                            navigator.clipboard.writeText(msg);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          {copied ? 'Copiado!' : 'Copiar Mensagem'}
                        </button>
                        <button
                          onClick={() => setLastCreatedSub(null)}
                          className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700 active:scale-95"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {isAddingClient && (
                <motion.form 
                  initial={{ height: 0, opacity: 0, scale: 0.95 }}
                  animate={{ height: "auto", opacity: 1, scale: 1 }}
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  onSubmit={handleAddClient} 
                  className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl mb-8"
                >

          <div className="p-4 border-b border-slate-800 bg-emerald-500/10">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Adicionar Novo Cliente
            </h3>
          </div>
          <div className="p-6 space-y-6">
             {/* Registration Type Toggle (Ativo vs Teste) */}
             <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 shadow-inner">
               <label className="text-xs text-slate-400 font-semibold block mb-2.5 flex items-center gap-1.5">
                 <User className="w-3.5 h-3.5 text-emerald-400" />
                 Tipo de Cadastro do Cliente
               </label>
               <div className="grid grid-cols-2 gap-2.5">
                 <button
                   type="button"
                   onClick={() => {
                     const currentPlans = getAvailablePlans(storeSettings?.plans);
                     const paidPlan = currentPlans.find(p => p.id !== 'teste') || currentPlans[0];
                     
                     // Set date to 30 days from now
                     const d = new Date();
                     d.setDate(d.getDate() + 30);
                     
                     setNewClient({
                       ...newClient,
                       status: 'active',
                       planId: paidPlan.id,
                       customPrice: '',
                       expiresAt: d.toISOString().split('T')[0],
                     });
                   }}
                   className={`py-3 px-4 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                     newClient.status === 'active'
                       ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30'
                       : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                   }`}
                 >
                   <Check className="w-4 h-4 text-emerald-400" />
                   <span>Cliente Ativo (Pago)</span>
                 </button>

                 <button
                   type="button"
                   onClick={() => {
                     const currentPlans = getAvailablePlans(storeSettings?.plans);
                     const trialPlan = currentPlans.find(p => p.id === 'teste' || p.name.toLowerCase().includes('teste')) || currentPlans[0];
                     
                     // Default trial expiration: 24h from now
                     const d = new Date();
                     d.setDate(d.getDate() + 1);
                     
                     setNewClient({
                       ...newClient,
                       status: 'trial',
                       planId: trialPlan.id,
                       customPrice: '0.00',
                       expiresAt: d.toISOString().split('T')[0],
                     });
                   }}
                   className={`py-3 px-4 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                     newClient.status === 'trial'
                       ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/30'
                       : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                   }`}
                 >
                   <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                   <span>⚡ Teste Grátis (Degustação)</span>
                 </button>
               </div>

               {/* Quick Trial Expiration Presets */}
               <AnimatePresence>
                 {newClient.status === 'trial' && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mt-3 pt-3 border-t border-slate-800/80 overflow-hidden"
                   >
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                         <Clock className="w-3 h-3" /> Duração Rápida do Teste:
                       </span>
                       <span className="text-[10px] text-slate-400 italic">Vencimento automático</span>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                       {[
                         { label: '+4 Horas (Hoje)', days: 0 },
                         { label: '+24 Horas (1 Dia)', days: 1 },
                         { label: '+48 Horas (2 Dias)', days: 2 },
                         { label: '+3 Dias', days: 3 },
                         { label: '+7 Dias', days: 7 },
                       ].map(preset => (
                         <button
                           key={preset.label}
                           type="button"
                           onClick={() => {
                             const d = new Date();
                             d.setDate(d.getDate() + preset.days);
                             setNewClient({ ...newClient, expiresAt: d.toISOString().split('T')[0] });
                             showToast(`Vencimento do teste definido para ${preset.label}`, 'info');
                           }}
                           className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                         >
                           {preset.label}
                         </button>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="space-y-1.5">
                 <label className="text-xs text-slate-400">Nome <span className="text-red-500">*</span></label>
                 <input required type="text" value={newClient.firstName} onChange={e => setNewClient({...newClient, firstName: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="Ex: Michael" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs text-slate-400">Sobrenome <span className="text-slate-500 ml-1">(Opcional)</span></label>
                 <input type="text" value={newClient.lastName} onChange={e => setNewClient({...newClient, lastName: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="Ex: Silva" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs text-slate-400">WhatsApp <span className="text-red-500">*</span></label>
                 <input required type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="(00) 00000-0000" />
               </div>
               <div className="space-y-1.5">
                 <CustomSelect
                   label="Plano Selecionado"
                   value={newClient.planId}
                   onChange={val => {
                     const currentPlans = getAvailablePlans(storeSettings?.plans);
                     const isTrial = val === 'teste' || val.toLowerCase().includes('teste');
                     setNewClient({
                       ...newClient,
                       planId: val,
                       status: isTrial ? 'trial' : newClient.status,
                       customPrice: isTrial ? '0.00' : newClient.customPrice,
                     });
                   }}
                   options={getAvailablePlans(storeSettings?.plans).map(p => ({
                     value: p.id,
                     label: p.name,
                     badge: p.price === 0 ? 'GRÁTIS' : `R$ ${p.price.toFixed(2)}`,
                     color: p.price === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                   }))}
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs text-slate-400">Valor Customizado <span className="text-[10px] text-slate-500 ml-1">(Opcional)</span></label>
                 <input 
                   type="text" 
                   inputMode="decimal"
                   value={newClient.customPrice} 
                   onChange={e => setNewClient({...newClient, customPrice: e.target.value})} 
                   className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" 
                   placeholder="Ex: 29,90"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs text-slate-400 font-medium">Data de Vencimento <span className="text-red-500">*</span></label>
                 <input 
                   required 
                   type="date" 
                   value={newClient.expiresAt} 
                   onChange={e => setNewClient({...newClient, expiresAt: e.target.value})} 
                   className="w-full bg-slate-950/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all [color-scheme:dark]" 
                 />
                 <p className="text-[10px] text-slate-500 italic">Defina quando o acesso expira.</p>
               </div>
             </div>
             <div className="space-y-1.5 lg:col-span-4 mt-2">
               <label className="text-xs text-slate-400 mb-2 block">Dispositivos (Selecione até 2)</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {["Televisão (ANDROID)", "Televisão (ROKU)", "Celular (ANDROID)", "iOS", "Tablet (ANDROID)", "iPad", "TV Box", "Smart TV (Outra)", "Computador", "Notebook"].map(type => {
                    const isSelected = selectedDevices.includes(type);
                    return (
                      <button
                        key={type} type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDevices(selectedDevices.filter(d => d !== type));
                          } else {
                            if (selectedDevices.length >= 2) {
                              showToast("Você pode selecionar no máximo 2 dispositivos.", 'info');
                              return;
                            }
                            setSelectedDevices([...selectedDevices, type]);
                          }
                        }}
                        className={`p-2 rounded-lg border text-[11px] font-medium text-center transition-all duration-200 ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
                      >
                        {type}
                      </button>
                    )
                  })}
               </div>
               {selectedDevices.length > 0 && (
                 <div className="flex flex-wrap gap-1 mt-3">
                   {selectedDevices.map(d => (
                     <span key={d} className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                       {d}
                     </span>
                   ))}
                 </div>
               )}
             </div>
             <div className="col-span-full mt-4">
               <AnimatePresence>
                 {selectedDevices.map((device, idx) => {
                   const creds = newCredentials[device] || {};
                   const onChange = (field: string, value: string) => {
                     setNewCredentials(prev => ({
                       ...prev,
                       [device]: { ...prev[device], [field]: value }
                     }));
                   };
                   
                   const isRoku = device.includes('ROKU');
                   const isIOS = device === 'iOS' || device === 'iPad';
                   const isPC = device === 'Notebook' || device === 'Computador';

                   return (
                     <motion.div 
                       key={device}
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.98 }}
                       className="border border-slate-800 bg-slate-950/40 backdrop-blur-sm p-4 rounded-xl mb-4 last:mb-0 shadow-inner"
                     >
                       <h4 className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                         {device} - Credenciais do App
                       </h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         
                         <div className="space-y-1.5 lg:col-span-2">
                           <label className="text-xs text-slate-400">Nome do Aplicativo</label>
                           <input type="text" value={creds.appName || ''} onChange={e => onChange('appName', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="Ex: IPTV Smarters" />
                         </div>

                         {isIOS && (
                           <div className="space-y-1.5 lg:col-span-2">
                             <label className="text-xs text-slate-400">Nome (Device Name)</label>
                             <input type="text" value={creds.name || ''} onChange={e => onChange('name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="Nome do dispositivo" />
                           </div>
                         )}

                         {isRoku && (
                           <>
                             <div className="space-y-1.5 lg:col-span-1">
                               <label className="text-xs text-emerald-400 font-semibold">Código (Roku)</label>
                               <input type="text" value={creds.code || ''} onChange={e => onChange('code', e.target.value)} className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Código Roku" />
                             </div>
                             <div className="space-y-1.5 lg:col-span-1">
                               <label className="text-xs text-slate-400">MAC Address (Opcional)</label>
                               <input type="text" value={creds.mac || ''} onChange={e => onChange('mac', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white uppercase focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="00:1A:2B:..." />
                             </div>
                           </>
                         )}

                         <div className="space-y-1.5 sm:col-span-1">
                           <label className="text-xs text-slate-400">Usuário</label>
                           <input type="text" value={creds.username || ''} onChange={e => onChange('username', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                         </div>
                         
                         <div className="space-y-1.5 sm:col-span-1">
                           <label className="text-xs text-slate-400">Senha</label>
                           <input type="text" value={creds.password || ''} onChange={e => onChange('password', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                         </div>

                         {(isIOS || isPC) && (
                           <div className="space-y-1.5 lg:col-span-2">
                             <label className="text-xs text-slate-400">URL / Servidor</label>
                             <input type="url" value={creds.url || ''} onChange={e => onChange('url', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                           </div>
                         )}

                       </div>
                     </motion.div>
                   );
                 })}
               </AnimatePresence>
             </div>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
              <Save className="w-4 h-4" /> Salvar Novo Cliente
            </button>
          </div>
                </motion.form>
              )}

        <div 
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> Últimos Pedidos
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente, código, whatsapp..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Quick Filter Bar for Trial, Active, Expirados */}
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1">Filtrar:</span>
            {[
              { id: 'all', label: 'Todos os Clientes', count: subscriptions.length },
              { id: 'trial', label: '⚡ Em Teste Grátis', count: subscriptions.filter(s => s.status === 'trial' || s.planId === 'teste').length },
              { id: 'active', label: 'Ativos (Pagos)', count: subscriptions.filter(s => s.status === 'active' && s.planId !== 'teste').length },
              { id: 'pending_payment', label: 'Pendentes', count: subscriptions.filter(s => s.status === 'pending_payment').length },
              { id: 'cancelled', label: 'Expirados / Cancelados', count: subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-2 cursor-pointer ${
                  statusFilter === tab.id
                    ? tab.id === 'trial'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black scale-105 ring-2 ring-amber-400/50'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black scale-105 ring-2 ring-blue-400/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === tab.id
                    ? tab.id === 'trial' ? 'bg-slate-950 text-amber-300' : 'bg-blue-950 text-blue-200'
                    : 'bg-slate-950/80 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente / Contato</th>
                  <th className="px-6 py-4">Plano / Status</th>
                  <th className="px-6 py-4">Código App</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      Nenhuma assinatura encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub, index) => {
                    const plan = getAvailablePlans(storeSettings?.plans).find(p => p.id === sub.planId);
                    const isEditing = editingId === sub.id;
                    
                    if (isEditing) {
                      return (
                        <tr key={sub.id} className="bg-slate-800/30">
                          <td className="px-6 py-4">
                             <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Data Criada</div>
                             <div className="text-slate-400 font-mono">{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={editFirstName} 
                                onChange={e => setEditFirstName(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50" 
                                placeholder="Nome"
                              />
                              <input 
                                type="text" 
                                value={editLastName} 
                                onChange={e => setEditLastName(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50" 
                                placeholder="Sobrenome"
                              />
                              <input 
                                type="tel" 
                                value={editPhone} 
                                onChange={e => setEditPhone(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50" 
                                placeholder="WhatsApp"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <CustomSelect
                                value={editPlanId}
                                onChange={val => setEditPlanId(val)}
                                options={getAvailablePlans(storeSettings?.plans).map(p => ({
                                  value: p.id,
                                  label: p.name,
                                  badge: p.price === 0 ? 'GRÁTIS' : `R$ ${p.price.toFixed(2)}`,
                                  color: p.price === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                                }))}
                              />
                              <CustomSelect
                                value={editStatus}
                                onChange={val => setEditStatus(val as any)}
                                options={[
                                  { value: 'active', label: 'Ativo', badge: 'Pago', color: 'bg-emerald-500/20 text-emerald-400' },
                                  { value: 'trial', label: 'Teste (Degustação)', badge: 'Teste', color: 'bg-amber-500/20 text-amber-400' },
                                  { value: 'pending_payment', label: 'Pendente', badge: 'Aguardando', color: 'bg-yellow-500/20 text-yellow-400' },
                                  { value: 'cancelled', label: 'Cancelado', badge: 'Inativo', color: 'bg-rose-500/20 text-rose-400' },
                                ]}
                              />
                              <input 
                                type="date" 
                                value={editExpiresAt} 
                                onChange={e => setEditExpiresAt(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50 [color-scheme:dark]" 
                              />
                              <div className="relative">
                                <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                  type="text" 
                                  inputMode="decimal"
                                  value={editCustomPrice} 
                                  onChange={e => setEditCustomPrice(e.target.value)} 
                                  className="w-full bg-slate-950 border border-slate-700 rounded pl-7 pr-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50" 
                                  placeholder="Ex: 29,90"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {Object.entries(editCredentials).map(([dt, creds]) => (
                                <div key={dt} className="p-2 border border-slate-800 rounded bg-slate-950/30">
                                  <div className="text-[9px] text-emerald-400 font-black mb-1 uppercase tracking-tighter">{dt}</div>
                                  <div className="grid grid-cols-2 gap-1">
                                    <input 
                                      type="text" 
                                      value={(creds as any).username || ''} 
                                      onChange={e => setEditCredentials(prev => ({...prev, [dt]: {...prev[dt], username: e.target.value}}))} 
                                      className="bg-slate-900 border border-slate-800 rounded px-1 py-1 text-[10px] text-white focus:border-emerald-500/50 outline-none" 
                                      placeholder="Usuário"
                                    />
                                    <input 
                                      type="text" 
                                      value={(creds as any).password || ''} 
                                      onChange={e => setEditCredentials(prev => ({...prev, [dt]: {...prev[dt], password: e.target.value}}))} 
                                      className="bg-slate-900 border border-slate-800 rounded px-1 py-1 text-[10px] text-white focus:border-emerald-500/50 outline-none" 
                                      placeholder="Senha"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(sub.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <motion.tr 
                        key={sub.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                          {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{sub.firstName} {sub.lastName}</div>
                          <div className="text-slate-500 text-xs mt-1 font-mono">{sub.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium text-xs">{plan?.name || 'Desconhecido'}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <DollarSign className="w-2.5 h-2.5" />
                            {sub.customPrice !== undefined ? (
                              <span className="text-emerald-400 font-bold">R$ {sub.customPrice.toFixed(2)}</span>
                            ) : (
                              <span>R$ {plan?.price.toFixed(2) || '0.00'}</span>
                            )}
                          </div>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter mt-1.5 border ${
                            sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            sub.status === 'trial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {sub.status === 'active' ? 'Ativo' :
                             sub.status === 'trial' ? 'Teste' :
                             sub.status === 'cancelled' ? 'Cancelado' :
                             'Pendente'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-slate-950/50 border border-slate-800 px-2 py-1 rounded-md text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                            {sub.protocolCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setViewingClient(sub)}
                              className="bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 p-2 rounded-lg transition-all border border-slate-500/20 active:scale-90"
                              title="Detalhes"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => copyClientLink(sub.protocolCode)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2 rounded-lg transition-all border border-emerald-500/20 active:scale-90"
                              title="Copiar Link para o Cliente"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(sub)}
                              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition-all border border-blue-500/20 active:scale-90"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(sub.id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-all border border-red-500/20 active:scale-90"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center text-slate-500 py-8">Nenhuma assinatura encontrada.</div>
            ) : (
              filteredSubscriptions.map((sub) => {
                const plan = getAvailablePlans(storeSettings?.plans).find(p => p.id === sub.planId);
                const isEditing = editingId === sub.id;

                if (isEditing) {
                  return (
                    <div key={sub.id} className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase">Nome</label>
                          <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase">Sobrenome</label>
                          <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase">WhatsApp</label>
                        <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <CustomSelect
                            label="Plano"
                            value={editPlanId}
                            onChange={val => setEditPlanId(val)}
                            options={getAvailablePlans(storeSettings?.plans).map(p => ({
                              value: p.id,
                              label: p.name,
                              badge: p.price === 0 ? 'GRÁTIS' : `R$ ${p.price.toFixed(2)}`,
                              color: p.price === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                            }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <CustomSelect
                            label="Status"
                            value={editStatus}
                            onChange={val => setEditStatus(val as any)}
                            options={[
                              { value: 'active', label: 'Ativo', badge: 'Pago', color: 'bg-emerald-500/20 text-emerald-400' },
                              { value: 'trial', label: 'Teste (Degustação)', badge: 'Teste', color: 'bg-amber-500/20 text-amber-400' },
                              { value: 'pending_payment', label: 'Pendente', badge: 'Aguardando', color: 'bg-yellow-500/20 text-yellow-400' },
                              { value: 'cancelled', label: 'Cancelado', badge: 'Inativo', color: 'bg-rose-500/20 text-rose-400' },
                            ]}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase">Vencimento</label>
                        <input type="date" value={editExpiresAt} onChange={e => setEditExpiresAt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white [color-scheme:dark]" />
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        {Object.entries(editCredentials).map(([dt, creds]) => (
                          <div key={dt} className="p-3 border border-slate-800 rounded bg-slate-950">
                            <div className="text-[10px] text-emerald-400 font-bold mb-2 uppercase">{dt}</div>
                            <div className="grid grid-cols-1 gap-2">
                              <input 
                                type="text" 
                                value={(creds as any).username || ''} 
                                onChange={e => setEditCredentials(prev => ({...prev, [dt]: {...prev[dt], username: e.target.value}}))} 
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white" 
                                placeholder="Usuário"
                              />
                              <input 
                                type="text" 
                                value={(creds as any).password || ''} 
                                onChange={e => setEditCredentials(prev => ({...prev, [dt]: {...prev[dt], password: e.target.value}}))} 
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white" 
                                placeholder="Senha"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleSaveEdit(sub.id)} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg">Salvar</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-800 text-white py-2 rounded-lg">Cancelar</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white">{sub.firstName} {sub.lastName}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{sub.phone}</div>
                      </div>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        sub.status === 'trial' ? 'bg-blue-500/10 text-blue-400' :
                        sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {sub.status === 'active' ? 'Ativo' :
                         sub.status === 'trial' ? 'Teste' :
                         sub.status === 'cancelled' ? 'Cancelado' :
                         'Pendente'}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Plano:</span>
                      <span className="text-white font-medium">{plan?.name || 'Desconhecido'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Código App:</span>
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-300">{sub.protocolCode}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800">
                      <span className="text-slate-500 text-xs">{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setViewingClient(sub)} 
                          className="text-slate-400 hover:text-white font-medium text-sm"
                          title="Detalhes"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => copyClientLink(sub.protocolCode)} 
                          className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
                          title="Copiar Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStartEdit(sub)} className="text-blue-400 hover:text-blue-300 font-medium text-sm">Editar</button>
                        <button onClick={() => handleDeleteClient(sub.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Excluir</button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </>
    )}

    {activeTab === 'news' && (
        <>
          <AnimatePresence>
            {isAddingNews && (
              <motion.form 
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                onSubmit={handleAddNews} 
                className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl mb-8"
              >
                <div className="p-4 border-b border-slate-800 bg-emerald-500/10 flex justify-between items-center">
                  <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                    {editingNewsId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingNewsId ? 'Editar Novidade / Atualização' : 'Adicionar Nova Notícia / Atualização'}
                  </h3>
                  {editingNewsId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingNewsId(null);
                        setIsAddingNews(false);
                        setNewNewsTitle('');
                        setNewNewsContent('');
                        setNewNewsImage('');
                      }} 
                      className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-3 py-1 rounded-lg"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Título / Assunto</label>
                    <input required type="text" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="Ex: Jogos de Hoje / Nova Novela adicionada" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Conteúdo</label>
                    <textarea required value={newNewsContent} onChange={e => setNewNewsContent(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white h-32 resize-none focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all leading-relaxed" placeholder="Escreva os detalhes..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Foto (Opcional)</label>
                    <div className="flex items-center gap-4">
                       <motion.button
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="inline-flex flex-shrink-0 items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-xl text-sm transition-all border border-slate-700 shadow-lg"
                       >
                         <ImageIcon className="w-5 h-5" /> Anexar Imagem
                       </motion.button>
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={fileInputRef} 
                         onChange={handleImageUpload}
                       />
                       <AnimatePresence>
                         {newNewsImage && (
                           <motion.div 
                             initial={{ scale: 0, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             exit={{ scale: 0, opacity: 0 }}
                             className="relative"
                           >
                             <img src={newNewsImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20" />
                             <button 
                               type="button" 
                               onClick={() => setNewNewsImage('')} 
                               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full text-white p-1 shadow-lg transition-colors"
                             >
                               <X className="w-3.5 h-3.5" />
                             </button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all shadow-xl shadow-emerald-600/20"
                  >
                    <Save className="w-5 h-5" /> {editingNewsId ? 'Salvar Alterações' : 'Salvar Novidade'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {news.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl"
                >
                  Nenhuma novidade publicada ainda.
                </motion.div>
             ) : (
                news.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ y: -5 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-slate-700 transition-colors"
                  >
                     {item.imageUrl && (
                       <div className="h-48 w-full overflow-hidden bg-slate-950 relative">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                       </div>
                     )}
                     <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3 uppercase font-bold tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(item.date).toLocaleString('pt-BR')}
                        </div>
                        <h4 className="text-white font-bold text-lg mb-3 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                        <p className="text-slate-400 text-sm whitespace-pre-wrap flex-1 leading-relaxed">{item.content}</p>
                        <div className="border-t border-slate-800 mt-6 pt-4 flex justify-end gap-2">
                           <motion.button 
                             whileTap={{ scale: 0.9 }}
                             onClick={() => handleStartEditNews(item)}
                             className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
                           >
                             <Edit2 className="w-4 h-4" /> Editar
                           </motion.button>
                           <motion.button 
                             whileTap={{ scale: 0.9 }}
                             onClick={() => handleDeleteNews(item.id)}
                             className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                           >
                             <Trash2 className="w-4 h-4" /> Excluir
                           </motion.button>
                        </div>
                     </div>
                  </motion.div>
                ))
             )}
          </div>
        </>
      )}
    </motion.div>
  </AnimatePresence>

        {/* Modal de Confirmação de Exclusão de Cliente */}
        <AnimatePresence>
          {isConfirmingDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados serão perdidos.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsConfirmingDelete(null)}
                      className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Confirmação de Exclusão de Novidade */}
        <AnimatePresence>
          {isConfirmingDeleteNews && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Excluir Novidade</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Tem certeza que deseja excluir esta novidade? Ela deixará de ser exibida para todos os clientes.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsConfirmingDeleteNews(null)}
                      className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmDeleteNews}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes do Cliente */}
        <AnimatePresence>
          {viewingClient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" /> Detalhes do Cliente
                  </h3>
                  <button onClick={() => { setViewingClient(null); setIsEditingPriceInModal(false); }} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome Completo</label>
                        <p className="text-white font-medium text-lg">{viewingClient.firstName} {viewingClient.lastName}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">WhatsApp</label>
                        <p className="text-white font-mono">{viewingClient.phone}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Código de Acesso</label>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-sm">
                            {viewingClient.protocolCode}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(viewingClient.protocolCode);
                              showToast('Código copiado!', 'success');
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Plano</label>
                        <p className="text-white font-medium">
                          {getAvailablePlans(storeSettings?.plans).find(p => p.id === viewingClient.planId)?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Valor da Assinatura</label>
                        <div className="flex items-center gap-3 mt-1">
                          {isEditingPriceInModal ? (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="text" 
                                  inputMode="decimal"
                                  value={modalEditPrice} 
                                  onChange={e => setModalEditPrice(e.target.value)} 
                                  className="bg-slate-950 border border-blue-500/50 rounded-lg pl-9 pr-3 py-2 text-white font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500/20 w-40"
                                  placeholder="29,90"
                                  autoFocus
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  if (viewingClient) {
                                    const newPrice = modalEditPrice ? parseFloat(modalEditPrice.replace(',', '.')) : undefined;
                                    updateSubscriptionAdmin(viewingClient.id, { customPrice: newPrice });
                                    setViewingClient({ ...viewingClient, customPrice: newPrice });
                                    setSubscriptions(getSubscriptions().reverse());
                                    setIsEditingPriceInModal(false);
                                    showToast('Valor atualizado com sucesso!', 'success');
                                  }
                                }}
                                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setIsEditingPriceInModal(false)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-white font-bold text-2xl">
                                R$ {(viewingClient.customPrice !== undefined ? viewingClient.customPrice : (getAvailablePlans(storeSettings?.plans).find(p => p.id === viewingClient.planId)?.price || 0)).toFixed(2)}
                              </p>
                              {viewingClient.customPrice !== undefined && (
                                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  Personalizado
                                </span>
                              )}
                              <button 
                                onClick={() => {
                                  setModalEditPrice(viewingClient.customPrice !== undefined ? viewingClient.customPrice.toString().replace('.', ',') : (getAvailablePlans(storeSettings?.plans).find(p => p.id === viewingClient.planId)?.price || 0).toString().replace('.', ','));
                                  setIsEditingPriceInModal(true);
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition-all hover:text-blue-400 hover:border-blue-500/30"
                                title="Editar Valor"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Data de Vencimento</label>
                        <p className={`font-medium ${new Date(viewingClient.expiresAt) < new Date() ? 'text-red-400' : 'text-emerald-400'}`}>
                          {new Date(viewingClient.expiresAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</label>
                        <div className="mt-1">
                          {getStatusBadge(viewingClient.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      Acessos por Dispositivo
                    </h4>
                    <div className="space-y-3">
                      {(viewingClient.deviceCredentials || []).map((dc, idx) => (
                        <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3 border-b border-slate-800/50 pb-2">
                            <span className="text-emerald-400 font-bold text-xs uppercase">{dc.deviceType}</span>
                            <span className="text-slate-500 text-[10px]">{dc.appName || 'App IPTV'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] text-slate-500 uppercase">Usuário</label>
                              <p className="text-white text-sm font-mono">{dc.username || '---'}</p>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 uppercase">Senha</label>
                              <p className="text-white text-sm font-mono">{dc.password || '---'}</p>
                            </div>
                            {dc.url && (
                              <div className="col-span-2">
                                <label className="text-[9px] text-slate-500 uppercase">URL / Servidor</label>
                                <p className="text-white text-xs font-mono break-all">{dc.url}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => {
                        handleStartEdit(viewingClient);
                        setViewingClient(null);
                        setIsEditingPriceInModal(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Editar Cliente
                    </button>
                    <button 
                      onClick={() => { setViewingClient(null); setIsEditingPriceInModal(false); }}
                      className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
