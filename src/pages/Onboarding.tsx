import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, UserPlus, Download, Share, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onLoginSuccess: (userProfile: { name: string; email: string; photoUrl: string }) => void;
}

export function Onboarding({ onLoginSuccess }: OnboardingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Parse invite query parameter on mount
  const [inviteCode, setInviteCode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  });

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Capture PWA install prompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    // Read Client ID from vite environment or fallback
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    // Fail if client ID is unconfigured
    if (!CLIENT_ID || CLIENT_ID.startsWith('your-google-client-id')) {
      alert("Google OAuth Client ID has not been configured in the .env file! Please add a valid Client ID.");
      setIsLoading(false);
      return;
    }

    // Trigger REAL Google OAuth implicit flow redirect
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent('email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;

    window.location.href = authUrl;
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-between p-6 max-w-[480px] mx-auto shadow-2xl relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-80 h-80 rounded-full bg-emerald-100/30 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 rounded-full bg-orange-100/20 blur-3xl" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-center gap-2 mt-4 z-10">
        <div className="h-9 w-9 bg-white rounded-xl border border-emerald-100 flex items-center justify-center shadow-premium">
          <img src={logo} alt="Logo" className="h-6 w-6 object-contain" />
        </div>
        <span className="text-xl font-black text-emerald-950 tracking-tight font-sans">Ghar<span className="text-accent-orange">Kharch</span></span>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center my-6 z-10 px-4">
        {inviteCode ? (
          // ==================== FAMILY INVITATION MODE ====================
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* Invite badge */}
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/75 border border-emerald-200/50 rounded-full px-3 py-1.5 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <UserPlus size={10} className="animate-pulse" />
              Family Invite Received
            </span>

            {/* Social Proof Avatars */}
            <div className="flex -space-x-3.5 my-6">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
                alt="Admin"
                className="h-14 w-14 rounded-full border-4 border-cream object-cover shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
                alt="Mother"
                className="h-14 w-14 rounded-full border-4 border-cream object-cover shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80"
                alt="Father"
                className="h-14 w-14 rounded-full border-4 border-cream object-cover shadow-md"
              />
              <div className="h-14 w-14 rounded-full border-4 border-cream bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                +3
              </div>
            </div>

            <h2 className="text-2xl font-black text-emerald-950 tracking-tight leading-tight">
              Join Sandeep's Family!
            </h2>
            <p className="text-xs font-medium text-emerald-800/75 mt-2.5 px-3 leading-relaxed">
              Accept the invite to log shared household expenses and sync budgets live. Get instant AI categorization and monthly reports!
            </p>

            {/* PWA Direct Installation Promotion Box for Invitees */}
            {!isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full mt-6 rounded-2xl border border-emerald-100/40 bg-white/80 p-4 shadow-premium glass-panel text-left flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-700" />
                  <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">
                    PWA One-Click Installer
                  </span>
                </div>
                
                <p className="text-[11px] text-emerald-800/80 leading-normal">
                  To sync automatically and use offline like a native app, install this PWA onto your device.
                </p>

                {isIOS ? (
                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-100/50 p-2.5 flex items-center gap-2 text-[10px] font-bold text-emerald-800 leading-normal">
                    <Share size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>How to Install: Tap the browser share button below and click <strong>'Add to Home Screen'</strong></span>
                  </div>
                ) : deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="h-9 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse"
                  >
                    <Download size={14} />
                    Install & Add to Home Screen
                  </button>
                ) : (
                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-100/50 p-2.5 text-center text-[10px] font-bold text-emerald-800">
                    ✨ Ready for instant app install via browser menu!
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          // ==================== STANDARD ONBOARDING MODE ====================
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center"
          >
            <div className="w-full max-w-[280px] aspect-square rounded-3xl bg-white/40 border border-white/60 p-4 shadow-premium glass-panel relative flex items-center justify-center overflow-hidden">
              {/* Animated SVG floating coins & home illustration */}
              <svg className="w-full h-full text-emerald-600" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="70" fill="rgba(16, 185, 129, 0.04)" />
                <motion.circle
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  cx="55" cy="65" r="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"
                />
                <motion.text
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  x="51" y="69" fill="#D97706" fontSize="12" fontWeight="bold" fontFamily="sans-serif"
                >₹</motion.text>

                <motion.circle
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  cx="145" cy="55" r="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"
                />
                <motion.text
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  x="140" y="60" fill="#D97706" fontSize="14" fontWeight="bold" fontFamily="sans-serif"
                >₹</motion.text>

                <rect x="75" y="40" width="50" height="90" rx="8" fill="white" stroke="#059669" strokeWidth="3" />
                <line x1="90" y1="46" x2="110" y2="46" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                <circle cx="100" cy="120" r="4" fill="#059669" />

                <path d="M90 85 L100 75 L110 85 V98 H90 Z" fill="#D1FAE5" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />
                <path d="M96 98 V91 H104 V98" stroke="#059669" strokeWidth="2" />
                
                <motion.path
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  d="M135 110 L137 114 L141 115 L138 118 L139 122 L135 120 L131 122 L132 118 L129 115 L133 114 Z"
                  fill="#FF6B35"
                />
              </svg>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-xl border border-emerald-100 p-2 text-center shadow-sm">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800">
                  Local AI Engine Active
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-emerald-950 text-center mt-6 tracking-tight leading-tight font-sans">
              Smart Expenses.<br />Zero Manual Categories.
            </h2>
            <p className="text-sm font-medium text-emerald-800/70 text-center mt-2 px-4 leading-relaxed">
              Type expenses in Hinglish or English like "doodh aur sabzi" and our local AI will categorize them instantly.
            </p>
          </motion.div>
        )}
      </div>

      {/* Action Button & Trust Info */}
      <div className="w-full px-4 mb-4 z-10 flex flex-col items-center">
        {isLoading ? (
          <div className="w-full h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center gap-3 shadow-premium">
            <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-emerald-950">Securing connection...</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            className="w-full h-14 rounded-2xl bg-white hover:bg-emerald-50/50 border border-emerald-100 shadow-premium flex items-center justify-center gap-3 active:scale-95 transition-all text-left px-5 cursor-pointer"
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-bold text-emerald-950 flex-1">
              {inviteCode ? 'Accept & Join with Google' : 'Continue with Google'}
            </span>
            <ArrowRight size={16} className="text-emerald-600" />
          </motion.button>
        )}

        <div className="flex items-center gap-1.5 mt-5 text-[10px] font-bold text-emerald-800/60 uppercase tracking-wider">
          <ShieldCheck size={14} className="text-emerald-600/70" />
          <span>One-click safe authentication</span>
        </div>
      </div>
    </div>
  );
}
