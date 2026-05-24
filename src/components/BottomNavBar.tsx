import React from 'react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] z-30 px-4 pb-4 pt-1 bg-gradient-to-t from-cream via-cream/90 to-transparent">
      <div className="h-16 w-full rounded-2xl glass-panel border border-emerald-100/40 flex items-center justify-between px-3 shadow-lg relative">
        
        {/* Home Tab */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex-1 py-1 flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <div className={`p-1 rounded-lg transition-all duration-200 ${activeTab === 'dashboard' ? 'text-emerald-700 font-bold -translate-y-[2px] scale-105' : 'text-emerald-600/60'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === 'dashboard' ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className={`text-[10px] mt-0.5 tracking-wide transition-all duration-200 ${activeTab === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-emerald-600/60'}`}>
            Home
          </span>
          {activeTab === 'dashboard' && (
            <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/50" />
          )}
        </button>

        {/* Logs Tab */}
        <button
          onClick={() => setActiveTab('history')}
          className="flex-1 py-1 flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <div className={`p-1 rounded-lg transition-all duration-200 ${activeTab === 'history' ? 'text-emerald-700 font-bold -translate-y-[2px] scale-105' : 'text-emerald-600/60'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === 'history' ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          </div>
          <span className={`text-[10px] mt-0.5 tracking-wide transition-all duration-200 ${activeTab === 'history' ? 'text-emerald-800 font-bold' : 'text-emerald-600/60'}`}>
            Logs
          </span>
          {activeTab === 'history' && (
            <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/50" />
          )}
        </button>

        {/* Floating Add Expense Tab */}
        <div className="relative -mt-8 flex flex-col items-center">
          <button
            onClick={() => setActiveTab('add-expense')}
            className={`
              h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer
              hover:scale-105 active:scale-95 transition-transform duration-200
              ${activeTab === 'add-expense' 
                ? 'bg-gradient-to-br from-amber-400 via-accent-orange to-accent-orange-hover shadow-accent-orange/40 scale-105 border-2 border-white' 
                : 'bg-gradient-to-br from-amber-500 to-accent-orange shadow-accent-orange/30'
              }
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${activeTab === 'add-expense' ? 'rotate-45' : ''}`}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="text-[10px] font-bold text-emerald-800/80 mt-1">Add Exp</span>
        </div>

        {/* Report Tab */}
        <button
          onClick={() => setActiveTab('report')}
          className="flex-1 py-1 flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <div className={`p-1 rounded-lg transition-all duration-200 ${activeTab === 'report' ? 'text-emerald-700 font-bold -translate-y-[2px] scale-105' : 'text-emerald-600/60'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === 'report' ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </div>
          <span className={`text-[10px] mt-0.5 tracking-wide transition-all duration-200 ${activeTab === 'report' ? 'text-emerald-800 font-bold' : 'text-emerald-600/60'}`}>
            Report
          </span>
          {activeTab === 'report' && (
            <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/50" />
          )}
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex-1 py-1 flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <div className={`p-1 rounded-lg transition-all duration-200 ${activeTab === 'settings' ? 'text-emerald-700 font-bold -translate-y-[2px] scale-105' : 'text-emerald-600/60'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={activeTab === 'settings' ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className={`text-[10px] mt-0.5 tracking-wide transition-all duration-200 ${activeTab === 'settings' ? 'text-emerald-800 font-bold' : 'text-emerald-600/60'}`}>
            Settings
          </span>
          {activeTab === 'settings' && (
            <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/50" />
          )}
        </button>

      </div>
    </div>
  );
}
