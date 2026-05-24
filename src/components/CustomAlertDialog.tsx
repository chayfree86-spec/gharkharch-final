import React from 'react';
import { ShieldAlert, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomAlertDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info' | 'success';
}

export function CustomAlertDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: CustomAlertDialogProps) {
  
  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: ShieldAlert,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50 border-rose-100',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-emerald-600',
          iconBg: 'bg-emerald-50 border-emerald-100',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-50 border-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
        };
    }
  };

  const { icon: Icon, iconColor, iconBg, confirmBtn } = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Alert Box Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-0 m-auto h-fit w-[calc(100%-32px)] max-w-[360px] bg-cream rounded-3xl border border-emerald-100/30 p-6 z-55 shadow-2xl glass-panel-dark flex flex-col items-center text-center"
          >
            {/* Top Close */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon Banner */}
            <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center mb-4 shadow-sm ${iconBg}`}>
              <Icon size={24} className={iconColor} />
            </div>

            {/* Content Details */}
            <h3 className="text-base font-extrabold text-emerald-950 px-2 leading-snug">
              {title}
            </h3>
            <p className="text-xs font-semibold text-emerald-800/70 leading-relaxed mt-2 px-1">
              {description}
            </p>

            {/* Buttons Row */}
            <div className="flex gap-3 w-full mt-6">
              {cancelLabel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-10 border border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={onConfirm}
                className={`${cancelLabel ? 'flex-1' : 'w-full'} h-10 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ${confirmBtn}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
