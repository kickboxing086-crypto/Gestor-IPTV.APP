import React, { useEffect, useState } from 'react';
import { getNews } from '../lib/store';
import { NewsItem } from '../types';
import { Calendar, Clock, Bell, ArrowLeft, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function News() {
  const { storeSlug } = useParams();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setNews(getNews().reverse());
    // Polling so users see new news automatically without refreshing
    const interval = setInterval(() => {
      setNews(getNews().reverse());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Group news by date
  const groupedNews = news.reduce((acc, item) => {
    const d = new Date(item.date);
    const dateKey = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 relative"
    >
      <div className="w-full mb-8">
        <Link to={storeSlug ? `/${storeSlug}` : '/'} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>

      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4"
        >
          <Bell className="w-8 h-8 text-blue-500" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight"
        >
          Novidades e Atualizações
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-2xl mx-auto text-lg"
        >
          Acompanhe aqui os Jogos do Dia, novos conteúdos adicionados, avisos e mudanças no catálogo.
        </motion.p>
      </div>

      <div className="space-y-12">
        {Object.keys(groupedNews).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl"
          >
            <p className="text-slate-500">Nenhuma novidade no momento. Volte mais tarde!</p>
          </motion.div>
        ) : (
          Object.entries(groupedNews).map(([dateLabel, items], groupIndex) => (
            <motion.div 
              key={dateLabel} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="space-y-6"
            >
              <div className="sticky top-0 z-10 py-2 bg-slate-950/80 backdrop-blur-md">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2 capitalize">
                   <Calendar className="w-5 h-5 text-blue-500" />
                   {dateLabel}
                 </h3>
              </div>
              <div className="grid grid-cols-1 gap-8">
                {(items as NewsItem[]).map((item, itemIndex) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (itemIndex * 0.05) }}
                    whileHover={{ y: -5 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:border-slate-700 transition-all duration-300 group flex flex-col"
                  >
                    {item.imageUrl && (
                      <div 
                        className="w-full relative cursor-pointer bg-slate-950 overflow-hidden" 
                        onClick={() => setSelectedImage(item.imageUrl!)}
                      >
                         <img src={item.imageUrl} alt={item.title} className="w-full h-auto max-h-[500px] object-contain transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                           <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-opacity">Ver imagem em tela cheia</span>
                         </div>
                      </div>
                    )}
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3 font-medium bg-slate-950 inline-flex px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors">{item.title}</h4>
                      <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-red-400 bg-slate-900/50 hover:bg-slate-900 rounded-full p-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
