import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Selecione...",
  className = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && <label className="text-xs text-slate-400 block mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white flex items-center justify-between gap-2 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className="font-semibold truncate">{selectedOption?.label || placeholder}</span>
          {selectedOption?.badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedOption.color || 'bg-emerald-500/20 text-emerald-400'}`}>
              {selectedOption.badge}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900/98 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-1 ring-1 ring-white/10"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon}
                    <div>
                      <div className="font-semibold truncate">{opt.label}</div>
                      {opt.sublabel && <div className="text-[10px] text-slate-500">{opt.sublabel}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {opt.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.color || 'bg-emerald-500/20 text-emerald-400'}`}>
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
