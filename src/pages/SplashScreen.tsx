import React, { useEffect } from 'react';
import logo from '../assets/logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1200); // Highly punchy 1.2 seconds splash screen
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col items-center justify-center max-w-[480px] mx-auto shadow-2xl overflow-hidden">
      {/* Background soft pulsing glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-100/40 blur-3xl splash-glow" />

      <div className="z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="h-28 w-28 bg-white rounded-3xl border border-emerald-100 flex items-center justify-center shadow-premium relative logo-scale">
          <img src={logo} alt="GharKharch Logo" className="h-20 w-20 object-contain" />
          
          {/* Pulsing ring around logo */}
          <div className="absolute inset-0 rounded-3xl border border-emerald-400 ring-pulse" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold text-emerald-950 mt-6 tracking-tight font-sans title-entrance">
          Ghar<span className="text-accent-orange">Kharch</span>
        </h1>
      </div>

      {/* Loading bar at bottom - aligned 100% with index.html */}
      <div className="absolute bottom-16 w-[120px] h-[3px] bg-[#e6f6ee] rounded-full overflow-hidden">
        <div className="absolute top-0 bottom-0 w-12 bg-[#10b981] rounded-full loading-slide" />
      </div>
    </div>
  );
}
