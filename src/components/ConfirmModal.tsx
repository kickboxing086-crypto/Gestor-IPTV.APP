import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  requiresDoubleStep?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Sim, Confirmar",
  cancelText = "Cancelar",
  variant = 'danger',
  requiresDoubleStep = false
}: ConfirmModalProps) {
  const [step, setStep] = React.useState<1 | 2>(1);

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-8 h-8 text-rose-400" />,
          iconBg: 'bg-rose-500/15 border-rose-500/30',
          btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/40',
          accent: 'text-rose-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          iconBg: 'bg-amber-500/15 border-amber-500/30',
          btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 ring-2 ring-amber-500/40',
          accent: 'text-amber-400',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
          iconBg: 'bg-emerald-500/15 border-emerald-500/30',
          btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40',
          accent: 'text-emerald-400',
        };
    }
  };

  const vStyles = getVariantStyles();

  const handlePrimaryClick = () => {
    if (requiresDoubleStep && step === 1) {
      setStep(2);
    } else {
      onConfirm();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl ring-1 ring-white/10 overflow-hidden"
        >
          {/* Top ambient glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-2xl border shadow-xl ${vStyles.iconBg}`}>
              {vStyles.icon}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                🔒 Confirmação em 2 Etapas {requiresDoubleStep && `(Etapa ${step}/2)`}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>

            {requiresDoubleStep && step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-slate-950/80 p-3 rounded-2xl border border-rose-500/30 text-xs text-rose-300 font-medium"
              >
                ⚠️ Por segurança, clique novamente no botão abaixo para concluir a ação.
              </motion.div>
            )}

            <div className="flex items-center gap-3 w-full pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                {cancelText}
              </button>
              
              <button
                type="button"
                onClick={handlePrimaryClick}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all shadow-lg active:scale-95 ${vStyles.btn}`}
              >
                {requiresDoubleStep && step === 1 ? "Continuar →" : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
