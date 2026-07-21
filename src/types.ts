export type DeviceType = string;

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  features?: string[];
}

export interface DeviceCredentials {
  deviceType: string;
  appName?: string;
  name?: string;
  username?: string;
  password?: string;
  url?: string;
  code?: string;
}

export interface Subscription {
  id: string;
  protocolCode: string;
  planId: string;
  firstName: string;
  lastName: string;
  phone: string;
  deviceType: DeviceType;
  status: "pending_payment" | "active" | "cancelled" | "trial";
  createdAt: string;
  expiresAt?: string;
  customPrice?: number;
  appUsername?: string;
  appPassword?: string;
  appUrl?: string;
  appMac?: string;
  appName?: string;
  appCode?: string;
  deviceCredentials?: DeviceCredentials[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
}

export interface StoreSettings {
  tenantEmail: string;
  storeName: string;
  storeSlug: string;
  backgroundColor: string;
  accentColor: string;
  plans: Plan[];
  pinCode?: string;
  whatsappNumber?: string;
  pixKey?: string;
  supportEmail?: string;
  logoUrl?: string;
  welcomeMessage?: string;
  footerText?: string;
  primaryColor?: string;
  instagramUrl?: string;
  promotionalBannerText?: string;
  isPromotionalBannerActive?: boolean;
}

export const DEFAULT_PLANS: Plan[] = [
  { id: "teste", name: "Teste 4 Horas", price: 0, durationMonths: 0 },
  { id: "mensal", name: "Mensal", price: 29.99, durationMonths: 1 },
  { id: "trimestral", name: "Trimestral", price: 59.99, durationMonths: 3 },
  { id: "semestral", name: "Semestral", price: 119.99, durationMonths: 6 },
  { id: "anual", name: "Anual", price: 199.99, durationMonths: 12 },
];
