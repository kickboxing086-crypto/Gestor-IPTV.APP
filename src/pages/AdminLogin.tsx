import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus } from 'lucide-react';
import { updateStoreSettings, getStoreSettings } from '../lib/store';
import { useToast } from '../components/Toast';

export default function AdminLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const usersStr = localStorage.getItem('gestor_iptv_users') || '[]';
    const users = JSON.parse(usersStr);

    if (isRegistering) {
      if (users.find((u: any) => u.email === email)) {
        showToast('E-mail já está em uso.', 'error');
        return;
      }
      
      const newUser = { email, password, storeName };
      users.push(newUser);
      localStorage.setItem('gestor_iptv_users', JSON.stringify(users));
      
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('tenant_email', email);
      localStorage.setItem('tenant_storeName', storeName);
      const settings = getStoreSettings(email);
      updateStoreSettings(settings);
      showToast('Conta criada com sucesso!', 'success');
      navigate('/admin/dashboard');
    } else {
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      // Fallback for previous hardcoded admin
      if (email === 'elitestreambr1@gmail.com' && password === '861139' && !user) {
         localStorage.setItem('admin_auth', 'true');
         localStorage.setItem('tenant_email', email);
         localStorage.setItem('tenant_storeName', 'Gestor IPTV');
         const settings = getStoreSettings(email);
         updateStoreSettings(settings);
         showToast('Bem-vindo de volta!', 'success');
         navigate('/admin/dashboard');
         return;
      }

      if (user) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('tenant_email', user.email);
        localStorage.setItem('tenant_storeName', user.storeName || 'Minha Loja');
        const settings = getStoreSettings(user.email);
        updateStoreSettings(settings);
        showToast('Bem-vindo de volta!', 'success');
        navigate('/admin/dashboard');
      } else {
        showToast('Credenciais inválidas. Verifique seu e-mail e senha.', 'error');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden border border-blue-500/20">
          <img 
            src="/src/assets/images/app_logo_gestor_1784140597832.jpg" 
            alt="Logo Gestor" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">Painel do Lojista</h2>
        <p className="text-center text-slate-400 mb-8">
          {isRegistering ? 'Crie sua conta e gerencie seus clientes' : 'Faça login para gerenciar sua loja'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
             <div className="space-y-2">
               <label className="block text-sm font-medium text-slate-300">Nome da Loja</label>
               <input
                 type="text"
                 value={storeName}
                 onChange={(e) => setStoreName(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                 placeholder="Sua Loja IPTV"
                 required
               />
             </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              placeholder="lojista@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              placeholder="••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors mt-4 focus:ring-4 focus:ring-blue-500/30 outline-none"
          >
            {isRegistering ? 'Criar Minha Loja' : 'Entrar na Minha Loja'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
            }} 
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Crie sua loja agora'}
          </button>
        </div>
      </div>
    </div>
  );
}
