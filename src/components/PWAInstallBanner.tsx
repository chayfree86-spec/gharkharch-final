import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
                        
    if (isStandalone) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // If iOS Safari, we can show manual install instructions after 5 seconds
    if (ios) {
      const shownBefore = localStorage.getItem('ios-pwa-dismissed');
      if (!shownBefore) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }

    // Capture standard install prompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const shownBefore = localStorage.getItem('android-pwa-dismissed');
      if (!shownBefore) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt is missing but we're on Android, we can simulate an install action
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (isIOS) {
      localStorage.setItem('ios-pwa-dismissed', 'true');
    } else {
      localStorage.setItem('android-pwa-dismissed', 'true');
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-20 left-4 right-4 z-40 max-w-[448px] mx-auto"
      >
        <div className="rounded-2xl border border-emerald-100/40 p-4 shadow-xl glass-panel-dark flex items-start gap-3">
          {/* Logo container */}
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-inner">
            <img src="/logo.png" alt="GharKharch Logo" className="h-9 w-9 object-contain" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-emerald-950">Install GharKharch</h4>
            <p className="text-xs text-emerald-800/80 leading-relaxed mt-0.5">
              Add to your home screen for quick offline access and high-fidelity app feel.
            </p>
            
            {isIOS ? (
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-700">
                <span>Tap</span>
                <Share size={12} className="inline mx-0.5 text-emerald-600" />
                <span>then "Add to Home Screen"</span>
              </div>
            ) : (
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Download size={13} />
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Later
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
