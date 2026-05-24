import React from 'react';
import { X, ZoomIn, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BillPreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function BillPreviewModal({ isOpen, imageUrl, onClose }: BillPreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `gharkharch_receipt_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
          />

          {/* Lightbox Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-0 m-auto h-fit w-[calc(100%-32px)] max-w-[400px] bg-cream rounded-3xl border border-emerald-100/30 p-5 z-[101] shadow-2xl glass-panel-dark flex flex-col items-center"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-emerald-100/30 pb-3 mb-4">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-700" />
                Attached Bill / Receipt
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Image Frame */}
            <div className="w-full aspect-[3/4] max-h-[360px] rounded-2xl border border-emerald-100 overflow-hidden bg-white shadow-inner relative group flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt="Receipt Attachment" 
                className="h-full w-full object-contain bg-emerald-50/10" 
              />
              
              {/* Floating Zoom indicator */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={14} />
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex gap-3 w-full mt-4">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-10 border border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                Download Attachment
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-emerald-600/10"
              >
                Close Receipt
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
