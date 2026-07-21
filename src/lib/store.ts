import { Subscription, NewsItem } from "../types";

const getStorageKey = (email?: string) => {
  const tenantEmail = email || localStorage.getItem('tenant_email') || 'default';
  return `gestor_iptv_subscriptions_${tenantEmail}`;
};

const NEWS_STORAGE_KEY = "gestor_iptv_news";

const generateProtocol = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


export const getSubscriptions = (tenantEmail?: string): Subscription[] => {
  try {
    const data = localStorage.getItem(getStorageKey(tenantEmail));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

export const addSubscription = (sub: Omit<Subscription, "id" | "createdAt" | "status" | "protocolCode">, tenantEmail?: string): Subscription => {
  const subscriptions = getSubscriptions(tenantEmail);
  const newSub: Subscription = {
    ...sub,
    id: Math.random().toString(36).substring(2, 9),
    protocolCode: generateProtocol(),
    createdAt: new Date().toISOString(),
    status: sub.planId === "teste" ? "trial" : "pending_payment",
  };
  
  subscriptions.push(newSub);
  try {
    localStorage.setItem(getStorageKey(tenantEmail), JSON.stringify(subscriptions));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
  
  return newSub;
};

export const updateSubscriptionAdmin = (id: string, updates: Partial<Subscription>, tenantEmail?: string) => {
  const subscriptions = getSubscriptions(tenantEmail);
  const index = subscriptions.findIndex((s) => s.id === id);
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...updates };
    try {
      localStorage.setItem(getStorageKey(tenantEmail), JSON.stringify(subscriptions));
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  }
};

export const deleteSubscription = (id: string, tenantEmail?: string) => {
  const subscriptions = getSubscriptions(tenantEmail);
  const filtered = subscriptions.filter(s => s.id !== id);
  try {
    localStorage.setItem(getStorageKey(tenantEmail), JSON.stringify(filtered));
  } catch (error) {
    console.error("Error updating localStorage:", error);
  }
};

export const getSubscriptionByPhone = (phone: string, tenantEmail?: string): Subscription | undefined => {
  const subscriptions = getSubscriptions(tenantEmail);
  const rawPhone = phone.replace(/\D/g, '');
  return subscriptions.find(s => s.phone && s.phone.replace(/\D/g, '') === rawPhone);
};

export const getSubscriptionByProtocol = (protocol: string, tenantEmail?: string): Subscription | undefined => {
  const subscriptions = getSubscriptions(tenantEmail);
  return subscriptions.find(s => s.protocolCode && s.protocolCode.toUpperCase() === protocol.toUpperCase());
};

export const formatDeviceType = (deviceType: string): string => {
  const formats: Record<string, string> = {
    "celular": "Celular",
    "televisão (ROKU TV/Android)": "Televisão (ROKU TV/Android)",
    "tablet": "Tablet",
    "notebook": "Notebook",
    "tv box": "TV Box",
    "computador": "Computador"
  };
  return formats[deviceType] || deviceType;
};

export const getNews = (): NewsItem[] => {
  try {
    const data = localStorage.getItem(NEWS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading news from localStorage:", error);
    return [];
  }
};

export const addNews = (news: Omit<NewsItem, "id" | "date">): NewsItem => {
  const newsList = getNews();
  const newItem: NewsItem = {
    ...news,
    id: Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString(),
  };
  newsList.push(newItem);
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(newsList));
  } catch (error) {
    console.error("Error writing news to localStorage:", error);
  }
  return newItem;
};

export const deleteNews = (id: string) => {
  const newsList = getNews();
  const filtered = newsList.filter(n => n.id !== id);
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error updating news in localStorage:", error);
  }
};

import { StoreSettings, DEFAULT_PLANS } from '../types';

export const getStoreSettings = (tenantEmail?: string): StoreSettings => {
  const email = tenantEmail || localStorage.getItem('tenant_email') || 'default';
  const data = localStorage.getItem(`gestor_iptv_settings_${email}`);
  if (data) {
    return JSON.parse(data);
  }
  // Default Settings
  return {
    tenantEmail: email,
    storeName: localStorage.getItem('tenant_storeName') || 'Minha Loja',
    storeSlug: (localStorage.getItem('tenant_storeName') || 'minhaloja').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    backgroundColor: 'bg-slate-950',
    accentColor: 'blue',
    plans: DEFAULT_PLANS,
    whatsappNumber: '5584999857391',
    pixKey: '',
    supportEmail: '',
    welcomeMessage: 'Olá! Seja bem-vindo ao nosso suporte.',
    footerText: '© 2026 Todos os direitos reservados.',
    primaryColor: '#3b82f6',
    instagramUrl: ''
  };
}

export const updateStoreSettings = (settings: StoreSettings) => {
  const email = settings.tenantEmail || localStorage.getItem('tenant_email') || 'default';
  localStorage.setItem(`gestor_iptv_settings_${email}`, JSON.stringify(settings));
}



export const getStoreSettingsBySlug = (slug?: string): StoreSettings | null => {
  if (!slug) return null;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('gestor_iptv_settings_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.storeSlug === slug) {
          return data;
        }
      } catch(e) {}
    }
  }
  
  // Fallback for default elitestream if no custom one exists
  if (slug === 'elitestream') {
    return {
      tenantEmail: 'default',
      storeName: 'Elite Stream',
      storeSlug: 'elitestream',
      backgroundColor: 'bg-slate-950',
      accentColor: 'blue',
      plans: DEFAULT_PLANS,
      whatsappNumber: '5584999857391',
      pixKey: 'a8d6dde8-33ae-45c8-b88a-5023cc204a55',
      supportEmail: '',
      welcomeMessage: 'Olá! Seja bem-vindo ao nosso suporte.',
      footerText: '© 2026 Todos os direitos reservados.',
      primaryColor: '#3b82f6',
      instagramUrl: ''
    };
  }

  return null;
}
